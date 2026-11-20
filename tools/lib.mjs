// Shared helpers for the Node tools and tests: load the browser scripts in a VM, read audio, write JSON.
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

export const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
export const path=(...p)=>join(ROOT,...p);

/** Run browser scripts (IIFEs that attach to window) in a fresh VM context and return that context.
 *  transform lets a caller patch the source text first (the mutation tests use it). */
export function loadScripts(files,transform=(src,file)=>src,extra={}){
 const ctx={Math,Float32Array,Uint8Array,Int16Array,Object,Set,Map,Array,JSON,console,...extra};ctx.window=ctx;vm.createContext(ctx);
 for(const f of files)vm.runInContext(transform(readFileSync(path(f),'utf8'),f),ctx,{filename:f});
 return ctx;
}
/** A fresh Rech module (src/rech.js), optionally with its source patched. */
export const loadRech=(transform)=>loadScripts(['src/rech.js'],transform?(s=>transform(s)):undefined).Rech;

export const readJson=f=>JSON.parse(readFileSync(path(f),'utf8'));
/** JSON writer that keeps files ASCII-clean for dashes: U+2013/U+2014 are written as \u escapes. */
const DASH=new RegExp("["+String.fromCharCode(0x2013,0x2014)+"]","g");
export function writeJson(f,obj,space){
 const B=String.fromCharCode(92);
 const s=JSON.stringify(obj,null,space).replace(DASH,c=>B+'u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
 writeFileSync(f,s+'\n');
}

/** Decode any audio file to 16 kHz mono Int16 samples with ffmpeg. */
export function decode16k(file){
 const raw=execFileSync('ffmpeg',['-v','error','-i',file,'-ac','1','-ar','16000','-f','s16le','-'],{maxBuffer:1<<28});
 return new Int16Array(raw.buffer,raw.byteOffset,raw.length>>1);
}
/** Read a 16-bit PCM mono WAV without dependencies. */
export function readWav(file){
 const b=readFileSync(path(file));let p=12,fmt=null;
 while(p+8<=b.length){const id=b.toString('ascii',p,p+4),len=b.readUInt32LE(p+4);
  if(id==='fmt ')fmt={ch:b.readUInt16LE(p+10),rate:b.readUInt32LE(p+12),bits:b.readUInt16LE(p+22)};
  if(id==='data'){if(!fmt||fmt.bits!==16||fmt.ch!==1)throw new Error('expected 16-bit mono WAV');const d=b.subarray(p+8,p+8+len),a=new Int16Array(d.length>>1);for(let i=0;i<a.length;i++)a[i]=d.readInt16LE(2*i);return {rate:fmt.rate,samples:a};}
  p+=8+len+(len&1);}
 throw new Error('no data chunk in '+file);
}
