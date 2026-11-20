// Static server for the demo with HTTP Range support: without Range the browser cannot seek the audio.
//   node tools/server.mjs [port]      (default: PORT from the environment, else 41700)
import {createServer} from 'node:http';
import {stat,createReadStream} from 'node:fs';
import {join,extname,normalize,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json',
 '.mp3':'audio/mpeg','.wav':'audio/wav','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.mp4':'video/mp4','.css':'text/css','.md':'text/plain; charset=utf-8','.svg':'image/svg+xml'};

export function serve(port=+(process.env.PORT||41700)){
 const server=createServer((q,s)=>{
  const u=decodeURIComponent(q.url.split('?')[0]),f=join(ROOT,normalize(u==='/'?'/index.html':u));
  if(f!==ROOT&&!f.startsWith(ROOT+sep)){s.writeHead(403).end();return;}
  stat(f,(e,st)=>{
   if(e||!st.isFile()){s.writeHead(404).end('not found');return;}
   const h={'Content-Type':TYPES[extname(f)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-store'},r=q.headers.range&&/bytes=(\d*)-(\d*)/.exec(q.headers.range);
   if(r){const a=r[1]?+r[1]:0,b=r[2]?+r[2]:st.size-1;s.writeHead(206,{...h,'Content-Range':`bytes ${a}-${b}/${st.size}`,'Content-Length':b-a+1});createReadStream(f,{start:a,end:b}).pipe(s);}
   else{s.writeHead(200,{...h,'Content-Length':st.size});createReadStream(f).pipe(s);}
  });
 });
 return new Promise(ok=>server.listen(port,'127.0.0.1',()=>ok(server)));
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const port=+(process.argv[2]||process.env.PORT||41700);
 serve(port).then(()=>console.log(`demo at http://127.0.0.1:${port}/`));
}
