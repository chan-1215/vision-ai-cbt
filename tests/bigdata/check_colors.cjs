const fs=require('fs'),{JSDOM}=require('jsdom'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../../public/bigdata/index.html'),'utf8');
async function main(){
 const dom=new JSDOM(html,{url:'https://study.local/',runScripts:'dangerously',beforeParse(w){
  w.URL.createObjectURL=()=> 'blob:testing';w.URL.revokeObjectURL=()=>{};
  w.AbortController=AbortController;
  w.Worker=class{
   postMessage(m){setTimeout(()=>this.onmessage({data:{id:m.id,result:{status:w.testTone==='wrong'?'wrong':'correct',tone:w.testTone,missing:w.testTone==='missing'?['head']:[],msgs:['테스트 결과'],user:{stdout:'',last:null,figs:[]},model:null}}}),0);}
   terminate(){}
  };
 }});
 const w=dom.window,d=w.document;
 assert(d.querySelector('.function-rule'));
 for(const tone of ['correct','wrong','alternative','missing']){
  w.testTone=tone;d.querySelector('#editor').value='example code';d.querySelector('#grade').click();
  await new Promise(r=>setTimeout(r,20));
  assert(d.querySelector('#feedback').classList.contains('tone-'+tone));
  assert.equal(d.querySelector('#grade').disabled,false);
 }
 d.querySelector('[data-type="mc"]').click();
 d.querySelector('[data-pick="0"]').click();d.querySelector('#submit').click();
 assert(/tone-(correct|wrong)/.test(d.querySelector('#feedback').className));
 d.querySelector('#themeToggle').click();
 assert.equal(d.documentElement.dataset.theme,'light');
 dom.window.close();console.log('PASS: four feedback styles, choice feedback, theme toggle');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
