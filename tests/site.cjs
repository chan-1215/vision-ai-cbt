const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm'),{JSDOM}=require('jsdom');
const root=path.join(__dirname,'..','public');
for(const route of ['','sql','bigdata']){
 const html=fs.readFileSync(path.join(root,route,'index.html'),'utf8');const dom=new JSDOM(html,{url:'https://vision-ai-cbt.pages.dev/'+(route?route+'/':'')});
 assert(dom.window.document.title);assert.equal(dom.window.document.documentElement.lang,'ko');
 for(const a of dom.window.document.querySelectorAll('a[href^="/"]'))assert(fs.existsSync(path.join(root,a.getAttribute('href'),'index.html')),a.href);
 assert(!/__STYLE__|__APP_JS__|__WORKER_BUNDLE_JS__/.test(html));
 for(const s of dom.window.document.querySelectorAll('script'))if(!s.type||s.type==='text/javascript')new vm.Script(s.textContent);
 dom.window.close();
}
console.log('PASS: three routes, internal links, Korean metadata, built placeholders and JavaScript syntax');
