// Deterministic video export: a headless browser renders frame k at time from+k/fps, ffmpeg encodes the frames and muxes the
// matching slice of the voice. The frame is a function of time only (the pose track is baked ahead), so there are no dropped
// frames, no drift, and the sound lines up exactly however slow the machine is.
//
//   node tools/video.mjs --out release-assets/grid.mp4 [--mode grid|stage|tempos|closeup|sheet] [--style kosoy3] [--tempo chut]
//                        [--from 0] [--to 42] [--fps 30] [--width 1280] [--strip] [--fit] [--gif] [--no-audio] [--page v1.html]
//   node tools/video.mjs --still 9.5 --out docs/frame.png [--mode ...] [--width 1920]     one PNG frame
//   node tools/video.mjs --verify 12 [--mode grid]     render 12 sample frames twice in fresh pages and compare pixel hashes
//
// Browser: see tools/browser.mjs (an installed Chrome through playwright-core).
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {openRenderer} from './browser.mjs';
import {serve} from './server.mjs';
import {path} from './lib.mjs';

const argv=process.argv.slice(2),opt=(k,d)=>{const i=argv.indexOf('--'+k);return i<0?d:(argv[i+1]&&!argv[i+1].startsWith('--')?argv[i+1]:true);};
const mode=opt('mode','grid'),style=opt('style','kosoy3'),tempo=opt('tempo','chut'),fps=+opt('fps',30),width=+opt('width',1280),strip=!!opt('strip',false),fit=!!opt('fit',false),html=opt('page','render.html');
const port=+(process.env.PORT||41701);

async function verify(n){
 const server=await serve(port);let same=0;const times=Array.from({length:n},(_,i)=>+(1+i*(40/n)).toFixed(3)),hashes=[[],[]];
 for(const run of [0,1]){const {page,close}=await openRenderer({mode,style,tempo,strip,fit,page:html,port});
  for(const t of times)hashes[run].push(await page.evaluate(async t=>{window.__frame(t);const cv=document.getElementById('cv'),d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
   const buf=await crypto.subtle.digest('SHA-256',d);return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');},t));
  await close();}
 times.forEach((t,i)=>{const ok=hashes[0][i]===hashes[1][i];if(ok)same++;console.log(`t=${t.toFixed(2)}  ${hashes[0][i].slice(0,16)}  ${ok?'identical':'DIFFERENT'}`);});
 console.log(`${same}/${n} frames pixel-identical across two fresh page loads (mode ${mode}, style ${style}, tempo ${tempo})`);
 server.close();if(same!==n)process.exitCode=1;
}

async function still(t){
 const out=resolve(opt('out',path('release-assets',`${mode}-${style}-${t}.png`)));mkdirSync(dirname(out),{recursive:true});
 const server=await serve(port),{page,close}=await openRenderer({mode,style,tempo,strip,fit,page:html,port});
 const d=await page.evaluate(([t,w])=>{window.__frame(t);const cv=document.getElementById('cv'),f=document.createElement('canvas');f.width=w;f.height=Math.round(w*cv.height/cv.width);const c=f.getContext('2d');c.imageSmoothingQuality='high';c.drawImage(cv,0,0,f.width,f.height);return f.toDataURL('image/png').split(',')[1];},[t,width]);
 writeFileSync(out,Buffer.from(d,'base64'));await close();server.close();console.log('done:',out);
}

async function exportVideo(){
 const out=resolve(opt('out',path('release-assets',`${mode}-${style}-${tempo}.mp4`))),gif=!!opt('gif',false)||out.endsWith('.gif'),audio=!opt('no-audio',false)&&!gif;
 mkdirSync(dirname(out),{recursive:true});
 const server=await serve(port),{page,errors,close}=await openRenderer({mode,style,tempo,strip,fit,page:html,port});
 const total=await page.evaluate(()=>window.__data.total),from=+opt('from',0),to=Math.min(+opt('to',total),total),n=Math.round((to-from)*fps);
 const outH=await page.evaluate(w=>{const cv=document.getElementById('cv');return Math.round(w*cv.height/cv.width/2)*2;},width);
 const enc=gif
  ?['-f','image2pipe','-framerate',String(fps),'-c:v','png','-i','-','-vf',`split[a][b];[a]palettegen=max_colors=${opt('colors',192)}:stats_mode=diff[p];[b][p]paletteuse=dither=${opt('dither','none')}:diff_mode=rectangle`,'-loop','0']
  :['-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-',...(audio?['-ss',String(from),'-t',String(to-from),'-i',path('data','demo.mp3'),'-map','0:v','-map','1:a','-c:a','aac','-b:a','128k']:[]),
    '-c:v','libx264','-preset','medium','-crf',String(opt('crf',20)),'-pix_fmt','yuv420p','-movflags','+faststart'];
 const ff=spawn('ffmpeg',['-y','-v','error',...enc,'-map_metadata','-1','-fflags','+bitexact',out],{stdio:['pipe','inherit','inherit']});
 await page.evaluate(([w,h,png])=>{const f=document.createElement('canvas');f.width=w;f.height=h;const c=f.getContext('2d');c.imageSmoothingQuality='high';
  window.__grab=t=>{window.__frame(t);c.drawImage(document.getElementById('cv'),0,0,w,h);return f.toDataURL(png?'image/png':'image/jpeg',.93).split(',')[1];};},[width,outH,gif]);
 const t0=Date.now();
 for(let i=0;i<n;i++){const d=await page.evaluate(t=>window.__grab(t),from+i/fps);if(!ff.stdin.write(Buffer.from(d,'base64')))await new Promise(r=>ff.stdin.once('drain',r));if(i%300===0)console.log(`frame ${i}/${n}`);}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));await close();server.close();
 console.log(`done: ${out}  ${n} frames ${width}x${outH} @${fps} fps in ${((Date.now()-t0)/1000).toFixed(0)} s, page errors: ${errors.length}`);
}

if(opt('verify',false))await verify(+opt('verify',12)||12);
else if(opt('still',false)!==false)await still(+opt('still',2.2));
else await exportVideo();
