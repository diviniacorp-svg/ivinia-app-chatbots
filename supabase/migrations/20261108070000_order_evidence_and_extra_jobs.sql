create table public.cl_order_tracking(order_id uuid primary key references public.cl_orders(id) on delete cascade, token uuid not null unique default gen_random_uuid());
create table public.cl_customer_evidence(id uuid primary key default gen_random_uuid(), order_id uuid not null references public.cl_orders on delete cascade, object_key text not null unique, media_type text not null, caption text not null default '', created_at timestamptz not null default now());
create table public.cl_order_extra_jobs(id uuid primary key, order_id uuid not null references public.cl_orders on delete cascade, title text not null, labor int not null check(labor>=0), part int not null check(part>=0), created_at timestamptz not null default now(), status text not null default 'presupuestado' check(status in ('presupuestado','aceptado','rechazado')), reason text, decided_at timestamptz);
alter table public.cl_order_tracking enable row level security;
alter table public.cl_customer_evidence enable row level security;
alter table public.cl_order_extra_jobs enable row level security;
revoke all on public.cl_order_tracking,public.cl_customer_evidence,public.cl_order_extra_jobs from public, anon, authenticated;
grant select,insert,update,delete on public.cl_order_tracking,public.cl_customer_evidence,public.cl_order_extra_jobs to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('celulab-evidence','celulab-evidence',false,4000000,array['image/jpeg','image/png','image/webp','video/mp4','video/webm']) on conflict(id) do nothing;
create function public.cl_order_tracking_token(p_order uuid) returns uuid language sql set search_path='' as $$
insert into public.cl_order_tracking(order_id) values(p_order) on conflict(order_id) do update set order_id=excluded.order_id returning token
$$;
revoke all on function public.cl_order_tracking_token(uuid) from public,anon,authenticated;
grant execute on function public.cl_order_tracking_token(uuid) to service_role;