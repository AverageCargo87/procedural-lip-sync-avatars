// Print the mouth honesty report for the demo track: node tools/proverka/honesty-cli.mjs [tempo|all] [--dump dir]
// --dump writes the baked tracks as .f32 files (for cross-checking against the original Python implementation).
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {loadRech,readJson,readWav} from '../lib.mjs';
import {measure,table} from './honesty.mjs';

const args=process.argv.slice(2),Rech=loadRech(),data=readJson('data/demo.json'),voice=readWav('data/demo-16k.wav').samples;
const tempos=!args[0]||args[0]==='all'||args[0].startsWith('--')?Object.keys(Rech.STILI):[args[0]],dump=args.indexOf('--dump');
for(const stil of tempos){
 const L=Rech.bake(data,'L',{storona:1,stil}),A=Rech.bake(data,'A',{storona:-1,stil}),r=measure({data,L,A,voice});
 console.log(`\n${stil} (${Rech.STILI[stil].imya}): ${r.passed}/${r.total} checks passed\n${table(r)}`);
 if(dump>=0){const d=join(args[dump+1],stil);mkdirSync(d,{recursive:true});
  for(const [w,B] of [['L',L],['A',A]]){for(const m of ['open','wide','round'])writeFileSync(join(d,`demo-${w}-${m}.f32`),Buffer.from(B.treki[m].buffer));writeFileSync(join(d,`demo-${w}-zv.json`),JSON.stringify(B.zv));}}
}
