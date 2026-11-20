// Build the input of Rech.bake from a script and its voice audio.
//   node tools/build-track.mjs data/demo.script.json [--no-hints] [--out data/demo.json]
//
// Script: { id, audio, lines:[{ id, who:'L'|'A', text, t0, t1, words?:[[word,t0,t1],...] }] }
//   t0/t1 is the approximate time of the line. words (for example from a TTS "with timestamps" response)
//   is optional and only used as a soft hint; with --no-hints the aligner sees nothing but the line bounds.
// Output: { scene, total, bukvy:[[who,t0,t1,char],...], repliki:[{id,who,t0,t1,show,vopros,vosk}], energy:[0-255 at 100 Hz], udar }
//
// Steps: decode the voice to 16 kHz mono (ffmpeg) -> loudness envelope at 100 Hz -> spread each line's letters over its
// words (or evenly over the line) -> re-time every letter against the voice itself with tools/vyravnivanie.mjs.
import {readFileSync,existsSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {priznaki,vyrovnyat} from './vyravnivanie.mjs';
import {decode16k,writeJson,path} from './lib.mjs';

const LETTER=/[а-яё]/i;

/** Loudness for the mouth: RMS over 20 ms every 10 ms, scaled so the 98th percentile maps to 200 (0-255). */
export function loudness(smp){
 const hop=160,win=320,rms=[];
 for(let i=0;i+win<=smp.length;i+=hop){let s=0;for(let j=i;j<i+win;j++)s+=smp[j]*smp[j];rms.push(Math.sqrt(s/win));}
 const p98=[...rms].sort((a,b)=>a-b)[rms.length*.98|0]||1;return rms.map(x=>Math.min(255,Math.round(x/p98*200)));
}

/** Initial letter times: each word's span is split between its characters; without words (or without hints) the line is split evenly. */
export function initialLetters(l,useWords=true){
 const chars=[...l.text],res=[];
 if(!useWords||!l.words||!l.words.length){const n=chars.length,d=(l.t1-l.t0)/n;chars.forEach((ch,i)=>res.push({who:l.who,t0:l.t0+i*d,t1:l.t0+(i+1)*d,ch}));return res;}
 let k=0;
 for(const [w,a,b] of l.words){const at=l.text.indexOf(w,k);if(at<0)throw new Error(`word "${w}" not found in line ${l.id}`);
  for(;k<at;k++)res.push({who:l.who,t0:a,t1:a,ch:chars[k]});           // spaces and punctuation before the word
  const n=w.length,d=(b-a)/n;for(let i=0;i<n;i++,k++)res.push({who:l.who,t0:a+i*d,t1:a+(i+1)*d,ch:chars[k]});}
 for(;k<chars.length;k++)res.push({who:l.who,t0:l.t1,t1:l.t1,ch:chars[k]});
 return res;
}

/** Script + 16 kHz samples -> pose-track input. hints=false ignores word timestamps entirely. */
export function buildTrack(SC,smp,{hints=true,udar}={}){
 const P=priznaki(smp),bukvy=[],repliki=[];let shift=0,count=0;
 SC.lines.forEach((l,i)=>{
  const L=initialLetters(l,hints),let0=L.filter(x=>LETTER.test(x.ch)),t0=hints?let0[0].t0:l.t0,t1=hints?let0.at(-1).t1:l.t1;
  const pr=SC.lines[i-1],nx=SC.lines[i+1];
  // a line never borrows time from the partner's neighbouring line
  const V=vyrovnyat(L,t0,t1,P,{podskazka:hints,ot:pr&&pr.who!==l.who?pr.t1+.02:0,do:nx&&nx.who!==l.who?nx.t0-.02:1e9});
  V.forEach((x,j)=>{bukvy.push([x.who,x.t0,x.t1,x.ch]);if(LETTER.test(x.ch)){shift+=Math.abs((x.t0+x.t1)/2-(L[j].t0+L[j].t1)/2);count++;}});
  repliki.push({id:l.id,who:l.who,t0:+t0.toFixed(3),t1:+t1.toFixed(3),show:l.text,vopros:/\?\s*$/.test(l.text),vosk:/!\s*$/.test(l.text)});
 });
 return {track:{scene:SC.id,total:+(smp.length/16000).toFixed(3),bukvy,repliki,energy:loudness(smp),udar},meanShift:shift/count};
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const args=process.argv.slice(2),scriptFile=resolve(args.find(a=>!a.startsWith('--'))||path('data/demo.script.json'));
 const hints=!args.includes('--no-hints'),outArg=args.indexOf('--out'),SC=JSON.parse(readFileSync(scriptFile,'utf8'));
 const out=outArg>=0?resolve(args[outArg+1]):scriptFile.replace(/(\.script)?\.json$/,'.json');
 const smp=decode16k(join(dirname(scriptFile),SC.audio)),udarF=path('tools/udar.json');
 const {track,meanShift}=buildTrack(SC,smp,{hints,udar:existsSync(udarF)?JSON.parse(readFileSync(udarF,'utf8')):undefined});
 writeJson(out,track);
 console.log(`${SC.id}: ${track.repliki.length} lines, ${track.bukvy.length} characters, ${track.energy.length} loudness points, total ${track.total} s`);
 console.log(`aligner (${hints?'with word hints':'line bounds only'}): mean letter shift ${(meanShift*1000).toFixed(0)} ms -> ${out}`);
}
