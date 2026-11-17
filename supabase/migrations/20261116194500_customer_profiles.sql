create table public.cl_customer_profiles (history_key text primary key,name text not null, dni text not null default '',phone text not null default '');
alter table public.cl_customer_profiles enable row level security;
revoke all on public.cl_customer_profiles from public,anon,authenticated;
grant select,insert,update on public.cl_customer_profiles to service_role;