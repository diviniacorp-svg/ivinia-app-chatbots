create extension if not exists pgcrypto with schema extensions;
create table public.cl_technician_access (
  username text primary key, pin_digest text not null, failures integer not null default 0,
  locked_until timestamptz, token_digest text, expires_at timestamptz
);
alter table public.cl_technician_access enable row level security;
revoke all on public.cl_technician_access from anon, authenticated;
grant select, insert, update on public.cl_technician_access to service_role;

create function public.cl_technician_login(p_user text, p_pin text, p_token text)
returns boolean language plpgsql set search_path = '' as $$
declare account public.cl_technician_access%rowtype;
begin
  select * into account from public.cl_technician_access where username=p_user for update;
  if not found or account.locked_until > now() then return false; end if;
  if extensions.crypt(p_pin, account.pin_digest) <> account.pin_digest then
    update public.cl_technician_access set failures=(failures+1)%5,
      locked_until=case when failures>=4 then now()+interval '15 minutes' end where username=p_user;
    return false;
  end if;
  update public.cl_technician_access set failures=0, locked_until=null, token_digest=p_token,
    expires_at=now()+interval '4 hours' where username=p_user;
  return true;
end $$;
revoke all on function public.cl_technician_login(text,text,text) from public,anon,authenticated;
grant execute on function public.cl_technician_login(text,text,text) to service_role;
create function public.cl_set_technician_pin(p_user text, p_pin text) returns void language sql set search_path='' as $$
insert into public.cl_technician_access(username,pin_digest) values (p_user,extensions.crypt(p_pin,extensions.gen_salt('bf',10)))
on conflict(username) do update set pin_digest=excluded.pin_digest, token_digest=null, expires_at=null, failures=0, locked_until=null;
$$;
revoke all on function public.cl_set_technician_pin(text,text) from public,anon,authenticated;
grant execute on function public.cl_set_technician_pin(text,text) to service_role;