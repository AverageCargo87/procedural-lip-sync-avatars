// Mouth honesty metric. The reference is the clean voice itself, not the letters and not the formula the mouth was computed from:
// a metric that reads the same inputs as the animation can only agree with it (an earlier metric did exactly that and scored 100%
// on deliberately broken versions). Port of the original Python check (numpy/scipy) to dependency-free JavaScript.
//
//   import {measure} from './honesty.mjs';
//   const r=measure({data, L:Rech.bake(data,'L',...), A:Rech.bake(data,'A',...), voice:Int16Array 16 kHz mono});
//   r.checks -> [{id, name, value, n, limit, pass}], r.passed, r.total
const HZ=120,SR=16000;

// ---- small numeric helpers (numpy semantics where it matters) ----
const percentile=(arr,q)=>{const a=Float64Array.from(arr).sort();if(!a.length)return NaN;const p=(a.length-1)*q/100,i=Math.floor(p),f=p-i;return i+1<a.length?a[i]+(a[i+1]-a[i])*f:a[i];};
const median=a=>percentile(a,50);
const maxOf=(a,i0=0,i1=a.length)=>{let m=-Infinity;for(let i=Math.max(0,i0);i<Math.min(a.length,i1);i++)if(a[i]>m)m=a[i];return m;};
const minOf=(a,i0=0,i1=a.length)=>{let m=Infinity;for(let i=Math.max(0,i0);i<Math.min(a.length,i1);i++)if(a[i]<m)m=a[i];return m;};
const countAbove=(a,i0,i1,th)=>{let n=0;for(let i=Math.max(0,i0);i<Math.min(a.length,i1);i++)if(a[i]>th)n++;return n;};
/** Contiguous runs of true: [[i0,i1),...] with length >= minlen. */
function runs(mask,minlen=1){const out=[];let a=-1;for(let i=0;i<=mask.length;i++){const m=i<mask.length&&mask[i];if(m&&a<0)a=i;else if(!m&&a>=0){if(i-a>=minlen)out.push([a,i]);a=-1;}}return out;}

/** Clean-voice level in dB relative to its 95th percentile: 10 ms window, 5 ms hop. */
function glev(x,hop=80,win=160){
 const n=Math.floor((x.length-win)/hop),c=new Float64Array(x.length+1);for(let i=0;i<x.length;i++){const v=x[i]/32768;c[i+1]=c[i]+v*v;}
 const db=new Float64Array(n),tt=new Float64Array(n);for(let k=0;k<n;k++){const e=(c[k*hop+win]-c[k*hop])/win;db[k]=10*Math.log10(e+1e-12);tt[k]=(k*hop+win/2)/SR;}
 const ref=percentile(db.filter(v=>v>-80),95);for(let k=0;k<n;k++)db[k]-=ref;return {db,tt};
}
/** Voice activity: runs above th dB (no gap closing, as in the original call). */
function vad(x,th=-42){const {db,tt}=glev(x),V=runs(Array.from(db,v=>v>th)).map(([i,j])=>[tt[i],tt[j-1]]);return {V,db,tt};}

/** Mid-band (800-4000 Hz) energy in dB over a 10 ms Hann STFT with a 2.5 ms hop, smoothed over 3 frames.
 *  Lips closing on "p" show up as a sharp dip here. Matches scipy.signal.stft(nperseg=160, noverlap=120, boundary=None, padded=False). */
function midBand(x){
 const N=160,H=40,n=Math.floor((x.length-N)/H)+1,w=new Float64Array(N);let ws=0;for(let i=0;i<N;i++){w[i]=.5-.5*Math.cos(2*Math.PI*i/N);ws+=w[i];}
 const K0=8,K1=40,cs=[],sn=[];for(let k=K0;k<K1;k++){const C=new Float64Array(N),S=new Float64Array(N);for(let i=0;i<N;i++){C[i]=Math.cos(2*Math.PI*k*i/N);S[i]=Math.sin(2*Math.PI*k*i/N);}cs.push(C);sn.push(S);}
 const mf=new Float64Array(n),t=new Float64Array(n),seg=new Float64Array(N);
 for(let f=0;f<n;f++){for(let i=0;i<N;i++)seg[i]=x[f*H+i]/32768*w[i];let p=0;
  for(let k=0;k<K1-K0;k++){const C=cs[k],S=sn[k];let re=0,im=0;for(let i=0;i<N;i++){re+=seg[i]*C[i];im+=seg[i]*S[i];}p+=(re*re+im*im)/(ws*ws);}
  mf[f]=10*Math.log10(p+1e-10);t[f]=(N/2+f*H)/SR;}
 const sm=new Float64Array(n);for(let f=0;f<n;f++)sm[f]=((f>0?mf[f-1]:0)+mf[f]+(f+1<n?mf[f+1]:0))/3;
 return {t,mf:sm};
}
/** Nearest line to time t (the line a pause belongs to). */
function nearestLine(D,t){let best=null,bd=9;for(const r of D.repliki){const d=r.t0-.7<=t&&t<=r.t1+.2?0:Math.min(Math.abs(t-r.t0),Math.abs(t-r.t1));if(d<bd){bd=d;best=r;}}return best;}

// target shapes of vowels: open, wide, round (the same numbers as table F in rech.js)
const TG={y:[.27,.42,0],a:[1,.22,.1],o:[.64,-.3,.85],u:[.3,-.62,1],e:[.56,.55,0],i:[.27,.95,0],ar:[.62,.12,.06],ir:[.34,.6,0],o2:[.6,-.05,.4]};
const ti=t=>Math.trunc(t*HZ);

export function measure({data:D,L,A,voice}){
 const {V,db,tt}=vad(voice),E=Float64Array.from(D.energy,v=>v/200),O={L:L.treki.open,A:A.treki.open},Z={L,A};
 let paus=0,badP=0,silTot=0,silOpen=0,molch=0,molch2=0,vow=0,reach=0,rnd=0,rndOk=0,spr=0,sprOk=0,pn=0,pnOk=0;const cl=[],d30=[],shake=[];
 // 1 real pauses in the voice (>= .25 s): the mouth of the line's owner must not stay open > .12 for .1 s or more
 for(let i=0;i+1<V.length;i++){const a=V[i][1],b=V[i+1][0];if(b-a<.25)continue;const r=nearestLine(D,(a+b)/2),o=O[r.who];paus++;if(countAbove(o,ti(a+.03),ti(b-.03),.12)/HZ>=.1)badP++;}
 // 2 silence in the voice (>= .16 s below -55 dB): neither mouth open > .12 for .1 s or more
 const quiet=Array.from(db,v=>v<-55);
 for(const [i,j] of runs(quiet,32)){const a=tt[i],b=tt[j-1],i0=ti(a),i1=ti(b);let n=0;for(let k=i0;k<i1;k++)if(Math.max(O.L[k]??0,O.A[k]??0)>.12)n++;silTot++;if(n/HZ>=.1)silOpen++;}
 const P=midBand(voice);
 for(const w of ['L','A']){
  const o=O[w],n=o.length,sp=new Uint8Array(n);
  for(const r of D.repliki)if(r.who===w)sp.fill(1,Math.max(0,ti(r.t0-.7)),Math.min(n,ti(r.t1+.3)));
  // 3 the silent partner keeps the mouth shut (outside own lines; and also outside any voice activity)
  const g=new Uint8Array(n);for(const [a,b] of V)g.fill(1,Math.max(0,ti(a-.12)),Math.min(n,ti(b+.12)));
  for(let i=0;i<n;i++){if(!sp[i]){if(o[i]>molch)molch=o[i];if(!g[i]&&o[i]>molch2)molch2=o[i];}}
  // 4 vowels reach their shape (40% of the loudness-scaled target, +-40 ms tolerance for letter timing)
  const Wd=Z[w].treki.wide,Ro=Z[w].treki.round;
  for(const z of Z[w].zv){if(!TG[z.k])continue;const i0=Math.max(0,ti(z.a-.05)),i1=Math.max(i0+1,ti(z.b+.04)),c=(z.a+z.b)/2;
   const e=Math.max(...[-.02,0,.02].map(d=>E[Math.min(E.length-1,Math.trunc((c+d)*100))]));
   vow++;if(maxOf(o,i0,i1)>=.4*TG[z.k][0]*Math.max(.55,Math.min(1.18,.58+.62*e)))reach++;
   if(z.k==='o'||z.k==='u'){rnd++;if(maxOf(Ro,i0,i1)>=.5)rndOk++;}
   if(z.k==='i'||z.k==='e'||z.k==='y'){spr++;if(maxOf(Wd,i0,i1)>=.3)sprOk++;}}
  // 5 "p": the acoustic closure is reliable, so the mouth must be closed at the dip of the mid band
  for(const b of D.bukvy){if(b[0]!==w||b[3].toLowerCase()!=='п')continue;const mid=(b[1]+b[2])/2,v=[],tm=[];
   for(let f=0;f<P.t.length;f++)if(P.t[f]>=mid-.09&&P.t[f]<=mid+.09){v.push(P.mf[f]);tm.push(P.t[f]);}
   if(v.length<5)continue;const vmin=Math.min(...v),tdip=tm[v.indexOf(vmin)];if(percentile(v,85)-vmin<12)continue;
   pn++;if(minOf(o,Math.max(0,ti(tdip-.02)),ti(tdip+.02)+1)<.08)pnOk++;}
  // closure length inside speech: runs with the mouth shut (< .05) between open stretches, while the voice is loud
  for(const [k0,k1] of runs(Array.from(o,(v,i)=>v<.05&&sp[i]===1)))if(k1-k0>2&&k0>0&&k1<n-1&&maxOf(o,k0-24,k0)>.2&&maxOf(o,k1,k1+24)>.2){
   let q=0,loud=0;for(let i=0;i<tt.length;i++)if(tt[i]>=k0/HZ&&tt[i]<k1/HZ){q++;if(db[i]>-30)loud++;}
   if(q&&loud/q>=.7)cl.push((k1-k0)/HZ);}
  // 6 speed at 30 fps and jitter (direction reversals per second while speaking)
  let prev=null;for(let k=0;k/30<n/HZ-.04;k++){const x=k/30*HZ,i=Math.floor(x),f=x-i,y=i+1<n?o[i]+(o[i+1]-o[i])*f:o[n-1];if(prev!==null)d30.push(Math.abs(y-prev));prev=y;}
  for(const r of D.repliki){if(r.who!==w)continue;const s=o.subarray(ti(r.t0),ti(r.t1));if(s.length<30)continue;let flips=0;
   for(let i=2;i<s.length;i++){const d1=s[i]-s[i-1],d0=s[i-1]-s[i-2];if(d1*d0<0&&Math.abs(d1)>.002)flips++;}shake.push(flips/(s.length/HZ));}
 }
 if(!cl.length)cl.push(0);
 const R=(x,k=3)=>+x.toFixed(k),p90=percentile(cl,90),p99=percentile(d30,99),dmax=Math.max(...d30),sh=median(shake);
 const checks=[
  {id:'pauses',name:'pauses >= .25 s with the mouth open > .12 for > .1 s',value:badP,n:paus,limit:'= 0',pass:badP===0},
  {id:'silence',name:'silences >= .16 s where a mouth is open > .12 for > .1 s',value:silOpen,n:silTot,limit:'<= 2',pass:silOpen<=2},
  {id:'listener',name:'listener mouth outside own lines: max open',value:R(molch),limit:'< .02',pass:molch<.02},
  {id:'listener-voice',name:'listener mouth outside own lines and outside the clean voice: max open',value:R(molch2),limit:'< .02',pass:molch2<.02},
  {id:'vowels',name:'vowels reach 40% of the target opening',value:R(reach/vow),n:vow,limit:'>= .97',pass:reach/vow>=.97},
  {id:'round',name:'o, u: lips rounded >= .5',value:R(rndOk/Math.max(rnd,1)),n:rnd,limit:'>= .85',pass:rndOk/Math.max(rnd,1)>=.85},
  {id:'spread',name:'i, e, y: lips spread >= .3',value:R(sprOk/Math.max(spr,1)),n:spr,limit:'>= .85',pass:sprOk/Math.max(spr,1)>=.85},
  {id:'p-closed',name:'p: mouth closed at the acoustic closure',value:R(pnOk/Math.max(pn,1)),n:pn,limit:'>= .9',pass:pnOk/Math.max(pn,1)>=.9},
  {id:'closure-p90',name:'closure length inside speech, p90 (s)',value:R(p90),n:cl.length,limit:'<= .16',pass:p90<=.16},
  {id:'speed-p99',name:'speed at 30 fps, p99 |d open|',value:R(p99),limit:'<= .36',pass:p99<=.36},
  {id:'speed-max',name:'speed at 30 fps, max |d open|',value:R(dmax),limit:'<= .46',pass:dmax<=.46},
  {id:'jitter',name:'jitter: open/close reversals per second (median)',value:R(sh,1),limit:'<= 12',pass:sh<=12}];
 return {checks,passed:checks.filter(c=>c.pass).length,total:checks.length,failed:checks.filter(c=>!c.pass).map(c=>c.id)};
}

/** Pretty table for the CLI. */
export function table(r){return r.checks.map(c=>`${c.pass?'PASS':'FAIL'}  ${c.name.padEnd(86)} ${String(c.value).padStart(6)}  ${c.limit}${c.n!=null?`  (n=${c.n})`:''}`).join('\n');}
