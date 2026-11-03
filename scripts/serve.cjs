const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../public'),port=Number(process.env.PORT||4173);
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Bad request');}
 let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
 if(pathname.endsWith('/'))file=path.join(file,'index.html');
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(data);});
});server.listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port} (Ctrl+C to stop)`));
