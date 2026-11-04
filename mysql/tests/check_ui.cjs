const fs=require('fs'),assert=require('assert'),{JSDOM,VirtualConsole}=require('jsdom'),{makeWorker}=require('./vm_worker.cjs');
const html=fs.readFileSync(require('path').join(__dirname,'../../common/public/sql/index.html'),'utf8'),errors=[],downloads=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
function open(saved){
 return new JSDOM(html,{runScripts:'dangerously',url:'https://sql-offline.local/',virtualConsole:vc,beforeParse(w){
  w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;w.alert=m=>errors.push(m);
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  const blobs=new Map();let n=0;
  w.Blob=class{constructor(parts,opts){this.parts=parts;this.type=opts?.type;}};
  w.URL.createObjectURL=b=>{const k='blob:test-'+(++n);blobs.set(k,b);return k;};w.URL.revokeObjectURL=k=>blobs.delete(k);
  w.HTMLAnchorElement.prototype.click=function(){downloads.push({name:this.download,text:blobs.get(this.href)?.parts.join('')});};
  w.Worker=class{
   constructor(url){this.w=makeWorker(blobs.get(url).parts.join(''),e=>this.onmessage?.(e),e=>this.onerror?.(e));}
   postMessage(data){this.w.postMessage(data);}terminate(){this.w.terminate();}
  };
  if(saved)w.localStorage.setItem('mysql-workshop-v1',saved);
 }});
}
async function idle(d){for(let i=0;i<800;i++){await new Promise(r=>setTimeout(r,5));if(!d.querySelector('#cancelRun'))return;}throw Error('UI timeout');}
function edit(w,id,text){const e=w.document.querySelector(id);e.value=text;e.dispatchEvent(new w.Event('input'));}
async function main(){
 console.log('UI start');
 const dom=open(),w=dom.window,d=w.document;await idle(d);
 console.log('UI initialized',d.querySelector('#engineStatus').textContent);
 assert(d.querySelector('#engineStatus').textContent.includes('준비 완료'));
 assert.equal(d.documentElement.dataset.theme,'dark');
 edit(w,'#problemEditor',"CREATE DATABASE '");d.querySelector('#checkProblem').click();assert(d.querySelector('#problemFeedback').classList.contains('tone-wrong'));
 edit(w,'#problemEditor','CREATE DATABASE wrong_name;');d.querySelector('#checkProblem').click();await idle(d);assert(d.querySelector('#problemFeedback').classList.contains('tone-wrong'));assert(d.querySelector('#next').disabled);
 for(let i=0;i<w.COURSE.steps.length;i++){
  if(i%10===0)console.log('UI step',i+1);
  const q=w.COURSE.steps[i];edit(w,'#problemEditor',q.answer);
  if(i===6){d.querySelector('#runProblem').click();await idle(d);assert(d.querySelector('#next').disabled);}
  if(i===21){
   edit(w,'#problemEditor','SELECT name, price FROM products WHERE price >= 5000 AND price <= 20000;');d.querySelector('#checkProblem').click();await idle(d);assert(d.querySelector('#problemFeedback').classList.contains('tone-missing'));assert(d.querySelector('#next').disabled);edit(w,'#problemEditor',q.answer);
  }
  d.querySelector('#checkProblem').click();await idle(d);
  assert(d.querySelector('#problemFeedback').classList.contains('tone-correct'),q.id+' '+d.querySelector('#problemFeedback').textContent);
  assert(!d.querySelector('#next').disabled);
  if(i<w.COURSE.steps.length-1){d.querySelector('#next').click();await idle(d);}
 }
 assert.equal(d.querySelector('#doneCount').textContent,'52 / 52');
 d.querySelector('#tab-concepts').click();assert(!d.querySelector('#conceptsView').hidden);
 for(const c of w.COURSE.concepts){d.querySelector('[data-concept="'+c.chapter+'"]').click();assert(d.querySelector('#conceptContent').textContent.includes(c.title));}
 d.querySelector('#tab-free').click();await idle(d);assert(!d.querySelector('#freeView').hidden);
 edit(w,'#freeEditor',"CREATE TABLE notes (id INT AUTO_INCREMENT PRIMARY KEY, note VARCHAR(20));\nINSERT INTO notes(note) VALUES('자유 연습');\nSELECT * FROM notes;");
 d.querySelector('#freeRunAll').click();await idle(d);assert(d.querySelector('#freeOutput').textContent.includes('자유 연습'));assert.equal(d.querySelector('#doneCount').textContent,'52 / 52');
 d.querySelector('#backup').click();const exported=JSON.parse(downloads.at(-1).text);assert.equal(exported.app,'mysql-workshop');assert(exported.state.free.dbs.playground);
 d.querySelector('#resetCourse').click();await idle(d);assert.equal(d.querySelector('#doneCount').textContent,'0 / 52');assert(d.querySelector('#freeInspector').textContent.includes('notes'));
 const file={size:downloads.at(-1).text.length,text:async()=>downloads.at(-1).text};
 Object.defineProperty(d.querySelector('#backupFile'),'files',{configurable:true,value:[file]});d.querySelector('#backupFile').dispatchEvent(new w.Event('change'));await new Promise(r=>setTimeout(r,20));await idle(d);
 assert.equal(d.querySelector('#doneCount').textContent,'52 / 52');assert(d.querySelector('#freeInspector').textContent.includes('notes'));
 d.querySelector('#theme').click();assert.equal(d.documentElement.dataset.theme,'light');
 d.querySelector('#openScope').click();assert(d.querySelector('#scopeDialog').open);d.querySelector('#closeScope').click();
 const saved=JSON.stringify({version:1,state:exported.state}),dom2=open(saved);await idle(dom2.window.document);assert.equal(dom2.window.document.querySelector('#doneCount').textContent,'52 / 52');assert(dom2.window.document.querySelector('#freeInspector').textContent.includes('notes'));dom2.window.close();
 assert.deepStrictEqual(errors,[]);dom.window.close();
 console.log('PASS: 52 SQL problems via UI, run-only isolation, 6 concepts, free DB isolation, backup/restore/reload, themes, scope dialog');
}
main().catch(e=>{console.error(e);process.exit(1);});
