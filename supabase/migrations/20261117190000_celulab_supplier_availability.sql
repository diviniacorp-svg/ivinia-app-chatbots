-- NULL means that availability at this provider has not been verified.
-- An aggregate legacy stock count does not identify the supplier that has inventory.
alter table public.cl_provider_prices
  add column if not exists supplier_in_stock boolean;

comment on column public.cl_provider_prices.supplier_in_stock is
  'Availability verified for this provider and offer. NULL is unknown, not in stock.';
