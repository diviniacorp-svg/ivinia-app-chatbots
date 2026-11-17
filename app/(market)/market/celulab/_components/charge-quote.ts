const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
export const isChargeJob=(job:string)=>/^(?:cambio de )?(?:pin|puerto) de carga$/.test(norm(job))
export const isIphone=(device:string)=>/\biphone\b/.test(norm(device))
export const chargeLabor=(device:string)=>isIphone(device)?[30000,40000,50000]:[20000,25000]
export const chargeLabel=(device:string)=>isIphone(device)?'Pin de carga (flex completo)':'Pin de carga'
export const chargeSupplier=(name:string)=>/\b(?:jps|only|mac\s*cell)\b/.test(norm(name))
export function chargeModel(device:string){
 return norm(device).replace(/^(?:(?:samsung|galaxy|motorola|moto|xiaomi|apple|huawei)\s+)+/,'')
}
export function matchesDevice(device:string,name:string){
 const title=norm(name), model=chargeModel(device)
 if(!model)return false
 const modelPattern=model.replace(/([a-z])([0-9])/g,'$1 *$2').replace(/ /g,' +').replace(/ \+\*/g,' *')
 const modelMatch=title.match(new RegExp('\\b'+modelPattern+'\\b'))
 if(!modelMatch)return false
 const suffix=title.slice((modelMatch.index??0)+modelMatch[0].length)
 if(/^\s+(?:pro|max|plus|mini|ultra|lite|5g|4g|fe|neo|power|play|fusion|edge|se|sport|go)\b/.test(suffix))return false
 return true
}
export function matchesChargePart(device:string,name:string,category:string){
 if(!matchesDevice(device,name))return false
 const title=norm(name),kind=norm(name+' '+category)
 if(/\b(?:placa madre|placa principal|motherboard|mainboard)\b/.test(title))return false
 const flex=/\b(?:flex|flexor|flex cable)\b/.test(title)
 const load=/\b(?:carga|charging|charger|dock|usb)\b/.test(kind)
 const board=/\b(?:placa|plaqueta|sub ?placa|sub ?board|board|pcb)\b/.test(title)
 return isIphone(device)?flex&&load:board&&load&&!/\b(?:flex|flexor)\b/.test(title)
}
export function chargePrice(cost:number,markup:number,labor:number){
 return {part:cost+markup,total:cost+markup+labor}
}
