create table public.cl_nucleus_sessions (token_hash text primary key, expires_at timestamptz not null);
create table public.cl_nucleus_attempts (client_id uuid primary key, failures int not null default 0, locked_until timestamptz);
alter table public.cl_nucleus_sessions enable row level security;
alter table public.cl_nucleus_attempts enable row level security;
revoke all on public.cl_nucleus_sessions, public.cl_nucleus_attempts from public,anon,authenticated;
grant select,insert,update,delete on public.cl_nucleus_sessions, public.cl_nucleus_attempts to service_role;
create function public.cl_nucleus_login(p_pin text,p_hash text) returns boolean language plpgsql set search_path='' as $$
declare owner_id uuid; expected text; attempts public.cl_nucleus_attempts%rowtype;
begin
select id,custom_config->>'nucleus_panel_pin' into owner_id,expected from public.clients where chatbot_id='celulab' or custom_config->>'nucleus_slug'='celulab' order by (chatbot_id='celulab') desc limit 1;
if expected is null or expected='' then return false; end if;
insert into public.cl_nucleus_attempts(client_id) values(owner_id) on conflict do nothing;
select * into attempts from public.cl_nucleus_attempts where client_id=owner_id for update;
if attempts.locked_until>now() then return false; end if;
if p_pin is distinct from expected then
update public.cl_nucleus_attempts set failures=(failures+1)%6,locked_until=case when failures>=5 then now()+interval '5 minutes' end where client_id=owner_id;
return false; end if;
update public.cl_nucleus_attempts set failures=0,locked_until=null where client_id=owner_id;
delete from public.cl_nucleus_sessions where expires_at<=now();
insert into public.cl_nucleus_sessions values(p_hash,now()+interval '8 hours');return true;
end $$;
revoke all on function public.cl_nucleus_login(text,text) from public,anon,authenticated;
grant execute on function public.cl_nucleus_login(text,text) to service_role;