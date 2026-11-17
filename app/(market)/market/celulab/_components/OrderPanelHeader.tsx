'use client'
import QuoteEditor from './QuoteEditor'

export default function OrderPanelHeader({title,subtitle,detail,color,partner,pin,onNew}:{
 title:string;subtitle:string;detail?:string;color:string;partner?:string|null;pin?:string;onNew:()=>void
}){
 return <header className="cl-order-header">
  <div><h2 style={{margin:0,fontSize:20,color:'#0f172a'}}>{title}</h2><p style={{margin:'3px 0 5px',fontSize:13,color:'#64748b'}}>{subtitle}</p>{detail&&<p style={{margin:0,fontSize:12,color:'#64748b'}}>{detail}</p>}</div>
  <div className="cl-order-actions">
   <QuoteEditor partner={partner} pin={pin}/>
   <button type="button" className="cl-order-action-primary" style={{background:color}} onClick={onNew}>+ Nueva orden</button>
  </div>
  <style>{`
   .cl-order-header{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}
   .cl-order-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-left:auto}
   .cl-order-actions>.cl-quote-open,.cl-order-action-primary{min-height:43px;padding:9px 16px;border-radius:10px;font-size:13px}
   .cl-order-action-primary{border:0;color:#fff;font-family:inherit;font-weight:750;cursor:pointer}
   @media(max-width:570px){.cl-order-actions{width:100%;margin:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.cl-order-actions>.cl-quote-open,.cl-order-action-primary{padding-inline:5px}}
  `}</style>
 </header>
}
