// The first edition (src/personazh.js): eight looks in four pairs, one shared mouth, drawn as a pure function of the pose.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadScripts,readJson} from '../tools/lib.mjs';
import {mockContext} from '../tools/mock-canvas.mjs';

const {Rech,Personazh}=loadScripts(['src/rech.js','src/personazh.js']),data=readJson('data/demo.json');

test('eight looks in four pairs, every one drawable over the whole clip',()=>{
 const looks=Object.keys(Personazh.LOOKS);assert.equal(looks.length,8);
 const L=Rech.bake(data,'L',{storona:1}),A=Rech.bake(data,'A',{storona:-1}),c=mockContext({record:false});
 for(const k of looks){const B=Personazh.LOOKS[k].storona>0?L:A;for(let t=0;t<data.total;t+=.5){Personazh.narisovat(c,Personazh.LOOKS[k],B.poza(t),560,610,1.5);Personazh.narisovatRuki(c,Personazh.LOOKS[k],B.poza(t),560,610,1.5);}}
});

test('the same pose gives the same drawing; a closed mouth draws differently',()=>{
 const P=Personazh.LOOKS.lena,draw=p=>{const c=mockContext();Personazh.narisovat(c,P,p,560,610,1.5);return c.log;};
 const a=draw({open:.6,round:.2}),b=draw({open:.6,round:.2}),closed=draw({open:0,press:1});
 assert.deepEqual(a,b);
 assert.notDeepEqual(a,closed);
});
