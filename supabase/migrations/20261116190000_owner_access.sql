create table public.cl_owner_access (
 partner_id uuid primary key references public.cl_partners(id) on delete cascade,
 owner_pin text not null check(owner_pin ~ '^[0-9]{4}$'),
 failures int not null default 0, blocked_until timestamptz
);
alter table public.cl_owner_access enable row level security;
revoke all on public.cl_owner_access from public, anon, authenticated;
grant select,update on public.cl_owner_access to service_role;
create function public.cl_assign_owner_pin() returns trigger language plpgsql security definer set search_path='' as $$
declare candidate text;
begin
 if tg_op='UPDATE' then
  if exists(select from public.cl_owner_access where partner_id=new.id and owner_pin=new.pin) then raise exception 'Los PIN deben ser diferentes'; end if;
  return new;
 end if;
 loop
 candidate:=lpad((get_byte(uuid_send(gen_random_uuid()),0)*256+get_byte(uuid_send(gen_random_uuid()),1))::text,5,'0');
 candidate:=right(candidate,4);
 exit when candidate<>new.pin and candidate<>reverse(new.pin);
 end loop;
 insert into public.cl_owner_access(partner_id,owner_pin) values(new.id,candidate);
 return new;
end $$;
revoke all on function public.cl_assign_owner_pin() from public,anon,authenticated;
create trigger cl_assign_owner after insert or update of pin on public.cl_partners for each row execute function public.cl_assign_owner_pin();
do $$ declare p record; candidate text; begin
for p in select id,pin from public.cl_partners loop
 loop
 candidate:=lpad(((get_byte(uuid_send(gen_random_uuid()),0)*256+get_byte(uuid_send(gen_random_uuid()),1))%10000)::text,4,'0');
 exit when candidate is distinct from p.pin and candidate is distinct from reverse(p.pin);
 end loop;
 insert into public.cl_owner_access(partner_id,owner_pin) values(p.id,candidate);
end loop;end $$;
create function public.cl_verify_owner(p_id uuid,p_pin text) returns boolean language plpgsql set search_path='' as $$
declare a public.cl_owner_access;
begin
 select * into a from public.cl_owner_access where partner_id=p_id for update;
 if not found or a.blocked_until>now() or not exists(select from public.cl_partners where id=p_id and is_active and pin is distinct from p_pin) then return false; end if;
 if a.owner_pin=p_pin then
 update public.cl_owner_access set failures=0,blocked_until=null where partner_id=p_id;return true;
 end if;
 update public.cl_owner_access set failures=(failures+1)%5,blocked_until=case when failures>=4 then now()+interval '10 minutes' end where partner_id=p_id;
 return false;
end $$;
revoke all on function public.cl_verify_owner(uuid,text) from public,anon,authenticated;
grant execute on function public.cl_verify_owner(uuid,text) to service_role;
create table public.cl_owner_sessions (token_hash text primary key, partner_id uuid not null references public.cl_partners(id) on delete cascade, expires_at timestamptz not null);
alter table public.cl_owner_sessions enable row level security;
revoke all on public.cl_owner_sessions from public,anon,authenticated;
grant select,insert,delete on public.cl_owner_sessions to service_role;
create function public.cl_owner_pin_changed() returns trigger language plpgsql set search_path='' as $$
begin
 if exists(select from public.cl_partners where id=new.partner_id and pin=new.owner_pin) then raise exception 'Los PIN deben ser diferentes';end if;
 delete from public.cl_owner_sessions where partner_id=new.partner_id;
 return new;
end $$;
create trigger cl_owner_rotate before update of owner_pin on public.cl_owner_access for each row execute function public.cl_owner_pin_changed();