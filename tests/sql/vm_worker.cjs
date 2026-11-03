const vm=require('vm');
function makeWorker(source,onmessage,onerror){
 let stopped=false,networkCalls=0;
 const c={console,TextDecoder,TextEncoder,setTimeout,clearTimeout,atob,btoa,performance,URL,location:{href:'blob:https://offline.local/sql'},importScripts(){throw Error('External import forbidden');},fetch(){networkCalls++;throw Error('Network forbidden');}};
 c.self=c;c.postMessage=data=>{if(!stopped)setTimeout(()=>onmessage({data}),0);};
 vm.createContext(c);vm.runInContext(source,c,{timeout:10000});
 return {postMessage(data){if(!stopped)Promise.resolve(c.onmessage({data})).catch(e=>onerror(e));},terminate(){stopped=true;},networkCalls:()=>networkCalls};
}
module.exports={makeWorker};
