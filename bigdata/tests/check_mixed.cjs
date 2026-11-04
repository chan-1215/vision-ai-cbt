const fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../../common/public/bigdata/index.html'),'utf8');
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
function open(state){return new JSDOM(html,{url:'https://study.local/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.HTMLElement.prototype.scrollIntoView=()=>{};if(state)w.localStorage.setItem('bd-personal-study-v1',state);}});}
const dom=open(),w=dom.window,d=w.document,bank=w.STUDY_BANK;
const id=()=>d.querySelector('article').dataset.qid;
d.querySelector('#tab-mixed').click();
assert(d.querySelector('#tab-mixed').classList.contains('active'));
assert(d.querySelector('#chapters').hidden);
assert.equal(d.querySelector('#counter').textContent,'1 / 336문제');
const initial=id(),first4=[];
for(let i=0;i<4;i++){first4.push(bank.find(q=>q.id===id()).ch);d.querySelector('#next').click();}
assert.equal(new Set(first4).size,4);
d.querySelector('#prev').click();const before=id();
d.querySelector('#tab-practice').click();d.querySelector('#tab-mixed').click();assert.equal(id(),before);
const state=w.localStorage.getItem('bd-personal-study-v1'),restored=open(state);
assert.equal(restored.window.document.querySelector('article').dataset.qid,before);restored.window.close();
for(const level of [-1,0,1,2])for(const type of ['all','code','mc','ox']){
 d.querySelector('[data-level="'+level+'"]').click();d.querySelector('[data-type="'+type+'"]').click();
 const expected=bank.filter(q=>(level===-1||q.level===level)&&(type==='all'||q.type===type));
 assert(d.querySelector('#counter').textContent.endsWith('/ '+expected.length+'문제'));
 assert(expected.some(q=>q.id===id()));
}
d.querySelector('[data-level="-1"]').click();d.querySelector('[data-type="all"]').click();d.querySelector('#reshuffle').click();
const seen=[];
for(let i=0;i<bank.length;i++){seen.push(id());if(i<bank.length-1)d.querySelector('#next').click();}
assert.equal(new Set(seen).size,bank.length);
d.querySelector('#next').click();assert(d.querySelector('#feedback').textContent.includes('마지막 문제'));
const oldSeed=JSON.parse(w.localStorage.getItem('bd-personal-study-v1')).state.mixSeed;
d.querySelector('#reshuffle').click();assert.equal(d.querySelector('#counter').textContent,'1 / 336문제');
assert.equal(JSON.parse(w.localStorage.getItem('bd-personal-study-v1')).state.mixSeed,(oldSeed+104729)>>>0);
assert.deepStrictEqual(errors,[]);
dom.window.close();console.log('PASS: 336 unique mixed questions, 4-chapter balance, 16 filters, saved position, tab switching and reshuffle');
