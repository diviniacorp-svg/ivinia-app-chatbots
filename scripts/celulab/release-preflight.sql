-- Read-only. Compare preview and the real project before changing deployment aliases.
with checks (name, ready) as (
  select 'table.' || item, to_regclass('public.' || item) is not null
  from unnest(array[
    'cl_technician_access', 'cl_nucleus_sessions', 'cl_nucleus_attempts',
    'cl_order_tracking', 'cl_customer_evidence', 'cl_order_extra_jobs',
    'cl_delivery_settings', 'cl_shipment_events', 'cl_physical_stock', 'cl_stock_allocations',
    'cl_owner_access', 'cl_owner_sessions', 'cl_customer_profiles',
    'cl_quote_versions', 'cl_labor_rates'
  ]) as item
  union all
  select 'column.' || t || '.' || c, exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = t and column_name = c
  )
  from (values
    ('cl_orders','reported_fault'),('cl_orders','quote_draft_lines'),
    ('cl_provider_prices','supplier_in_stock'),
    ('cl_tienda_orders','request_id'),('cl_tienda_orders','tracking_token'),
    ('cl_tienda_orders','fulfillment'),('cl_tienda_orders','shipment_stage'),
    ('cl_tienda_orders','deposit_paid'),('cl_quote_versions','customer_phone')
  ) cols(t,c)
  union all
  select 'function.' || item, to_regprocedure(item) is not null
  from unnest(array[
    'public.cl_nucleus_login(text,text)',
    'public.cl_technician_login(text,text,text)',
    'public.cl_verify_owner(uuid,text)',
    'public.cl_order_tracking_token(uuid)',
    'public.cl_price_list_v1(text,text,text,integer,integer)',
    'public.cl_advance_shipment(uuid,text,text,text,integer,integer,integer)'
  ]) as item
)
select count(*) filter (where ready) as ready, count(*) as total,
  coalesce(jsonb_agg(name order by name) filter (where not ready),'[]'::jsonb) as missing
from checks;
