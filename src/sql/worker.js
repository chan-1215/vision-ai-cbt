let sqlPromise=null;
function getSQL(){
 if(!sqlPromise){const bytes=Uint8Array.from(atob(WASM_B64),c=>c.charCodeAt(0));sqlPromise=initSqlJs({wasmBinary:bytes});}
 return sqlPromise;
}
self.onmessage=async e=>{
 const m=e.data;
 try{
  const SQL=await getSQL();let out;
  if(m.op==='ping')out={ready:true};
  else if(m.op==='grade')out=DBLab.grade(SQL,Parser,m.state,m.step,m.sql);
  else {
   const s=new DBLab.Session(SQL,Parser,m.state);
   try{out=m.op==='inspect'?s.inspect():s.run(m.sql);}finally{s.close();}
  }
  self.postMessage({id:m.id,result:out});
 }catch(err){self.postMessage({id:m.id,error:String(err.message||err)});}
};
