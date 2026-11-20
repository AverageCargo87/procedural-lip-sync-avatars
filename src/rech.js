'use strict';
/* Pose track from speech: timed letters plus loudness -> every character parameter at 120 points per second.
 *   const D=Rech.bake(data,'L',{partner:'A',storona:1}); const poza=D.poza(t);
 * Baked once, ahead of time, so a frame is a pure function of time: pause, seek, playback speed and video export all give the same result.
 * Input works for any lesson: { total, bukvy:[[who,t0,t1,'а'],...], repliki:[{id,who,t0,t1,vopros,vosk},...], energy:[0-255 at 100 Hz] }. */
(function(root){
const HZ=120,clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),lerp=(a,b,t)=>a+(b-a)*t;
// mouth shapes for Russian sounds; each row is open, wide, round, teeth, tongue, press, bite
const F={sil:[0,0,0,.4,0,0,0],a:[1,.22,.1,.42,0,0,0],o:[.64,-.3,.85,.2,0,0,0],u:[.3,-.62,1,.08,0,0,0],e:[.56,.55,0,.55,0,0,0],i:[.27,.95,0,.75,.1,0,0],
 mb:[0,-.04,0,.3,0,1,0],fv:[.2,-.08,0,1,0,0,1],td:[.2,.22,0,.62,.95,0,0],sz:[.13,.55,0,1,.2,0,0],sh:[.28,-.34,.72,.85,.3,0,0],l:[.34,.12,0,.5,1,0,0],r:[.26,.06,.1,.5,.75,0,0],kg:[.3,.05,0,.38,.1,0,0],j:[.2,.8,0,.7,.3,0,0],y:[.27,.42,0,.6,.1,0,0],ch:[.24,.02,.38,.85,.3,0,0],ar:[.62,.12,.06,.4,0,0,0],ir:[.34,.6,0,.62,.05,0,0],o2:[.6,-.05,.4,.3,0,0,0]};
const IM=['open','wide','round','teeth','tongue','press','bite'];
const KL={а:'a',я:'a',о:'o',ё:'o',у:'u',ю:'u',э:'e',е:'e',и:'i',ы:'y',м:'mb',б:'mb',п:'mb',ф:'fv',в:'fv',т:'td',д:'td',н:'td',с:'sz',з:'sz',ц:'sz',ш:'sh',щ:'ch',ж:'sh',ч:'ch',л:'l',р:'r',к:'kg',г:'kg',х:'kg',й:'j'};
const GLASN=new Set(['a','o','u','e','i','y','ar','ir','o2']);
const IMENA={б:'бэ',в:'вэ',г:'гэ',д:'дэ',ж:'жэ',з:'зэ',к:'ка',л:'эль',м:'эм',н:'эн',п:'пэ',р:'эр',с:'эс',т:'тэ',ф:'эф',х:'ха',ц:'цэ',ч:'че',ш:'ша',щ:'ща'};
const GLS='аоуэиыеёюя',BEZ_G=/^(много|немного|строго|дорого|убого|полого)$/,KLITIKI=new Set(['о','об','обо','от','до','по','на','но','во','со','за','под','над','про','из','не','ни','бы','же','ли','а','и','у','к','с','в']);
/** Letters to sounds, word by word: a sound depends on stress and neighbours. udar: {word: index of the stressed letter}. */
function vyrovnat(sl,gol){const d0=sl[0][2]-sl[0][1],ost=sl.slice(1);if(ost.length<2)return sl;const sr=ost.reduce((s,b)=>s+b[2]-b[1],0)/ost.length;if(d0<.14||d0<2.2*sr)return sl;
 let t=sl[0][1];const end=sl[sl.length-1][2];if(gol)while(t<end-.1&&!gol(t))t+=.01;const ves=b=>GLS.includes(b[3].toLowerCase())?1.35:/[ьъ]/i.test(b[3])?.2:1,k=(end-t)/sl.reduce((s,b)=>s+ves(b),0);
 return sl.map(b=>{const a=t;t+=ves(b)*k;return [b[0],a,t,b[3]];});}
function zvuki(bukvy,who,udar,gol){
 const out=[];let sl=[];
 const sbros=()=>{if(!sl.length)return;sl=vyrovnat(sl,gol);const w=sl.map(b=>b[3].toLowerCase()).join(''),vs=[...w].flatMap((c,i)=>GLS.includes(c)?[i]:[]);
  if(sl.length>1&&!vs.length&&sl.every(b=>b[3]===b[3].toUpperCase())){for(const b of sl){const im=IMENA[b[3].toLowerCase()]||'',d=(b[2]-b[1])/(im.length||1);[...im].forEach((c,i)=>{if(KL[c])out.push({k:KL[c],a:b[1]+i*d,b:b[1]+(i+1)*d});});}sl=[];return;}
  const ud=udar&&udar[w]!=null?udar[w]:vs.length===1&&!KLITIKI.has(w)?vs[0]:-1,znaem=ud>=0||vs.length===1;
  sl.forEach((b,i)=>{const c=w[i];let k=KL[c];if(!k)return;
   if(c==='г'&&i===w.length-2&&/(ого|его)$/.test(w)&&!BEZ_G.test(w))k='fv';
   if(GLS.includes(c)&&i!==ud){if(!znaem){if(c==='о')k='o2';}else if(c==='о'||c==='а')k='ar';else if(c==='е'||c==='я')k=(c==='я'&&i===w.length-1)?'ar':'ir';}
   if('еёюя'.includes(c)&&i&&(GLS+'ьъ').includes(w[i-1])){const m=b[1]+(b[2]-b[1])*.38;out.push({k:'j',a:b[1],b:m},{k,a:m,b:b[2]});return;}
   out.push({k,a:b[1],b:b[2]});});
  sl=[];};
 for(const b of bukvy){if(b[0]!==who)continue;if(/[а-яё]/i.test(b[3]))sl.push(b);else sbros();}sbros();
 const z=[];for(const q of out){const p=z[z.length-1];if(p&&p.k===q.k&&!GLASN.has(q.k)&&q.a-p.b<.03)p.b=q.b;else z.push(q);}
 return z;}

function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let a=seed;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
/** Zero-lag smoothing: one-pole filter run forward and backward. */
function gladko(a,tau){const k=1-Math.exp(-1/HZ/tau);let y=a[0];for(let i=0;i<a.length;i++){y+=k*(a[i]-y);a[i]=y;}y=a[a.length-1];for(let i=a.length-1;i>=0;i--){y+=k*(a[i]-y);a[i]=y;}return a;}
/** Spring: target, frequency, damping; imp holds impulses over time. */
function pruzhina(tgt,f,z,imp){const w=2*Math.PI*f,dt=1/HZ,o=new Float32Array(tgt.length);let x=tgt[0]||0,v=0;for(let i=0;i<tgt.length;i++){if(imp&&imp[i])v+=imp[i];const a=w*w*(tgt[i]-x)-2*z*w*v;v+=a*dt;x+=v*dt;o[i]=x;}return o;}
/** Rate limiter: it only lowers values, so the lip closure on m, b, p stays at zero. */
function zamedlit(a,v){const d=v/HZ;for(let i=1;i<a.length;i++)if(a[i]>a[i-1]+d)a[i]=a[i-1]+d;for(let i=a.length-2;i>=0;i--)if(a[i]>a[i+1]+d)a[i]=a[i+1]+d;return a;}
/** Smooth noise: a sum of slow sines. */
function shum(n,R,fs){const ph=fs.map(()=>R()*6.283),o=new Float32Array(n);for(let i=0;i<n;i++){const t=i/HZ;let s=0;fs.forEach((f,k)=>{s+=Math.sin(t*f*6.283+ph[k])/(k+1);});o[i]=s/1.83;}return o;}

/* Animation tempos. bylo is the first version with its original numbers; the others change only strength, frequency and softness. The mouth is checked by the honesty metric on every tempo. */
const BYLO={imya:'Original',
 rotSila:1,rotA:.58,rotB:.62,rotMin:.55,rotMax:1.18,tauK:1,tauGuby:1,skorost:10,tauPost:.009,svyaz:0,tishina:0,
 chast:.4,porog:.7,kivok:4.5,pitchF:2.3,pitchZ:.55,slushK:1,slushMin:1.5,
 yawF:.95,yawZ:.92,rollF:.8,rollZ:.9,leanF:.55,leanZ:.95,povorot:1,shumYaw:1,shumRoll:1,lean:1,naklonFrazy:1,
 ulybkaTau:.28,ulybkaShum:1,
 broviShans:1,broviImp:.9,broviF:2.1,broviZ:.8,broviVopros:1,broviL:1,
 sakkadaMin:.7,sakkadaRazbros:2.2,sakkadaSila:1,tauVzglyad:.03,
 morgMin:1.9,morgRazbros:3.2,morgDur:.17,morgDvoinoe:.16,
 dyhanie:[1.45,2.1],vdoh:1.6,bobF:1.9,bobZ:.6,bobUdar:.7,
 volosyK:2,volosyF:1.5,volosyZ:.42,
 zhestMin:1.3,zhestDl:1.1,zhestRazbros:1.5,zhestPauza:.45,zhestPauzaDl:.7,zhestPauzaRazbros:.6,zhestVtoraya:.4,zhestSila:1,zhestShansFrazy:1,tolchok:20,rukaF:1.3,rukaZ:.74,rukaTau:.06,ladonTau:.12};
const STILI={bylo:BYLO,
 chut:Object.assign({},BYLO,{imya:'A bit calmer',
  rotSila:.93,rotA:.62,rotB:.54,tauK:1.2,tauGuby:1.08,skorost:8.8,tishina:.12,tauPost:.011,svyaz:.35,
  chast:.6,porog:.75,kivok:3.5,pitchF:1.95,pitchZ:.62,slushK:.8,slushMin:2,
  yawF:.8,rollF:.7,leanF:.46,povorot:.92,shumYaw:.8,shumRoll:.8,lean:.8,naklonFrazy:.8,
  ulybkaTau:.36,ulybkaShum:.8,
  broviShans:.55,broviImp:.62,broviF:1.75,broviZ:.86,broviVopros:.8,broviL:.8,
  sakkadaMin:1.1,sakkadaRazbros:2.6,sakkadaSila:.75,tauVzglyad:.04,
  morgMin:2.6,morgRazbros:3.6,morgDur:.19,morgDvoinoe:.1,
  dyhanie:[1.3,1.8],vdoh:1.3,bobF:1.6,bobZ:.68,bobUdar:.5,
  volosyK:1.6,volosyF:1.3,volosyZ:.5,
  zhestMin:1.8,zhestDl:1.4,zhestRazbros:1.6,zhestPauza:.65,zhestPauzaDl:.9,zhestPauzaRazbros:1,zhestVtoraya:.25,zhestSila:.88,zhestShansFrazy:.85,tolchok:12,rukaF:1.1,rukaZ:.8,rukaTau:.08,ladonTau:.16}),
 spokoyno:Object.assign({},BYLO,{imya:'Calm',
  rotSila:.87,rotA:.64,rotB:.46,tauK:1.4,tauGuby:1.15,skorost:7.8,tishina:.12,tauPost:.013,svyaz:.55,
  chast:.85,porog:.8,kivok:2.7,pitchF:1.6,pitchZ:.7,slushK:.65,slushMin:2.6,
  yawF:.66,rollF:.6,leanF:.38,povorot:.84,shumYaw:.62,shumRoll:.62,lean:.62,naklonFrazy:.62,
  ulybkaTau:.45,ulybkaShum:.6,
  broviShans:.35,broviImp:.46,broviF:1.4,broviZ:.92,broviVopros:.62,broviL:.6,
  sakkadaMin:1.5,sakkadaRazbros:3,sakkadaSila:.55,tauVzglyad:.05,
  morgMin:3.2,morgRazbros:4,morgDur:.2,morgDvoinoe:.06,
  dyhanie:[1.2,1.55],vdoh:1,bobF:1.35,bobZ:.76,bobUdar:.34,
  volosyK:1.2,volosyF:1.1,volosyZ:.6,
  zhestMin:2.3,zhestDl:1.8,zhestRazbros:1.6,zhestPauza:.8,zhestPauzaDl:1.2,zhestPauzaRazbros:1.3,zhestVtoraya:.12,zhestSila:.76,zhestShansFrazy:.7,tolchok:7,rukaF:.92,rukaZ:.86,rukaTau:.1,ladonTau:.2}),
 tiho:Object.assign({},BYLO,{imya:'Very calm',
  rotSila:.8,rotA:.66,rotB:.38,tauK:1.6,tauGuby:1.22,skorost:6.8,tishina:.12,tauPost:.015,svyaz:.72,
  chast:1.2,porog:.85,kivok:2,pitchF:1.3,pitchZ:.8,slushK:.5,slushMin:3.2,
  yawF:.52,rollF:.48,leanF:.3,povorot:.74,shumYaw:.45,shumRoll:.45,lean:.45,naklonFrazy:.45,
  ulybkaTau:.55,ulybkaShum:.45,
  broviShans:.2,broviImp:.34,broviF:1.1,broviZ:1,broviVopros:.45,broviL:.4,
  sakkadaMin:2,sakkadaRazbros:3.6,sakkadaSila:.4,tauVzglyad:.06,
  morgMin:3.8,morgRazbros:4.4,morgDur:.22,morgDvoinoe:.03,
  dyhanie:[1.1,1.3],vdoh:.7,bobF:1.1,bobZ:.85,bobUdar:.2,
  volosyK:.9,volosyF:.95,volosyZ:.7,
  zhestMin:3,zhestDl:2.2,zhestRazbros:1.6,zhestPauza:.92,zhestPauzaDl:1.6,zhestPauzaRazbros:1.6,zhestVtoraya:.05,zhestSila:.64,zhestShansFrazy:.55,tolchok:4,rukaF:.76,rukaZ:.92,rukaTau:.13,ladonTau:.25})};

function bake(data,who,o={}){
 const S=typeof o.stil==='string'?(STILI[o.stil]||BYLO):(o.stil||BYLO);
 const n=Math.ceil(data.total*HZ)+2,R=rng(hash(data.scene+who)),st=o.storona||1,idx=t=>clamp(Math.round(t*HZ),0,n-1);
 const E=t=>{const k=t*100;return (data.energy[k|0]||0)/200;};
 // -- sounds of this voice --
 const chuzhoj=new Uint8Array(Math.ceil(data.total*100)+2);for(const r of data.repliki)if(r.who!==who)chuzhoj.fill(1,Math.max(0,Math.round(r.t0*100)-3),Math.round(r.t1*100)+1);   // the partner's voice does not count for this mouth
 const gol=t=>{const k=Math.round(t*100);return !chuzhoj[k]&&(data.energy[k]||0)>5;};const zv=zvuki(data.bukvy,who,o.udar||data.udar,gol);
 // letter timing is coarse (40-80 ms steps) and the pause before a phrase is often given to its first letter: check against the real voice
 const golosMezhdu=(a,b)=>{for(let t=a;t<b;t+=.01)if(!gol(t))return false;return true;};
 for(let i=0;i<zv.length;i++){const z=zv[i],pr=zv[i-1],nx=zv[i+1];
  if(pr&&z.a<pr.b){z.a=pr.b;z.b=Math.max(z.b,z.a+.03);}
  if(!gol(z.a+.01)&&!(pr&&gol(z.a-.03))){let t=z.a;const lim=z.b+.35;while(t<lim&&!gol(t))t+=.01;if(t<lim&&t-z.a>.06){const d=Math.min(z.b-z.a,.11);z.a=t;z.b=Math.max(z.b,t+d);}}
  if(!nx||nx.a-z.b>.02||!gol(z.b+.01)){let e=z.b;while(e>z.a+.05&&!gol(e-.01))e-=.01;z.b=e;}
  if(!nx||nx.a-z.b>.14){let e=z.b;const lim=Math.min(z.b+.16,nx?nx.a-.04:1e9);while(e<lim&&gol(e+.01))e+=.01;z.b=e;}}
 // voices differ in loudness: the mouth shape must not depend on who is speaking
 const gr=zv.filter(z=>GLASN.has(z.k)).map(z=>E((z.a+z.b)/2)).sort((a,b)=>a-b),Ek=gr.length?.8/(gr[gr.length*.8|0]||1):1;
 // connected speech: a short consonant between vowels does not fully close the jaw, so the mouth flaps less; labials are left alone
 const svyazat=(z,i,f)=>{if(!S.svyaz||GLASN.has(z.k)||z.k==='mb'||z.k==='fv'||z.b-z.a>.13)return;const pr=zv[i-1],nx=zv[i+1];if(!pr||!nx||!GLASN.has(pr.k)||!GLASN.has(nx.k)||z.a-pr.b>.03||nx.a-z.b>.03)return;f[0]=Math.max(f[0],lerp(f[0],Math.min(F[pr.k][0],F[nx.k][0])*S.rotSila*.8,S.svyaz));};
 const T=Object.fromEntries(IM.map(m=>[m,new Float32Array(n)]));
 for(const m of IM)T[m].fill(F.sil[IM.indexOf(m)]);
 for(let i=0;i<zv.length;i++){const z=zv[i],nx=zv[i+1],f=F[z.k].slice(),gl=GLASN.has(z.k);
  if(gl){let e=0;const m=(z.a+z.b)/2;for(let d=-.03;d<=.03;d+=.01)e=Math.max(e,E(m+d)*Ek);f[0]*=clamp(S.rotA+S.rotB*e,S.rotMin,S.rotMax)*S.rotSila;}
  else if(nx&&z.k!=='mb'&&z.k!=='fv'){let v=null;for(let j=i+1;j<zv.length&&j<i+4;j++){if(zv[j].a-zv[j-1].b>.14)break;if(GLASN.has(zv[j].k)){v=zv[j];break;}}if(v){const g=F[v.k];f[2]=Math.max(f[2],g[2]*.62);f[1]=lerp(f[1],g[1],.45);}}   // the lips prepare for the next vowel in advance
  svyazat(z,i,f);const lead=.03,a=z.a-lead,gap=nx?nx.a-z.b:9,b=(nx&&gap<.14&&golosMezhdu(z.b,nx.a)?nx.a:z.b+.04)-lead;
  const i0=idx(a),i1=idx(b);for(let k=i0;k<i1;k++)IM.forEach((m,j)=>{T[m][k]=f[j];});z.f=f;}
 // a vowel shorter than 50 ms is an artefact of the timing grid, not of speech: draw it for at least 50 ms
 for(const z of zv)if(GLASN.has(z.k)&&z.b-z.a<.05){const c=(z.a+z.b)/2-.03;for(let k=idx(c-.025);k<idx(c+.025);k++)IM.forEach((m,j)=>{T[m][k]=z.f[j];});}
 const poza={};
 const tau={open:.027*S.tauK,wide:.04*S.tauGuby,round:.044*S.tauGuby,teeth:.034*S.tauGuby,tongue:.03*S.tauGuby,press:.022,bite:.024};
 for(const m of IM)poza[m]=gladko(T[m],tau[m]);
 // closure on m, b, p and lip contact on v, f: smoothing must not eat them
 const K=new Float32Array(n).fill(1),sst=x=>{x=clamp(x);return x*x*(3-2*x);};
 for(const z of zv)if(z.k==='mb'||z.k==='fv'){let c=(z.a+z.b)/2-.01,mn=9,c1=c;for(let d=-.04;d<=.07;d+=.01){const e=E(c+d);if(e<mn-.002){mn=e;c1=c+d;}}c=c1-.012;const w=.03,r=.06,i0=idx(c-w-r),i1=idx(c+w+r);for(let i=i0;i<=i1;i++){const k=sst((Math.abs(i/HZ-c)-w)/r),v=z.k==='mb'?k:lerp(.85,1,k);if(v<K[i])K[i]=v;}}
 // silence in this voice: a soft mouth must not hang open during a pause
 if(S.tishina){const m=Math.ceil(data.total*100);let a=-1;for(let k=0;k<=m;k++){const g=k<m&&gol(k/100);if(!g&&a<0)a=k;else if(g&&a>=0){if((k-a)/100>=S.tishina||a===0){const t0=a/100+.01,t1=k/100-.035,r=.05;for(let i=idx(t0-r);i<=idx(t1+r);i++){const t=i/HZ,v=sst(Math.max(t0-t,t-t1)/r);if(v<K[i])K[i]=v;}}a=-1;}}if(a>=0&&(m-a)/100>=S.tishina)for(let i=idx(a/100+.06);i<n;i++)K[i]=0;}
 gladko(K,.006);for(let i=0;i<n;i++)poza.open[i]*=K[i];
 zamedlit(poza.open,S.skorost);gladko(poza.open,S.tauPost);
 // -- phrases --
 const svoi=data.repliki.filter(r=>r.who===who),chuzh=data.repliki.filter(r=>r.who!==who),speaking=new Uint8Array(n);
 for(const r of svoi){const a=idx(r.t0-.08),b=idx(r.t1+.05);for(let i=a;i<=b;i++)speaking[i]=1;}
 const mk=()=>new Float32Array(n),cel={yaw:mk(),lean:mk(),roll:mk(),smile:mk(),gx:mk(),gy:mk(),brow:mk(),hLx:mk(),hLy:mk(),hRx:mk(),hRy:mk(),hLo:mk(),hRo:mk()};
 // stressed syllables: loudness peaks on vowels, at most one per 0.4 s
 const eGl=zv.filter(z=>GLASN.has(z.k)).map(z=>E((z.a+z.b)/2)).sort((a,b)=>a-b),porog=eGl[eGl.length*S.porog|0]||.62,eNorm=eGl[eGl.length*.92|0]||1;
 const udary=[];let last=-9;for(const z of zv)if(GLASN.has(z.k)){const e=E((z.a+z.b)/2);if(e>porog&&z.a-last>S.chast){udary.push({t:z.a,e:e/eNorm});last=z.a;}}
 // gaze: the speaker mostly looks at the partner, sometimes at the viewer; the listener looks at the speaker; before tasks both look at the viewer
 const kZritelyu=r=>/^(intro|k-testu|title)/.test(r.id);
 const yawK=new Float32Array(n).fill(.1*st);
 const fill=(arr,a,b,v)=>{for(let i=idx(a);i<idx(b);i++)arr[i]=v;};
 data.repliki.forEach((r,i)=>{const nx=data.repliki[i+1],end=nx?nx.t0-.25:data.total,mine=r.who===who,Rr=rng(hash(r.id+who));
  let y=.36*st;if(kZritelyu(r))y=.1*st;else if(mine&&Rr()<.38)y=.13*st;fill(yawK,r.t0-.3,end,y*S.povorot);});
 cel.yaw=yawK;
 const noiseY=shum(n,R,[.11,.27,.53]),noiseR=shum(n,R,[.09,.23,.41]),noiseL=shum(n,R,[.07,.17]),noiseB=shum(n,R,[.13,.37]);
 for(let i=0;i<n;i++){const s=speaking[i];cel.yaw[i]+=noiseY[i]*(s?.06:.03)*S.shumYaw;cel.roll[i]=noiseR[i]*(s?.04:.022)*S.shumRoll;cel.lean[i]=(noiseL[i]*.35+(s?.28*st:.04*st))*S.lean;cel.smile[i]=(s?.2:.42)+noiseB[i]*.07*S.ulybkaShum;}
 for(const r of svoi){const Rr=rng(hash(r.id));fill(cel.roll,r.t0,r.t1,0);const rr=(Rr()-.5)*.09*S.naklonFrazy;for(let i=idx(r.t0);i<idx(r.t1);i++)cel.roll[i]=rr+noiseR[i]*.03*S.shumRoll;if(r.vosk)fill(cel.smile,r.t0,r.t1+.4,.55);if(r.vopros){const a=r.t1-.55;for(let i=idx(a);i<idx(r.t1+.25);i++)cel.brow[i]=.75*S.broviVopros;for(let i=idx(a);i<idx(r.t1+.4);i++)cel.roll[i]+=.05*st*S.naklonFrazy;}}
 for(const r of chuzh){if(r.vopros)for(let i=idx(r.t1-.2);i<idx(r.t1+.6);i++)cel.brow[i]=.42*S.broviVopros;}
 // -- motion with time offsets: eyes lead the head, the head leads the body, hair comes last --
 const impP=mk(),impB=mk(),impH=mk();
 for(const u of udary){const i=idx(u.t-.03);impP[i]+=(.9+R()*.9)*clamp(u.e,.5,1.1)*S.kivok;const b=.9+R()*.6;if(S.broviShans>=1||R()<S.broviShans)impB[i]+=b;impH[i]+=1;}
 for(const r of chuzh){if(r.t1-r.t0>S.slushMin){const k=idx(r.t1-.15);impP[k]+=2.1*S.slushK;impP[idx(r.t1+.28)]+=1.4*S.slushK;}}   // listener nods at the end of the partner's phrase
 poza.yaw=pruzhina(cel.yaw,S.yawF,S.yawZ);poza.roll=pruzhina(cel.roll,S.rollF,S.rollZ);poza.lean=pruzhina(cel.lean,S.leanF,S.leanZ);
 poza.pitch=pruzhina(new Float32Array(n),S.pitchF,S.pitchZ,impP);
 poza.smile=gladko(cel.smile,S.ulybkaTau);
 // gaze: a fast shift, the head catches up; small saccades
 let gt=0,gy=0,sac=1;const gxT=mk(),gyT=mk(),Rg=rng(hash(who+'g'));
 for(let i=0;i<n;i++){const t=i/HZ;if(t>sac){sac=t+S.sakkadaMin+Rg()*S.sakkadaRazbros;gt=(Rg()-.5)*.28*S.sakkadaSila;gy=(Rg()-.5)*.28*S.sakkadaSila;}gxT[i]=cel.yaw[i]*1.5+gt;gyT[i]=gy-(speaking[i]?.05:0);}
 poza.gx=gladko(gxT,S.tauVzglyad);poza.gy=gladko(gyT,S.tauVzglyad);
 // eyebrows
 poza.brow=pruzhina(cel.brow,S.broviF,S.broviZ,impB.map(x=>x*S.broviImp));poza.browL=gladko(shum(n,R,[.19,.43]).map(x=>x*.14*S.broviL),.2);
 // blinks: random, more often when the gaze shifts
 poza.blink=mk();let tb=.8+R()*2,dvoinoe=false;while(tb<data.total){const i0=idx(tb),dur=S.morgDur;for(let i=0;i<dur*HZ;i++){const u=i/(dur*HZ),v=u<.36?u/.36:1-(u-.36)/.64,k=i0+i;if(k<n)poza.blink[k]=Math.max(poza.blink[k],Math.sin(v*1.5708));}dvoinoe=!dvoinoe&&R()<S.morgDvoinoe;tb+=dvoinoe?.26:S.morgMin+R()*S.morgRazbros;}
 // breathing and bobbing: an inhale before each phrase
 poza.breath=mk();poza.bob=mk();const nb=shum(n,R,[.09,.21]);{let ph=0,w=S.dyhanie[0];for(let i=0;i<n;i++){w+=((speaking[i]?S.dyhanie[1]:S.dyhanie[0])-w)*.01;ph+=w/HZ;poza.breath[i]=Math.sin(ph);}}
 const impV=mk();for(const r of svoi)impV[idx(r.t0-.28)]-=S.vdoh;
 const bobU=pruzhina(new Float32Array(n),S.bobF,S.bobZ,impB.map((x,i)=>x*S.bobUdar+impV[i]));for(let i=0;i<n;i++)poza.bob[i]=bobU[i]+nb[i]*.35;
 // hair follows the head
 const yawV=mk();for(let i=1;i<n;i++)yawV[i]=(poza.yaw[i]-poza.yaw[i-1])*HZ*.22-(poza.roll[i]-poza.roll[i-1])*HZ*.4;
 poza.hair=pruzhina(gladko(yawV,.05).map(x=>x*S.volosyK),S.volosyF,S.volosyZ);
 // -- hands: gestures on long phrases, palms on the table between phrases --
 const G=[[-14,-92,1],[8,-108,1],[-28,-84,.9],[20,-98,.8]];   // outward, up, palm opening: the hand in front of the chest, the elbow down
 for(const r of svoi){if(r.t1-r.t0<S.zhestMin)continue;const Rr=rng(hash(r.id+'g')),a=r.t0-.3,b=r.t1+.05,glav=Rr()<.7?'R':'L';if(S.zhestShansFrazy<1&&Rr()>S.zhestShansFrazy)continue;let t=a;while(t<b-.5){const g=G[Rr()*G.length|0],dl=S.zhestDl+Rr()*S.zhestRazbros,e=Math.min(b,t+dl);
   const H=glav==='R'?['hRx','hRy','hRo']:['hLx','hLy','hLo'],O=glav==='R'?['hLx','hLy','hLo']:['hRx','hRy','hRo'],sgn=glav==='R'?1:-1;
   fill(cel[H[0]],t,e,sgn*g[0]*S.zhestSila);fill(cel[H[1]],t,e,g[1]*S.zhestSila);fill(cel[H[2]],t,e,g[2]);
   if(Rr()<S.zhestVtoraya){fill(cel[O[0]],t,e,-sgn*g[0]*.7*S.zhestSila);fill(cel[O[1]],t,e,g[1]*.72*S.zhestSila);fill(cel[O[2]],t,e,.8);}
   t=e+(Rr()<S.zhestPauza?S.zhestPauzaDl+Rr()*S.zhestPauzaRazbros:0);}}
 for(const k of ['hLx','hLy','hRx','hRy'])gladko(cel[k],S.rukaTau);
 // a hand beat on a stressed syllable: only for a raised hand; palms resting on the table stay calm
 const impL=impH.map((x,i)=>cel.hLy[i]<-30?x*S.tolchok:0),impRr=impH.map((x,i)=>cel.hRy[i]<-30?x*S.tolchok:0);
 const rkY=S.rukaF+.05*S.rukaF/1.3,rkZy=S.rukaZ-.02;poza.hLx=pruzhina(cel.hLx,S.rukaF,S.rukaZ);poza.hLy=pruzhina(cel.hLy,rkY,rkZy,impL);poza.hRx=pruzhina(cel.hRx,S.rukaF,S.rukaZ);poza.hRy=pruzhina(cel.hRy,rkY,rkZy,impRr);poza.hLo=gladko(cel.hLo,S.ladonTau);poza.hRo=gladko(cel.hRo,S.ladonTau);
 const keys=Object.keys(poza);
 return {udary,poza(t){const x=clamp(t*HZ,0,n-1.001),i=x|0,f=x-i,p={};for(const k of keys)p[k]=poza[k][i]+(poza[k][i+1]-poza[k][i])*f;return p;},treki:poza,zv,HZ};
}
root.Rech={bake,F,IM,KL,STILI};
})(window);
