(function(){
'use strict';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STEPS=COURSE.steps,KEY='mysql-workshop-v1';
const empty=()=>({tab:'problems',step:0,passed:{},drafts:{},checkpoints:[null],free:null,freeDraft:'SHOW TABLES;',freeHistory:[],concept:'02'});
let S=empty(),busy=false,worker=null,requestId=0,pending=null,saveTimer,freeInspect=null;
function validate(st){
 const s={...empty()};for(const k of Object.keys(s))if(Object.hasOwn(st||{},k))s[k]=st[k];
 if(!['concepts','problems','free'].includes(s.tab))s.tab='problems';
 if(!Array.isArray(s.checkpoints)||s.checkpoints.length<1||s.checkpoints.length>STEPS.length+1||s.checkpoints[0]!==null)throw Error('문제 DB의 시작 정보가 올바르지 않습니다.');
 for(const snap of [...s.checkpoints.slice(1),...(s.free?[s.free]:[])]){
  if(!snap||typeof snap.dbs!=='object'||Array.isArray(snap.dbs))throw Error('DB 백업 형식이 올바르지 않습니다.');
  if(Object.keys(snap.dbs).length>20)throw Error('DB 개수는 20개 이내여야 합니다.');
  for(const [k,v]of Object.entries(snap.dbs))if(!/^[a-z_][a-z0-9_]{0,63}$/.test(k)||typeof v!=='string'||v.length>4000000||!/^[A-Za-z0-9+/]*={0,2}$/.test(v))throw Error('DB 백업 내용을 확인하세요.');
 }
 if(!Number.isInteger(s.step))s.step=0;s.step=Math.min(Math.max(0,s.step),STEPS.length-1,s.checkpoints.length-1);
 for(const k of ['passed','drafts'])if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))s[k]={};
 for(const k of Object.keys(s.passed))if(!STEPS.some(q=>q.id===k)||!['correct','alternative'].includes(s.passed[k]))delete s.passed[k];
 for(const k of Object.keys(s.drafts))if(!STEPS.some(q=>q.id===k)||typeof s.drafts[k]!=='string')delete s.drafts[k];
 if(typeof s.freeDraft!=='string')s.freeDraft='';
 if(!Array.isArray(s.freeHistory))s.freeHistory=[];s.freeHistory=s.freeHistory.filter(x=>x&&typeof x.sql==='string').slice(-40);
 if(!COURSE.concepts.some(c=>c.chapter===s.concept))s.concept='02';
 return s;
}
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved?.version===1)S=validate(saved.state);}catch(e){console.warn('학습 기록을 읽지 못했습니다.',e);}
function write(){
 try{localStorage.setItem(KEY,JSON.stringify({version:1,state:S}));}
 catch{$('.statusline>span:last-child').textContent='자동 저장 공간이 부족합니다. 전체 백업으로 현재 진도와 DB를 저장하세요.';}
}
function save(){clearTimeout(saveTimer);saveTimer=setTimeout(write,250);}
window.addEventListener('beforeunload',write);
function download(name,data,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function theme(){
 const dark=document.documentElement.dataset.theme==='dark';$('#theme').textContent=dark?'☀ 밝은 테마':'☾ 어두운 테마';$('#theme').setAttribute('aria-pressed',String(dark));
 try{localStorage.setItem('sql-lab-theme',dark?'dark':'light');}catch{}
}
$('#theme').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';theme();};theme();
function table(r,max=100){
 if(!r)return '';
 return '<div class="table-scroll"><table><thead><tr>'+r.columns.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+r.values.slice(0,max).map(row=>'<tr>'+row.map(v=>'<td>'+(v===null?'<span class="null">NULL</span>':esc(v))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div><p class="tiny muted">'+r.values.length+'행 · '+r.columns.length+'열'+(r.values.length>max?' · 앞 '+max+'행만 표시':'')+'</p>';
}
function feedback(target,tone,title,message){const el=$(target);el.hidden=false;el.className='feedback tone-'+tone;el.setAttribute('role','status');el.innerHTML='<strong>'+esc(title)+'</strong>'+esc(message);}
function outputs(target,r){
 $(target).innerHTML='<div class="output">'+r.outputs.map((o,i)=>'<div class="label">문장 '+(i+1)+'</div><details><summary>실행한 SQL 보기</summary><pre>'+esc(o.sql)+'</pre></details>'+(o.error?'<div class="feedback tone-wrong">'+esc(o.error)+'</div>':(o.message?'<p class="sql-log muted">'+esc(o.message)+'</p>':'')+(o.warning?'<div class="feedback tone-missing">'+esc(o.warning)+'</div>':'')+table(o.result))).join('')+'</div>';
}
function inspector(target,info){
 $(target).innerHTML=(!info?.current?'<p class="status-message">선택된 DB가 없습니다. CREATE DATABASE와 USE부터 실행하세요.</p>':!info.tables.length?'<p class="status-message">아직 테이블이 없습니다. CREATE TABLE로 첫 표를 만들어 보세요.</p>':info.tables.map(t=>'<details class="inspector-table" '+(info.tables.length===1?'open':'')+'><summary><b>'+esc(t.name)+'</b> · '+t.count+'행</summary><p class="columns">'+t.columns.map(c=>esc(c.name)+' <span class="badge">'+esc(c.type)+(c.pk?' · PK':'')+'</span>').join(' ')+'</p>'+table(t.rows)+'</details>').join(''));
}
function setStatus(message,ready=true){$('#engineStatus').textContent=message;$('#engineDot').classList.toggle('ready',ready);}
function stop(){if(worker)worker.terminate();worker=null;}
function cancel(){if(!pending)return;const p=pending;pending=null;clearTimeout(p.timer);stop();p.reject(Error('실행을 중지했습니다. 이번 실행에서 완료되지 않은 변경은 저장되지 않았습니다.'));}
function call(op,params={}){
 if(!worker){
  const url=URL.createObjectURL(new Blob([$('#sqlWorkerSource').textContent],{type:'text/javascript'}));worker=new Worker(url);URL.revokeObjectURL(url);
  worker.onmessage=e=>{const m=e.data;if(!pending||m.id!==pending.id)return;const p=pending;pending=null;clearTimeout(p.timer);m.error?p.reject(Error(m.error)):p.resolve(m.result);};
  worker.onerror=e=>{if(pending){const p=pending;pending=null;clearTimeout(p.timer);p.reject(Error(e.message||'내장 엔진을 시작하지 못했습니다.'));}stop();};
 }
 return new Promise((resolve,reject)=>{const id=++requestId,timer=setTimeout(()=>{if(pending?.id===id){pending=null;stop();reject(Error('실행 시간이 길어 중지했습니다. 쿼리의 조건과 반복·조인 크기를 확인하세요.'));}},15000);pending={id,timer,resolve,reject};worker.postMessage({id,op,...params});});
}
const disabled=new WeakMap();
function lock(v){
 busy=v;document.querySelectorAll('button,select,textarea,input').forEach(b=>{if(v){disabled.set(b,b.disabled);b.disabled=true;}else if(disabled.has(b)){b.disabled=disabled.get(b);disabled.delete(b);}});
}
async function job(fn){
 if(busy)return;lock(true);setStatus('실행 중 · 브라우저 안에서 처리합니다',false);
 const b=document.createElement('button');b.id='cancelRun';b.textContent='중지';b.onclick=cancel;$('#engineStatus').after(b);
 try{await fn();setStatus('내장 SQL 엔진 준비 완료 · 오프라인 사용 가능');}
 catch(e){const target=S.tab==='free'?'#freeFeedback':'#problemFeedback';if($(target))feedback(target,'wrong','실행을 완료하지 못했습니다.',e.message);setStatus('실행 중단 · 수정 후 다시 실행할 수 있습니다',false);}
 finally{b.remove();lock(false);renderSidebar();syncNav();}
}
function syncNav(){
 if($('#previous'))$('#previous').disabled=busy||S.step===0;
 if($('#next')){$('#next').disabled=busy||!S.checkpoints[S.step+1];$('#next').textContent=S.step===STEPS.length-1?'실습 완료 ✓':'다음 문제 →';}
}
function renderSidebar(){
 const complete=Object.keys(S.passed).length;$('#doneCount').textContent=complete+' / '+STEPS.length;$('#progressText').textContent=Math.round(complete/STEPS.length*100)+'%';$('#progressBar').style.width=complete/STEPS.length*100+'%';
 let previous='',html='';
 STEPS.forEach((q,i)=>{if(q.group!==previous){html+='<p class="group-title">'+esc(q.group)+'</p>';previous=q.group;}html+='<button class="step-btn '+(S.step===i?'active':'')+(S.passed[q.id]?' done':'')+'" data-step="'+i+'" '+(busy||i>S.checkpoints.length-1?'disabled':'')+'><span class="num">'+(S.passed[q.id]?'✓':String(i+1).padStart(2,'0'))+'</span>'+esc(q.title)+'</button>';});
 $('#stepList').innerHTML=html;
 document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{if(busy)return;S.step=+b.dataset.step;save();renderProblem();job(refreshLab);});
}
function wireEditor(ed,run,all){
 ed.addEventListener('keydown',e=>{
  if(e.key==='Tab'){e.preventDefault();ed.setRangeText('  ',ed.selectionStart,ed.selectionEnd,'end');ed.dispatchEvent(new Event('input'));}
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();if(!busy)(e.shiftKey&&all?all:run)();}
 });
}
function renderProblem(){
 const q=STEPS[S.step];renderSidebar();
 $('#problem').innerHTML='<div><span class="badge">문제 '+(S.step+1)+' / '+STEPS.length+'</span><span class="badge">'+esc(q.group)+'</span><span class="badge">자료 '+esc(q.source||'02–07')+'</span></div><h2>'+esc(q.title)+'</h2><p class="task">'+esc(q.task)+'</p>'+(q.data?table({columns:['name','category','price','stock','added_on'],values:q.data}):'')+'<div class="rule"><b>필수 구문</b> · '+q.required.map(v=>'<code>'+esc(v)+'</code>').join(' ')+'</div><details><summary>힌트 보기</summary><p>'+esc(q.hint)+'</p></details><label class="tiny muted" for="problemEditor">이 문제를 해결할 SQL을 작성하세요. 여러 문장을 입력할 수 있습니다. Ctrl+Enter로 실행하고 확인합니다.</label><textarea id="problemEditor" class="editor" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="-- SQL을 직접 작성하세요"></textarea><p class="legend"><span>● 정답</span><span>● 오답·오류</span><span>● 다른 SQL·같은 목표</span><span>● 필수 구문 미사용</span></p><div class="actions"><button id="checkProblem" class="primary">실행하고 확인</button><button id="runProblem">실행만 하기</button><button id="answerProblem">정답·해설</button><button id="next" class="primary next">다음 문제 →</button></div><p class="tiny muted">매번 이 문제의 시작 DB에서 실행합니다. 통과한 변경만 다음 문제에 저장됩니다. 틀려도 앞 문제의 데이터는 보존됩니다.</p><div id="problemFeedback" hidden></div><div id="problemOutput"></div><div id="problemAnswer" hidden></div><div class="actions"><button id="previous">← 이전 문제</button><span class="tiny muted">'+(S.passed[q.id]?'이 문제는 완료 기록이 있습니다.':'차근차근 직접 작성해 보세요.')+'</span></div>';
 const ed=$('#problemEditor');ed.value=S.drafts[q.id]||'';ed.oninput=()=>{S.drafts[q.id]=ed.value;save();};wireEditor(ed,()=>$('#checkProblem').click());
 $('#checkProblem').onclick=()=>attempt(true);$('#runProblem').onclick=()=>attempt(false);
 $('#answerProblem').onclick=()=>{$('#problemAnswer').hidden=false;$('#problemAnswer').innerHTML='<h3>모범 SQL</h3><pre>'+esc(q.answer)+'</pre><p>'+esc(q.explain)+'</p><p class="tiny muted">답안을 본 뒤 직접 고쳐 실행하고 확인해야 완료됩니다.</p>';};
 $('#next').onclick=()=>{if(busy||!S.checkpoints[S.step+1])return;if(S.step===STEPS.length-1){feedback('#problemFeedback','correct','52문제를 모두 마쳤습니다.','자유모드에서 문제 DB 복사를 눌러 완성한 매장으로 자유롭게 연습해 보세요.');return;}S.step++;save();renderProblem();$('#problem').scrollIntoView({behavior:'smooth',block:'start'});job(refreshLab);};
 $('#previous').onclick=()=>{if(busy||!S.step)return;S.step--;save();renderProblem();job(refreshLab);};
 syncNav();
}
async function refreshLab(){const info=await call('inspect',{state:S.checkpoints[S.step]});inspector('#labInspector',info);$('#labDbLabel').textContent=(info.current||'DB 선택 전')+' · 이 문제의 시작 상태';}
function attempt(grade){
 const ed=$('#problemEditor'),sql=ed.value,q=STEPS[S.step],index=S.step;
 try{if(!DBLab.tokens(sql).length){feedback('#problemFeedback','wrong','SQL을 먼저 작성하세요.','힌트와 개념정리를 참고해 첫 문장을 작성해 보세요.');return;}}
 catch(e){feedback('#problemFeedback','wrong','SQL 문장을 확인하세요.',e.message);return;}
 return job(async()=>{
  const r=await call(grade?'grade':'run',{state:S.checkpoints[index],step:q,sql});
  outputs('#problemOutput',r);inspector('#labInspector',r.inspect);$('#labDbLabel').textContent=(r.inspect.current||'DB 선택 전')+' · '+(grade&&r.pass?'통과한 상태':'이번 실행 미리보기');
  if(grade){
   feedback('#problemFeedback',r.tone,{correct:'정답 · 목표 완료',alternative:'다른 SQL로 목표 완료',missing:'결과는 같지만 필수 구문이 빠졌습니다.',wrong:'수정 후 다시 확인해 보세요.'}[r.tone],r.message);
   if(r.pass){S.checkpoints[index+1]=r.state;S.passed[q.id]=r.tone;S.drafts[q.id]=sql;save();}
  }else feedback('#problemFeedback',r.error?'wrong':'alternative',r.error?'실행 오류':'실행 미리보기',r.error||'현재 DB에서 실행한 결과입니다. 문제를 통과하려면 실행하고 확인을 누르세요.');
 });
}
function renderConcepts(){
 $('#conceptNav').innerHTML=COURSE.concepts.map(c=>'<button class="concept-link '+(S.concept===c.chapter?'active':'')+'" data-concept="'+c.chapter+'">'+c.chapter+' · '+esc(c.title)+'</button>').join('');
 const c=COURSE.concepts.find(c=>c.chapter===S.concept);
 $('#conceptContent').innerHTML='<article class="concept-card"><span class="badge">자료 '+c.chapter+'</span><h2>'+esc(c.title)+'</h2><p class="concept-lead">'+esc(c.lead)+'</p><p class="concept-source">학습 범위: '+esc(c.source)+'</p>'+c.items.map(([title,body,sql])=>'<h3>'+esc(title)+'</h3><p>'+esc(body)+'</p><pre>'+esc(sql)+'</pre>').join('')+'</article><div class="panel"><b>실행 범위</b><p class="scope-copy">'+esc(COURSE.scope)+'</p></div>';
 document.querySelectorAll('[data-concept]').forEach(b=>b.onclick=()=>{if(busy)return;S.concept=b.dataset.concept;save();renderConcepts();});
}
function views(){
 for(const v of ['concepts','problems','free']){$('#'+v+'View').hidden=S.tab!==v;$('#tab-'+v).classList.toggle('active',S.tab===v);$('#tab-'+v).setAttribute('aria-selected',String(S.tab===v));}
}
for(const v of ['concepts','problems','free'])$('#tab-'+v).onclick=()=>{if(busy)return;S.tab=v;save();views();if(v==='concepts')renderConcepts();if(v==='free')job(refreshFree);if(v==='problems')job(refreshLab);};
function renderFree(info){
 freeInspect=info;$('#freeDb').innerHTML=(info.names.length?'':'<option value="">DB 없음</option>')+info.names.map(n=>'<option '+(info.current===n?'selected':'')+' value="'+esc(n)+'">'+esc(n)+'</option>').join('');if(!info.current)$('#freeDb').selectedIndex=-1;
 inspector('#freeInspector',info);
 $('#history').innerHTML=S.freeHistory.slice().reverse().map((h,i)=>'<div class="history-item"><span class="muted">'+esc(h.date)+' · '+(h.error?'오류':'실행')+'</span><button data-history="'+i+'">'+esc(h.sql.slice(0,350))+'</button></div>').join('')||'<p class="muted tiny">아직 실행 기록이 없습니다.</p>';
 document.querySelectorAll('[data-history]').forEach(b=>b.onclick=()=>{if(busy)return;$('#freeEditor').value=S.freeHistory.at(-1-Number(b.dataset.history)).sql;S.freeDraft=$('#freeEditor').value;save();});
}
async function refreshFree(){const info=await call('inspect',{state:S.free});renderFree(info);}
function chosenSQL(all){
 const ed=$('#freeEditor');if(all)return ed.value;
 if(ed.selectionStart!==ed.selectionEnd)return ed.value.slice(ed.selectionStart,ed.selectionEnd);
 const ss=DBLab.split(ed.value);return (ss.find(s=>ed.selectionStart>=s.start&&ed.selectionStart<s.end)||ss.at(-1))?.sql||'';
}
function runFree(all=false){
 let sql;try{sql=chosenSQL(all);if(!DBLab.tokens(sql).length){feedback('#freeFeedback','wrong','실행할 SQL이 없습니다.','현재 문장 또는 선택 영역을 확인하세요.');return;}}
 catch(e){feedback('#freeFeedback','wrong','SQL 구분 오류',e.message);return;}
 return job(async()=>{
  const r=await call('run',{state:S.free,sql});S.free=r.state;S.freeDraft=$('#freeEditor').value;
  S.freeHistory.push({sql,date:new Date().toLocaleString('ko-KR'),error:!!r.error});S.freeHistory=S.freeHistory.slice(-40);save();renderFree(r.inspect);outputs('#freeOutput',r);
  feedback('#freeFeedback',r.error?'wrong':'correct',r.error?'오류가 발생한 문장에서 멈췄습니다.':'SQL 실행 완료',r.error?(r.error+'\n오류 전 성공한 문장의 변경은 자유 DB에 남습니다.'):'자유 DB에 실행 결과를 반영했습니다. 조회는 데이터를 바꾸지 않습니다.');
 });
}
$('#freeEditor').value=S.freeDraft;$('#freeEditor').oninput=()=>{S.freeDraft=$('#freeEditor').value;save();};wireEditor($('#freeEditor'),()=>runFree(false),()=>runFree(true));
$('#freeRun').onclick=()=>runFree(false);$('#freeRunAll').onclick=()=>runFree(true);$('#refreshFree').onclick=()=>job(refreshFree);
$('#freeDb').onchange=()=>{const name=$('#freeDb').value;job(async()=>{const r=await call('run',{state:S.free,sql:'USE '+name+';'});if(r.error)throw Error(r.error);S.free=r.state;save();renderFree(r.inspect);});};
$('#clearFreeOutput').onclick=()=>{$('#freeOutput').innerHTML='';$('#freeFeedback').hidden=true;};
$('#saveSQL').onclick=()=>download('자유모드_SQL.sql',$('#freeEditor').value,'text/plain;charset=utf-8');
async function replaceFree(sql){
 const r=await call('run',{state:null,sql});if(r.error)throw Error(r.error);S.free=r.state;S.freeDraft='SHOW TABLES;';$('#freeEditor').value=S.freeDraft;S.freeHistory=[];save();renderFree(r.inspect);$('#freeOutput').innerHTML='';$('#freeFeedback').hidden=true;
}
$('#loadDemo').onclick=()=>{if(busy||!confirm('자유모드 DB를 12개 상품이 있는 예제 매장으로 바꿀까요? 기존 자유 DB를 보관하려면 먼저 전체 백업을 하세요.'))return;job(()=>replaceFree(COURSE.demoSQL));};
$('#resetFree').onclick=()=>{if(busy||!confirm('자유모드 DB만 비우고 playground부터 다시 시작할까요? 문제 진도는 유지됩니다.'))return;job(()=>replaceFree(COURSE.sandboxSQL));};
$('#copyLab').onclick=()=>{if(busy)return;const snapshot=S.checkpoints[S.step+1]||S.checkpoints[S.step];if(!snapshot){feedback('#freeFeedback','wrong','복사할 DB가 아직 없습니다.','문제 탭에서 데이터베이스를 먼저 만들어 주세요.');return;}if(!confirm('현재 문제 DB를 자유모드로 복사할까요? 기존 자유 DB는 교체됩니다.'))return;job(async()=>{S.free=JSON.parse(JSON.stringify(snapshot));S.freeDraft='SHOW TABLES;';$('#freeEditor').value=S.freeDraft;save();await refreshFree();feedback('#freeFeedback','alternative','문제 DB를 복사했습니다.','이제 자유모드에서 바꿔도 문제 진도에는 영향을 주지 않습니다.');});};
$('#resetCourse').onclick=()=>{if(busy||!confirm('52문제의 진도·작성 코드·문제 DB를 처음 상태로 되돌릴까요? 자유모드는 유지됩니다.'))return;S.step=0;S.passed={};S.drafts={};S.checkpoints=[null];save();renderProblem();job(refreshLab);};
$('#backup').onclick=()=>{write();download('SQL작업실_전체백업_'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({app:'mysql-workshop',version:1,state:S}),'application/json');};
$('#restore').onclick=()=>$('#backupFile').click();
$('#backupFile').onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{
  if(f.size>12000000)throw Error('백업 파일이 너무 큽니다.');
  const x=JSON.parse(await f.text());if(x.app!=='mysql-workshop'||x.version!==1)throw Error('SQL 작업실의 전체 백업 파일을 선택하세요.');
  const next=validate(x.state);if(!confirm('현재 문제 진도와 자유 DB를 백업 파일의 내용으로 교체할까요?'))return;
  await job(async()=>{
   await call('inspect',{state:next.checkpoints[next.step]});await call('inspect',{state:next.free});
   S=next;save();renderProblem();renderConcepts();views();$('#freeEditor').value=S.freeDraft;await refreshLab();await refreshFree();
  });
 }catch(err){alert('불러오기 실패: '+err.message);}finally{e.target.value='';}
};
document.querySelectorAll('.scope-copy').forEach(e=>e.textContent=COURSE.scope);
const report=window.COMPAT_REPORT;
if(report){
 $('#compatNotice').textContent='MySQL 8.0 학습 프로필 · 실제 서버와 '+report.total+'건 비교 검증 완료 · '+report.checkedAt.slice(0,10);
 $('#compatReport').innerHTML='<h3>실제 MySQL과 비교한 결과</h3><p><b>'+report.passed+' / '+report.total+'건 일치</b> · '+esc(report.reference)+'</p><p class="tiny muted">문제의 모범 SQL, 단계별 저장 데이터, 자료형·NULL·문자 비교·자동 번호·집계·오류 사례를 비교했습니다. 숫자는 검증한 실행 건수이며 모든 MySQL 문법의 호환을 의미하지는 않습니다. 정렬을 지정하지 않은 결과의 행 순서와 DECIMAL 표시 자릿수는 비교에서 정규화합니다.</p><details><summary>검증 SQL 목록</summary><pre>'+esc(report.tests.map(t=>(t.ok?'✓ ':'✗ ')+t.label+'\n'+t.sql).join('\n\n'))+'</pre></details>';
}
$('#licenses').textContent=window.LICENSE_TEXT||'';
$('#openScope').onclick=()=>$('#scopeDialog').showModal();$('#closeScope').onclick=()=>$('#scopeDialog').close();
renderProblem();renderConcepts();views();
job(async()=>{await call('ping');if(!S.free){const r=await call('run',{state:null,sql:COURSE.sandboxSQL});S.free=r.state;save();}await refreshLab();await refreshFree();});
})();
