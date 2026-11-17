create table public.cl_quote_versions (
quote_id uuid not null, revision integer not null check(revision>0), partner_id uuid references public.cl_partners(id), order_id uuid references public.cl_orders(id), issued_at timestamptz not null default now(), issuer text not null, customer text not null, lines jsonb not null, primary key(quote_id,revision)
);
create index cl_quote_order_idx on public.cl_quote_versions(order_id,issued_at desc);
alter table public.cl_quote_versions enable row level security;
revoke all on public.cl_quote_versions from public,anon,authenticated;
grant select,insert on public.cl_quote_versions to service_role;