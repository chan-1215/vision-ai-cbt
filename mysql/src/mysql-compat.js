(function(G){
'use strict';
const {Session,tokens}=G.DBLab,P=Session.prototype,base={setup:P.setup,serialize:P.serialize,execute:P.executeOne,checkSelect:P.checkSelect,semantic:P.semantic,parse:P.parse};
const qi=s=>'\x60'+String(s).replace(/\x60/g,'\x60\x60')+'\x60',qs=s=>"'"+String(s).replace(/'/g,"''")+"'";
const collator=new Intl.Collator('en',{usage:'sort',sensitivity:'base',numeric:false,ignorePunctuation:false});
const err=(code,message)=>{throw Error(code+': '+message);};
const number=v=>{
 if(v===null)return null;if(typeof v==='number')return v;
 const m=String(v).trimStart().match(/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);return m?Number(m[0]):0;
};
const cmp=(a,b)=>a===null||b===null?null:typeof a==='number'||typeof b==='number'?Math.sign(number(a)-number(b)):collator.compare(String(a),String(b));
const same=(a,b)=>a===null&&b===null||a!==null&&b!==null&&cmp(a,b)===0;
const callName=e=>typeof e.name==='string'?e.name:(e.name?.name||[]).map(x=>x.value).join('.');
const hasAgg=e=>!!e&&typeof e==='object'&&(e.type==='aggr_func'||Object.values(e).some(v=>Array.isArray(v)?v.some(hasAgg):hasAgg(v)));
const quoteType=t=>t.toUpperCase().replace(/\s*\(\s*/g,'(').replace(/\s*\)/g,')').replace(/\s+/g,' ');
function like(a,b){
 if(a===null||b===null)return null;const input=Array.from(String(a)),pattern=Array.from(String(b)),memo=new Map();
 function match(i,j){
  const key=i+','+j;if(memo.has(key))return memo.get(key);let ok;
  if(j===pattern.length)ok=i===input.length;
  else if(pattern[j]==='%')ok=match(i,j+1)||i<input.length&&match(i+1,j);
  else if(pattern[j]==='_')ok=i<input.length&&match(i+1,j+1);
  else if(pattern[j]==='\\'&&j+1<pattern.length)ok=i<input.length&&collator.compare(input[i],pattern[j+1])===0&&match(i+1,j+2);
  else ok=i<input.length&&collator.compare(input[i],pattern[j])===0&&match(i+1,j+1);
  memo.set(key,ok);return ok;
 }
 return +match(0,0);
}
function roundDecimal(v,scale){
 const n=Number(v);if(!Number.isFinite(n))return n;
 const power=10**scale;return Math.sign(n)*Math.round((Math.abs(n)+Number.EPSILON)*power)/power;
}
function metadata(s){
 if(!s.meta)s.meta={};
 for(const name of s.names()){
  const m=s.meta[name]||(s.meta[name]={}),d=s.dbs[name];
  for(const table of s.tables(d)){
   if(m[table])continue;const ddl=d.exec("SELECT sql FROM sqlite_master WHERE type='table' AND name="+qs(table))[0]?.values[0][0]||'';
   const seq=d.exec("SELECT name FROM sqlite_master WHERE name='sqlite_sequence'").length?d.exec('SELECT seq FROM sqlite_sequence WHERE name='+qs(table))[0]?.values[0]?.[0]||0:0;
   m[table]={columns:s.info(table,d).map(r=>({name:r[1],type:quoteType(r[2]).replace(/^INTEGER$/,'INT'),notnull:!!r[3]||!!r[5],pk:!!r[5],auto:!!r[5]&&/\bAUTOINCREMENT\b/i.test(ddl),defaultSQL:r[4]})),next:seq+1};
  }
 }
 return s.meta;
}
function tableMeta(s,name){let m=s.meta?.[s.current];if(m){const key=Object.keys(m).find(k=>k.toLowerCase()===String(name).toLowerCase());if(key)return m[key];}metadata(s);m=s.meta[s.current]||{};const key=Object.keys(m).find(k=>k.toLowerCase()===String(name).toLowerCase());return m[key];}
function evalSQL(d,sql){const p=d.prepare(sql);try{const columns=p.getColumnNames(),values=[];while(p.step())values.push(p.get());return {columns,values};}finally{p.free();}}
function literal(v){return v===null?'NULL':typeof v==='number'?String(v):qs(v);}
function cast(s,value,table,column){
 const c=tableMeta(s,table)?.columns.find(c=>c.name.toLowerCase()===String(column).toLowerCase());if(!c)return value;
 const t=c.type.toUpperCase();
 if(value===null){if(c.notnull&&!c.auto)err(1048,c.name+' 열에는 NULL을 넣을 수 없습니다.');return null;}
 if(/^(?:TINYINT|SMALLINT|MEDIUMINT|INT|INTEGER|BIGINT)\b/.test(t)){
  if(typeof value==='string'&&!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()))err(/^[+-]?\d/.test(value.trim())?1265:1366,c.name+' 열의 정수 값을 변환할 수 없습니다.');
  const n=number(value),out=Math.sign(n)*Math.floor(Math.abs(n)+.5),bits=/^TINYINT/.test(t)?8:/^SMALLINT/.test(t)?16:/^MEDIUMINT/.test(t)?24:/^BIGINT/.test(t)?64:32,unsigned=/UNSIGNED/.test(t);
  if(!Number.isSafeInteger(out)){if(bits===64)throw Error('지원 범위: BIGINT의 정확한 계산은 JavaScript 안전 정수 범위까지만 제공합니다.');err(1264,c.name+' 열의 정수 범위를 벗어났습니다.');}
  if(out<(unsigned?0:-(2**(bits-1)))||out>(unsigned?2**bits-1:2**(bits-1)-1))err(1264,c.name+' 열의 정수 범위를 벗어났습니다.');return out;
 }
 if(/^(?:DECIMAL|NUMERIC|FLOAT|DOUBLE|REAL)\b/.test(t)){
  if(typeof value==='string'&&!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim()))err(1366,c.name+' 열의 숫자를 확인하세요.');
  let n=number(value);const dec=t.match(/^(?:DECIMAL|NUMERIC)\((\d+)(?:,\s*(\d+))?\)/);
  if(dec){n=roundDecimal(n,+(dec[2]||0));if(Math.abs(n)>=10**(+dec[1]-(+dec[2]||0)))err(1264,c.name+' 열의 DECIMAL 범위를 벗어났습니다.');}
  return n;
 }
 if(t==='DATE'){
  let str=String(value).trim(),m=str.match(/^(\d{2}|\d{4})-(\d{1,2})-(\d{1,2})$/);
  if(!m&&/^\d{8}$/.test(str))m=[str,str.slice(0,4),str.slice(4,6),str.slice(6,8)];
  if(!m)err(1292,c.name+" 열의 날짜가 올바르지 않습니다. 예: '2026-10-27'");
  let y=+m[1];if(m[1].length===2)y+=y<=69?2000:1900;
  str=String(y).padStart(4,'0')+'-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0');
  if(y<1000||!Number.isFinite(Date.parse(str+'T00:00:00Z'))||new Date(str+'T00:00:00Z').toISOString().slice(0,10)!==str)err(1292,c.name+' 열에 존재하지 않는 날짜를 넣었습니다.');return str;
 }
 if(/^(?:VAR)?CHAR|^TEXT/.test(t)){
  let str=String(value),len=t.match(/^(?:VAR)?CHAR\((\d+)\)/);
  if(len&&[...str].length>+len[1]){
   const chars=[...str];if(chars.slice(+len[1]).some(x=>x!==' '))err(1406,c.name+' 열은 최대 '+len[1]+'자입니다.');str=chars.slice(0,+len[1]).join('');
  }
  if(/^CHAR\(/.test(t))str=str.replace(/ +$/,'');return str;
 }
 return value;
}
P.setup=function(d){
 base.setup.call(this,d);const s=this;
 d.create_function('__my_cmp',(a,b)=>cmp(a,b));
 d.create_function('__my_like',(a,b)=>like(a,b));
 d.create_function('__my_num',a=>number(a));
 d.create_function('__my_div',(a,b)=>a===null||b===null||number(b)===0?null:number(a)/number(b));
 d.create_function('__my_idiv',(a,b)=>a===null||b===null||number(b)===0?null:Math.trunc(number(a)/number(b)));
 d.create_function('__my_mod',(a,b)=>a===null||b===null||number(b)===0?null:number(a)%number(b));
 d.create_function('__my_cast',(value,table,col)=>cast(s,value,table,col));
 d.create_function('__my_key',v=>{
  if(v===null||typeof v==='number')return v;
  const a=s.collationKeys||(s.collationKeys=[]);let l=0,r=a.length;
  while(l<r){const mid=(l+r)>>1,c=collator.compare(String(v),a[mid].value);if(c===0)return a[mid].key;if(c<0)r=mid;else l=mid+1;}
  const key='s'+(s.collationKeyCount=(s.collationKeyCount||0)+1);a.splice(l,0,{value:String(v),key});return key;
 });
 d.create_function('LAST_INSERT_ID',()=>s.lastInsertId||0);
 d.create_function('IF',(condition,yes,no)=>number(condition)?yes:no);
 d.create_function('CONCAT_WS',(sep,a,b)=>sep===null?null:[a,b].filter(x=>x!==null).join(String(sep)));
 d.create_function('LOWER',v=>v===null?null:String(v).toLowerCase());
 d.create_function('UPPER',v=>v===null?null:String(v).toUpperCase());
 d.create_function('LENGTH',v=>v===null?null:new TextEncoder().encode(String(v)).length);
 d.create_function('__my_concat_pair',(sep,a,b)=>sep===null||a===null&&b===null?null:[a,b].filter(v=>v!==null).join(String(sep)));
 for(const [name,direction]of [['__my_min',-1],['__my_max',1]])d.create_aggregate(name,{init:()=>null,step:(old,v)=>v===null?old:old===null||cmp(v,old)*direction>0?v:old,finalize:v=>v});
};
P.serialize=function(){
 metadata(this);const state=base.serialize.call(this);for(const d of Object.values(this.dbs))this.setup(d);state.meta=JSON.parse(JSON.stringify(this.meta));state.lastInsertId=this.lastInsertId||0;return state;
};
P.parse=function(ts){return base.parse.call(this,ts.map(t=>t.kind==='number'&&(t.value[0]==='.'||/[eE]/.test(t.value))?{...t,value:Number(t.value).toLocaleString('en-US',{useGrouping:false,maximumSignificantDigits:21})}:t));};
function expression(s,e,ctx={}){
 if(!e)return 'NULL';
 if(e.ast)return '('+selectSQL(s,e.ast).sql+')';
 const exp=x=>expression(s,x,ctx);
 if(e.type==='column_ref'){
  if(ctx.substitutions?.[String(e.column).toLowerCase()])return '('+ctx.substitutions[String(e.column).toLowerCase()]+')';
  if(!e.table&&ctx.aliases?.[String(e.column).toLowerCase()])return expression(s,ctx.aliases[String(e.column).toLowerCase()],{...ctx,aliases:null});
  if(e.column==='*')return e.table?qi(e.table)+'.*':'*';
  return (e.table?qi(e.table)+'.':'')+qi(e.column);
 }
 if(e.type==='number')return String(e.value);
 if(e.type==='null')return 'NULL';
 if(e.type==='bool')return e.value?'1':'0';
 if(/string/.test(e.type))return qs(e.value);
 if(e.type==='star')return '*';
 if(e.type==='expr_list')return '('+e.value.map(exp).join(',')+')';
 if(e.type==='unary_expr')return '('+e.operator+' '+exp(e.expr)+')';
 if(e.type==='binary_expr'){
  const op=e.operator.toUpperCase(),a=exp(e.left),b=exp(e.right);
  if(['IS','IS NOT'].includes(op)&&e.right.type==='bool')return '('+a+' '+op+' '+(e.right.value?'TRUE':'FALSE')+')';
  if(['=','!=','<>','<','>','<=','>='].includes(op))return '(__my_cmp('+a+','+b+') '+(op==='!='?'<>':op)+' 0)';
  if(op==='<=>')return '(('+a+' IS NULL AND '+b+' IS NULL) OR COALESCE(__my_cmp('+a+','+b+')=0,0))';
  if(op==='LIKE'||op==='NOT LIKE')return '('+(op==='NOT LIKE'?'NOT ':'')+'__my_like('+a+','+b+'))';
  if(['IN','NOT IN'].includes(op)&&e.right.type==='expr_list')return '('+(op==='NOT IN'?'NOT ':'')+'('+e.right.value.map(v=>'__my_cmp('+a+','+exp(v)+')=0').join(' OR ')+'))';
  if(['BETWEEN','NOT BETWEEN'].includes(op))return '('+(op==='NOT BETWEEN'?'NOT ':'')+'(__my_cmp('+a+','+exp(e.right.value[0])+')>=0 AND __my_cmp('+a+','+exp(e.right.value[1])+')<=0))';
  if(op==='/')return '__my_div('+a+','+b+')';
  if(op==='DIV')return '__my_idiv('+a+','+b+')';
  if(op==='%'||op==='MOD')return '__my_mod('+a+','+b+')';
  if(['+','-','*'].includes(op))return '(__my_num('+a+') '+op+' __my_num('+b+'))';
  if(op==='REGEXP'||op==='NOT REGEXP')throw Error('지원 범위: REGEXP의 ICU 정규식 문법은 아직 제공하지 않습니다.');
  return '('+a+' '+op+' '+b+')';
 }
 if(e.type==='aggr_func'){
  const arg=e.args?.expr,distinct=e.args?.distinct?'DISTINCT ':'';
  if(['MAX','MIN'].includes(e.name.toUpperCase()))return (e.name.toUpperCase()==='MAX'?'__my_max':'__my_min')+'('+exp(arg)+')';
  const rendered=e.name+'('+distinct+(distinct?'__my_key('+exp(arg)+')':exp(arg))+')';
  if(e.name.toUpperCase()==='AVG'){
   let precision=null;
   if(arg.type==='column_ref'){
    metadata(s);const candidates=Object.values(s.meta[s.current]||{}).flatMap(t=>t.columns).filter(c=>c.name.toLowerCase()===String(arg.column).toLowerCase()),type=candidates[0]?.type||'';
    if(/INT/i.test(type))precision=4;
    const m=type.match(/DECIMAL\(\d+,\s*(\d+)\)/i);if(m)precision=4+(+m[1]);
   }else if(arg.type==='number')precision=4+(String(arg.value).split('.')[1]?.length||0);
   if(precision!==null)return 'ROUND('+rendered+','+precision+')';
  }
  return rendered;
 }
 if(e.type==='function'){
  const name=callName(e),args=e.args?.value||[];
  if(name.toUpperCase()==='DATABASE')return literal(s.current);
  if(name.toUpperCase()==='CONCAT'){
   if(!args.length)err(1582,'CONCAT에는 인수가 필요합니다.');
   let value='CAST('+exp(args[0])+' AS TEXT)';for(const a of args.slice(1))value='CONCAT('+value+','+exp(a)+')';return value;
  }
  if(name.toUpperCase()==='CONCAT_WS'){
   if(args.length<2)err(1582,'CONCAT_WS에는 구분자와 값이 필요합니다.');
   const sep=exp(args[0]);let value=exp(args[1]);for(const a of args.slice(2))value='__my_concat_pair('+sep+','+value+','+exp(a)+')';
   return '(CASE WHEN '+sep+" IS NULL THEN NULL ELSE COALESCE("+value+",'') END)";
  }
  return name+'('+args.map(exp).join(',')+')';
 }
 if(e.type==='case')return '(CASE '+(e.expr?exp(e.expr):'')+' '+e.args.map(a=>a.type==='when'?'WHEN '+exp(a.cond)+' THEN '+exp(a.result):'ELSE '+exp(a.result)).join(' ')+' END)';
 if(e.type==='cast')return 'CAST('+exp(e.expr)+' AS '+(e.target?.[0]?.dataType||'TEXT')+')';
 throw Error('지원 범위: '+e.type+' 표현식은 현재 호환 처리 대상이 아닙니다.');
}
function exprTitle(s,e){
 try{const a={with:null,type:'select',columns:[{expr:e,as:null}],from:null};return s.parser.sqlify(a,{database:'MySQL'}).replace(/^SELECT\s+/i,'').replace(/\x60/g,'').replace(/\s*\(\s*/g,'(').replace(/\s*\)/g,')').replace(/\s*,\s*/g,',');}catch{return '결과';}
}
function limitValues(ast){
 const l=ast.limit;if(!l)return [0,Infinity];const vs=l.value||[];
 for(const n of vs)if(n.type!=='number'||!Number.isInteger(+n.value)||+n.value<0)err(1064,'LIMIT에는 0 이상의 정수를 사용하세요.');
 return vs.length===2?[+vs[0].value,+vs[1].value]:[0,+vs[0].value];
}
function selectSQL(s,ast){
 if(ast.with||ast._next)throw Error('지원 범위: CTE·UNION은 현재 호환 프로필에서 제외됩니다.');
 const expanded=[];
 for(const c of ast.columns){
  if(c.expr.type==='column_ref'&&c.expr.column==='*'){
   for(const f of ast.from||[])if(!c.expr.table||c.expr.table===(f.as||f.table))for(const col of s.info(f.table))expanded.push({expr:{type:'column_ref',table:f.as||f.table,column:col[1]},as:null});
  }else expanded.push(c);
 }
 ast={...ast,columns:expanded};
 const aliases={};for(const col of ast.columns||[])if(col.as)aliases[col.as.toLowerCase()]=col.expr;
 const resolve=e=>e.type==='number'?(ast.columns[+e.value-1]?.expr||e):e.type==='column_ref'&&!e.table&&aliases[String(e.column).toLowerCase()]?aliases[String(e.column).toLowerCase()]:e;
 const columns=ast.columns.map(c=>expression(s,c.expr)+(c.as?' AS '+qi(c.as):c.expr.type!=='column_ref'?' AS '+qi(exprTitle(s,c.expr)):''));
 const order=(ast.orderby||[]).map(o=>({...o,expr:resolve(o.expr)}));
 for(let i=0;i<order.length;i++)columns.push(expression(s,order[i].expr,{aliases})+' AS '+qi('__sql_order_'+i));
 let sql='SELECT '+columns.join(', ');
 if(ast.from?.length){
  sql+=' FROM '+ast.from.map((f,i)=>{
   if(f.table&&!s.info(f.table).length)err(1146,'테이블이 없습니다: '+f.table);
   let v=f.expr?.ast?'('+selectSQL(s,f.expr.ast).sql+')':(f.db?qi(f.db)+'.':'')+qi(f.table);
   if(f.as)v+=' AS '+qi(f.as);
   if(f.on)v+=' ON '+expression(s,f.on);
   return (i?(f.join?' '+f.join+' ':', '):'')+v;
  }).join('');
 }
 if(ast.where)sql+=' WHERE '+expression(s,ast.where);
 let grouping=ast.groupby?.columns?.map(resolve)||[];
 if(ast.distinct&&!grouping.length&&!hasAgg(ast.columns))grouping=ast.columns.map(c=>c.expr);
 if(grouping.length){if(grouping.some(e=>e.column==='*'))throw Error('지원 범위: DISTINCT * 대신 조회할 열을 직접 적어 주세요.');sql+=' GROUP BY '+grouping.map(e=>'__my_key('+expression(s,e)+')').join(',');}
 if(ast.having)sql+=' HAVING '+expression(s,ast.having,{aliases});
 return {sql,order,limit:limitValues(ast),hidden:order.length};
}
function executeSelect(s,ast){
 s.checkSelect(ast);const plan=selectSQL(s,ast),d=s.current?s.db():s.scalar,out=evalSQL(d,plan.sql),n=out.columns.length-plan.hidden;
 if(plan.order.length)out.values.sort((a,b)=>{
  for(let i=0;i<plan.order.length;i++){const x=a[n+i],y=b[n+i],c=x===null?(y===null?0:-1):y===null?1:cmp(x,y);if(c)return plan.order[i].type==='DESC'?-c:c;}return 0;
 });
 out.columns=out.columns.slice(0,n);out.values=out.values.slice(plan.limit[0],plan.limit[0]+plan.limit[1]).map(r=>r.slice(0,n));
 return {result:out,message:'조회 완료 · '+out.values.length+'행'};
}
function captureMeta(s,ast){
 metadata(s);const name=ast.table?.[0]?.table;if(!name)return;
 const defs=ast.create_definitions?.filter(d=>d.resource==='column')||[];
 const inf=s.info(name);
 s.meta[s.current][name]={columns:defs.map(def=>{
  const r=inf.find(r=>r[1]===def.column.column),dt=def.definition;
  return {name:def.column.column,type:(dt.dataType.toUpperCase().replace(/^INTEGER$/,'INT')+(dt.length!==undefined?'('+dt.length+(dt.scale!==undefined?','+dt.scale:'')+')':'')+(dt.suffix?.includes('UNSIGNED')?' UNSIGNED':'')),notnull:!!r?.[3]||!!r?.[5],pk:!!r?.[5],auto:!!def.auto_increment,defaultSQL:r?.[4]??null};
 }),next:1};
}
function defaults(s,table,col){
 if(col.defaultSQL!==null)return evalSQL(s.db(),'SELECT '+col.defaultSQL).values[0][0];
 if(col.auto||!col.notnull)return null;err(1364,col.name+' 열에 기본값이 없습니다. INSERT에서 값을 지정하세요.');
}
function enforce(s,d){
 for(const name of s.tables(d)){
  const meta=tableMeta(s,name),inf=s.info(name,d),rows=evalSQL(d,'SELECT * FROM '+qi(name)).values;
  if(rows.length>10000)throw Error('학습장 제한: 테이블당 10,000행까지 실행할 수 있습니다.');
  for(const row of rows)for(let i=0;i<meta.columns.length;i++){const c=meta.columns[i];if(c.notnull&&row[i]===null)err(1048,c.name+' 열은 NULL일 수 없습니다.');}
  const indices=d.exec('PRAGMA index_list('+qi(name)+')')[0]?.values||[];
  for(const index of indices.filter(r=>r[2])){
   const cols=(d.exec('PRAGMA index_info('+qi(index[1])+')')[0]?.values||[]).map(r=>inf.findIndex(c=>c[1]===r[2])),seen=[];
   for(const row of rows){const values=cols.map(i=>row[i]);if(values.some(v=>v===null))continue;if(seen.some(old=>values.every((v,i)=>same(v,old[i]))))err(1062,'UNIQUE 또는 PRIMARY KEY 값이 중복됩니다.');seen.push(values);}
  }
 }
}
function sqliteError(e){
 const m=String(e.message||e);if(/^\d+:/.test(m))return e;
 const code=/UNIQUE constraint/.test(m)?1062:/NOT NULL constraint/.test(m)?1048:/no such table/i.test(m)?1146:/no such column|has no column/i.test(m)?1054:/already exists/i.test(m)?1050:/duplicate column/i.test(m)?1060:/FOREIGN KEY constraint/i.test(m)?1452:1064;
 return Error(code+': '+m);
}
function target(s,ast){
 const name=(ast.table||ast.from||[])[0]?.table;if(!name||!s.tables().some(n=>n.toLowerCase()===name.toLowerCase()))err(1146,'테이블이 없습니다: '+name);
 return name;
}
function safeCheck(s,ast,table){
 if(!s.safe)return;if(ast.limit)return;
 if(!ast.where)err(1175,'SQL_SAFE_UPDATES가 켜져 있습니다. 키를 사용하는 WHERE 또는 LIMIT을 적어 주세요.');
 const d=s.db(),inf=s.info(table),keys=new Set(inf.filter(c=>c[5]).map(c=>c[1].toLowerCase()));
 for(const ix of d.exec('PRAGMA index_list('+qi(table)+')')[0]?.values||[]){const col=d.exec('PRAGMA index_info('+qi(ix[1])+')')[0]?.values?.[0]?.[2];if(col)keys.add(col.toLowerCase());}
 const uses=e=>e&&e.type==='binary_expr'&&(['AND','OR'].includes(e.operator)?uses(e.left)||uses(e.right):['=','<','>','<=','>=','IN','BETWEEN'].includes(e.operator)&&e.left.type==='column_ref'&&keys.has(String(e.left.column).toLowerCase()));
 if(!uses(ast.where))err(1175,'안전 모드에서 WHERE의 키 열을 직접 비교하세요. 실제 MySQL의 인덱스 선택 비용까지는 모사하지 않습니다.');
}
function updateSequence(s,table){
 const meta=tableMeta(s,table);if(!meta?.columns.some(c=>c.auto))return;
 const d=s.db();d.run('DELETE FROM sqlite_sequence WHERE name='+qs(table));d.run('INSERT INTO sqlite_sequence(name,seq) VALUES('+qs(table)+','+(meta.next-1)+')');
}
function executeMutation(s,ast){
 const d=s.db(),name=target(s,ast),meta=tableMeta(s,name),auto=meta.columns.find(c=>c.auto);
 if(ast.type==='insert'){
  if(ast.on_duplicate_update||ast.values?.type!=='values')throw Error('지원 범위: INSERT SELECT와 ON DUPLICATE KEY UPDATE는 이 프로필에서 제외됩니다.');
  const names=ast.columns||meta.columns.map(c=>c.name),list=ast.values.values,known=new Set(meta.columns.map(c=>c.name.toLowerCase()));
  for(const n of names)if(!known.has(n.toLowerCase()))err(1054,'존재하지 않는 열입니다: '+n);
  if(new Set(names.map(n=>n.toLowerCase())).size!==names.length)err(1110,'같은 열을 두 번 지정했습니다.');
  const prepared=list.map(row=>{
   if(row.value.length!==names.length)err(1136,'열 개수와 값 개수가 다릅니다.');
   const obj={};names.forEach((n,i)=>{obj[n.toLowerCase()]=evalSQL(d,'SELECT '+expression(s,row.value[i])).values[0][0];});
   return meta.columns.map(c=>cast(s,Object.hasOwn(obj,c.name.toLowerCase())?obj[c.name.toLowerCase()]:defaults(s,name,c),name,c.name));
  });
  let allocated=false,first=0;
  if(auto){
   const ai=meta.columns.indexOf(auto),start=meta.next,needs=prepared.some(row=>row[ai]===null||row[ai]===0);let cursor=start,reserved=needs?start+prepared.length:start;
   for(const row of prepared){if(row[ai]===null||row[ai]===0){row[ai]=cursor++;if(!first)first=row[ai];allocated=true;}else cursor=Math.max(cursor,row[ai]+1);reserved=Math.max(reserved,cursor);}
   meta.next=reserved;
  }
  d.run('SAVEPOINT mysql_compat_statement');
  try{d.run('INSERT INTO '+qi(name)+' ('+meta.columns.map(c=>qi(c.name)).join(',')+') VALUES '+prepared.map(row=>'('+row.map(literal).join(',')+')').join(','));enforce(s,d);d.run('RELEASE mysql_compat_statement');if(first)s.lastInsertId=first;updateSequence(s,name);return {message:prepared.length+'행 추가 · INSERT 완료',affectedRows:prepared.length};}
  catch(e){d.run('ROLLBACK TO mysql_compat_statement');d.run('RELEASE mysql_compat_statement');if(allocated)updateSequence(s,name);throw sqliteError(e);}
 }
 safeCheck(s,ast,name);
 const alias=(ast.table||ast.from||[])[0]?.as,from=qi(name)+(alias?' AS '+qi(alias):'');
 let where=ast.where?expression(s,ast.where):'1';
 const query={type:'select',columns:[{expr:{type:'column_ref',column:'rowid',table:alias||null}}],from:[{table:name,as:alias}],where:ast.where,orderby:ast.orderby,limit:ast.limit};
 const ids=executeSelect(s,query).result.values.map(r=>r[0]);
 if(!ids.length)return {message:'대상 0행 · '+ast.type.toUpperCase()+' 완료',affectedRows:0,matchedRows:0};
 const before=evalSQL(d,'SELECT * FROM '+qi(name)+' WHERE rowid IN ('+ids.join(',')+')').values;
 let sql;
 if(ast.type==='delete')sql='DELETE FROM '+qi(name)+' WHERE rowid IN ('+ids.join(',')+')';
 else{
  const substitutions={},sets=[];
  for(const a of ast.set){const col=meta.columns.find(c=>c.name.toLowerCase()===a.column.toLowerCase());if(!col)err(1054,'존재하지 않는 열입니다: '+a.column);const value='__my_cast('+expression(s,a.value,{substitutions})+','+qs(name)+','+qs(col.name)+')';sets.push(qi(col.name)+'='+value);substitutions[col.name.toLowerCase()]=value;}
  sql='UPDATE '+qi(name)+(alias?' AS '+qi(alias):'')+' SET '+sets.join(',')+' WHERE rowid IN ('+ids.join(',')+')';
 }
 d.run('SAVEPOINT mysql_compat_statement');
 try{
  d.run(sql);enforce(s,d);let changed=ids.length;
  if(ast.type==='update'){
   const after=evalSQL(d,'SELECT * FROM '+qi(name)+' WHERE rowid IN ('+ids.join(',')+')').values;changed=before.length-after.filter(row=>before.some(old=>JSON.stringify(old)===JSON.stringify(row))).length;
   if(auto){const max=evalSQL(d,'SELECT COALESCE(MAX('+qi(auto.name)+'),0) FROM '+qi(name)).values[0][0];meta.next=Math.max(meta.next,max+1);}
  }
  d.run('RELEASE mysql_compat_statement');updateSequence(s,name);
  return {message:'대상 '+ids.length+'행 / 변경 '+changed+'행 · '+ast.type.toUpperCase()+' 완료',matchedRows:ids.length,affectedRows:changed,warning:!ast.where&&!ast.limit?'WHERE가 없어 전체 행이 대상이었습니다. DELETE는 테이블 구조를 남깁니다.':null};
 }catch(e){d.run('ROLLBACK TO mysql_compat_statement');d.run('RELEASE mysql_compat_statement');throw sqliteError(e);}
}
P.checkSelect=function(ast){
 if(ast.type!=='select')return;
 const groups=ast.groupby?.columns||[],aliases=Object.fromEntries(ast.columns.filter(c=>c.as).map(c=>[c.as.toLowerCase(),c.expr]));
 const resolve=e=>e.type==='number'?(ast.columns[+e.value-1]?.expr||e):e.type==='column_ref'&&!e.table&&aliases[String(e.column).toLowerCase()]?aliases[String(e.column).toLowerCase()]:e;
 const bare=(e,out=[])=>{if(!e||typeof e!=='object'||e.type==='aggr_func'||e.ast)return out;if(e.type==='column_ref'){out.push(e);return out;}for(const v of Object.values(e))if(v&&typeof v==='object'){if(Array.isArray(v))v.forEach(x=>bare(x,out));else bare(v,out);}return out;};
 const grouped=groups.map(resolve),groupNames=new Set(grouped.filter(e=>e.type==='column_ref').map(e=>String(e.column).toLowerCase())),allowed=new Set(groupNames);
 const single=e=>{if(e?.type!=='binary_expr')return;if(e.operator==='AND'){single(e.left);single(e.right);}if(e.operator==='='&&e.left.type==='column_ref'&&['single_quote_string','double_quote_string','number'].includes(e.right.type))allowed.add(String(e.left.column).toLowerCase());};single(ast.where);
 const cols=new Set();for(const f of ast.from||[])if(f.table){const inf=this.info(f.table);inf.forEach(c=>cols.add(c[1].toLowerCase()));let keys=inf.filter(c=>c[5]).map(c=>c[1]);const d=this.db();const ix=(d.exec('PRAGMA index_list('+qi(f.table)+')')[0]?.values||[]).filter(r=>r[2]).map(r=>(d.exec('PRAGMA index_info('+qi(r[1])+')')[0]?.values||[]).map(c=>c[2]));
  if(keys.length)ix.push(keys);if(ix.some(key=>key.length&&key.every(n=>allowed.has(n.toLowerCase())&&inf.find(c=>c[1]===n)&&(inf.find(c=>c[1]===n)[3]||inf.find(c=>c[1]===n)[5]))))inf.forEach(c=>allowed.add(c[1].toLowerCase()));
 }
 for(const r of bare(ast.where))if(aliases[String(r.column).toLowerCase()]&&!cols.has(String(r.column).toLowerCase()))err(1054,'WHERE에서는 SELECT 별명이 아니라 원래 열 이름을 사용하세요.');
 if(ast.groupby||hasAgg(ast.columns)||hasAgg(ast.having)){
  const signature=e=>JSON.stringify(e,(k,v)=>['collate','parentheses'].includes(k)?undefined:v);
  const expand=e=>{if(!e||typeof e!=='object')return e;if(e.type==='column_ref'&&!e.table&&aliases[String(e.column).toLowerCase()])return aliases[String(e.column).toLowerCase()];if(Array.isArray(e))return e.map(expand);return Object.fromEntries(Object.entries(e).map(([k,v])=>[k,typeof v==='object'?expand(v):v]));};
  const validate=e=>{if(grouped.some(g=>signature(g)===signature(e)))return;for(const r of bare(expand(e)))if(!allowed.has(String(r.column).toLowerCase()))err(ast.groupby?1055:1140,r.column+' 열을 GROUP BY에 적거나 집계 함수로 감싸세요.');};
  for(const c of ast.columns)validate(c.expr);
  for(const o of ast.orderby||[])validate(resolve(o.expr));if(ast.having)validate(resolve(ast.having));
 }
 if(ast.distinct&&ast.orderby)for(const o of ast.orderby){const ex=resolve(o.expr);if(ex.type==='column_ref'&&!ast.columns.some(c=>c.expr.column==='*'||c.expr.type==='column_ref'&&c.expr.column===ex.column))err(3065,'DISTINCT 조회에서 ORDER BY에 쓰는 열을 SELECT에 포함하세요.');}
};
P.executeOne=function(sql){
 this.collationKeys=[];this.collationKeyCount=0;
 const ts=tokens(sql),head=ts[0]?.value.toUpperCase();
 try{
  if(['SELECT','INSERT','UPDATE','DELETE'].includes(head)){
   if(this.current)this.db();
   const defaultInsert=head==='INSERT'&&ts.length===8&&ts[1].value.toUpperCase()==='INTO'&&ts[3].value==='('&&ts[4].value===')'&&ts[5].value.toUpperCase()==='VALUES'&&ts[6].value==='('&&ts[7].value===')';
   const ast=defaultInsert?{type:'insert',table:[{table:ts[2].value}],columns:[],values:{type:'values',values:[{type:'expr_list',value:[]}]}}:this.parse(ts);
   return ast.type==='select'?executeSelect(this,ast):executeMutation(this,ast);
  }
  if(['CREATE','ALTER','DROP'].includes(head)){
   let ast;try{ast=this.parse(ts);}catch{}
   const createName=ast?.type==='create'&&ast.keyword==='table'?ast.table?.[0]?.table:null,existed=createName&&this.current&&this.tables().includes(createName);
   const out=base.execute.call(this,sql);
   if(createName&&!existed)captureMeta(this,ast);
   else if(ast?.type==='alter'){
    const name=ast.table?.[0]?.table,old=tableMeta(this,name);
    if(old){const inf=this.info(name),byName=Object.fromEntries(old.columns.map(c=>[c.name,c]));old.columns=inf.map(r=>byName[r[1]]||{name:r[1],type:quoteType(r[2]).replace(/^INTEGER$/,'INT'),pk:!!r[5],notnull:!!r[3]||!!r[5],auto:!!r[5]&&old.columns.some(c=>c.auto),defaultSQL:r[4]});}
   }
   if(head==='ALTER'&&ts.some(t=>t.value.toUpperCase()==='AUTO_INCREMENT')){
    const name=ts[2].value,meta=tableMeta(this,name),pk=meta?.columns.find(c=>c.auto);if(pk){const max=evalSQL(this.db(),'SELECT COALESCE(MAX('+qi(pk.name)+'),0) FROM '+qi(name)).values[0][0];meta.next=Math.max(max+1,Number(ts.at(-1).value));updateSequence(this,name);}
   }
   if(ast?.type==='drop'&&ast.keyword==='table'&&this.meta?.[this.current])for(const t of ast.name||ast.table||[])delete this.meta[this.current][t.table];
   return out;
  }
  if(['DESC','DESCRIBE'].includes(head)){
   const name=ts[1]?.value,meta=tableMeta(this,name);if(!meta)err(1146,'테이블이 없습니다: '+name);
   const d=this.db(),indices=(d.exec('PRAGMA index_list('+qi(name)+')')[0]?.values||[]).map(r=>({unique:!!r[2],cols:(d.exec('PRAGMA index_info('+qi(r[1])+')')[0]?.values||[]).map(x=>x[2])}));
   const key=c=>c.pk?'PRI':indices.some(ix=>ix.unique&&ix.cols.length===1&&ix.cols[0]===c.name)?'UNI':indices.some(ix=>ix.cols[0]===c.name)?'MUL':'';
   return {result:{columns:['Field','Type','Null','Key','Default','Extra'],values:meta.columns.map(c=>[c.name,c.type.toLowerCase(),c.notnull?'NO':'YES',key(c),c.defaultSQL===null?null:evalSQL(this.db(),'SELECT '+c.defaultSQL).values[0][0],c.auto?'auto_increment':''])},message:'테이블 구조 조회 완료'};
  }
  return base.execute.call(this,sql);
 }catch(e){throw sqliteError(e);}
};
P.strict=function(d){enforce(this,d);};
P.semantic=function(){metadata(this);return base.semantic.call(this);};
G.DBLab.mysqlProfile={version:'MySQL 8.0 / utf8mb4_0900_ai_ci / strict',compare:cmp,like,number,cast,expression};
})(typeof self!=='undefined'?self:globalThis);
