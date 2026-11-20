'use strict';
/* Headless frame renderer for video export and README media: render.html?mode=grid|stage|tempos|closeup|sheet&style=kosoy3&tempo=chut&strip=1&fit=1
 * window.__frame(t) draws the frame for time t and returns nothing; the exporter grabs the canvas. Nothing here reads a clock,
 * so the same t always gives the same pixels. */
(async function(){
 const q=new URLSearchParams(location.search),mode=q.get('mode')||'grid',styleId=q.get('style')||'kosoy3',tempo=q.get('tempo')||'chut',
  withStrip=q.get('strip')==='1',stripH=300,cv=document.getElementById('cv'),c=cv.getContext('2d'),W=Stage.W,H=Stage.H;
 const fit=mode==='grid'&&q.get('fit')==='1',baseH=fit?Stage.gridHeight():H;
 cv.height=baseH+(withStrip?stripH:0);
 const data=await fetch(q.get('data')||'data/demo.json').then(r=>r.json()),S=Stili.SPISOK[styleId];
 if(!S)throw new Error('unknown style '+styleId);
 const B=Stage.bake(data,tempo),list=Stage.styles();
 window.__data={total:data.total,scene:data.scene,styles:list.map(s=>s.id)};
 window.__frame=t=>{
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#15171C';c.fillRect(0,0,cv.width,cv.height);
  const pL=B.L.poza(t),pA=B.A.poza(t);
  if(mode==='stage')Stage.scene(c,S,pL,pA);
  else if(mode==='grid')Stage.grid(c,list,B,t,{height:baseH});
  else if(mode==='tempos')Stage.tempoGrid(c,S,data,t);
  else if(mode==='closeup')Stage.closeup(c,S,pL,pA);
  else if(mode==='sheet')Stage.sheet(c,S,q.get('who')||'L');
  if(withStrip){c.save();c.translate(0,baseH);c.scale(2,2);Stage.track(c,data,B,t,W/2,stripH/2,{span:2.2});c.restore();}
 };
 window.__frame(+(q.get('t')||2.2));window.__ready=true;
})().catch(e=>{console.error(e);window.__error=e.message;window.__ready=true;});
