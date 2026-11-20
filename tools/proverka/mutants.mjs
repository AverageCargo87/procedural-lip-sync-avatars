// Mutation tests for the honesty metric: deliberately broken animations that the metric must reject.
// A metric that passes a broken mouth is worthless, so every mutant names the checks that are supposed to catch it.
//   node tools/proverka/mutants.mjs [tempo]     prints which checks each mutant fails
//
// Three kinds of mutants:
//  - src:  a text replacement in src/rech.js (the bug lives in the baker itself);
//  - post: a change to the baked tracks (the bug lives downstream: playback, export, a bad merge);
//  - data: a change to the baker's input (the bug lives upstream: the letter timing).
// A mutant with expect:[] and a `survivor` note is a known blind spot of the metric, kept visible on purpose.
import {loadRech,readJson,readWav} from '../lib.mjs';
import {measure} from './honesty.mjs';
import {pathToFileURL} from 'node:url';

/** Replace one exact snippet; throws when rech.js no longer contains it, so a refactor cannot silently disable a mutant. */
const swap=(a,b)=>s=>{if(!s.includes(a))throw new Error('mutant anchor not found in rech.js: '+a);return s.replace(a,b);};
const HZ=120;

/** Letters of every line without the aligner: spread evenly over the line, or over each word's TTS timestamp. */
function lettersWithoutAligner(script,useWords){
 const out=[];
 for(const l of script.lines){const ch=[...l.text];
  if(!useWords){const d=(l.t1-l.t0)/ch.length;ch.forEach((c,i)=>out.push([l.who,l.t0+i*d,l.t0+(i+1)*d,c]));continue;}
  let k=0;for(const [w,a,b] of l.words){const at=l.text.indexOf(w,k);for(;k<at;k++)out.push([l.who,a,a,ch[k]]);const d=(b-a)/w.length;for(let i=0;i<w.length;i++,k++)out.push([l.who,a+i*d,a+(i+1)*d,ch[k]]);}
  for(;k<ch.length;k++)out.push([l.who,l.t1,l.t1,ch[k]]);}
 return out;
}

export const MUTANTS=[
 {id:'all-vowels-a',kind:'src',what:'every vowel uses the shape of "a": no o, u, i, e',expect:['round','spread'],
  src:swap("const KL={а:'a',я:'a',о:'o',ё:'o',у:'u',ю:'u',э:'e',е:'e',и:'i',ы:'y',","const KL={а:'a',я:'a',о:'a',ё:'a',у:'a',ю:'a',э:'a',е:'a',и:'a',ы:'a',")},
 {id:'no-lip-closure',kind:'src',what:'no forced closure on m, b, p',expect:['p-closed'],
  src:swap("if(z.k==='mb'||z.k==='fv'){let c=","if(false){let c=")},
 {id:'weak-mouth',kind:'src',what:'mouth opening 0.42x',expect:['vowels'],
  src:swap("*S.rotSila;}","*S.rotSila*.42;}")},
 {id:'slow-mouth',kind:'src',what:'mouth speed limit 2 per second instead of 7-10',expect:['vowels'],
  src:swap("zamedlit(poza.open,S.skorost)","zamedlit(poza.open,2)")},
 {id:'no-rounding',kind:'src',what:'o and u do not round the lips',expect:['round'],
  src:swap("o:[.64,-.3,.85,.2,0,0,0],u:[.3,-.62,1,.08,0,0,0]","o:[.64,-.3,.3,.2,0,0,0],u:[.3,-.62,.3,.08,0,0,0]")},
 {id:'long-closure',kind:'src',what:'the m, b, p closure is three times wider and eats neighbouring vowels',expect:['vowels','closure-p90'],
  src:swap("const w=.03,r=.06,","const w=.09,r=.18,")},
 {id:'no-silence-close',kind:'src',tempo:'spokoyno',what:'the soft tempos stop force-closing the mouth after 0.12 s of silence',expect:[],
  survivor:'the pause checks start at 0.16-0.25 s, while this mechanism acts in shorter gaps (up to 0.47 open difference over about 2 s of the clip), so the metric cannot see it',
  src:swap("if(S.tishina){const m=","if(false){const m=")},
 {id:'flapper',kind:'post',what:'a jaw flap: wide, round, teeth, tongue, press, bite are all zero',expect:['round','spread'],
  post:B=>{for(const m of ['wide','round','teeth','tongue','bite','press'])B.treki[m].fill(0);}},
 {id:'hangs-open',kind:'post',what:'the mouth hangs open for 0.5 s before and after every line',expect:['pauses','silence'],
  post:(B,D,w)=>{const o=B.treki.open;for(const r of D.repliki){if(r.who!==w)continue;for(const [a,b] of [[r.t0-.5,r.t0],[r.t1,r.t1+.5]])for(let i=Math.round(a*HZ);i<Math.round(b*HZ);i++)if(i>=0&&i<o.length)o[i]=Math.max(o[i],.5);}}},
 {id:'listener-chews',kind:'post',what:'the listener moves the mouth while the partner speaks',expect:['listener','listener-voice'],
  post:(B,D,w)=>{const o=B.treki.open;for(const r of D.repliki){if(r.who===w)continue;for(let i=Math.round(r.t0*HZ);i<Math.round(r.t1*HZ);i++)o[i]=.3+.3*Math.sin(i*.6);}}},
 {id:'jitter',kind:'post',what:'+-0.05 jitter on every 120 Hz frame',expect:['jitter'],
  post:B=>{const o=B.treki.open;for(let i=0;i<o.length;i++)if(o[i]>.08)o[i]+=(i%2?.05:-.05);}},
 {id:'late-150ms',kind:'post',what:'the mouth runs 150 ms late (a sync bug in playback or export)',expect:['p-closed','pauses','silence'],
  post:B=>{const s=Math.round(.15*HZ);for(const m of Object.keys(B.treki)){const a=B.treki[m];if(!(a instanceof Float32Array))continue;a.copyWithin(s,0,a.length-s);a.fill(a[s],0,s);}}},
 {id:'no-aligner-even',kind:'data',what:'aligner skipped: letters spread evenly over each line',expect:['pauses','silence','vowels','round'],
  data:(D,S)=>({...D,bukvy:lettersWithoutAligner(S,false)})},
 {id:'no-aligner-words',kind:'data',what:'aligner skipped: TTS word timestamps split evenly into letters',expect:['pauses','silence','vowels','closure-p90'],
  data:(D,S)=>({...D,bukvy:lettersWithoutAligner(S,true)})},
];

/** Bake both hosts with a mutant applied and measure against the clean voice. */
export function runMutant(M,{data=readJson('data/demo.json'),script=readJson('data/demo.script.json'),voice=readWav('data/demo-16k.wav').samples,tempo}={}){
 const Rech=loadRech(M.src),stil=M.tempo||tempo||'bylo',input=M.data?M.data(data,script):data,res={};
 for(const [w,st] of [['L',1],['A',-1]]){const B=Rech.bake(input,w,{storona:st,stil});if(M.post)M.post(B,data,w);res[w]=B;}
 return measure({data,L:res.L,A:res.A,voice});
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const tempo=process.argv[2]||'bylo',data=readJson('data/demo.json'),script=readJson('data/demo.script.json'),voice=readWav('data/demo-16k.wav').samples,R=loadRech();
 const base=measure({data,L:R.bake(data,'L',{storona:1,stil:tempo}),A:R.bake(data,'A',{storona:-1,stil:tempo}),voice});
 console.log(`baseline (${tempo}): ${base.passed}/${base.total}${base.failed.length?' failed: '+base.failed.join(', '):''}\n`);
 let caught=0,killable=0;
 for(const M of MUTANTS){const r=runMutant(M,{data,script,voice,tempo}),hit=M.expect.filter(e=>r.failed.includes(e));
  if(M.expect.length){killable++;if(hit.length)caught++;}
  const verdict=M.expect.length?(hit.length?'CAUGHT ':'MISSED '):(r.failed.length?'CAUGHT?':'SURVIVES');
  console.log(`${verdict} ${M.kind.padEnd(4)} ${M.id.padEnd(17)} ${String(r.passed).padStart(2)}/${r.total}  failed: ${(r.failed.join(', ')||'-').padEnd(44)} ${M.what}`);
  if(M.survivor)console.log(`         known blind spot: ${M.survivor}`);}
 console.log(`\n${caught}/${killable} mutants caught by an expected check; ${MUTANTS.length-killable} documented survivor(s)`);
}
