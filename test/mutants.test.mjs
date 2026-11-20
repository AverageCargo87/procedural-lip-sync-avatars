// Mutation tests: deliberately broken animations. Each mutant must fail at least one of the checks it targets,
// on the original tempo A and on the default tempo B. The one documented survivor must keep surviving until the metric
// learns to see it, so the README never claims more than the metric does.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readJson,readWav} from '../tools/lib.mjs';
import {MUTANTS,runMutant} from '../tools/proverka/mutants.mjs';

const data=readJson('data/demo.json'),script=readJson('data/demo.script.json'),voice=readWav('data/demo-16k.wav').samples;

for(const tempo of ['bylo','chut'])for(const M of MUTANTS.filter(m=>m.expect.length)){
 test(`[${tempo}] ${M.kind} mutant "${M.id}" is caught (${M.what})`,()=>{
  const r=runMutant(M,{data,script,voice,tempo});
  const hit=M.expect.filter(e=>r.failed.includes(e));
  assert.ok(hit.length>0,`expected one of ${M.expect.join(', ')} to fail; failed: ${r.failed.join(', ')||'none'}`);
 });
}

test('documented survivor: disabling silence-closing is invisible to the metric on this clip',()=>{
 const survivors=MUTANTS.filter(m=>!m.expect.length);
 assert.equal(survivors.length,1);
 for(const M of survivors){assert.ok(M.survivor,'a survivor must explain itself');const r=runMutant(M,{data,script,voice});assert.deepEqual(r.failed,[]);}
});

test('every source mutant still finds its anchor in rech.js (a refactor cannot silently disable a mutant)',()=>{
 for(const M of MUTANTS.filter(m=>m.src))assert.doesNotThrow(()=>runMutant(M,{data,script,voice}),M.id);
});
