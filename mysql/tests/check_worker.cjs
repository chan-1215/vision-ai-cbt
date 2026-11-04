const fs=require('fs'),assert=require('assert'),{makeWorker}=require('./vm_worker.cjs');
require('../src/content.js');
let seq=0,pending=new Map();
const worker=makeWorker(fs.readFileSync(__dirname+'/../src/worker.bundle.js','utf8'),e=>{const p=pending.get(e.data.id);pending.delete(e.data.id);if(e.data.error)p.reject(Error(e.data.error));else p.resolve(e.data.result);},e=>{throw e;});
function call(op,p={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});worker.postMessage({id,op,...p});});}
async function main(){
 assert((await call('ping')).ready);
 let state=null;
 for(const step of COURSE.steps){const r=await call('grade',{state,step,sql:step.answer});assert(r.pass,step.id+' '+r.message);state=r.state;}
 const sample=await call('run',{state:null,sql:COURSE.demoSQL});assert(!sample.error);assert.equal(sample.inspect.tables[0].count,12);
 const next=await call('run',{state:sample.state,sql:"INSERT INTO products (name,price) VALUES('오프라인 추가',100);SELECT COUNT(*) AS n FROM products;"});assert.equal(next.outputs.at(-1).result.values[0][0],13);
 assert.equal(worker.networkCalls(),0);
 worker.terminate();console.log('PASS: bundled browser worker, all 52 steps, free SQL, zero network requests');
}
main().catch(e=>{console.error(e);worker.terminate();process.exitCode=1;});
