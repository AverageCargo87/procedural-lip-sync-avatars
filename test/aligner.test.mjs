// The model-free aligner (tools/vyravnivanie.mjs), the track builder and the phoneme stage of rech.js.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {priznaki,vyrovnyat} from '../tools/vyravnivanie.mjs';
import {buildTrack} from '../tools/build-track.mjs';
import {loadRech,readJson,readWav} from '../tools/lib.mjs';
import {measure} from '../tools/proverka/honesty.mjs';

const script=readJson('data/demo.script.json'),data=readJson('data/demo.json'),voice=readWav('data/demo-16k.wav').samples,P=priznaki(voice);
const LETTER=/[а-яё]/i,VOWEL=/[аоуэиыеёюя]/i;

test('features: 10 ms steps, loudness relative to the loud level',()=>{
 assert.equal(P.E.length,Math.floor((voice.length-400)/160));
 const sorted=[...P.E].sort((a,b)=>a-b);assert.ok(Math.abs(sorted[sorted.length*.95|0])<1e-6,'p95 is the 0 dB reference');
});

test('the committed demo track is exactly what build-track produces from the script and the audio',()=>{
 const {track}=buildTrack(script,voice,{hints:true,udar:data.udar});
 assert.deepEqual(JSON.parse(JSON.stringify(track)),data);
});

test('aligned letters keep text order, stay near their line and vowels land on voiced audio',()=>{
 let voiced=0,vowels=0;
 for(const l of script.lines){const ch=[...l.text],d=(l.t1-l.t0)/ch.length,L=ch.map((c,i)=>({who:l.who,t0:l.t0+i*d,t1:l.t0+(i+1)*d,ch:c}));
  const out=vyrovnyat(L,l.t0,l.t1,P,{podskazka:false}).filter(x=>LETTER.test(x.ch));
  for(let i=1;i<out.length;i++)assert.ok(out[i].t0>=out[i-1].t1-1e-9,`${l.id}: order`);
  assert.ok(out[0].t0>=l.t0-.15&&out.at(-1).t1<=l.t1+.21,`${l.id}: bounds`);
  for(const x of out)if(VOWEL.test(x.ch)){vowels++;if(P.E[Math.round((x.t0+x.t1)/2/.01)]>-30)voiced++;}}
 assert.ok(voiced/vowels>=.9,`vowel centres on voiced frames: ${(voiced/vowels*100).toFixed(1)}%`);
});

test('without TTS timestamps (text and line bounds only) the track passes the honesty metric on all four tempos',()=>{
 const {track}=buildTrack(script,voice,{hints:false,udar:data.udar}),R=loadRech();
 for(const stil of Object.keys(R.STILI)){const r=measure({data,L:R.bake(track,'L',{storona:1,stil}),A:R.bake(track,'A',{storona:-1,stil}),voice});assert.deepEqual(r.failed,[],stil);}
});

test('phonemes: stress reduces unstressed "o", "-ого" reads as "-ово", m b p share one closed shape',()=>{
 const R=loadRech(),sounds=(word,udar)=>{const d={scene:'t',total:2,repliki:[{id:'x',who:'L',t0:.1,t1:1.9}],energy:new Array(200).fill(120),
  bukvy:[...word].map((c,i)=>['L',.1+i*.1,.2+i*.1,c])};return [...R.bake(d,'L',{udar}).zv].map(z=>z.k);};
 assert.deepEqual(sounds('молоко',{молоко:5}),['mb','ar','l','ar','kg','o']);
 assert.ok(sounds('его',{его:2}).includes('fv'),'г in -ого/-его is pronounced as в');
 assert.equal(sounds('мама',null).filter(k=>k==='mb').length,2);
});
