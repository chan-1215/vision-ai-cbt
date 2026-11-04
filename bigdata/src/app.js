(function(){
'use strict';
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>esc(s).replace(/«([^»]+)»/g,'<code>$1</code>');
function applyTheme(theme){
 document.documentElement.dataset.theme=theme;
 const dark=theme==='dark',button=$('#themeToggle');
 button.textContent=dark?'☀ 밝은 테마':'☾ 어두운 테마';
 button.setAttribute('aria-pressed',String(dark));
 button.title=dark?'밝은 흑백 테마로 전환':'어두운 흑백 테마로 전환';
 try{localStorage.setItem('bd-study-theme',theme);}catch{}
}
applyTheme(document.documentElement.dataset.theme==='light'?'light':'dark');
$('#themeToggle').onclick=()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
const CH={5:'데이터 파악과 기초',6:'데이터 가공',7:'데이터 정제',8:'그래프 만들기'};
const LV=['초급','중급','고급'], TY={code:'코드 작성',mc:'객관식',ox:'O/X'};
const BANK=[];
const codeLevels={
5:[['head','shape','describe','stats','columns'],['rename','derive','where','vc','diff'],['grade3','chain5']],
6:[['q1','q2','q_and','q_or','cols','drop','sort'],['q_in','group','group_sort','merge','concat','two_key'],['q_group','multi_agg','chain_filter','merge_q','top1','mpg6','exam6']],
7:[['isna_all','isna_col','vc_na','dropna','rows_cmp'],['isna_cols','stats7','fillna','fill_mode','rule_find','rule_nan','replace999'],['iqr','bounds','outliers','flag','check_etc','clean_chain']],
8:[['scatter','count','scatter_hue'],['scatter_lim','bar','bar_sort','count_order','datetime','line_econ','box'],['scatter_q','bar_top','line_viz']]
};
const middleMC={5:[5,6,7,11,12,13,14,15,16,21,23,26],6:[5,7,11,12,13,14,15,16,17,18,19,21,22,25],7:[4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,21,22],8:[5,6,7,8,9,10,11,12,13,14,15,16,17,18,20,21,23,24]};
const highMC={5:[19,24,25],6:[20,24],7:[20,24,25],8:[22]};
const middleOX={5:[7,8,9,12,16,17,18,21,22],6:[8,9,10,11,12,13,15,17,18,19,20,22],7:[5,7,8,9,10,11,12,13,14,15,16,18,19,20,21,22],8:[5,6,7,8,9,10,11,12,13,16,17,21]};
const highOX={5:[],6:[16],7:[17],8:[18]};
function requiredFunctions(answer){
 const core=new Set(['head','tail','describe','mean','median','min','max','sum','copy','rename','where','select','value_counts','query','drop','sort_values','groupby','agg','merge','concat','isna','notna','dropna','fillna','mode','between','replace','quantile','scatterplot','countplot','barplot','lineplot','boxplot','to_datetime']);
 const found=[...answer.matchAll(/\.\s*([A-Za-z_]\w*)\s*\(/g)].map(m=>m[1]).filter(n=>core.has(n));
 return [...new Set(found)];
}
for(const t of QZ.CODE_T){
 const level=codeLevels[t.ch].findIndex(a=>a.includes(t.id));
 if(level<0)throw Error('난이도 미지정: '+t.id);
 for(let v=0;v<2;v++){
  const q=QZ.genCode(t,23000+t.ch*1000+QZ.CODE_T.indexOf(t)*31+v*7919);
  BANK.push({...q,type:'code',level,required:requiredFunctions(q.answer),id:'code-'+t.ch+'-'+t.id+'-'+v,e:q.hint||'준비된 데이터에서 요구하는 결과를 만드는 순서를 확인하세요.'});
 }
}
for(const [type,source] of [['mc',QZ.MC],['ox',QZ.OX]]){
 for(const ch of [5,6,7,8])source.filter(x=>x.ch===ch).forEach((q,i)=>{
  q={...q};
  if(type==='ox'&&ch===5&&i===9)q.q='기본 설정의 «rename()»은 반환값을 다시 대입하지 않아도 원래 데이터의 열 이름을 바꾼다.';
  if(type==='mc'&&ch===8&&i===7){q.o=q.o.slice();q.o[0]='barplot은 집단별 평균 등을, countplot은 범주별 행 수를 나타낸다';q.e='barplot은 원자료의 집단별 평균을 기본으로 계산하며 미리 만든 요약표도 사용할 수 있습니다. countplot은 원자료의 범주별 행 수를 셉니다.';}
  if(type==='mc'&&ch===6&&i===14){q.q='«agg()»에서 집단별로 특정 열의 결측치가 아닌 값 개수를 구하는 함수 이름은?';q.e='count는 해당 열의 결측치를 제외하고 셉니다. 결측치와 관계없는 집단 전체 행 수는 size로 구합니다.';}
  const high=(type==='mc'?highMC:highOX)[ch].includes(i),mid=(type==='mc'?middleMC:middleOX)[ch].includes(i);
  const level=high?2:mid?1:0;
  if(type==='mc'){const correct=q.o[0],order=QZ.mkR(ch*997+i*31).shuffle(q.o);q.o=order;q.a=order.indexOf(correct);}
  BANK.push({...q,type,level,id:type+'-'+ch+'-'+i,e:q.e||(q.a?'문장은 개념 정리에 나온 동작과 일치합니다.':'해당 함수의 동작과 조건을 다시 확인하세요.')});
 });
}
function add(ch,type,q,a,e,code,o){BANK.push({id:'custom-'+ch+'-'+type+'-'+BANK.length,ch,type,level:2,q,a,e,code,o});}
add(5,'mc','학생별 수학·영어 평균을 mean 열로 만들려 한다. 올바른 코드는?',1,'mean()의 기본 축은 열 방향(axis=0)입니다. 학생 한 명의 가로 방향 평균은 axis=1로 계산합니다.',null,["exam['mean'] = exam[['math', 'english']].mean()","exam['mean'] = exam[['math', 'english']].mean(axis=1)","exam['mean'] = exam['math'].mean() + exam['english'].mean()","exam['mean'] = exam['math'] + exam['english'] / 2"]);
add(5,'ox','수학·영어 열에 결측치가 없을 때 «exam[[\'math\', \'english\']].mean(axis=1)»은 학생별 두 과목 평균을 구한다.',true,'axis=1은 각 행에서 열을 가로질러 평균을 계산합니다.');
add(5,'ox','«np.select([score >= 80, score >= 90], [\'B\', \'A\'], default=\'C\')»에서 score가 95라면 A가 된다.',false,'np.select는 먼저 참인 조건을 사용합니다. 80 이상 조건이 먼저이므로 B입니다. 높은 등급의 조건부터 작성해야 합니다.');
add(5,'mc','점수 95에 아래 조건을 적용하면 grade는?',2,'중첩 조건은 바깥 조건부터 평가합니다. 95 >= 80이 참이므로 뒤의 90점 조건에는 도달하지 않습니다.',"score = 95\ngrade = np.where(score >= 80, 'B', np.where(score >= 90, 'A', 'C'))",['A','C','B','실행 오류']);
add(6,'mc','수학 점수가 [30, 95, 50, 80]인 학생 네 명의 상위 2명을 구하려 한다. head(2)를 먼저 한 다음 정렬하면 어떤 문제가 있는가?',0,'head(2)를 먼저 쓰면 처음 두 학생만 남기므로 80점 학생을 놓칩니다. 전체를 정렬한 뒤 head(2)를 사용해야 합니다.',null,['처음 두 학생만 정렬하여 전체 상위 2명을 보장하지 못한다','언제나 같은 결과다','head가 열 두 개를 고른다','내림차순 정렬 자체가 불가능하다']);
add(6,'ox','math에 결측치가 있어도 «exam.groupby(\'nclass\')[\'math\'].count()»는 항상 반별 전체 학생 수를 구한다.',false,'count는 해당 열에서 결측치가 아닌 값만 셉니다. 전체 행 수는 groupby(...).size()로 계산합니다.');
add(6,'ox','왼쪽 표의 key가 1인 행이 2개, 오른쪽 표의 key가 1인 행이 3개라면, 해당 키의 merge 결과는 6행이 될 수 있다.',true,'양쪽의 중복 키가 모두 조합되어 2 × 3 = 6행이 생깁니다. left merge라고 항상 원래 행 수가 유지되는 것은 아닙니다.');
add(7,'mc','결측치를 전체 평균으로 채우기 전에 999라는 입력 오류를 발견했다. 가장 타당한 순서는?',2,'입력 오류를 평균 계산에 포함하면 대체값 자체가 왜곡됩니다. 오류를 NaN으로 바꾼 뒤 유효한 값으로 대표값을 계산합니다.',null,['999를 포함한 평균으로 먼저 채우기','결측치가 있는 모든 열 삭제','999를 NaN으로 바꾸고 대표값을 계산해 대체','모든 결측치를 999로 채우기']);
add(7,'ox','NaN이 들어 있는 숫자 열에서 «~df[\'x\'].between(1, 5)»만 쓰면 기존 결측치도 선택될 수 있다.',true,'NaN의 between 결과는 False가 될 수 있고 ~가 이를 뒤집습니다. 기존 결측치를 제외하려면 notna() 조건도 함께 사용합니다.');
add(8,'mc','학과별 퀴즈 평균은 비슷하지만 점수의 퍼짐이 다른지 알고 싶다. 가장 적절한 방법은?',2,'평균만으로 분포를 알 수 없습니다. boxplot은 중앙값, 사분위 범위, 극단값 후보를 함께 비교합니다.',null,['평균 막대 높이만 비교','원자료를 countplot으로만 표시','학과별 quiz_score를 boxplot으로 비교','학과 이름을 날짜형으로 변환']);
add(8,'mc','산점도에서 공부시간과 점수에 양의 관계가 보인다. 타당한 해석은?',1,'관찰된 관계만으로 인과관계를 확정할 수 없습니다. 학습 습관, 기존 실력 등 다른 요인을 검토해야 합니다.',null,['공부시간만 늘리면 모든 학생의 점수가 반드시 오른다','공부시간이 긴 학생의 점수가 높은 경향이 있다','두 변수는 완전히 독립이다','공부시간이 점수 상승의 유일한 원인이다']);
add(8,'ox','«sns.lineplot(data=economics, x=\'year\', y=\'unemploy\', errorbar=None)»에서 한 연도에 여러 행이 있으면 기본적으로 그 연도의 평균이 선으로 표시된다.',true,'lineplot은 같은 x값에 여러 y값이 있을 때 기본적으로 평균을 집계합니다. errorbar=None은 음영을 없애며 평균 계산을 끄지는 않습니다.');
add(8,'ox','상자그림에서 수염의 끝은 항상 Q1−1.5×IQR과 Q3+1.5×IQR이라는 계산값 자체에 그려진다.',false,'기본 설정에서 수염은 그 경계 안에 존재하는 실제 관측값 중 가장 바깥 값까지 뻗습니다.');
BANK.sort((a,b)=>a.ch-b.ch||a.level-b.level);
window.STUDY_BANK=BANK;
const KEY='bd-personal-study-v1';
let S={ch:5,level:0,type:'code',mode:'all',view:'practice',mixLevel:-1,mixType:'all',mixSeed:Math.floor(Math.random()*2147483647),positions:{},records:{},drafts:{}};
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&saved.version===1)Object.assign(S,saved.state);}catch{}
const valid=()=>{if(![5,6,7,8].includes(S.ch))S.ch=5;if(![0,1,2].includes(S.level))S.level=0;if(!TY[S.type])S.type='code';if(!['all','wrong'].includes(S.mode))S.mode='all';if(!['practice','concept','mixed'].includes(S.view))S.view='practice';if(![-1,0,1,2].includes(S.mixLevel))S.mixLevel=-1;if(S.mixType!=='all'&&!TY[S.mixType])S.mixType='all';if(!Number.isInteger(S.mixSeed)||S.mixSeed<0)S.mixSeed=43217;for(const k of ['positions','records','drafts'])if(!S[k]||typeof S[k]!=='object'||Array.isArray(S[k]))S[k]={};};
valid();
let storageWarn=false,busy=false,current=null,picked=null;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({version:1,state:S}));}catch{if(!storageWarn){storageWarn=true;$('#runtime').textContent='자동 저장 불가 · 기록 내보내기를 사용하세요';}}};
const mixed=()=>S.view==='mixed',level=()=>mixed()?S.mixLevel:S.level,type=()=>mixed()?S.mixType:S.type;
const pk=()=>mixed()?['mixed',S.mixLevel,S.mixType,S.mode].join('-'):[S.ch,S.level,S.type,S.mode].join('-');
function pool(){
 const qs=BANK.filter(q=>(mixed()||q.ch===S.ch)&&(level()===-1||q.level===level())&&(type()==='all'||q.type===type()));
 let ordered=qs;
 if(mixed()){
  const rng=QZ.mkR(S.mixSeed),groups=[5,6,7,8].map(ch=>rng.shuffle(qs.filter(q=>q.ch===ch)));
  ordered=[];let round=0;
  while(groups.some(g=>g.length>round)){
   for(const i of rng.shuffle([0,1,2,3]))if(groups[i][round])ordered.push(groups[i][round]);
   round++;
  }
 }
 return S.mode==='wrong'?ordered.filter(q=>S.records[q.id]&&S.records[q.id].status!=='correct'):ordered;
}
function stat(){const all=Object.values(S.records),ok=all.filter(r=>r.status==='correct').length;$('#summary').innerHTML='<b>'+ok+'</b> / '+BANK.length+'<br>정답 완료 · '+all.length+'문제 학습';}
function record(q,status){const old=S.records[q.id]||{};S.records[q.id]={status,attempts:(old.attempts||0)+1,first:old.first||status,last:new Date().toISOString()};save();stat();}
function setView(v){if(busy)return;S.view=v;save();render();}
function drawTabs(){
 $('#conceptView').hidden=S.view!=='concept';$('#practiceView').hidden=S.view==='concept';
 $('#chapters').hidden=mixed();$('#mixedInfo').hidden=!mixed();
 for(const v of ['concept','practice','mixed']){$('#tab-'+v).classList.toggle('active',S.view===v);$('#tab-'+v).setAttribute('aria-selected',String(S.view===v));}
 [...document.querySelectorAll('#conceptBody section')].forEach((el,i)=>el.classList.toggle('visible',i===S.ch-5));
}
function filters(){
 $('#chapters').innerHTML=[5,6,7,8].map(ch=>'<button class="chapter '+(S.ch===ch?'active':'')+'" data-ch="'+ch+'"><strong>'+ch+'장</strong><small>'+CH[ch]+'</small></button>').join('');
 $('#levels').innerHTML=(mixed()?'<button class="'+(level()===-1?'active':'')+'" data-level="-1">전체</button>':'')+LV.map((v,i)=>'<button class="'+(level()===i?'active':'')+'" data-level="'+i+'">'+v+'</button>').join('');
 $('#types').innerHTML=(mixed()?'<button class="'+(type()==='all'?'active':'')+'" data-type="all">전체 유형</button>':'')+Object.entries(TY).map(([k,v])=>'<button class="'+(type()===k?'active':'')+'" data-type="'+k+'">'+v+'</button>').join('');
 $('#mode option[value="all"]').textContent=mixed()?'섞어서 풀기':'순서대로 풀기';
 $('#mode').value=S.mode;
 document.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>{if(busy)return;S.ch=+b.dataset.ch;save();render();});
 document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{if(busy)return;if(mixed())S.mixLevel=+b.dataset.level;else S.level=+b.dataset.level;save();render();});
 document.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{if(busy)return;if(mixed())S.mixType=b.dataset.type;else S.type=b.dataset.type;save();render();});
}
function render(){
 filters();drawTabs();stat();
 const p=pool(),idx=Math.min(Math.max(0,Number(S.positions[pk()])||0),Math.max(0,p.length-1));
 S.positions[pk()]=idx;current=p[idx];picked=null;
 $('#position').textContent=(mixed()?'5~8장 종합':S.ch+'장 / '+CH[S.ch])+' / '+(level()===-1?'전체 난이도':LV[level()])+' / '+(type()==='all'?'전체 유형':TY[type()]);
 $('#counter').textContent=p.length?(idx+1)+' / '+p.length+'문제':'';
 $('#prev').disabled=idx===0;$('#next').textContent=idx===p.length-1?'이 단계 완료 →':'다음 문제 →';
 if(!current){$('#card').innerHTML='<article><h2>복습할 문제가 없습니다.</h2><p>이 조건에서 틀렸거나 정답을 확인한 문제가 여기에 모입니다. 순서대로 풀기로 돌아가거나 다른 난이도를 선택하세요.</p></article>';$('#next').disabled=true;return;}
 $('#next').disabled=false;const q=current,r=S.records[q.id];
 $('#card').innerHTML='<article data-qid="'+esc(q.id)+'"><div><span class="badge">'+q.ch+'장</span><span class="badge">'+LV[q.level]+'</span><span class="badge">'+TY[q.type]+'</span>'+(r?'<span class="note">이전 기록: '+(r.status==='correct'?'정답':r.status==='review'?'답안 확인':'복습 필요')+'</span>':'')+'</div><h2>'+(q.type==='code'?esc(q.title):'문제 '+(idx+1))+'</h2><p class="prompt">'+fmt(q.type==='code'?q.prompt:q.q)+'</p><div id="answerArea"></div><div id="feedback" hidden></div><div id="output" class="out" hidden></div><div id="model" class="model" hidden></div></article>';
 if(q.type==='code'){
  $('#answerArea').innerHTML='<details><summary>준비 코드 · 자동으로 먼저 실행됩니다</summary><pre>'+esc(q.setup)+'</pre><p class="note">매번 새 데이터로 실행됩니다. 이 코드를 다시 작성할 필요는 없습니다.</p></details><details><summary>힌트 보기</summary><p>'+fmt(q.hint||'개념 정리에서 필요한 함수를 찾아보세요.')+'</p></details><label for="editor" class="note">코드 작성 · Tab 들여쓰기 / Ctrl+Enter 채점</label><textarea id="editor" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="# 여기에 Python 코드를 작성하세요"></textarea><div class="actions"><button id="grade" class="primary">실행하고 채점</button><button id="run">실행만 하기</button><button id="reveal">정답·해설 보기</button></div><p class="note">표·값을 구하는 문제는 마지막 줄에 결과를 표시하세요. 다른 올바른 풀이도 실행 결과로 비교합니다. 그래프는 주요 구성과 데이터를 비교하며 해석 서술은 자동 채점하지 않습니다.</p>';
  const ed=$('#editor');ed.value=S.drafts[q.id]||'';ed.oninput=()=>{S.drafts[q.id]=ed.value;save();};
  const req=document.createElement('p');req.className='function-rule';
  req.innerHTML=q.required.length?'필수 함수: '+q.required.map(n=>'<code>'+esc(n)+'()</code>').join(' · ')+'<br><small>결과가 같아도 이 함수를 사용하지 않으면 노란색으로 표시합니다.</small>':'필수 함수 제한 없음 · 결과가 같으면 다른 풀이도 인정합니다.';
  ed.before(req);
  const legend=document.createElement('p');legend.className='grading-legend';legend.innerHTML='<span class="tone-green">● 정답</span><span class="tone-red">● 오답</span><span class="tone-blue">● 다른 코드·같은 결과</span><span class="tone-yellow">● 필수 함수 미사용</span>';ed.after(legend);
  const pv=document.createElement('details');pv.innerHTML='<summary>데이터 미리보기 · 앞 6행</summary>'+previewData(q.setup);ed.before(pv);
  ed.onkeydown=e=>{if(e.key==='Tab'){e.preventDefault();ed.setRangeText('    ',ed.selectionStart,ed.selectionEnd,'end');ed.dispatchEvent(new Event('input'));}if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();$('#grade').click();}};
  $('#grade').onclick=()=>execute(q,true);$('#run').onclick=()=>execute(q,false);
  $('#reveal').onclick=()=>{if(busy)return;record(q,'review');showModel(q);feedback('답안 확인','직접 작성한 코드와 비교한 뒤 다시 풀어 보세요.',false);};
 }else{
  const opts=q.type==='mc'?q.o:['O','X'];
  $('#answerArea').innerHTML=(q.code?'<pre>'+esc(q.code)+'</pre>':'')+'<div class="options">'+opts.map((o,i)=>'<button class="option" data-pick="'+i+'">'+(q.type==='mc'?(i+1)+'. ':'')+fmt(o)+'</button>').join('')+'</div><div class="actions"><button id="submit" class="primary">답 제출하고 확인</button><button id="again">다시 풀기</button></div>';
  document.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{picked=+b.dataset.pick;document.querySelectorAll('[data-pick]').forEach(x=>x.classList.toggle('picked',x===b));});
  $('#submit').onclick=()=>{if(picked===null){feedback('답을 먼저 골라주세요.','선택한 뒤 제출하면 정답과 해설이 나옵니다.',false);return;}const a=q.type==='ox'?picked===0:picked,ok=a===q.a;record(q,ok?'correct':'wrong');feedback(ok?'정답입니다.':'다시 확인해 보세요.','정답: '+(q.type==='ox'?(q.a?'O':'X'):(q.a+1)+'. '+q.o[q.a])+'\n'+q.e,ok);};
  $('#again').onclick=()=>{picked=null;document.querySelectorAll('[data-pick]').forEach(x=>x.classList.remove('picked'));$('#feedback').hidden=true;};
 }
 const quickNext=document.createElement('button');quickNext.id='quickNext';quickNext.className='primary quick-next';quickNext.textContent=$('#next').textContent;
 quickNext.onclick=()=>{if(busy)return;advance(1);$('#card').scrollIntoView({behavior:'smooth',block:'start'});};
 $('#answerArea .actions').appendChild(quickNext);
 save();
}
function previewData(setup){
 const files=[...setup.matchAll(/(\w+)\s*=\s*pd\.read_csv\('([^']+)'\)/g)];
 if(!files.length)return '<p class="note">이 문제는 준비 코드에서 직접 데이터를 생성합니다.</p>';
 return files.map(([,name,file])=>{
  const csv=window.DATA[file];if(!csv)return '';
  const rows=[];let row=[],cell='',quote=false;
  for(let i=0;i<csv.length;i++){const c=csv[i];if(c==='"'){if(quote&&csv[i+1]==='"'){cell+='"';i++;}else quote=!quote;}else if(c===','&&!quote){row.push(cell);cell='';}else if(c==='\n'&&!quote){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}else cell+=c;}
  if(cell||row.length){row.push(cell);rows.push(row);}
  const head=rows.shift()||[];
  return '<p class="note"><b>'+esc(name)+'</b> · '+esc(file)+' · '+rows.length+'행 × '+head.length+'열</p><div style="overflow:auto"><table><thead><tr>'+head.map(v=>'<th>'+esc(v)+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(0,6).map(r=>'<tr>'+r.map(v=>'<td>'+esc(v||'NaN')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
 }).join('');
}
function feedback(title,msg,ok){const tone=typeof ok==='string'?ok:ok?'correct':'wrong';const e=$('#feedback');e.hidden=false;e.className='result tone-'+tone;e.setAttribute('role','status');e.innerHTML='<strong>'+esc(title)+'</strong><div style="white-space:pre-line">'+fmt(msg)+'</div>';}
function showModel(q,g){const e=$('#model');e.hidden=false;e.innerHTML='<h3>모범답안</h3><pre>'+esc(q.answer)+'</pre><p>'+fmt(q.e)+'</p><button id="retryCode">내 코드 고쳐서 다시 풀기</button>';if(g&&g.model)e.innerHTML+=output(g.model);$('#retryCode').onclick=()=>{e.hidden=true;$('#feedback').hidden=true;$('#editor').focus();};}
function output(r){
 let h=r.stdout?'<pre>'+esc(r.stdout)+'</pre>':'';
 if(r.last)h+=r.last.html?'<div class="scroll">'+r.last.html+'</div>':'<pre>'+esc(r.last.text)+'</pre>';
 for(const f of r.figs||[])h+='<img alt="실행한 그래프" src="data:image/png;base64,'+f+'">';
 if(r.error)h+='<pre>'+esc(r.error)+'</pre>';
 return h||'<p class="note">출력 없음 · 마지막 줄에서 결과를 확인하세요.</p>';
}
let worker=null,ready=false,seq=0;
function workerSource(){
 const body=function(){
  let py=null;onmessage=async e=>{const m=e.data;try{
   if(!py){
    postMessage({state:'파이썬 준비 중 · 첫 실행은 몇 분 걸릴 수 있습니다'});importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');
    py=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});await py.loadPackage(['numpy','pandas','matplotlib','micropip']);
    postMessage({state:'시각화 패키지 준비 중…'});const mp=py.pyimport('micropip');await mp.install('seaborn');mp.destroy();
    for(const [k,v]of Object.entries(DATA))py.FS.writeFile(k,v.replace(/^\uFEFF/,''));py.runPython(HELPER);
    try{const r=await fetch('https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/nanumgothic/NanumGothic-Regular.ttf',{signal:AbortSignal.timeout(7000)});if(r.ok){py.FS.writeFile('/tmp/study-font.ttf',new Uint8Array(await r.arrayBuffer()));py.runPython("setup_font('/tmp/study-font.ttf')");}}catch{}
    postMessage({ready:true});
   }
   const f=py.globals.get(m.grade?'grade':'run_code');let r;
   try{r=m.grade?f(m.q.setup,m.code,m.q.answer,JSON.stringify(m.q.checks||[]),!!m.q.plot,JSON.stringify(m.q.required||[])):f(m.q.setup,m.code);}finally{f.destroy();}
   postMessage({id:m.id,result:JSON.parse(r)});
  }catch(err){py=null;postMessage({id:m.id,error:String(err)});}};
 };
 return 'const DATA='+JSON.stringify(window.DATA)+';const HELPER='+JSON.stringify(window.HELPER_PY)+';('+body.toString()+')();';
}
function stop(){if(worker)worker.terminate();worker=null;ready=false;}
function request(q,code,grade,signal){
 return new Promise((resolve,reject)=>{
  if(!worker){const url=URL.createObjectURL(new Blob([workerSource()],{type:'text/javascript'}));worker=new Worker(url);URL.revokeObjectURL(url);}
  const id=++seq;let timer;
  const finish=(err,result)=>{clearTimeout(timer);signal.removeEventListener('abort',cancel);if(err)reject(err);else resolve(result);};
  const cancel=()=>{stop();finish(Error('사용자가 실행을 중지했습니다.'));};
  const time=ms=>{clearTimeout(timer);timer=setTimeout(()=>{stop();finish(Error('실행 시간이 초과되었습니다. 반복문을 확인하세요.'));},ms);};
  signal.addEventListener('abort',cancel,{once:true});time(ready?25000:240000);
  worker.onmessage=e=>{const m=e.data;if(m.state){$('#runtime').textContent=m.state;return;}if(m.ready){ready=true;$('#runtime').textContent='Python 실행 준비 완료';time(25000);return;}if(m.id!==id)return;if(m.error){stop();finish(Error(m.error));}else finish(null,m.result);};
  worker.onerror=e=>{stop();finish(Error(e.message||'Python 연결 실패'));};
  worker.postMessage({id,q,code,grade});
 });
}
function lock(v){busy=v;document.querySelectorAll('button,select,textarea').forEach(b=>{if(v)b.dataset.oldDisabled=b.disabled?'1':'0';b.disabled=v||b.dataset.oldDisabled==='1';});}
async function execute(q,grade){
 if(busy)return;const code=$('#editor').value;if(!code.trim()){feedback('코드를 먼저 작성해 주세요.','힌트나 개념 정리를 참고해 시작해 보세요.',false);return;}
 lock(true);$('#runtime').textContent=ready?'코드 실행 중…':'Python 준비 중 · 인터넷 연결을 확인하세요';
 const control=new AbortController(),cancel=document.createElement('button');cancel.textContent='실행 중지';cancel.id='cancel';cancel.onclick=()=>control.abort();$('#runtime').after(cancel);
 try{
  const r=await request(q,code,grade,control.signal);$('#output').hidden=false;$('#output').innerHTML=output(grade?r.user:r);
  if(grade){
   const tone=r.tone||(r.status==='correct'?'correct':'wrong');
   const title={correct:'정답입니다.',alternative:'같은 결과를 만드는 다른 풀이입니다.',missing:'결과는 같지만 필수 함수를 사용하지 않았습니다.',wrong:r.status==='error'?'실행 오류가 있습니다.':'결과가 다르거나 요구 조건이 부족합니다.'}[tone];
   record(q,r.status==='correct'&&tone!=='missing'?'correct':'wrong');
   const message=(tone==='missing'?'빠진 필수 함수: '+r.missing.map(n=>n+'()').join(', ')+'\n결과는 맞았습니다. 지정된 함수로 다시 작성해 보세요.\n':tone==='alternative'?'필수 조건을 만족했습니다. 코드 구성은 모범답안과 다릅니다.\n':'')+(r.msgs||[]).join('\n')+'\n'+diagnose(code);
   feedback(title,message,tone);showModel(q,r);
  }
  $('#runtime').textContent='Python 실행 준비 완료';
 }catch(e){$('#runtime').textContent='코드 실행 연결이 중단되었습니다';feedback('자동 채점을 완료하지 못했습니다.','인터넷 연결 후 다시 시도하거나 정답·해설을 확인하세요. '+String(e),false);}
 finally{cancel.remove();lock(false);}
}
function diagnose(code){
 if(/\bfalse\b|\btrue\b/.test(code))return 'Python의 참·거짓 값은 첫 글자를 대문자로 쓴 True / False입니다.';
 if(/nclass\s*==\s*1\s+(?:and|&)\s+nclass\s*==\s*3/.test(code))return '동시에 1반과 3반일 수는 없습니다. 둘 중 하나는 or로 연결하세요.';
 if(/\.mean\(\s*\)/.test(code)&&/mean['"]\s*\]/.test(code))return '학생별 평균을 구하려면 가로 방향 axis=1 또는 총점 ÷ 과목 수인지 확인하세요.';
 return '모범답안과 다르게 작성해도 요구한 결과가 같으면 정답일 수 있습니다.';
}
function advance(delta){
 if(busy)return;const p=pool(),i=Number(S.positions[pk()])||0;
 if(S.mode==='wrong'&&current&&!p.some(q=>q.id===current.id)){S.positions[pk()]=Math.max(0,delta<0?i-1:i);save();render();return;}
 if(delta<0||i<p.length-1){S.positions[pk()]=Math.max(0,i+delta);save();render();return;}
 if(S.mode==='wrong'){S.positions[pk()]=0;save();render();return;}
 if(mixed()){
  if(S.mixLevel>=0&&S.mixLevel<2){S.mixLevel++;save();render();return;}
  feedback('종합 연습의 마지막 문제입니다.','새 순서로 섞기를 눌러 다시 연습하거나, 복습 필요 문제를 선택하세요.',true);return;
 }
 if(S.level<2)S.level++;else if(S.ch<8){S.ch++;S.level=0;}else{feedback('선택한 유형의 5~8장을 모두 둘러봤습니다.','복습 필요 문제를 풀거나 다른 문제 유형을 선택해 보세요.',true);return;}
 save();render();$('#position').scrollIntoView({behavior:'smooth',block:'center'});
}
$('#tab-concept').onclick=()=>setView('concept');$('#tab-practice').onclick=()=>setView('practice');$('#startPractice').onclick=()=>setView('practice');
$('#tab-mixed').onclick=()=>setView('mixed');
$('#reshuffle').onclick=()=>{if(busy)return;S.mixSeed=(S.mixSeed+104729)>>>0;for(const key of Object.keys(S.positions))if(key.startsWith('mixed-'))delete S.positions[key];save();render();};
$('#prev').onclick=()=>advance(-1);$('#next').onclick=()=>advance(1);
$('#mode').onchange=e=>{if(busy)return;S.mode=e.target.value;save();render();};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify({app:'bigdata-study',version:1,state:S},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='빅데이터_학습기록_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
$('#import').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{
  if(f.size>5000000)throw Error('기록 파일이 너무 큽니다.');
  const x=JSON.parse(await f.text());if(x.app!=='bigdata-study'||x.version!==1||!x.state)throw Error('이 공부방에서 내보낸 기록 파일을 선택하세요.');
  if(!confirm('불러온 기록으로 현재 학습 기록을 바꿀까요? 현재 기록을 유지하려면 취소 후 먼저 내보내세요.'))return;
  const st=x.state;S={ch:st.ch,level:st.level,type:st.type,mode:st.mode,view:st.view,mixLevel:st.mixLevel,mixType:st.mixType,mixSeed:st.mixSeed,positions:st.positions,records:st.records,drafts:st.drafts};valid();
  const ids=new Set(BANK.map(q=>q.id));
  for(const [id,r]of Object.entries(S.records))if(!ids.has(id)||!r||!['correct','wrong','review'].includes(r.status))delete S.records[id];
  for(const [id,d]of Object.entries(S.drafts))if(!ids.has(id)||typeof d!=='string')delete S.drafts[id];
  save();render();
 }catch(err){alert('불러오기 실패: '+err.message);}finally{e.target.value='';}
};
render();
})();
