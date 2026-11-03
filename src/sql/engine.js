(function(G){
'use strict';
const qi=s=>'"'+String(s).replace(/"/g,'""')+'"', qs=s=>"'"+String(s).replace(/'/g,"''")+"'";
function tokens(sql){
 const a=[];let i=0,start;
 while(i<sql.length){
  start=i;const c=sql[i],n=sql[i+1];
  if(/\s/.test(c)){i++;continue;}
  if(c==='#'||(c==='-'&&n==='-'&&(!sql[i+2]||/\s/.test(sql[i+2])))){while(i<sql.length&&sql[i]!=='\n')i++;continue;}
  if(c==='/'&&n==='*'){i+=2;while(i<sql.length&&!(sql[i]==='*'&&sql[i+1]==='/'))i++;if(i>=sql.length)throw Error('닫히지 않은 /* 주석입니다. */를 붙여 주세요.');i+=2;continue;}
  if(c==="'"||c==='"'||c==='\x60'){
   const quote=c;let v='',closed=false;i++;
   while(i<sql.length){const x=sql[i++];
    if(x===quote){if(sql[i]===quote){v+=quote;i++;}else{closed=true;break;}}
    else if(x==='\\'&&quote!=='\x60'&&i<sql.length){const k=sql[i++];v+=({n:'\n',r:'\r',t:'\t','0':'\0',b:'\b',Z:'\x1a','%':'\\%','_':'\\_'}[k]??k);}
    else v+=x;
   }
   if(!closed)throw Error('따옴표가 닫히지 않았습니다.');
   a.push({kind:quote==='\x60'?'id':'string',value:v,start,end:i});continue;
  }
  if(/[\p{L}_$]/u.test(c)){i++;while(i<sql.length&&/[\p{L}\p{N}_$]/u.test(sql[i]))i++;a.push({kind:'word',value:sql.slice(start,i),start,end:i});continue;}
  if(/[0-9]/.test(c)||c==='.'&&/[0-9]/.test(n)){const match=sql.slice(i).match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);i+=match[0].length;a.push({kind:'number',value:match[0],start,end:i});continue;}
  if(['>=','<=','!=','<>','||','&&'].includes(c+n)){i+=2;a.push({kind:'op',value:c+n,start,end:i});continue;}
  i++;a.push({kind:'op',value:c,start,end:i});
 }
 return a;
}
const raw=t=>t.kind==='string'?qs(t.value):t.kind==='id'?qi(t.value):t.value;
const text=ts=>ts.map(raw).join(' ');
const upper=t=>t&&t.kind!=='string'?t.value.toUpperCase():'';
function split(sql){
 const ts=tokens(sql),out=[];let start=0;
 for(const t of ts)if(t.value===';'&&t.kind==='op'){const s=sql.slice(start,t.start).trim();if(tokens(s).length)out.push({sql:s,start,end:t.end});start=t.end;}
 const rest=sql.slice(start).trim();if(tokens(rest).length)out.push({sql:rest,start,end:sql.length});
 return out;
}
function normal(sql){return JSON.stringify(tokens(sql).filter(t=>t.value!==';').map(t=>[t.kind==='id'?'word':t.kind,t.kind==='string'?t.value:t.value.toLowerCase()]));}
function hasRequired(sql,required){
 const ts=tokens(sql).filter(t=>t.kind!=='string'),names=ts.map(upper),missing=[];
 for(const req of required||[]){const parts=req.replace(/\(\)/g,'').toUpperCase().split(/\s+/);if(!names.some((_,i)=>parts.every((p,j)=>names[i+j]===p)))missing.push(req);}
 return missing;
}
function rowsEqual(a,b,ordered=false,columns=true){
 if(!a||!b)return a===b;
 if(columns&&JSON.stringify(a.columns)!==JSON.stringify(b.columns))return false;
 if(a.columns.length!==b.columns.length||a.values.length!==b.values.length)return false;
 const key=row=>JSON.stringify(row.map(v=>typeof v==='number'?Math.round(v*1e7)/1e7:v));
 const x=a.values.map(key),y=b.values.map(key);if(!ordered){x.sort();y.sort();}
 return x.every((v,i)=>v===y[i]);
}
function to64(bytes){let s='';for(let i=0;i<bytes.length;i+=16384)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+16384));return btoa(s);}
function from64(s){return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
function result(columns,values){return {columns,values};}
class Session{
 constructor(SQL,Parser,state){
  this.SQL=SQL;this.parser=new Parser();this.dbs=Object.create(null);this.current=null;this.safe=false;this.scalar=new SQL.Database();this.setup(this.scalar);
  this.meta=state?.meta?JSON.parse(JSON.stringify(state.meta)):null;this.lastInsertId=state?.lastInsertId||0;
  if(state){this.current=state.current||null;this.safe=!!state.safe;for(const [k,v]of Object.entries(state.dbs||{})){if(!/^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(k))throw Error('백업의 DB 이름이 올바르지 않습니다.');const d=new SQL.Database(from64(v));this.setup(d);this.dbs[k]=d;}}
 }
 setup(d){
  d.run('PRAGMA foreign_keys=ON;');
  d.create_function('CONCAT',(a,b)=>a===null||b===null?null:String(a)+String(b));
  d.create_function('CHAR_LENGTH',s=>s===null?null:[...String(s)].length);
  d.create_function('YEAR',s=>s===null?null:parseInt(String(s).slice(0,4),10));
  d.create_function('MONTH',s=>s===null?null:parseInt(String(s).slice(5,7),10));
  d.create_function('DAY',s=>s===null?null:parseInt(String(s).slice(8,10),10));
  d.create_function('DATABASE',()=>this.current);
 }
 serialize(){const dbs=Object.create(null);for(const [k,d]of Object.entries(this.dbs))dbs[k]=to64(d.export());return {current:this.current,safe:this.safe,dbs};}
 close(){for(const d of Object.values(this.dbs))d.close();this.scalar.close();}
 db(){if(!this.current||!this.dbs[this.current])throw Error('1046: 선택된 데이터베이스가 없습니다. CREATE DATABASE 이름; 다음 USE 이름;을 실행하세요.');return this.dbs[this.current];}
 names(){return Object.keys(this.dbs).sort();}
 tables(d=this.db()){return d.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;")[0]?.values.map(r=>r[0])||[];}
 info(name,d=this.db()){return d.exec('PRAGMA table_info('+qi(name)+')')[0]?.values||[];}
 inspect(){
  const tables=[];if(this.current&&this.dbs[this.current])for(const name of this.tables()){
   tables.push({name,columns:this.info(name).map(r=>({name:r[1],type:r[2],notnull:!!r[3]||!!r[5],pk:!!r[5]})),rows:this.db().exec('SELECT * FROM '+qi(name)+' LIMIT 100')[0]||result(this.info(name).map(r=>r[1]),[]),count:this.db().exec('SELECT COUNT(*) FROM '+qi(name))[0].values[0][0]});
  }
  return {names:this.names(),current:this.current,tables};
 }
 semantic(){
  const dbs={};
  for(const key of this.names()){
   const d=this.dbs[key],tables={};
   for(const name of this.tables(d)){
    const schema=d.exec("SELECT sql FROM sqlite_master WHERE type='table' AND name="+qs(name))[0].values[0][0];
    const columns=this.info(name,d).map(r=>[r[1].toLowerCase(),r[2].toUpperCase().replace(/^INT(?:EGER)?$/,'INTEGER'),!!r[3]||!!r[5],r[4],r[5]]);
    const rows=d.exec('SELECT * FROM '+qi(name))[0]?.values||[];
    const unique=(d.exec('PRAGMA index_list('+qi(name)+')')[0]?.values||[]).filter(r=>r[2]).map(r=>(d.exec('PRAGMA index_info('+qi(r[1])+')')[0]?.values||[]).map(c=>c[2]).join(',')).sort();
    const foreign=d.exec('PRAGMA foreign_key_list('+qi(name)+')')[0]?.values||[];
    tables[name.toLowerCase()]={columns,auto:/\bAUTOINCREMENT\b/i.test(schema),unique,foreign,checks:(schema.match(/\bCHECK\s*\(/gi)||[]).length,rows:rows.map(r=>JSON.stringify(r)).sort()};
   }
   const sequences=d.exec("SELECT name FROM sqlite_master WHERE name='sqlite_sequence'").length?d.exec('SELECT name,seq FROM sqlite_sequence ORDER BY name')[0]?.values||[]:[];
   dbs[key]={tables,sequences};
  }
  return {current:this.current,safe:this.safe,dbs};
 }
 parse(ts){
  const sql=ts.map(t=>(t.kind==='word'&&/[^\x00-\x7F]/.test(t.value))||t.kind==='id'?'\x60'+t.value.replace(/\x60/g,'\x60\x60')+'\x60':raw(t)).join(' ');
  try{const a=this.parser.astify(sql,{database:'MySQL'});return Array.isArray(a)?a[0]:a;}catch(e){throw Error('MySQL 문법 확인: '+String(e.message).slice(0,350));}
 }
 checkSelect(ast){
  if(!ast||ast.type!=='select')return;
  const refs=(expr,out=[])=>{if(!expr||typeof expr!=='object')return out;if(expr.type==='aggr_func')return out;if(expr.type==='column_ref'){out.push(expr);return out;}if(expr.type==='select'||expr.ast)return out;for(const v of Object.values(expr))if(v&&typeof v==='object'){if(Array.isArray(v))v.forEach(x=>refs(x,out));else refs(v,out);}return out;};
  const containsAgg=x=>x&&typeof x==='object'&&(x.type==='aggr_func'||Object.values(x).some(v=>Array.isArray(v)?v.some(containsAgg):containsAgg(v)));
  const from=ast.from||[],allCols=new Set();
  for(const f of from)if(f.table)for(const r of this.info(f.table))allCols.add(r[1].toLowerCase());
  const aliases=new Set((ast.columns||[]).filter(x=>x.as).map(x=>x.as.toLowerCase()));
  for(const r of refs(ast.where))if(aliases.has(String(r.column).toLowerCase())&&!allCols.has(String(r.column).toLowerCase()))throw Error('1054: WHERE에서는 SELECT의 별명을 사용할 수 없습니다. 원래 열 이름을 쓰세요.');
  if(ast.groupby||containsAgg(ast.columns)){
   const group=(ast.groupby?.columns||[]).map(x=>x.type==='number'?(ast.columns[x.value-1]?.expr||x):x);
   const groupNames=new Set(group.filter(x=>x.type==='column_ref').map(x=>String(x.column).toLowerCase())),dependencies=new Set();
   for(const col of ast.columns||[])if(col.as&&groupNames.has(col.as.toLowerCase())&&col.expr.type==='column_ref')groupNames.add(String(col.expr.column).toLowerCase());
   for(const f of from)if(f.table){const inf=this.info(f.table),pk=inf.filter(r=>r[5]);if(pk.length&&pk.every(r=>groupNames.has(r[1].toLowerCase())))inf.forEach(r=>dependencies.add(r[1].toLowerCase()));}
   for(const col of ast.columns||[]){
    const e=col.expr;if(e.type==='column_ref'&&groupNames.has(String(e.column).toLowerCase()))continue;
    if(e.type==='column_ref'&&e.column==='*')throw Error('1055: 집계 조회에는 묶은 열과 집계 함수를 적어 주세요.');
    for(const r of refs(e))if(!groupNames.has(String(r.column).toLowerCase())&&!dependencies.has(String(r.column).toLowerCase()))throw Error('1055: '+r.column+'은 GROUP BY에 없고 집계되지 않은 열입니다.');
   }
  }
 }
 strict(d){
  for(const table of this.tables(d)){
   const inf=this.info(table,d),out=d.exec('SELECT * FROM '+qi(table))[0];if(!out)continue;
   if(out.values.length>10000)throw Error('이 연습장은 테이블당 10,000행까지 지원합니다.');
   for(const row of out.values)for(let i=0;i<inf.length;i++){
    const c=inf[i],v=row[i],type=c[2].toUpperCase().replace(/\s+/g,'');if(v===null)continue;
    if(/^(?:TINYINT|SMALLINT|MEDIUMINT|INT|INTEGER|BIGINT)\b/.test(type)&&(!Number.isInteger(v)||Math.abs(v)>Number.MAX_SAFE_INTEGER))throw Error(c[1]+': 정수 열에는 정수를 넣어 주세요.');
    const len=type.match(/^(?:VAR)?CHAR\((\d+)\)/);if(len&&[...String(v)].length>+len[1])throw Error(c[1]+': 최대 '+len[1]+'자를 초과했습니다.');
    if(type==='DATE'&&(!/^\d{4}-\d{2}-\d{2}$/.test(String(v))||!Number.isFinite(Date.parse(String(v)+'T00:00:00Z'))||new Date(String(v)+'T00:00:00Z').toISOString().slice(0,10)!==v))throw Error(c[1]+": 날짜는 유효한 'YYYY-MM-DD' 형식으로 쓰세요.");
   }
  }
 }
 executeOne(sql){
  const ts=tokens(sql),u=ts.map(upper),word=i=>ts[i]?.value,clean=text(ts);
  if(!ts.length)return {message:'빈 문장'};
  if(u[0]==='CREATE'&&['DATABASE','SCHEMA'].includes(u[1])){
   let at=2,optional=false;if(u[2]==='IF'&&u[3]==='NOT'&&u[4]==='EXISTS'){at=5;optional=true;}
   const name=word(at)?.toLowerCase();if(!name||!/^[a-z_][a-z0-9_]{0,63}$/.test(name))throw Error('DB 이름은 영문·숫자·밑줄로 작성하세요.');
   const tail=u.slice(at+1).join(' ');if(tail&&!/^(?:DEFAULT )?(?:CHARACTER SET|CHARSET)(?: =)? UTF8MB4$/.test(tail))throw Error('CREATE DATABASE는 이름과 CHARACTER SET utf8mb4 옵션을 지원합니다.');
   if(this.dbs[name]){if(optional)return {message:'이미 존재하는 DB입니다.'};throw Error('1007: 이미 존재하는 데이터베이스입니다.');}
   const d=new this.SQL.Database();this.setup(d);this.dbs[name]=d;return {message:'데이터베이스 '+name+' 생성 · 문자셋 옵션은 학습용으로 확인했습니다.'};
  }
  if(u[0]==='USE'){if(ts.length!==2)throw Error('USE DB이름; 형식으로 작성하세요.');const name=word(1).toLowerCase();if(!this.dbs[name])throw Error('1049: 데이터베이스가 없습니다. CREATE DATABASE로 먼저 만드세요.');this.current=name;return {message:name+' 선택 완료'};}
  if(u[0]==='DROP'&&['DATABASE','SCHEMA'].includes(u[1])){
   const optional=u[2]==='IF'&&u[3]==='EXISTS',name=word(optional?4:2)?.toLowerCase();if(ts.length!==(optional?5:3))throw Error('DROP DATABASE 이름; 형식을 확인하세요.');
   if(!this.dbs[name]){if(optional)return {message:'삭제할 DB 없음'};throw Error('1008: 데이터베이스가 없습니다.');}this.dbs[name].close();delete this.dbs[name];if(this.current===name)this.current=null;return {message:name+' 삭제 완료'};
  }
  if(u[0]==='SHOW'&&u[1]==='DATABASES'&&ts.length===2)return {result:result(['Database'],this.names().map(x=>[x]))};
  if(u[0]==='SET'&&u[1]==='SQL_SAFE_UPDATES'&&u[2]==='='&&['0','1'].includes(word(3))&&ts.length===4){this.safe=word(3)==='1';return {message:'SQL_SAFE_UPDATES = '+word(3)+' · WHERE 없는 UPDATE/DELETE 보호 '+(this.safe?'켜짐':'꺼짐')};}
  const d=this.current?this.db():u[0]==='SELECT'?this.scalar:this.db();
  if(u[0]==='SHOW'&&u[1]==='TABLES'&&ts.length===2)return {result:result(['Tables_in_'+this.current],this.tables().map(n=>[n]))};
  if(['DESC','DESCRIBE'].includes(u[0])&&ts.length===2){
   const name=word(1);if(!this.tables().includes(name))throw Error('1146: 테이블이 없습니다.');
   const ddl=d.exec("SELECT sql FROM sqlite_master WHERE name="+qs(name))[0]?.values[0][0]||'';
   return {result:result(['Field','Type','Null','Key','Default','Extra'],this.info(name).map(r=>[r[1],r[2].toLowerCase(),r[3]||r[5]?'NO':'YES',r[5]?'PRI':'',r[4],r[5]&&/AUTOINCREMENT/i.test(ddl)?'auto_increment':'']))};
  }
  if(u[0]==='ALTER'&&u[1]==='TABLE'&&u[3]==='AUTO_INCREMENT'&&u[4]==='='&&ts.length===6){
   const name=word(2),n=Number(word(5)),inf=this.info(name),pk=inf.find(r=>r[5]);if(!pk||!Number.isSafeInteger(n)||n<1)throw Error('AUTO_INCREMENT 값 또는 기본 키를 확인하세요.');
   const ddl=d.exec("SELECT sql FROM sqlite_master WHERE name="+qs(name))[0]?.values[0][0];if(!/AUTOINCREMENT/i.test(ddl||''))throw Error('AUTO_INCREMENT 열이 있는 테이블에서만 사용할 수 있습니다.');
   const max=d.exec('SELECT COALESCE(MAX('+qi(pk[1])+'),0) FROM '+qi(name))[0].values[0][0];
   d.run('DELETE FROM sqlite_sequence WHERE name='+qs(name));d.run('INSERT INTO sqlite_sequence(name,seq) VALUES('+qs(name)+','+Math.max(max,n-1)+')');return {message:'다음 번호를 '+(Math.max(max,n-1)+1)+'부터 사용합니다.'};
  }
  if(['PRAGMA','ATTACH','DETACH','VACUUM','REINDEX','BEGIN','COMMIT','ROLLBACK','SAVEPOINT','RELEASE','GRANT','REVOKE','DELIMITER','TRUNCATE'].includes(u[0]))throw Error('이 문장은 현재 브라우저 연습 범위 밖입니다. 지원 범위 안내를 확인하세요.');
  const ast=this.parse(ts);if(!['select','create','insert','replace','update','delete','alter','drop'].includes(ast.type))throw Error('이 문장은 현재 연습장에서 지원하지 않습니다.');
  if(ast.type==='create'&&ast.keyword!=='table')throw Error('CREATE TABLE과 CREATE DATABASE를 지원합니다.');
  if(ast.type==='select')this.checkSelect(ast);
  if(this.safe&&['update','delete'].includes(ast.type)){
   if(!ast.where)throw Error('1175: SQL_SAFE_UPDATES가 켜져 있습니다. WHERE 조건을 쓰세요.');
   const target=(ast.table||ast.from||[])[0]?.table,pk=this.info(target).filter(r=>r[5]).map(r=>r[1].toUpperCase());
   const wh=clean.slice(clean.toUpperCase().indexOf(' WHERE '));if(!pk.some(k=>tokens(wh).some(t=>upper(t)===k)))throw Error('1175: 안전 모드에서는 기본 키를 WHERE 조건에 사용하세요. 이 보호는 기초 범위만 모사합니다.');
  }
  if((ast.from||ast.table||[]).some(t=>t.db))throw Error('이 연습장에서는 USE로 DB를 선택한 뒤 테이블 이름만 사용하세요.');
  let translated=clean;
  if(u[0]==='CREATE'&&u.includes('AUTO_INCREMENT')){
   const open=ts.findIndex(t=>t.value==='(');let depth=0,chunks=[],part=[];
   for(let i=open+1;i<ts.length;i++){const t=ts[i];if(t.value===')'&&depth===0){if(part.length)chunks.push(part);break;}if(t.value===','&&depth===0){chunks.push(part);part=[];continue;}part.push(t);if(t.value==='(')depth++;if(t.value===')')depth--;}
   chunks=chunks.map(chunk=>{
    if(!chunk.some(t=>upper(t)==='AUTO_INCREMENT'))return text(chunk);
    if(!['INT','INTEGER'].includes(upper(chunk[1])))throw Error('이 연습장의 AUTO_INCREMENT는 INT PRIMARY KEY에 사용하세요.');
    const def=(ast.create_definitions||[]).find(c=>c.column?.column===chunk[0].value);
    if(!def?.primary_key)throw Error('이 연습장에서는 id INT AUTO_INCREMENT PRIMARY KEY처럼 열 안에 기본 키를 선언하세요.');
    const rest=chunk.slice(2).filter(t=>!['AUTO_INCREMENT','PRIMARY','KEY'].includes(upper(t)));
    return qi(chunk[0].value)+' INTEGER PRIMARY KEY AUTOINCREMENT '+text(rest);
   });
   translated=text(ts.slice(0,open))+' ('+chunks.join(', ')+')';
  }
  d.run('SAVEPOINT db_lab_statement');
  try{
   const out=d.exec(translated);if(['create','insert','replace','update','delete','alter'].includes(ast.type))this.strict(d);
   d.run('RELEASE db_lab_statement');
   return {result:out.at(-1)||null,message:ast.type==='select'?'조회 완료':d.getRowsModified()+'행 영향 · '+ast.type.toUpperCase()+' 완료',warning:['update','delete'].includes(ast.type)&&!ast.where?'WHERE가 없어 모든 행이 대상이었습니다. DELETE는 행만 지우며 테이블은 유지됩니다.':null};
  }catch(e){try{d.run('ROLLBACK TO db_lab_statement');d.run('RELEASE db_lab_statement');}catch{}throw e;}
 }
 run(sql){
  if(sql.length>80000)throw Error('한 번에 실행할 SQL은 80,000자 이내로 작성하세요.');
  const statements=split(sql);if(!statements.length)throw Error('실행할 SQL을 입력하세요.');
  const outputs=[];let error=null;
  for(const st of statements){try{outputs.push({sql:st.sql,...this.executeOne(st.sql)});}catch(e){error=String(e.message||e);outputs.push({sql:st.sql,error});break;}}
  return {outputs,error,state:this.serialize(),inspect:this.inspect()};
 }
}
function grade(SQL,Parser,state,step,user){
 const expected=new Session(SQL,Parser,state),actual=new Session(SQL,Parser,state);
 try{
  const er=expected.run(step.answer);if(er.error)throw Error('모범 SQL 오류: '+er.error);
  const ar=actual.run(user);if(ar.error)return {...ar,tone:'wrong',pass:false,message:ar.error};
  const equalState=JSON.stringify(actual.semantic())===JSON.stringify(expected.semantic());
  const a=ar.outputs.filter(x=>x.result).at(-1)?.result,e=er.outputs.filter(x=>x.result).at(-1)?.result;
  const same=equalState&&(step.kind==='state'||rowsEqual(a,e,!!step.ordered,step.columns!==false));
  if(!same)return {...ar,tone:'wrong',pass:false,message:equalState?'조회 결과의 열·값·행 수·정렬 순서를 확인하세요.':'테이블 구조 또는 저장된 데이터가 목표와 다릅니다. 대상 행과 변경 값을 확인하세요.'};
  const missing=hasRequired(user,step.required||[]);
  if(missing.length)return {...ar,tone:'missing',pass:false,missing,message:'결과는 같지만 필수 구문이 빠졌습니다: '+missing.join(', ')};
  const tone=normal(user)===normal(step.answer)?'correct':'alternative';
  return {...ar,tone,pass:true,message:tone==='correct'?'목표를 정확히 완료했습니다. 다음 단계로 이어집니다.':'다른 SQL로 같은 목표를 완료했습니다. 다음 단계로 이어집니다.'};
 }finally{expected.close();actual.close();}
}
G.DBLab={Session,grade,tokens,split,normal,hasRequired,rowsEqual,to64,from64};
})(typeof self!=='undefined'?self:globalThis);
