export const familyLabels = {
 family:'Familiar', parent_child:'Madre/padre e hijo/a', siblings:'Hermanos/as', couple:'Pareja', other:'Otro vínculo',
} as const
export type FamilyKind=keyof typeof familyLabels
const keyPattern=/^[0-9a-f]{64}$/
export const validCustomerKey=(value:unknown): value is string=>typeof value==='string'&&keyPattern.test(value)
export const validFamilyKind=(value:unknown): value is FamilyKind=>typeof value==='string'&&Object.prototype.hasOwnProperty.call(familyLabels,value)
export function familyObjectName(first:unknown,second:unknown,kind:unknown){
 if(!validCustomerKey(first)||!validCustomerKey(second)||first===second||!validFamilyKind(kind))return null
 return [first,second].sort().join('-')+'-'+kind+'.json'
}
export function parseFamilyObject(name:string,customer:string){
 const [first,second,suffix,...more]=name.split('-')
 const kind=suffix?.replace(/\.json$/,'')
 if(more.length||familyObjectName(first,second,kind)!==name||(first!==customer&&second!==customer))return null
 return {key:first===customer?second:first,kind:kind as FamilyKind}
}
