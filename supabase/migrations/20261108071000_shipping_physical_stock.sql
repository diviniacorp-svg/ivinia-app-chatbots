create table public.cl_delivery_settings(id boolean primary key default true check(id), carrier text not null);
insert into public.cl_delivery_settings values(true,'Uber Envíos');
alter table public.cl_tienda_orders add column request_id uuid unique, add column tracking_token uuid unique default gen_random_uuid(), add column fulfillment text not null default 'retiro', add column destination text, add column carrier text, add column delivery_fee integer check(delivery_fee>=0), add column delivery_cost integer check(delivery_cost>=0), add column shipment_stage text not null default 'Recibido', add column deposit_paid integer not null default 0 check(deposit_paid>=0);
create table public.cl_shipment_events(id bigint generated always as identity primary key, order_id uuid not null references public.cl_tienda_orders on delete cascade, stage text not null, created_at timestamptz not null default now());
create table public.cl_physical_stock(id uuid primary key default gen_random_uuid(), name text not null, variant text not null default '', kind text not null check(kind in ('Accesorio','Repuesto')), cost integer not null check(cost>=0), price integer not null check(price>=0), qty integer not null check(qty>=0), catalog_id uuid unique references public.cl_products on delete set null);
create table public.cl_stock_allocations(order_id uuid references public.cl_tienda_orders,stock_id uuid references public.cl_physical_stock,qty integer not null check(qty>0),primary key(order_id,stock_id));
alter table public.cl_delivery_settings enable row level security;
alter table public.cl_physical_stock enable row level security;
alter table public.cl_stock_allocations enable row level security;
alter table public.cl_shipment_events enable row level security;
revoke all on public.cl_delivery_settings,public.cl_physical_stock,public.cl_stock_allocations,public.cl_shipment_events from public,anon,authenticated;
grant all on public.cl_delivery_settings,public.cl_physical_stock,public.cl_stock_allocations,public.cl_shipment_events to service_role;
create function public.cl_advance_shipment(p_order uuid,p_expected text,p_stage text,p_carrier text,p_fee int,p_cost int,p_paid int) returns boolean language plpgsql set search_path='' as $$
declare o public.cl_tienda_orders%rowtype; item record; s public.cl_physical_stock%rowtype; units int; stages text[];
begin
select * into o from public.cl_tienda_orders where id=p_order for update;
if not found or o.shipment_stage<>p_expected then return false; end if;
stages:=case when o.fulfillment='envio' then array['Recibido','Confirmado','Preparando','Esperando delivery','Repartidor en el local','En camino','Llegando','Entregado'] else array['Recibido','Confirmado','Preparando','Listo para retirar','Entregado'] end;
if p_stage<>o.shipment_stage and (array_position(stages,o.shipment_stage) is null or stages[array_position(stages,o.shipment_stage)+1] is distinct from p_stage) then return false; end if;
if p_paid<o.deposit_paid or p_paid>o.total_ars+coalesce(p_fee,0) then return false; end if;
if p_stage='Confirmado' and p_expected='Recibido' then
 for item in select x->>'id' as id,sum((x->>'qty')::int)::int as qty from jsonb_array_elements(o.items) x group by 1 order by 1 loop
 select * into s from public.cl_physical_stock where catalog_id::text=item.id for update;
 if found then units:=least(s.qty,item.qty); if units>0 then
 update public.cl_physical_stock set qty=qty-units where id=s.id;
 insert into public.cl_stock_allocations values(o.id,s.id,units); end if; end if;
 end loop;
end if;
if p_paid>o.deposit_paid then insert into public.cl_caja_movimientos(tipo,concepto,categoria,metodo_pago,monto_ars) values('ingreso','Cobro tienda '||o.order_number,'accesorios',o.metodo_pago,p_paid-o.deposit_paid); end if;
update public.cl_tienda_orders set shipment_stage=p_stage,carrier=p_carrier,delivery_fee=p_fee,delivery_cost=p_cost,deposit_paid=p_paid,updated_at=now(),
estado=case p_stage when 'Entregado' then 'entregado' when 'Listo para retirar' then 'listo' when 'Recibido' then 'pendiente' else 'confirmado' end where id=o.id;
if p_stage<>o.shipment_stage then insert into public.cl_shipment_events(order_id,stage) values(o.id,p_stage); end if;
return true;
end $$;
revoke all on function public.cl_advance_shipment(uuid,text,text,text,int,int,int) from public,anon,authenticated;
grant execute on function public.cl_advance_shipment(uuid,text,text,text,int,int,int) to service_role;