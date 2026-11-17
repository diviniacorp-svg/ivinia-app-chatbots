'use client'
import { orderMetrics,orderMetricWindow,type MetricOrder } from './order-lists'

type Props = {orders:MetricOrder[];filter:string;onSelect:(key:string)=>void;loading?:boolean;locked?:boolean;budget?:number|null}
const ars=(n:number)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n)
export default function OrderMetricCards({orders,filter,onSelect,loading=false,locked=false,budget}:Props){
 const stats=orderMetrics(orders,orderMetricWindow())
 const shell={background:'#fff',borderRadius:12,minWidth:0,textAlign:'center' as const}
 const small={fontSize:12,color:'#64748b',marginTop:3}
 const btn=(key:string,color:string)=>({...shell,border:'1px solid '+(filter===key?color:'#e5e7eb'),padding:'12px 8px',cursor:'pointer',fontFamily:'inherit'})
 const shown=(n:number)=>loading?'—':n
 return <div aria-label="Indicadores de órdenes" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,142px),1fr))',gap:9,marginBottom:18}}>
  {([
    ['active','Activas','⚙️','#6366f1'],['listo','Listas en taller','✅','#059669'],['delivered','Entregadas','🏁','#4f46e5']
  ] as const).map(([key,label,icon,color])=><button type="button" key={key} aria-pressed={filter===key} onClick={()=>onSelect(key)} style={btn(key,color)}>
   <span aria-hidden="true" style={{display:'block',fontSize:19}}>{icon}</span><strong style={{display:'block',color,fontSize:23}}>{shown(stats[key])}</strong><span style={small}>{label}</span>
  </button>)}
  <div style={{...shell,border:'1px solid #e5e7eb',padding:'7px 6px'}}><div style={{...small,margin:'1px 0 5px'}}>📋 Ingresadas</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:4}}>
    {([['week','Semana'],['month','Mes']] as const).map(([key,label])=><button type="button" key={key} aria-label={key==='week'?'Ingresadas esta semana':'Ingresadas este mes'} aria-pressed={filter===key} onClick={()=>onSelect(key)} style={{...btn(key,'#d97706'),padding:'6px 3px',background:filter===key?'#fff7ed':'#fff'}}>
     <strong style={{display:'block',color:'#b45309',fontSize:17}}>{shown(stats[key])}</strong><span style={small}>{label}</span>
    </button>)}
   </div>
  </div>
  <button type="button" aria-pressed={!locked&&filter==='budgetMonth'} onClick={()=>onSelect('budgetMonth')} style={btn('budgetMonth','#0284c7')}>
   <span aria-hidden="true" style={{display:'block',fontSize:19}}>{locked?'🔒':'💰'}</span>
   <strong style={{display:'block',color:'#0284c7',fontSize:16}}>{locked?'Ver con PIN':loading||budget===null?'—':ars(budget??stats.budgetMonth)}</strong><span style={small}>Presupuestado este mes</span>
  </button>
 </div>
}
