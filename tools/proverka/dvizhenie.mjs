// How much motion each animation tempo produces per minute: nods, brow raises, blinks, gaze shifts, gestures, strength.
//   node tools/proverka/dvizhenie.mjs [tempos, comma separated] [--json]
// Counts are per host per minute of audio (both hosts averaged).
import {loadRech,readJson} from '../lib.mjs';

/** Peaks above a threshold, separated by a fall to half the threshold. */
const peaks=(a,th)=>{let n=0,up=false;for(const v of a){if(!up&&v>th){n++;up=true;}else if(up&&v<th*.5)up=false;}return n;};
const rms=a=>{let s=0;for(const v of a)s+=v*v;return Math.sqrt(s/a.length);};
const pct=(a,q)=>{const b=Array.from(a,Math.abs).sort((x,y)=>x-y);return b[Math.floor(b.length*q)];};

export function motion(data,tempos){
 const Rech=loadRech(),rows=[];
 for(const v of tempos){const S={min:data.total/60,nod:0,brow:0,blink:0,gaze:0,gest:0,up:0,speech:0,pit:[],br:[],yw:[],op:[],rev:0,sec:0};
  for(const [w,st] of [['L',1],['A',-1]]){const B=Rech.bake(data,w,{storona:st,stil:v}),T=B.treki,HZ=B.HZ,n=T.open.length;
   S.nod+=peaks(T.pitch,.05);S.brow+=peaks(T.brow,.05);S.blink+=peaks(T.blink,.5);
   let g=0;for(let i=1;i<n;i++){const d=Math.abs(T.gx[i]-T.gx[i-1])*HZ;if(d>.9&&g===0){S.gaze++;g=HZ*.15|0;}if(g>0)g--;}
   for(const k of ['hRy','hLy'])S.gest+=peaks(T[k].map(x=>-x),30);
   for(const r of data.repliki){if(r.who!==w)continue;const a=r.t0*HZ|0,b=r.t1*HZ|0;S.speech+=b-a;let up=0;for(let i=a;i<b;i++)if(T.hRy[i]<-30||T.hLy[i]<-30)up++;S.up+=up;
    const seg=T.open.slice(a,b);S.op.push(...seg);let rv=0;for(let i=2;i<seg.length;i++){const d1=seg[i]-seg[i-1],d0=seg[i-1]-seg[i-2];if(d1*d0<0&&Math.abs(d1)>.002)rv++;}S.rev+=rv;S.sec+=(b-a)/HZ;}
   S.pit.push(...T.pitch);S.br.push(...T.brow);S.yw.push(...T.yaw);}
  const m=S.min*2;   // both hosts
  rows.push({tempo:v,'nods/min':+(S.nod/m).toFixed(1),'brow raises/min':+(S.brow/m).toFixed(1),'blinks/min':+(S.blink/m).toFixed(1),'gaze shifts/min':+(S.gaze/m).toFixed(1),
   'gestures/min':+(S.gest/m).toFixed(1),'hand raised, % of speech':Math.round(S.up/S.speech*100),'nod p99':+pct(S.pit,.99).toFixed(2),'mouth open p95':+pct(S.op,.95).toFixed(2),
   'mouth reversals/s':+(S.rev/S.sec).toFixed(1)});}
 return rows;
}

if(process.argv[1]?.endsWith('dvizhenie.mjs')){
 const data=readJson('data/demo.json'),arg=process.argv.slice(2).find(a=>!a.startsWith('--')),tempos=(arg||'bylo,chut,spokoyno,tiho').split(','),rows=motion(data,tempos);
 if(process.argv.includes('--json'))console.log(JSON.stringify(rows,null,1));else console.table(rows);
}
