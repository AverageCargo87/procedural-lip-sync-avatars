// Is the mouth visible in the finished drawing? For every style and host, a frame is rendered with and without the mouth in
// extreme head and arm poses, and the changed pixels are compared with the pixels of the mouth drawn alone. 100% means hair,
// beard, glasses or hands never cover the mouth. Also measures the width of "a" at phone size (360 px wide stage) and checks
// that no teeth show through a closed "m".
//   node tools/proverka/rot-vidno.mjs [id,id,...] [--json]
import {serve} from '../server.mjs';
import {launch} from '../browser.mjs';

const arg=process.argv.slice(2).find(a=>!a.startsWith('--')),port=+(process.env.PORT||41702);
const server=await serve(port),browser=await launch(),page=await browser.newPage({viewport:{width:800,height:500}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(`http://127.0.0.1:${port}/render.html?mode=stage`,{waitUntil:'load'});await page.waitForFunction(()=>window.__ready);
const ids=arg?arg.split(','):await page.evaluate(()=>window.__data.styles),rows=[];
for(const id of ids){
 const r=await page.evaluate(id=>{const S=Stili.SPISOK[id],F=Rech.F,IM=Rech.IM,W=1920,H=1080,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d',{willReadFrequently:true});
  const shape=k=>{const q={smile:.2};IM.forEach((m,j)=>{q[m]=F[k][j];});return q;};
  const heads=[{},{yaw:.42},{yaw:-.42},{pitch:.5},{pitch:-.5},{roll:.06},{roll:-.06},{lean:.6},{lean:-.6}];
  const arms=[{},{hRx:20,hRy:-100},{hLx:-20,hLy:-100},{hRx:-28,hRy:-108,hLx:28,hLy:-108}];
  const frame=(G,q)=>{c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.fillStyle='#fff';c.fillRect(0,0,W,H);Stili.geroj(c,G,q,'telo');S.stol&&S.stol(c,W,H);Stili.geroj(c,G,q,'ruki');return c.getImageData(0,0,W,H).data;};
  const out={};
  for(const w of ['L','A']){const G=S[w];let worst=1,where='',width=0,poses=0;
   for(const k of ['a','o','u','e','i','fv','td'])for(const po of heads)for(const ar of arms){const q=Object.assign(shape(k),po,ar);poses++;
    Stili.zapisRta=[];const A=frame(G,q),rec=Stili.zapisRta;Stili.zapisRta=null;Stili.bezRta=true;const B=frame(G,q);Stili.bezRta=false;
    if(!rec.length)return {error:'the mouth is not drawn through Kit.rot'};
    let diff=0,x0=1e9,x1=-1;for(let i=0;i<A.length;i+=4)if(Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2])>24){diff++;const x=(i/4)%W;if(x<x0)x0=x;if(x>x1)x1=x;}
    // the mouth alone on an empty canvas with the same transforms
    c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.fillStyle='#fff';c.fillRect(0,0,W,H);for(const z of rec){c.setTransform(z.m);Kit.rot(c,z.p,z.o);}c.setTransform(1,0,0,1,0,0);
    const M=c.getImageData(0,0,W,H).data;let own=0;for(let i=0;i<M.length;i+=4)if(M[i]+M[i+1]+M[i+2]<735)own++;
    const v=Math.min(1,diff/Math.max(1,own));if(v<worst){worst=v;where=`${k} ${JSON.stringify(po)} ${JSON.stringify(ar)}`;}
    if(k==='a'&&!po.yaw&&!ar.hRy)width=Math.max(width,x1-x0+1);}
   // full closure on m, b, p: nothing light may show inside the mouth
   const q=shape('mb');Stili.zapisRta=[];const A=frame(G,q);Stili.zapisRta=null;Stili.bezRta=true;const B=frame(G,q);Stili.bezRta=false;let teeth=0;
   for(let i=0;i<A.length;i+=4)if(A[i]>245&&A[i+1]>245&&A[i+2]>245&&(A[i]!==B[i]||A[i+1]!==B[i+1]))teeth++;
   out[w]={visible:worst,where,phoneA:width*360/W,teeth,poses};}
  return out;},id);
 if(r.error){rows.push({style:id,error:r.error});continue;}
 for(const w of ['L','A'])rows.push({style:id,host:w,'mouth visible, worst pose %':+(r[w].visible*100).toFixed(1),'"a" width at 360 px, px':+r[w].phoneA.toFixed(1),'teeth px on "m"':r[w].teeth,poses:r[w].poses,'worst pose':r[w].where});
}
if(process.argv.includes('--json'))console.log(JSON.stringify(rows,null,1));else{console.table(rows);console.log('page errors',errors.length,errors.slice(0,3));}
await browser.close();server.close();
