create or replace function public.cl_price_list_v1(p_tab text,p_brand text,p_search text,p_limit integer,p_offset integer)
returns jsonb language sql stable security invoker set search_path='' as $$
with configs as (
 select id,tab_key,category,label,markup_ars,labor_ars,sort_order,created_at from public.cl_repair_configs where tab_key=p_tab
), filtered as (
 select p.id,p.name,coalesce(p.brand,'') brand,coalesce(p.quality,'') quality,p.category,p.stock_qty
 from public.cl_parts p where p.tab_key=p_tab and (p_brand='' or p.brand=p_brand)
 and (p_search='' or strpos(lower(p.name),lower(p_search))>0)
), page as (
 select * from filtered order by brand,name,id limit least(greatest(p_limit,1),1000) offset greatest(p_offset,0)
), items as (
 select p.id,p.name,p.brand,p.quality,p.category,coalesce(p.stock_qty>0,false) stock,
 v.best_cost, v.best_cost+coalesce(c.markup_ars,0)+coalesce(c.labor_ars,0) final_price,
 v.best_provider,coalesce(c.markup_ars,0) markup_ars,coalesce(c.labor_ars,0) labor_ars,v.all_providers
 from page p left join configs c on c.category=p.category
 cross join lateral (
 select min(pp.cost_ars) best_cost,(array_agg(pr.name order by pp.cost_ars,pr.name))[1] best_provider,
 coalesce(jsonb_agg(jsonb_build_object('name',pr.name,'cost',pp.cost_ars) order by pp.cost_ars,pr.name),'[]'::jsonb) all_providers
 from public.cl_provider_prices pp join public.cl_providers pr on pr.id=pp.provider_id
 where pp.part_id=p.id and pp.is_latest and pr.is_active and pp.cost_ars>0
 and (to_jsonb(pp)->>'supplier_in_stock') is distinct from 'false'
 ) v
)
select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(i) order by brand,name,id) from items i),'[]'::jsonb),
'total',(select count(*) from filtered),'limit',least(greatest(p_limit,1),1000),'offset',greatest(p_offset,0),
'brands',coalesce((select jsonb_agg(distinct brand order by brand) from public.cl_parts where tab_key=p_tab and brand<>''),'[]'::jsonb),
'configs',coalesce((select jsonb_agg(to_jsonb(c) order by sort_order,id) from configs c),'[]'::jsonb))
$$;
revoke all on function public.cl_price_list_v1(text,text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.cl_price_list_v1(text,text,text,integer,integer) to service_role;