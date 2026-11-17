import {lineCaution,linePrice,pesos,publicJob,quoteGroups,quoteSummary,type QuoteLine} from './quote-groups'
import {publicOption} from './quote-labels'

export type Version={quote_id:string;revision:number;issued_at:string;issuer:string;customer:string;customer_phone?:string;lines:QuoteLine[]}
export const quoteDate=(s:string)=>new Date(s).toLocaleString('es-AR',{timeZone:'America/Argentina/Buenos_Aires'})
export const quoteNote='Los precios corresponden al día de emisión. Al traer el equipo confirmamos stock y precios vigentes. Cualquier cambio se comunica para tu aceptación antes de realizar el trabajo.'
export const quoteNumber=(v:Version)=>v.quote_id.slice(0,8).toUpperCase()+' · v'+v.revision
export const quoteFilename=(v:Version)=>'CeluLab-Presupuesto-'+v.quote_id.slice(0,8).toUpperCase()+'-v'+v.revision+'.pdf'
export function quoteMessage(v:Version){
 return ['*CeluLab · Presupuesto '+quoteNumber(v)+'*',v.issuer,quoteDate(v.issued_at),v.customer,v.customer_phone,quoteSummary(v.lines),quoteNote].filter(Boolean).join('\n\n')
}
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>(({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'} as Record<string,string>)[c]||c))
export function printableQuote(v:Version){
 const rows=quoteGroups(v.lines).map(g=>'<section><h2>'+esc(g.title)+'</h2>'+g.variants.map((a,i)=>(g.variants.length>1?'<h3>Alternativa '+(i+1)+'</h3>':'')+a.lines.map(l=>'<div class="row"><div><strong>'+esc(publicJob(l))+'</strong>'+(publicOption(l.option)?'<small>'+esc(publicOption(l.option)!)+'</small>':'')+(lineCaution(l)?'<small>'+esc(lineCaution(l))+'</small>':'')+'</div><b>'+esc(linePrice(l))+'</b></div>').join('')+'<div class="row total"><strong>Total del equipo</strong><b>'+esc(a.pending?'A confirmar':pesos(a.total))+'</b></div>').join('')+'</section>').join('')
 return '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Presupuesto CeluLab</title><style>@page{size:A4;margin:15mm}*{box-sizing:border-box}body{font:13px/1.45 Arial,sans-serif;color:#17243a;margin:0}main{border:1px solid #8493a7;border-radius:9px;padding:18px}header{display:flex;justify-content:space-between;border-bottom:2px solid #1c2e48;padding-bottom:10px;gap:18px}header b{font-size:20px}header small,.row small{display:block;color:#465671}h2{font-size:14px;margin:0;background:#edf2fa;padding:8px}h3{font-size:12px;margin:8px}section{border:1px solid #ccd5e2;border-radius:6px;margin-top:12px;overflow:hidden}.row{display:flex;justify-content:space-between;gap:18px;padding:7px 9px;border-bottom:1px solid #e4e9f0;break-inside:avoid}.row b{white-space:nowrap}.total{background:#f2f5fb}footer{font-size:10px;margin-top:13px;color:#465671}</style></head><body><main><header><div><b>CeluLab</b><small>TALLER DE REPARACIONES · SAN LUIS CAPITAL</small></div><div><strong>Presupuesto '+esc(quoteNumber(v))+'</strong><small>'+esc(quoteDate(v.issued_at))+'</small></div></header><p>'+[v.issuer,v.customer,v.customer_phone].filter(s=>!!s).map(s=>esc(s!)).join(' · ')+'</p>'+rows+'<footer>'+esc(quoteNote)+'</footer></main></body></html>'
}
const ascii=(s:string)=>Array.from(s.normalize('NFC')).map(c=>{
 const n=c.codePointAt(0)||0
 return n<32?' ':n>255?(c==='–'||c==='—'?'-':'?'):c
}).join('')
const pdfText=(s:string)=>Array.from(ascii(s)).map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join('')
function wrap(text:string,max:number){
 const result:string[]=[]
 let line=''
 for(const word of ascii(text).trim().split(/\s+/)){
  if(line&&line.length+word.length+1>max){result.push(line);line=''}
  if(word.length>max){if(line){result.push(line);line=''}for(let i=0;i<word.length;i+=max)result.push(word.slice(i,i+max))}
  else line+=(line?' ':'')+word
 }
 if(line)result.push(line)
 return result
}
export function quotePdf(v:Version){
 const pages:string[]=[]
 let commands='', y=0
 const txt=(x:number,top:number,size:number,s:string,bold=false)=>{commands+='BT 0.09 0.14 0.23 rg /'+(bold?'F2':'F1')+' '+size+' Tf '+x+' '+(842-top)+' Td <'+pdfText(s)+'> Tj ET\n'}
 const rule=(top:number)=>{commands+='0.78 0.83 0.89 RG 0.6 w 48 '+(842-top)+' m 547 '+(842-top)+' l S\n'}
 function closePage(){const bottom=Math.max(36,842-y-12);pages.push('0.52 0.58 0.66 RG 0.7 w 36 '+bottom+' 523 '+(806-bottom)+' re S\n'+commands)}
 function page(){
  if(commands)closePage()
  commands=''
  txt(48,62,21,'CeluLab',true);txt(48,78,8,'TALLER DE REPARACIONES · SAN LUIS CAPITAL')
  txt(330,62,13,'Presupuesto '+quoteNumber(v),true);txt(330,78,9,quoteDate(v.issued_at))
  rule(88);y=106
 }
 function ensure(h:number){if(y+h>790)page()}
 function label(text:string){const ls=wrap(text,70);ensure(ls.length*15+11);for(const line of ls){txt(48,y,12,line,true);y+=15}y+=8}
 function row(title:string,sub:string|undefined,amount:string,bold=false){
  const a=wrap(title,57), b=sub?wrap(sub,63):[], h=(a.length+b.length)*13+11
  ensure(h)
  txt(448,y,11,amount,true)
  for(const l of a){txt(52,y,11,l,bold);y+=13}
  for(const l of b){txt(52,y,9,l);y+=13}
  rule(y-5);y+=11
 }
 page()
 for(const t of [v.issuer,v.customer,v.customer_phone].filter(Boolean) as string[]){
  for(const l of wrap(t,85)){ensure(13);txt(48,y,10,l);y+=13}
 }
 y+=12
 for(const g of quoteGroups(v.lines)){
  label(g.title)
  for(const [i,a] of Array.from(g.variants.entries())){
   if(g.variants.length>1)label('Alternativa '+(i+1))
   for(const l of a.lines)row(publicJob(l),[publicOption(l.option),lineCaution(l)].filter(Boolean).join(' · '),linePrice(l))
   row('Total del equipo',undefined,a.pending?'A confirmar':pesos(a.total),true)
  }
  y+=7
 }
 const foot=wrap(quoteNote,91);ensure(foot.length*12+4)
 for(const l of foot){txt(48,y,9,l);y+=12}
 closePage()
 const objs=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Count '+pages.length+' /Kids ['+pages.map((_,i)=>(5+i*2)+' 0 R').join(' ')+'] >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>']
 for(const [i,p] of Array.from(pages.entries()))objs.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents '+(6+i*2)+' 0 R >>','<< /Length '+p.length+' >>\nstream\n'+p+'endstream')
 let out='%PDF-1.4\n'
 const offsets=objs.map((o,i)=>{const start=out.length;out+=(i+1)+' 0 obj\n'+o+'\nendobj\n';return start})
 const xref=out.length
 out+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n'+offsets.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+(objs.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n'
 return new Blob([out],{type:'application/pdf'})
}
