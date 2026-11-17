import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { hasNucleusSession } from '@/lib/celulab/nucleus-session'
import { sameOrigin } from '@/lib/celulab/partner-session'
import { familyObjectName,parseFamilyObject,validCustomerKey } from '@/lib/celulab/customer-family'
export const dynamic='force-dynamic'
const bucketName='celulab-customer-family'
const folder=()=>process.env.VERCEL_ENV==='production'?'production':'preview'
const response=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}})
const missing=(e:{message:string;statusCode?:string|number;status?:string|number})=>Number(e.statusCode??e.status)===404||/not found|does not exist/i.test(e.message)
export async function GET(req:NextRequest){
 if(!await hasNucleusSession(req))return response({},403)
 const key=req.nextUrl.searchParams.get('key')
 if(!validCustomerKey(key))return response({},400)
 const storage=createAdminClient().storage
 const info=await storage.getBucket(bucketName)
 if(info.error)return missing(info.error)?response([]):response({},503)
 if(info.data.public)return response({},503)
 const results=[]
 for(let offset=0;;offset+=100){
  const {data,error}=await storage.from(bucketName).list(folder(),{limit:100,offset,search:key,sortBy:{column:'name',order:'asc'}})
  if(error)return response({},503)
  for(const file of data){const link=parseFamilyObject(file.name,key);if(link)results.push(link)}
  if(data.length<100)break
 }
 return response(results)
}
async function mutate(req:NextRequest,remove:boolean){
 if(!sameOrigin(req)||!await hasNucleusSession(req))return response({},403)
 const body=await req.json().catch(()=>null)
 const name=familyObjectName(body?.key,body?.related,body?.kind)
 if(!name)return response({},400)
 const storage=createAdminClient().storage
 const info=await storage.getBucket(bucketName)
 if(info.error){
  if(remove||!missing(info.error))return response({},503)
  const result=await storage.createBucket(bucketName,{public:false,fileSizeLimit:1024,allowedMimeTypes:['application/json']})
  if(result.error){
   const retry=await storage.getBucket(bucketName)
   if(retry.error||retry.data.public)return response({},503)
  }
 }else if(info.data.public)return response({},503)
 const path=folder()+'/'+name
 const bucket=storage.from(bucketName)
 const result=remove?await bucket.remove([path]):await bucket.upload(path,new Blob(['{}'],{type:'application/json'}),{upsert:true,contentType:'application/json',cacheControl:'0'})
 return result.error?response({},503):response({ok:true})
}
export const POST=(req:NextRequest)=>mutate(req,false)
export const DELETE=(req:NextRequest)=>mutate(req,true)
