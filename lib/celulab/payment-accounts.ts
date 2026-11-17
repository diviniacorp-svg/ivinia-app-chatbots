import {createAdminClient} from '@/lib/supabase'
export type PaymentAccount={id:string;name:string;alias:string;qr:string}
const bucketName='celulab-payment-settings'
const object=()=>process.env.VERCEL_ENV==='production'?'production.json':'preview.json'
const bucket=()=>createAdminClient().storage.from(bucketName)
export function cleanAccounts(value:unknown):PaymentAccount[]|null{
 if(!Array.isArray(value)||value.length>5)return null
 const ids=new Set<string>(),aliases=new Set<string>(),rows:PaymentAccount[]=[]
 for(const item of value){
  if(!item||typeof item.id!=='string'||!/^[-a-z0-9]{8,50}$/i.test(item.id)||ids.has(item.id)||typeof item.alias!=='string'||!/^[-a-z0-9.]{6,40}$/i.test(item.alias.trim())||aliases.has(item.alias.toLowerCase().trim())||typeof item.name!=='string'||!item.name.trim()||item.name.length>60||typeof item.qr!=='string'||item.qr.length>180000||item.qr&&!/^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(item.qr))return null
  ids.add(item.id);aliases.add(item.alias.toLowerCase().trim())
  rows.push({id:item.id,name:item.name.trim(),alias:item.alias.trim(),qr:item.qr})
 }
 return rows
}
export async function readPaymentAccounts(){
 const {data,error}=await bucket().download(object())
 if(error){
  const status=Number((error as {status?:number|string;statusCode?:number|string}).statusCode||(error as {status?:number|string}).status)
  if(status===404||/not found|does not exist/i.test(error.message))return []
  throw Error('No se pudieron leer las cuentas')
 }
 if(!data)return []
 const rows=cleanAccounts(JSON.parse(await data.text()))
 if(!rows)throw Error('Configuración inválida')
 return rows
}
export async function savePaymentAccounts(rows:PaymentAccount[]){
 const storage=createAdminClient().storage, check=await storage.getBucket(bucketName)
 if(!check.data){
  const created=await storage.createBucket(bucketName,{public:false,fileSizeLimit:1000000,allowedMimeTypes:['application/json']})
  if(created.error&&!/already exists|duplicate/i.test(created.error.message))throw created.error
 }else if(check.data.public){throw Error('El almacenamiento debe ser privado')}
 const {error}=await bucket().upload(object(),new Blob([JSON.stringify(rows)],{type:'application/json'}),{upsert:true,contentType:'application/json',cacheControl:'0'})
 if(error)throw error
}
