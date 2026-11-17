import {chargeLabel,isChargeJob} from './charge-quote'

export function partQuality(quality:string,name=''){
 const text=quality+' '+name
 if(/\b(?:incell|in-cell|in cell)\b/i.test(text))return 'Incell'
 if(/\b(?:amoled|oled)\b/i.test(text))return /amoled/i.test(text)?'AMOLED':'OLED'
 if(/\b(?:oem|orig(?:inal)?\.?|service pack)\b/i.test(text))return 'Tipo original'
 if(/\b(?:tft|lcd|copy|copia|wuzip|t20|amm|mec[aá]nico)\b/i.test(text)){
  const known=text.match(/\b(tft|lcd|copy|copia|wuzip|t20|amm|mec[aá]nico)\b/i)?.[0]||''
  return /copy|copia/i.test(known)?'Copia':known.toUpperCase()
 }
 return ''
}
export function repairForCategory(category:string){
 if(/modulo/.test(category))return 'Cambio de módulo'
 if(/bateria/.test(category))return 'Cambio de batería'
 if(/(?:pin|placa|flex)_carga/.test(category))return 'Pin de carga'
 if(/tapa/.test(category))return 'Cambio de tapa trasera'
 if(/camara/.test(category))return 'Cambio de cámara'
 return 'Cambio de repuesto'
}
export function partCaption(job:string,device:string,quality='',color=''){
 if(isChargeJob(job))return [chargeLabel(device),quality].filter(Boolean).join(' · ')
 const kind=job.replace(/^Cambio de\s+/i,'').replace(/\s*\(excepto iPhone\)$/i,'')
 const short=device.trim().replace(/^(?:(?:Samsung|Motorola|Moto|Galaxy|Apple|Xiaomi|Huawei)\s+)+/i,'')
 return [kind.charAt(0).toUpperCase()+kind.slice(1),short,quality,color].filter(Boolean).join(' ')
}
export function partColor(job:string,name:string){
 if(!/tapa/i.test(job))return ''
 return name.match(/\b(?:azul oscuro|azul claro|verde oscuro|verde claro|gris oscuro|gris claro|azul|celeste|negro|negra|blanco|blanca|gris|verde|rosa|rojo|roja|violeta|dorado|dorada|plateado|plateada|morado|morada|lila|beige|amarillo|amarilla)\b/i)?.[0]?.toLowerCase()||''
}
export function publicOption(option?:string){
 // Current captions are generated from the requested device. Legacy options contained catalogue and supplier names.
 if(!option?.startsWith('Repuesto: '))return undefined
 return option.slice('Repuesto: '.length)
}
