'use client'
import type { ReactNode } from 'react'
import { groupOrderMonths } from './order-lists'

export default function OrderPeriods<T extends { id: string; created_at: string; damage_diagram?: { completedAt?: string } }>({ rows, children }: {
  rows: T[]
  children: (order: T) => ReactNode
}) {
  return <div style={{ display:'grid',gap:10 }}>
    {groupOrderMonths(rows).map((group,index,all)=><section key={group.key}>
      {(index===0||all[index-1].year!==group.year)&&<h3 style={{margin:'8px 0',fontSize:13,color:'#64748b',fontWeight:700}}>{group.year}</h3>}
      <details open={index===0||undefined} style={{border:'1px solid #e2e8f0',borderRadius:13,background:'#f8fafc'}}>
        <summary style={{cursor:'pointer',padding:'11px 14px',fontSize:13,fontWeight:700,color:'#1e40af',textTransform:'capitalize'}}>
          {group.month} <span style={{borderRadius:16,padding:'2px 8px',marginLeft:6,color:'#475569',background:'#eaf0fc',fontSize:11,textTransform:'none'}}>{group.rows.length} {group.rows.length===1?'orden':'órdenes'}</span>
        </summary>
        <div style={{display:'grid',gap:8,padding:'0 8px 8px'}}>{group.rows.map(children)}</div>
      </details>
    </section>)}
  </div>
}
