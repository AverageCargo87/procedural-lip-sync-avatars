// Model-free text-to-audio aligner (identifiers are transliterated Russian, see docs/GLOSSARY.md).
// Aligns the letters of a line to the voice itself, with no model and no network. Input: the text of a line and its approximate time; output: the time of every letter.
// The voice is described by two features per 10 ms step: loudness and sharpness (share of high frequencies). They separate a vowel (loud and dull), a fricative (sharp),
// a sonorant (medium and dull) and a stop (quiet). The best placement of all letters is found by dynamic programming over the whole line.
// TTS letter timing (for example ElevenLabs alignment), when present, is a soft hint; for other voices the line time is enough.
const HOP=160,WIN=400,KADR=.01;
const KLASS={};
for(const c of 'аяоёуюэеиы')KLASS[c]='V';for(const c of 'сшщфзжчцх')KLASS[c]='F';for(const c of 'мнлрйв')KLASS[c]='N';for(const c of 'птк')KLASS[c]='S';for(const c of 'бдг')KLASS[c]='B';
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
// mean duration (s), lower bound and spread of sound duration per class
const DL={V:[.075,.03,.045],F:[.085,.03,.04],N:[.06,.025,.035],S:[.07,.03,.035],B:[.055,.025,.03]};

/** Voice features. smp is an Int16Array at 16 kHz. -> {E: dB from the loud level, H: sharpness 0...2} */
export function priznaki(smp){
 const n=Math.max(0,Math.floor((smp.length-WIN)/HOP)),e=new Float32Array(n),h=new Float32Array(n);
 for(let k=0;k<n;k++){let s=0,d=0,pr=smp[k*HOP];for(let i=k*HOP;i<k*HOP+WIN;i++){const x=smp[i],y=x-pr;pr=x;s+=x*x;d+=y*y;}e[k]=10*Math.log10(s/WIN+1);h[k]=Math.sqrt(d/(s+1));}
 const sorted=[...e].sort((a,b)=>a-b),p95=sorted[n*.95|0];for(let k=0;k<n;k++)e[k]-=p95;
 return {E:e,H:h};
}
/** How much a frame looks like a sound class: roughly -1.5 to 1. */
function ocenka(kl,E,H){
 if(kl==='sil')return E<-40?1:E<-32?.2:-1.4;
 if(kl==='V')return clamp((E+24)/12,-1.5,1)-clamp((H-.55)/.4,0,1.4);
 if(kl==='F')return clamp((H-.55)/.35,-1.1,1)+clamp((E+40)/10,-1,0);
 if(kl==='N')return clamp((E+32)/10,-1,.7)-clamp((H-.6)/.35,0,1.2)-clamp((E+10)/8,0,.6);
 if(kl==='S')return clamp((-E-22)/10,-1,1);
 return clamp((-E-14)/10,-1,1);
}
/** Letters of a line -> new times. bukvy: [{ch,t0,t1}] in text order, spaces and punctuation included. a,b are line bounds, s. */
export function vyrovnyat(bukvy,a,b,P,{podskazka=true,ot=0,'do':dO=1e9}={}){
 const f0=Math.max(0,Math.round(Math.max(a-.14,ot)/KADR)),f1=Math.min(P.E.length,Math.round(Math.min(b+.2,dO)/KADR)),T=f1-f0;if(T<4)return bukvy;
 // states: leading silence, letters, optional silence between words, trailing silence
 const S=[{kl:'sil',mn:0,mx:60}];let i=0;
 while(i<bukvy.length){const c=bukvy[i].ch.toLowerCase();
  if(KLASS[c]){const kl=KLASS[c],[mu,lo,si]=DL[kl];S.push({kl,mn:Math.round(lo/KADR),mx:Math.round(.42/KADR),mu:mu/KADR,si:si/KADR,idx:i,el:podskazka?(bukvy[i].t0+bukvy[i].t1)/2:null});i++;}
  else if(/[ьъ]/i.test(c)){i++;}
  else{let silno=false;while(i<bukvy.length&&!KLASS[bukvy[i].ch.toLowerCase()]&&!/[ьъ]/i.test(bukvy[i].ch)){if(/[.,!?:;\u2014\u2026-]/.test(bukvy[i].ch))silno=true;i++;}S.push({kl:'sil',mn:0,mx:silno?70:30});}}
 S.push({kl:'sil',mn:0,mx:60});
 const J=S.length,pref=S.map(s=>{const o=new Float32Array(T+1);for(let t=0;t<T;t++)o[t+1]=o[t]+ocenka(s.kl,P.E[f0+t],P.H[f0+t]);return o;});
 const INF=-1e9,dp=Array.from({length:J},()=>new Float32Array(T+1).fill(INF)),nz=Array.from({length:J},()=>new Int16Array(T+1));
 for(let t=0;t<=T;t++){const d=t;if(d>=S[0].mn&&d<=S[0].mx)dp[0][t]=pref[0][t];}
 for(let j=1;j<J;j++){const s=S[j],mx=s.mx,mn=s.mn,pj=dp[j-1],pf=pref[j];
  for(let t=0;t<=T;t++){let best=INF,bd=0;
   for(let d=mn;d<=mx&&d<=t;d++){const q=pj[t-d];if(q<=INF/2)continue;let v=q+pf[t]-pf[t-d];
    if(s.mu!=null){const z=(d-s.mu)/s.si;v-=.11*z*z;if(s.el!=null){const c=(f0+t-d/2)*KADR,off=Math.max(0,Math.abs(c-s.el)-.1);v-=120*off*off;}}
    if(v>best){best=v;bd=d;}}
   dp[j][t]=best;nz[j][t]=bd;}}
 // backtrack
 const out=bukvy.map(x=>({...x}));let t=T;for(let j=J-1;j>=1;j--){const d=nz[j][t],s=S[j];if(s.idx!=null){out[s.idx].t0=+((f0+t-d)*KADR).toFixed(3);out[s.idx].t1=+((f0+t)*KADR).toFixed(3);}t-=d;}
 // spaces and punctuation sit between neighbouring letters; they only mark word boundaries
 for(let k=0;k<out.length;k++)if(!KLASS[out[k].ch.toLowerCase()]){const p=out[k-1]?.t1??a;out[k].t0=p;out[k].t1=p;}
 return out;
}
