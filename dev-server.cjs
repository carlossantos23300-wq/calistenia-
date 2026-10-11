const http=require('http'),fs=require('fs'),path=require('path');
const previewPort=Number(process.argv[2]||4173);
if(!Number.isInteger(previewPort)||previewPort<1024||previewPort>65535)throw Error('Invalid preview port');
const root=__dirname,types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png'};
http.createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Not found');return}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)})}).listen(previewPort,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+previewPort));
