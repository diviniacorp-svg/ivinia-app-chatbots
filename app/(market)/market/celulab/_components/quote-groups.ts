export type QuoteLine = {device:string; job:string; part:number; labor:number; pending?:boolean; equipment?:string; task?:string; option?:string}
export const pesos = (n:number)=>n.toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})
export function quoteSummary(lines:QuoteLine[]){
  const devices = new Map<string, Map<string,QuoteLine[]>>()
  for(const [i,line] of Array.from(lines.entries())){
    const key=line.equipment||line.device
    const tasks=devices.get(key)||new Map<string,QuoteLine[]>()
    const task=line.task||String(i)
    tasks.set(task,[...(tasks.get(task)||[]),line])
    devices.set(key,tasks)
  }
  return Array.from(devices.values()).map((tasks,index)=>{
    let variants:{items:string[];total:number;pending:boolean}[]=[{items:[],total:0,pending:false}]
    for(const options of Array.from(tasks.values())){
      if(variants.length*options.length>128)throw Error('Elegí hasta 128 combinaciones por equipo.')
      variants=variants.flatMap(v=>options.map(l=>({
        items:[...v.items,[l.job,l.option,l.pending?'A confirmar':pesos(l.part+l.labor)].filter(Boolean).join(' · ')],
        total:v.total+l.part+l.labor,pending:v.pending||!!l.pending
      })))
    }
    const first=Array.from(tasks.values())[0][0]
    return ['Equipo '+(index+1)+' · '+first.device,...variants.map((v,i)=>[variants.length>1?'Alternativa '+(i+1):'',...v.items,'Total del equipo: '+(v.pending?'A confirmar':pesos(v.total))].filter(Boolean).join('\n'))].join('\n\n')
  }).join('\n\n')
}
