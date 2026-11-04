const fs=require('fs'),path=require('path'),{JSDOM,VirtualConsole}=require('jsdom'),assert=require('assert');
const file=path.join(__dirname,'../../public/bigdata/index.html');
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const html=fs.readFileSync(file,'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://study.local/',virtualConsole:vc});
const w=dom.window,d=w.document;
assert.deepStrictEqual(errors,[]);
const bank=w.STUDY_BANK;
assert(bank&&bank.length>200);
assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);
const counts={};
for(const ch of [5,6,7,8])for(const level of [0,1,2])for(const type of ['code','mc','ox']){
 const qs=bank.filter(q=>q.ch===ch&&q.level===level&&q.type===type);assert(qs.length>0,[ch,level,type].join('/'));
 counts[[ch,level,type].join('/')]=qs.length;
 d.querySelector('[data-ch="'+ch+'"]').click();
 d.querySelector('[data-level="'+level+'"]').click();
 d.querySelector('[data-type="'+type+'"]').click();
 assert(d.querySelector('article'));assert(d.querySelector('#position').textContent.includes(ch+'장'));
 if(type==='code'){
  assert(d.querySelector('#editor'));d.querySelector('#editor').value='draft for '+ch;d.querySelector('#editor').dispatchEvent(new w.Event('input'));
  d.querySelector('#reveal').click();assert(!d.querySelector('#model').hidden);
 }else{
  const q=qs[0],n=type==='mc'?q.a:q.a?0:1;
  d.querySelector('[data-pick="'+n+'"]').click();d.querySelector('#submit').click();
  assert(d.querySelector('#feedback').textContent.includes('정답입니다.'));
  d.querySelector('#again').click();assert(d.querySelector('#feedback').hidden);
 }
 d.querySelector('#tab-concept').click();assert(!d.querySelector('#conceptView').hidden);
 assert.equal(d.querySelectorAll('#conceptBody section.visible').length,1);
 assert(d.querySelector('#conceptBody section.visible').textContent.includes('0'+ch));
 d.querySelector('#tab-practice').click();assert(!d.querySelector('#practiceView').hidden);
}
for(const q of bank){if(q.type==='mc'){assert(q.a>=0&&q.a<q.o.length);assert.equal(new Set(q.o).size,q.o.length);}if(q.type==='ox')assert.equal(typeof q.a,'boolean');}
// Restoring a record preserves the draft and advances 5장→6장 at a stage boundary.
const last=bank.filter(q=>q.ch===5&&q.level===2&&q.type==='code').length-1;
const restored={ch:5,level:2,type:'code',mode:'all',view:'practice',positions:{'5-2-code-all':last},records:{},drafts:{}};
const qlast=bank.filter(q=>q.ch===5&&q.level===2&&q.type==='code')[last];
restored.drafts[qlast.id]='saved_code = 42';
const dom2=new JSDOM(html,{runScripts:'dangerously',url:'https://study.local/',virtualConsole:vc,beforeParse(w){w.HTMLElement.prototype.scrollIntoView=function(){};w.localStorage.setItem('bd-personal-study-v1',JSON.stringify({version:1,state:restored}));}});
assert.equal(dom2.window.document.querySelector('#editor').value,'saved_code = 42');
dom2.window.document.querySelector('#next').click();
assert(dom2.window.document.querySelector('#position').textContent.startsWith('6장'));
dom2.window.close();
assert.deepStrictEqual(errors,[]);
console.log(JSON.stringify({questions:bank.length,code:bank.filter(x=>x.type==='code').length,mc:bank.filter(x=>x.type==='mc').length,ox:bank.filter(x=>x.type==='ox').length,combinations:Object.keys(counts).length,scriptErrors:errors},null,2));
dom.window.close();
