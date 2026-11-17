import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const work = resolve(process.argv[2] || '')
if (!process.argv[2]) throw Error('Pass the isolated npm prefix containing @electric-sql/pglite@0.5.16.')
const require = createRequire(resolve(work, 'package.json'))
const { PGlite } = await import(require.resolve('@electric-sql/pglite'))
const { pgcrypto } = await import(require.resolve('@electric-sql/pglite/contrib/pgcrypto'))
const schema = 'celulab_release_qa'
const files = [
 '20261108040000_technician_access.sql',
 '20261108070000_order_evidence_and_extra_jobs.sql',
 '20261108071000_shipping_physical_stock.sql',
 '20261116190000_owner_access.sql',
 '20261117020000_quote_versions.sql',
 '20261117020100_reported_fault.sql',
 '20261117020200_quote_draft_lines.sql',
 '20261117030000_quote_contacts_rates.sql',
 '20261117190000_celulab_supplier_availability.sql',
]
const migrations = (await Promise.all(files.map(name=>readFile(new URL('../../supabase/migrations/'+name,import.meta.url),'utf8'))))
  .join('\n').replaceAll('public.',schema+'.').replaceAll('storage.buckets',schema+'.buckets')
const fixture = String.raw`begin;
set local lock_timeout = '1s';
set local statement_timeout = '15s';
create schema celulab_release_qa;
create table celulab_release_qa.cl_partners(id uuid primary key, pin text not null, is_active boolean not null default true);
create table celulab_release_qa.cl_orders(id uuid primary key, order_number text not null);
create table celulab_release_qa.cl_products(id uuid primary key);
create table celulab_release_qa.cl_provider_prices(id uuid primary key, part_id uuid, cost_ars integer);
create table celulab_release_qa.cl_tienda_orders(id uuid primary key,order_number text,items jsonb not null default '[]', total_ars integer not null,metodo_pago text not null,estado text not null default 'pendiente',caja_registrado boolean not null default false,updated_at timestamptz);
create table celulab_release_qa.cl_caja_movimientos(tipo text, concepto text, categoria text, metodo_pago text,monto_ars integer);
create table celulab_release_qa.buckets(id text primary key,name text,public boolean,file_size_limit integer,allowed_mime_types text[]);
insert into celulab_release_qa.cl_tienda_orders (id,order_number,total_ars,metodo_pago) values ('00000000-0000-0000-0000-000000000111','legacy-pending',2500,'digital');
insert into celulab_release_qa.cl_orders values ('00000000-0000-0000-0000-000000000112','legacy-service');
insert into celulab_release_qa.cl_partners(id,pin) values ('00000000-0000-0000-0000-000000000113','123456');
insert into celulab_release_qa.cl_provider_prices(id,cost_ars) values ('00000000-0000-0000-0000-000000000114',850);
`
const checks = String.raw`do $checks$
declare ticket uuid; product uuid:=gen_random_uuid(); order_id uuid:=gen_random_uuid();
begin
 if not exists(select 1 from celulab_release_qa.cl_tienda_orders where order_number='legacy-pending' and estado='pendiente' and total_ars=2500 and deposit_paid=0 and shipment_stage='Recibido' and tracking_token is not null) then raise exception 'Legacy pickup not preserved'; end if;
 if not exists(select 1 from celulab_release_qa.cl_orders where order_number='legacy-service' and reported_fault='' and quote_draft_lines='[]'::jsonb) then raise exception 'Legacy repair not preserved'; end if;
 if not exists(select 1 from celulab_release_qa.cl_provider_prices where cost_ars=850 and supplier_in_stock is null) then raise exception 'Unverified offer must stay unknown'; end if;
 if not exists(select 1 from celulab_release_qa.cl_owner_access where partner_id='00000000-0000-0000-0000-000000000113') then raise exception 'No owner access for legacy partner'; end if;
 if (select count(*) from celulab_release_qa.cl_labor_rates)<20 then raise exception 'Missing labor rate rows'; end if;
 ticket:=celulab_release_qa.cl_order_tracking_token('00000000-0000-0000-0000-000000000112');
 if ticket is null then raise exception 'Cannot generate service tracking'; end if;
 insert into celulab_release_qa.cl_products values(product);
 insert into celulab_release_qa.cl_physical_stock(name,kind,cost,price,qty,catalog_id) values('QA accessory','Accesorio',600,1000,3,product);
 insert into celulab_release_qa.cl_tienda_orders(id,order_number,total_ars,metodo_pago,items) values(order_id,'qa-pickup',2000,'digital',jsonb_build_array(jsonb_build_object('id',product,'qty',2)));
 if not celulab_release_qa.cl_advance_shipment(order_id,'Recibido','Confirmado',null,0,0,0) then raise exception 'Cannot confirm pickup'; end if;
 if celulab_release_qa.cl_advance_shipment(order_id,'Recibido','Confirmado',null,0,0,0) then raise exception 'Duplicate pickup acknowledgement'; end if;
 if not exists(select 1 from celulab_release_qa.cl_physical_stock where catalog_id=product and qty=1) then raise exception 'Wrong inventory after pickup'; end if;
end $checks$;
rollback;`
const db = new PGlite({extensions:{pgcrypto}})
try {
 await db.exec('create schema extensions; create role anon; create role authenticated; create role service_role;')
 await db.exec(fixture+'\n'+migrations+'\n'+checks)
 const result = await db.query("select to_regnamespace('celulab_release_qa') is null as cleaned")
 if (!result.rows[0]?.cleaned) throw Error('Rollback failed')
 console.log('PASS: nine migrations; legacy orders and offers preserved; test pickup reserved stock exactly once; rollback verified')
} finally { await db.close() }
