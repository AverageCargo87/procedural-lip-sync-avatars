// Style contract: 12 styles in 3 groups, each draws a full scene for any pose without throwing, and every mouth goes
// through the shared Kit.rot (so the mouth metric and the visibility check apply to all of them). Runs on a recording
// mock canvas, no browser needed.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';
import {loadScripts,readJson,path} from '../tools/lib.mjs';
import {mockContext} from '../tools/mock-canvas.mjs';

const files=readdirSync(path('src/stili')).filter(f=>f.endsWith('.js')&&f!=='_kit.js').map(f=>'src/stili/'+f);
const ctx=loadScripts(['src/rech.js','src/stili/_kit.js',...files,'src/stage.js']),{Rech,Stili,Kit,Stage}=ctx,data=readJson('data/demo.json');

test('12 styles in 3 groups of 4',()=>{
 const list=Stage.styles();assert.equal(list.length,12);
 const by={};for(const S of list)(by[S.gruppa]??=[]).push(S.nomer);
 assert.deepEqual(Object.keys(by).sort(),['geo','geo2','geo3']);
 assert.deepEqual(by.geo,[7,8,9,10]);assert.deepEqual(by.geo2,[20,21,22,23]);assert.deepEqual(by.geo3,[24,25,26,27]);
});

test('every style follows the contract: fon, L and A with x, y, s, ramka and telo',()=>{
 for(const S of Stage.styles()){assert.equal(typeof S.fon,'function',S.id);
  for(const w of ['L','A']){const G=S[w];for(const k of ['x','y','s'])assert.equal(typeof G[k],'number',`${S.id}.${w}.${k}`);assert.equal(G.ramka.length,4);assert.equal(typeof G.telo,'function');}}
});

test('every style draws the whole clip at 4 fps for every tempo without throwing, and the mouth always goes through Kit.rot',()=>{
 const c=mockContext({record:false});
 for(const T of Stage.TEMPOS){const B=Stage.bake(data,T.id);
  for(const S of Stage.styles())for(let t=0;t<data.total;t+=.25){Stili.zapisRta=[];Stili.scena(c,S,B.L.poza(t),B.A.poza(t));assert.equal(Stili.zapisRta.length,2,`${S.id} draws two mouths @${t}`);}}
 Stili.zapisRta=null;
});

test('extreme poses (head turn, nod, lean, both hands up, blink, wide mouth) draw for every style',()=>{
 const c=mockContext({record:false}),poses=[{yaw:.5,pitch:1,roll:.1,lean:1},{yaw:-.5,pitch:-1,roll:-.1,lean:-1},{hLx:-30,hLy:-110,hRx:30,hRy:-110,hLo:1,hRo:1},{blink:1,brow:1,open:1.2,wide:1,round:1,teeth:1,bite:1,press:1,tongue:1}];
 for(const S of Stage.styles())for(const p of poses)assert.doesNotThrow(()=>Stili.scena(c,S,p,p),S.id);
});

test('shapes per host: simple styles stay small, detailed adults are the heavy ones',()=>{
 const c=mockContext({record:false}),count=S=>Math.round((Stili.schet(c,S.L,{})+Stili.schet(c,S.A,{}))/2),n={};
 for(const S of Stage.styles())n[S.id]=count(S);
 for(const id of ['kosoy','trapecii','grani','blok','kosoy3','trapecii3','grani3','blok3'])assert.ok(n[id]<=45,`${id}: ${n[id]}`);
 for(const id of ['kosoy2','trapecii2','grani2','blok2'])assert.ok(n[id]>=60,`${id}: ${n[id]}`);
});

test('the mouth contour is parametric: open, round and wide change its geometry continuously',()=>{
 const path=p=>{const c=mockContext();Kit.rot(c,Object.assign({},Stili.POZA,p),{x:0,y:0});return c.log.filter(l=>l.startsWith('bezierCurveTo')).join('|');};
 const a=path({open:.5}),b=path({open:.5001}),d=path({open:.5,round:.5});
 assert.notEqual(a,b,'a tiny change in open moves the contour');assert.notEqual(a,d);
 // closed "m": no cavity, teeth or tongue fill, only the lip line
 const c=mockContext();Kit.rot(c,Object.assign({},Stili.POZA,{open:0,press:1,teeth:.3}),{x:0,y:0});
 assert.ok(!c.log.some(l=>l.startsWith('clip')),'no cavity is drawn when the mouth is closed');
 assert.ok(Rech.F.mb[0]===0&&Rech.F.mb[5]===1);
});
