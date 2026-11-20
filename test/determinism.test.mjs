// Determinism: the pose track is baked ahead of time and a frame is a pure function of time.
// Baking twice (also in two fresh VM contexts) must give byte-identical tracks, and drawing the same time twice must issue
// the same canvas commands. This is what makes seeking, pausing and frame-by-frame video export safe.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadRech,loadScripts,readJson} from '../tools/lib.mjs';
import {mockContext} from '../tools/mock-canvas.mjs';

const data=readJson('data/demo.json');
const digest=B=>{const h=createHash('sha256');for(const k of Object.keys(B.treki).sort())h.update(k).update(Buffer.from(B.treki[k].buffer,B.treki[k].byteOffset,B.treki[k].byteLength));return h.digest('hex');};

test('bake twice in the same context gives identical tracks for every tempo and host',()=>{
 const R=loadRech();
 for(const stil of Object.keys(R.STILI))for(const [w,st] of [['L',1],['A',-1]])
  assert.equal(digest(R.bake(data,w,{storona:st,stil})),digest(R.bake(data,w,{storona:st,stil})),`${stil}/${w}`);
});

test('bake in two fresh VM contexts gives identical tracks (no hidden global state)',()=>{
 const a=loadRech(),b=loadRech();
 for(const stil of Object.keys(a.STILI))assert.equal(digest(a.bake(data,'L',{storona:1,stil})),digest(b.bake(data,'L',{storona:1,stil})),stil);
});

test('the track runs at 120 points per second and covers the whole clip',()=>{
 const B=loadRech().bake(data,'L',{storona:1,stil:'chut'});
 assert.equal(B.HZ,120);
 assert.equal(B.treki.open.length,Math.ceil(data.total*120)+2);
 for(const k of Object.keys(B.treki))assert.equal(B.treki[k].length,B.treki.open.length,k);
});

test('poza(t) is a pure function of t: same input, same pose; between samples it interpolates linearly',()=>{
 const B=loadRech().bake(data,'A',{storona:-1,stil:'bylo'});
 for(const t of [0,3.3,7.77,20.001,41.9])assert.deepEqual(B.poza(t),B.poza(t));
 const i=1000,a=B.poza(i/120),b=B.poza((i+1)/120),m=B.poza((i+.5)/120);
 for(const k of Object.keys(a))assert.ok(Math.abs(m[k]-(a[k]+b[k])/2)<1e-6,k);
});

test('a frame is a pure function of the pose: drawing the same time twice issues the same canvas commands',()=>{
 const ctx=loadScripts(['src/rech.js','src/stili/_kit.js','src/stili/kosoy3.js','src/stili/grani2.js','src/stili/blok.js']),R=ctx.Rech,S=ctx.Stili;
 const L=R.bake(data,'L',{storona:1,stil:'chut'}),A=R.bake(data,'A',{storona:-1,stil:'chut'});
 for(const id of ['kosoy3','grani2','blok'])for(const t of [2.2,9.5,24.75]){
  const c1=mockContext(),c2=mockContext();S.scena(c1,S.SPISOK[id],L.poza(t),A.poza(t));S.scena(c2,S.SPISOK[id],L.poza(t),A.poza(t));
  assert.ok(c1.log.length>200,'the scene draws something');assert.equal(c1.log.join('\n'),c2.log.join('\n'),`${id} @ ${t}`);}
});
