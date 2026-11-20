// Milliseconds to draw one full scene (both hosts, background, table) at a given canvas width, on the real pose track, tempo B.
//   node tools/proverka/skorost.mjs [id,id,...] [width=960] [--json]
// One style per page load: a shared run once showed a random 54 ms outlier on the last style instead of 9.
import {serve} from '../server.mjs';
import {launch} from '../browser.mjs';

const args=process.argv.slice(2).filter(a=>!a.startsWith('--')),width=+(args[1]||960),port=+(process.env.PORT||41703);
const server=await serve(port),browser=await launch(),rows=[];
const page0=await browser.newPage();await page0.goto(`http://127.0.0.1:${port}/render.html?mode=stage`,{waitUntil:'load'});await page0.waitForFunction(()=>window.__ready);
const ids=args[0]?args[0].split(','):await page0.evaluate(()=>window.__data.styles);await page0.close();
for(const id of ids){
 const p=await browser.newPage({viewport:{width:800,height:500}});await p.goto(`http://127.0.0.1:${port}/render.html?mode=stage&style=${id}&tempo=chut`,{waitUntil:'load'});await p.waitForFunction(()=>window.__ready);
 const r=await p.evaluate(([id,w])=>{const cv=document.createElement('canvas');cv.width=w;cv.height=Math.round(w*9/16);const c=cv.getContext('2d'),k=w/1920,S=Stili.SPISOK[id];
  return fetch('data/demo.json').then(x=>x.json()).then(D=>{const B=Stage.bake(D,'chut'),t=[];
   for(let i=0;i<8;i++){c.save();c.setTransform(k,0,0,k,0,0);Stage.scene(c,S,B.L.poza(5),B.A.poza(5));c.restore();}
   for(let i=0;i<240;i++){const s=6+i*.05,t0=performance.now();c.save();c.setTransform(k,0,0,k,0,0);Stage.scene(c,S,B.L.poza(s),B.A.poza(s));c.restore();c.getImageData(0,0,1,1);t.push(performance.now()-t0);}
   t.sort((a,b)=>a-b);return {med:t[120],p95:t[228]};});},[id,width]);
 rows.push({style:id,'median, ms':+r.med.toFixed(2),'p95, ms':+r.p95.toFixed(2)});await p.close();
}
if(process.argv.includes('--json'))console.log(JSON.stringify(rows,null,1));else console.table(rows);
await browser.close();server.close();
