// A recording stand-in for CanvasRenderingContext2D, so drawing code can be tested in Node without a browser.
// Every method call and property assignment is appended to ctx.log as a compact string; numbers are rounded to 1e-6
// so two identical renders produce identical logs. getTransform returns a real matrix (the visibility check uses it).
// Methods live on a prototype, so code that overrides c.fill and later deletes the override (Stili.schet) works as in a browser.
const r=v=>typeof v==='number'?Math.round(v*1e6)/1e6:typeof v==='object'&&v?'{obj}':v;
const METHODS=['beginPath','moveTo','lineTo','bezierCurveTo','quadraticCurveTo','arc','arcTo','ellipse','rect','roundRect','closePath',
 'fill','stroke','fillRect','strokeRect','clearRect','clip','fillText','strokeText','drawImage','setLineDash'];
const PROPS=['fillStyle','strokeStyle','lineWidth','lineCap','lineJoin','globalAlpha','font','textAlign','textBaseline','imageSmoothingQuality','globalCompositeOperation','miterLimit','lineDashOffset'];

class Matrix{constructor(a=1,b=0,c=0,d=1,e=0,f=0){Object.assign(this,{a,b,c,d,e,f});}
 mul(m){return new Matrix(this.a*m.a+this.c*m.b,this.b*m.a+this.d*m.b,this.a*m.c+this.c*m.d,this.b*m.c+this.d*m.d,this.a*m.e+this.c*m.f+this.e,this.b*m.e+this.d*m.f+this.f);}}

export function mockContext({record=true}={}){
 const log=[],stack=[];let M=new Matrix();const state={};
 const proto={
  save(){stack.push({M,state:{...state}});record&&log.push('save');},
  restore(){const s=stack.pop();if(s){M=s.M;Object.assign(state,s.state);}record&&log.push('restore');},
  translate(x,y){M=M.mul(new Matrix(1,0,0,1,x,y));record&&log.push(`translate ${r(x)} ${r(y)}`);},
  scale(x,y){M=M.mul(new Matrix(x,0,0,y,0,0));record&&log.push(`scale ${r(x)} ${r(y)}`);},
  rotate(t){const c=Math.cos(t),s=Math.sin(t);M=M.mul(new Matrix(c,s,-s,c,0,0));record&&log.push(`rotate ${r(t)}`);},
  transform(a,b,c,d,e,f){M=M.mul(new Matrix(a,b,c,d,e,f));record&&log.push(`transform ${[a,b,c,d,e,f].map(r).join(' ')}`);},
  setTransform(a,b,c,d,e,f){M=typeof a==='object'?new Matrix(a.a,a.b,a.c,a.d,a.e,a.f):new Matrix(a,b,c,d,e,f);record&&log.push('setTransform '+[M.a,M.b,M.c,M.d,M.e,M.f].map(r).join(' '));},
  resetTransform(){M=new Matrix();},
  getTransform(){return new Matrix(M.a,M.b,M.c,M.d,M.e,M.f);},
  createLinearGradient(...a){record&&log.push('linearGradient '+a.map(r).join(' '));return {addColorStop:(o,c)=>{record&&log.push(`stop ${r(o)} ${c}`);}};},
  createRadialGradient(...a){record&&log.push('radialGradient '+a.map(r).join(' '));return {addColorStop:(o,c)=>{record&&log.push(`stop ${r(o)} ${c}`);}};},
  measureText(t){return {width:String(t).length*10};},
  getImageData(){return {data:new Uint8ClampedArray(4)};},
  get canvas(){return {width:1920,height:1080};}};
 for(const m of METHODS)proto[m]=(...a)=>{record&&log.push(m+' '+a.map(r).join(' '));};
 const ctx=Object.create(proto);ctx.log=log;
 for(const p of PROPS)Object.defineProperty(ctx,p,{get:()=>state[p],set:v=>{state[p]=v;record&&log.push(`${p}=${r(v)}`);},enumerable:true});
 return ctx;
}
