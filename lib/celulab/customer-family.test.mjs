import {test} from 'node:test'
import assert from 'node:assert/strict'
import {familyObjectName,parseFamilyObject} from './customer-family.ts'
const a='a'.repeat(64),b='b'.repeat(64)
test('family links are deterministic and readable from either profile without merging identities',()=>{
 const name=familyObjectName(a,b,'siblings')
 assert.equal(name,familyObjectName(b,a,'siblings'))
 assert.deepEqual(parseFamilyObject(name,a),{key:b,kind:'siblings'})
 assert.deepEqual(parseFamilyObject(name,b),{key:a,kind:'siblings'})
 assert.equal(parseFamilyObject(name,'c'.repeat(64)),null)
})
test('rejects self links, invalid keys and arbitrary storage paths',()=>{
 assert.equal(familyObjectName(a,a,'other'),null)
 assert.equal(familyObjectName('../private',b,'family'),null)
 assert.equal(familyObjectName(a,b,'__proto__'),null)
 assert.equal(parseFamilyObject(a+'-'+b+'-couple.txt',a),null)
})
