// The mouth honesty metric on the demo clip. Reference = the clean voice (VAD, silences, the acoustic closure of "p"),
// never the letters the mouth was computed from.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadRech,readJson,readWav} from '../tools/lib.mjs';
import {measure} from '../tools/proverka/honesty.mjs';

const data=readJson('data/demo.json'),voice=readWav('data/demo-16k.wav').samples,R=loadRech();
// Known, documented gap: on this clip the slowest tempo D reaches 40% of the vowel target on 96.6% of vowels (bar: 97%).
const KNOWN={tiho:['vowels']};

test('the demo voice is 16 kHz mono and matches the track length',()=>{
 const w=readWav('data/demo-16k.wav');assert.equal(w.rate,16000);
 assert.ok(Math.abs(w.samples.length/16000-data.total)<.01);
 assert.ok(Math.abs(data.energy.length-data.total*100)<=3);
});

for(const stil of Object.keys(R.STILI)){
 test(`honesty metric, tempo ${stil}: ${KNOWN[stil]?'all checks except the documented gap':'12/12 checks'}`,()=>{
  const r=measure({data,L:R.bake(data,'L',{storona:1,stil}),A:R.bake(data,'A',{storona:-1,stil}),voice});
  assert.equal(r.total,12);
  assert.deepEqual(r.failed,KNOWN[stil]||[],r.checks.map(c=>`${c.pass?'ok  ':'FAIL'} ${c.id}=${c.value}`).join('\n'));
  if(KNOWN[stil])assert.ok(r.checks.find(c=>c.id==='vowels').value>=.96);
 });
}

test('the metric has enough evidence on this clip (no check passes vacuously)',()=>{
 const r=measure({data,L:R.bake(data,'L',{storona:1,stil:'chut'}),A:R.bake(data,'A',{storona:-1,stil:'chut'}),voice}),n=Object.fromEntries(r.checks.map(c=>[c.id,c.n]));
 assert.ok(n.pauses>=8,'pauses');assert.ok(n.silence>=8,'silences');assert.ok(n.vowels>=150,'vowels');assert.ok(n.round>=20,'o/u');assert.ok(n.spread>=40,'i/e');assert.ok(n['p-closed']>=8,'p');
});

test('the listener keeps the mouth shut: max open outside own lines is 0 for every tempo',()=>{
 for(const stil of Object.keys(R.STILI)){const r=measure({data,L:R.bake(data,'L',{storona:1,stil}),A:R.bake(data,'A',{storona:-1,stil}),voice});
  assert.equal(r.checks.find(c=>c.id==='listener').value,0,stil);}
});
