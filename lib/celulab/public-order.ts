export function totalOnlyLines(value:unknown){
 return Array.isArray(value)?value.filter(l=>l&&typeof l.job==='string').map(l=>({device:l.device,job:l.job,option:l.option,task:l.task,equipment:l.equipment,pending:l.pending===true,part:(Number(l.part)||0)+(Number(l.labor)||0),labor:0})): []
}
export function partnerOrder<T extends Record<string,unknown>>(order:T,showCommission=false){
 const {part_cost_ars,commission_ars,commission_pct,quote_draft_lines,budget_items,...safe}=order
 return {...safe,quote_draft_lines:totalOnlyLines(quote_draft_lines),
  budget_items:Array.isArray(budget_items)?budget_items.filter(item=>item?.is_cost!==true).map(item=>({desc:item.desc,price:item.price})):[],
  ...(showCommission?{commission_ars,commission_pct}:{})}
}
