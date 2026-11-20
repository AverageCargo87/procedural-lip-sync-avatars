'use strict';
/* Shared kit for drawing styles. A style is a file stili/<id>.js that calls Stili.dobavit({...}).
 * Mouth, pill eye, arm and head turn are shared: a style changes the character's shape while the face still follows the pose track from rech.js.
 * 
 * Style contract:
 *  Stili.dobavit({id,nomer,imya,
 *   fon(c,W,H){},                 background of the whole 1920x1080 scene
 *   stol(c,W,H){},                table between bodies and arms; optional; rukiZaStolom:true puts arms behind the table, hidden at rest
 *   L:{x,y,s,ramka:[x,y,w,h],telo(c,p){},ruki(c,p){}},   Lena, left
 *   A:{...}});                                            Artem, right
 *  telo and ruki draw in character coordinates: the origin is the base of the neck, scale s, breathing and lean are already applied.
 *  ramka is the face close-up box in those coordinates (for the mouth sheet). ruki is optional.
 * 
 * Pose parameters p: mouth open wide round teeth tongue press bite smile; head yaw (+-.5) pitch (+-1) roll (rad);
 *  gaze gx gy (+-.6); blink 0-1; brow, browL; body lean, bob, breath; hair; hands hLx hLy hRx hRy, palm hLo hRo. */
(function(root){
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const POZA={open:0,wide:0,round:0,teeth:.4,tongue:0,press:0,bite:0,smile:.3,yaw:0,pitch:0,roll:0,gx:0,gy:0,blink:0,brow:0,browL:0,lean:0,bob:0,breath:0,hair:0,hLx:0,hLy:0,hRx:0,hRy:0,hLo:0,hRo:0};

/** Path of a rounded rectangle around a centre. */
function plashka(c,x,y,w,h,r){c.beginPath();c.roundRect(x-w/2,y-h/2,w,h,r);}
/** Fill a rounded rectangle in one call. */
function zal(c,cvet,x,y,w,h,r){c.fillStyle=cvet;plashka(c,x,y,w,h,r);c.fill();}
/** Arch head: a semicircle on top, a rounded bottom. (x,y) is the centre of the top arc. */
function arka(c,x,y,w,h,rNiz){const r=w/2;c.beginPath();c.moveTo(x-r,y);c.arc(x,y,r,Math.PI,0);c.lineTo(x+r,y+h-rNiz);c.quadraticCurveTo(x+r,y+h,x+r-rNiz,y+h);c.lineTo(x-r+rNiz,y+h);c.quadraticCurveTo(x-r,y+h,x-r,y+h-rNiz);c.closePath();}
/** Polygon with rounded corners: pts [[x,y],...], r is the corner radius; a third number [x,y,r] sets the radius of that corner. */
function mnogo(c,pts,r){const n=pts.length,R=p=>p[2]??r;c.beginPath();for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;if(i===0)c.moveTo(mx,my);else c.arcTo(a[0],a[1],mx,my,R(a));}const a=pts[0],b=pts[1];c.arcTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2,R(a));c.closePath();}

/** Feature offsets for head turn: a flat face behaves like a 3D one. */
function sdvig(p,k=1){const yw=p.yaw;return {fe:yw*24*k,fn:yw*36*k,fm:yw*28*k,py:p.pitch*13};}

/** Mouth. The shape is computed only here, with the same numbers as the first version, so the mouth measurements stay valid.
 *  o: x,y centre; k scale; shir width; cvet mouth cavity; yazyk; zuby teeth colour; kontur outline colour; asim -1...1 mouth shifted sideways with that corner higher;
 *  maxH height limit; tenPress shadow under the lip on m, b, p; ugolki constant corner lift in px, so the character keeps smiling while talking; zubyOt mouth height at which teeth appear, below it a dark slit without a grimace; vys height squash. */
function rot(c,p,o){
 const Z=root.Stili;if(Z.zapisRta)Z.zapisRta.push({m:c.getTransform(),p,o});if(Z.bezRta)return;
 const k=o.k||1,asim=o.asim||0,hw=50*(o.shir||1)*(1+.30*p.wide-.42*p.round-.10*p.press),H=Math.min((p.open*60+p.bite*5)*(o.vys||1),o.maxH||1e9),u=H*.32,d=H*.68,lift=(-p.smile*13*(o.ulybka??1)-(o.ugolki||0)*(1-.85*clamp(p.round))+p.round*1.5)*(1-.75*p.bite),
  q=lerp(.62,.42,p.round),r=lerp(.30,.92,clamp(p.round+p.open*.35)),cy=p.open*3,mx=asim*hw*.32;
 const Lx=mx-hw,Rx=mx+hw,CL=cy+lift*(1-asim*.8),CR=cy+lift*(1+asim*.8),Ty=cy-u,By=cy+d,hh=u+d;
 const path=()=>{c.beginPath();c.moveTo(Lx,CL);
  c.bezierCurveTo(Lx,CL-u*r-.4,mx-hw*q,Ty,mx,Ty);c.bezierCurveTo(mx+hw*q,Ty,Rx,CR-u*r-.4,Rx,CR);
  c.bezierCurveTo(Rx,CR+d*r+.4,mx+hw*q,By,mx,By);c.bezierCurveTo(mx-hw*q,By,Lx,CL+d*r+.4,Lx,CL);c.closePath();};
 c.save();c.translate(o.x,o.y);c.scale(k,k);
 const cvet=o.cvet||'#6B1730';
 if(hh>.6){c.save();path();c.fillStyle=cvet;c.fill();c.clip();
  if(o.yazyk!==false){const ty=lerp(By+7,lerp(By-3,Ty+hh*.42,p.tongue),clamp(hh/14));c.fillStyle=o.yazyk||'#F1647E';c.beginPath();c.ellipse(mx,ty+16,hw*.74,19+p.tongue*5,0,0,6.3);c.fill();}
  const zk=o.zubyOt?clamp((hh-o.zubyOt)/9):1;if(o.zuby!==false&&zk>0){const th=(Math.min(clamp(p.teeth)*hh,20)+1.5)*zk;c.fillStyle=o.zuby||'#fff';c.beginPath();c.roundRect(mx-hw-4,Ty-3,2*hw+8,th+3,[0,0,8,8]);c.fill();}
  c.restore();}
 c.lineJoin=c.lineCap='round';c.strokeStyle=o.kontur||cvet;c.lineWidth=lerp(o.liniya||6,4,clamp(hh/10))+p.press*1.4;path();c.stroke();
 // on v, f the lower lip rests on the upper teeth
 if(p.bite>.02){c.globalAlpha=p.bite;c.lineWidth=11;c.beginPath();c.moveTo(mx-hw*.8,By+2);c.quadraticCurveTo(mx,By+8,mx+hw*.8,By+2);c.stroke();c.globalAlpha=1;}
 // on m, b, p the lips are pressed: a shadow under them
 if(o.tenPress&&p.press>.02){c.globalAlpha=p.press*.55;c.strokeStyle=o.tenPress;c.lineWidth=5;c.beginPath();c.moveTo(mx-15,By+11);c.quadraticCurveTo(mx,By+15,mx+15,By+11);c.stroke();c.globalAlpha=1;}
 c.restore();
}

/** Pill eye with a straight lid cut: an elongated capsule, the pupil a smaller capsule, the lid a straight line.
 *  o: x,y centre; w,h size; zw,zh pupil; cvet pupil colour; belok; veko 0-1 how much is closed from the top; naklon lid slant, rad; side -+1;
 *  liniya closed-eye colour; tol thickness. */
function glaz(c,p,o){
 const {x,y,w,h}=o,bl=clamp(p.blink),z=clamp(bl/.8),side=o.side||1,dn=Math.tan((o.naklon||0)*side)*w,v=o.veko||0;
 const sm=y+h*.16,top=lerp(y-h/2-4+(h+8)*v,sm,z),niz=lerp(y+h/2+4,sm,z*z);
 if(z<.98){c.save();c.beginPath();c.moveTo(x-w,top-dn);c.lineTo(x+w,top+dn);c.lineTo(x+w,niz);c.lineTo(x-w,niz);c.closePath();c.clip();
  zal(c,o.belok||'#fff',x,y,w,h,w/2);
  const zw=o.zw||w*.46,zh=o.zh||h*.5;zal(c,o.cvet||'#2E2230',x+p.gx*w*.26,y+h*.06+p.gy*h*.18,zw,zh,zw/2);c.restore();}
 const a=clamp((bl-.3)/.35);if(a>0){c.globalAlpha=a;c.strokeStyle=o.liniya||o.cvet||'#2E2230';c.lineCap='round';c.lineWidth=o.tol||6;c.beginPath();c.moveTo(x-w*.55,sm);c.lineTo(x+w*.55,sm);c.stroke();c.globalAlpha=1;}
}

/** Egg: widest line at y, top hv and bottom hn of different heights; kv, kn 0.56 is an ellipse, near 0.9 a rounded square. */
function yajco(c,x,y,r,hv,hn,kv=.56,kn=.56){c.beginPath();c.moveTo(x,y-hv);c.bezierCurveTo(x+r*kv,y-hv,x+r,y-hv*kv,x+r,y);c.bezierCurveTo(x+r,y+hn*kn,x+r*kn,y+hn,x,y+hn);c.bezierCurveTo(x-r*kn,y+hn,x-r,y+hn*kn,x-r,y);c.bezierCurveTo(x-r,y-hv*kv,x-r*kv,y-hv,x,y-hv);c.closePath();}

/** Closed eye: a soft upward arc, not a dash. */
function dugaGlaza(c,p,x,y,dl,cvet,tol){const a=clamp((clamp(p.blink)-.3)/.35);if(a<=0)return;c.globalAlpha=a;c.strokeStyle=cvet;c.lineCap='round';c.lineWidth=tol;c.beginPath();c.moveTo(x-dl,y+dl*.22);c.quadraticCurveTo(x,y-dl*.34,x+dl,y+dl*.22);c.stroke();c.globalAlpha=1;}

/** Friendly eye: the pupil almost fills the white, the lid covers it from the top, the cheek props it from below. One highlight, on the same side in both eyes.
 *  o: x,y centre; w,h; cvet; zk pupil share; veko 0-1; nizh 0-1 cheek smile; belok; tol; pil pill instead of oval; vekoLin upper lid line colour, vekoTol thickness. */
function glazMil(c,p,o){
 const {x,y,w,h}=o,rx=w/2,ry=h/2,z=clamp(clamp(p.blink)/.8),sm=y+ry*.25,top=lerp(y-ry-2+2*ry*(o.veko||0),sm,z),niz=lerp(y+ry+2,sm,z*z),bu=(o.nizh||0)*h*(1-z);
 if(z<.98){const zk=o.zk||.74,zw=w*zk,zh=h*Math.min(.86,zk+.08),px=x+p.gx*(rx-zw/2+w*.04)*1.3,py=y+h*.04+p.gy*h*.1;
  c.save();c.beginPath();c.moveTo(x-w,top);c.lineTo(x+w,top);c.lineTo(x+w,niz);c.quadraticCurveTo(x,niz-bu*2,x-w,niz);c.closePath();c.clip();
  c.fillStyle=o.belok||'#fff';c.beginPath();if(o.pil)c.roundRect(x-rx,y-ry,w,h,rx);else c.ellipse(x,y,rx,ry,0,0,6.3);c.fill();
  c.fillStyle=o.cvet;c.beginPath();if(o.pil)c.roundRect(px-zw/2,py-zh/2,zw,zh,zw/2);else c.ellipse(px,py,zw/2,zh/2,0,0,6.3);c.fill();
  c.fillStyle='#fff';c.beginPath();c.ellipse(px-zw*.2,py-zh*.2,zw*.2,zh*.19,0,0,6.3);c.fill();c.restore();
  if(o.vekoLin){c.globalAlpha=1-z;c.strokeStyle=o.vekoLin;c.lineCap='round';c.lineWidth=o.vekoTol||5;c.beginPath();c.moveTo(x-rx*.98,top+ry*.2);c.quadraticCurveTo(x,top-ry*.24,x+rx*.98,top+ry*.2);c.stroke();c.globalAlpha=1;}}
 dugaGlaza(c,p,x,sm,rx*.86,o.cvet,o.tol||6);
}
/** Bead eye: a dark oval with a highlight, no white. o: x,y; w,h; cvet; tol. */
function busina(c,p,o){
 const {x,y,w,h}=o,z=clamp(clamp(p.blink)/.8),hh=lerp(h,w*.3,z),gx=p.gx*w*.26,gy=p.gy*h*.14;
 if(z<.98){c.fillStyle=o.cvet;c.beginPath();c.ellipse(x+gx,y+gy,w/2,hh/2,0,0,6.3);c.fill();
  if(z<.5){c.fillStyle='#fff';c.globalAlpha=1-z*2;c.beginPath();c.arc(x+gx-w*.17,y+gy-h*.2,w*.17,0,6.3);c.fill();c.globalAlpha=1;}}
 dugaGlaza(c,p,x,y,w*.56,o.cvet,o.tol||6);
}
/** Arched brow, thin and high: an open face. o: x,y; dl; tol; cvet; side -+1; izgib; naklon in px, plus raises the inner end; hod. */
function brovDuga(c,p,o){
 const s=o.side||1,raise=(p.brow+(s<0?p.browL:0))*(o.hod??9),y=o.y-raise,dl=o.dl||40,g=(o.izgib??9)+p.brow*3,n=o.naklon||0;
 c.strokeStyle=o.cvet;c.lineCap='round';c.lineWidth=o.tol||7;c.beginPath();c.moveTo(o.x-s*dl/2,y-n);c.quadraticCurveTo(o.x,y-g*2,o.x+s*dl/2,y+n);c.stroke();
}
/** The whole face from settings: cheeks, mouth, nose, eyes, brows. One function for all friendly versions; only the numbers differ. */
function lico(c,p,o){
 const {fe,fn,fm,py}=sdvig(p,o.sdvig||1),ey=o.glY+py*.8;
 if(o.shcheki){c.fillStyle=o.shcheki;for(const s of [-1,1]){c.beginPath();c.ellipse(s*o.shX+fe*.7,o.shY+py*.7,o.shRx,o.shRy,0,0,6.3);c.fill();}}
 rot(c,p,{x:fm+(o.rotX||0),y:o.rotY+py*1.05,k:o.rotK,cvet:o.rot,yazyk:o.yazyk,zuby:o.zuby,ugolki:o.ugolki,ulybka:o.ulybka,zubyOt:o.zubyOt,vys:o.vys,asim:o.asim,liniya:o.rotLin,shir:o.rotShir,tenPress:o.tenPress,kontur:o.rotKontur,maxH:o.rotMaxH});
 if(o.nos)zal(c,o.nos,(o.rotX||0)*.6+fn,o.nosY+py,o.nosW,o.nosH,o.nosH/2);
 for(const s of [-1,1]){const q={x:s*o.glX+fe,y:ey,w:o.glW,h:o.glH,cvet:o.zrachok,zk:o.zk,veko:o.veko,nizh:o.nizh,tol:o.glTol,pil:o.pil,vekoLin:o.vekoLin,vekoTol:o.vekoTol};(o.bezBelka?busina:glazMil)(c,p,q);}
 if(o.brovi)for(const s of [-1,1])brovDuga(c,p,{x:s*(o.brX||o.glX)+fe,y:ey-o.brY,dl:o.brDl,tol:o.brTol,cvet:o.brovi,side:s,izgib:o.brIzg,naklon:o.brNak});
}

/** Brow: a thick rounded stroke. o: x,y centre; dl length; tol; cvet; side -+1; naklon, rad: plus lowers the inner end. */
function brov(c,p,o){
 const s=o.side||1,raise=(p.brow+(s<0?p.browL:0))*(o.hod??13),y=o.y-raise,dl=o.dl||46,a=(o.naklon||0)*s-p.brow*.1*s;
 const dx=Math.cos(a)*dl/2,dy=Math.sin(a)*dl/2;c.strokeStyle=o.cvet;c.lineCap='round';c.lineWidth=o.tol||10;c.beginPath();c.moveTo(o.x-dx,y-dy);c.lineTo(o.x+dx,y+dy);c.stroke();
}

/** Arm: shoulder and hand are given, the elbow comes from bone lengths and bends outward and down. A tube of constant width, the hand a circle.
 *  o: a,b bones; tol; cvet; kist colour; r hand radius (0 = no hand); bezRuki hand only; lomanaya angled elbow instead of a curve;
 *  palec mitten hand with a thumb, otkr 0-1 opening; manzheta cuff colour; kistKv corner radius of a square hand. */
function ruka(c,sx,sy,hx,hy,side,o,otkr=0){
 const a=o.a,b=o.b,dl=Math.hypot(hx-sx,hy-sy)||1,d=Math.min(a+b-1,dl),ux=(hx-sx)/dl,uy=(hy-sy)/dl,ca=clamp((a*a+d*d-b*b)/(2*a*d),-1,1),h=a*Math.sqrt(1-ca*ca);
 let nx=-uy,ny=ux;if(nx*side<0){nx=-nx;ny=-ny;}
 const ex=sx+ux*a*ca+nx*h,ey=sy+uy*a*ca+ny*h;
 if(!o.bezRuki){c.lineCap='round';c.lineJoin='round';c.strokeStyle=o.cvet;c.lineWidth=o.tol;c.beginPath();c.moveTo(sx,sy);if(o.lomanaya){c.lineTo(ex,ey);c.lineTo(hx,hy);}else c.quadraticCurveTo(ex,ey,hx,hy);c.stroke();}
 if(o.r!==0){const r=o.r||o.tol*.72;
  if(o.palec){const ang=Math.atan2(hy-ey,hx-ex);c.save();c.translate(hx,hy);c.rotate(ang);
   if(o.manzheta){c.fillStyle=o.manzheta;c.beginPath();c.roundRect(-r*.55,-o.tol/2-1,r*.75,o.tol+2,r*.22);c.fill();}
   c.fillStyle=o.kist;c.beginPath();c.ellipse(r*.72,0,r*1.04,r*.86,0,0,6.3);c.fill();
   const t=lerp(.5,1.05,clamp(otkr));c.lineCap='round';c.strokeStyle=o.kist;c.lineWidth=r*.6;c.beginPath();c.moveTo(r*.3,side*r*.46);c.lineTo(r*.3+Math.cos(t)*r*.82,side*(r*.6+Math.sin(t)*r*.56));c.stroke();c.restore();}
  else if(o.kistKv){c.fillStyle=o.kist;plashka(c,hx,hy,2*r,2*r,o.kistKv);c.fill();}
  else{c.fillStyle=o.kist;c.beginPath();c.arc(hx,hy,r,0,6.3);c.fill();}}
}

/** Both arms: rest on the table, a gesture is an offset from rest. o: tw half shoulder width; sy shoulder height; restX,restY hands at rest; k gesture scale; vnutr how far the hand moves toward the chest per unit of lift, otherwise the arm sticks out to the side; the rest goes to ruka. */
function dveRuki(c,p,o){
 const ves=y=>1-clamp(-y/40),s=o.s||1.5,dx=p.lean*22/s,dy=(p.bob*6-p.breath*2.2)/s,k=o.k||1,rx=o.restX,ry=o.restY,vn=o.vnutr||0;
 ruka(c,-o.tw,o.sy,-rx-p.hLy*k*vn+p.hLx*k-dx*ves(p.hLy),ry+p.hLy*k-dy*ves(p.hLy),-1,o,p.hLo);
 ruka(c,o.tw,o.sy,rx+p.hRy*k*vn+p.hRx*k-dx*ves(p.hRy),ry+p.hRy*k-dy*ves(p.hRy),1,o,p.hRo);
}

/** Cone: round start at a, flat cut at b. */
function srez(c,ax,ay,ra,bx,by,rb){const u=Math.atan2(by-ay,bx-ax),q=1.5708;c.moveTo(ax+Math.cos(u+q)*ra,ay+Math.sin(u+q)*ra);c.arc(ax,ay,ra,u+q,u-q);c.lineTo(bx+Math.cos(u-q)*rb,by+Math.sin(u-q)*rb);c.lineTo(bx+Math.cos(u+q)*rb,by+Math.sin(u+q)*rb);c.closePath();}
/** Cone with round ends: a finger segment. */
function kapsula(c,ax,ay,ra,bx,by,rb){const u=Math.atan2(by-ay,bx-ax),q=1.5708;c.moveTo(ax+Math.cos(u+q)*ra,ay+Math.sin(u+q)*ra);c.arc(ax,ay,ra,u+q,u-q);c.arc(bx,by,rb,u-q,u+q);c.closePath();}

/** Adult hand: wrist at the origin, fingers along +x, thumb toward +y, t 0-1 opening. A palm and two segments per finger, so a finger tapers and bends slightly.
 *  o: D hand length; kozha, kozhaT colour and the line between fingers; kistZal(c) fill instead of kozha; obv [colour,width] outline. */
function kistV(c,o,t,m){
 const k=o.D/100,N=[];c.save();c.scale(k,k*m*(o.uz||1));
 const pal=(x,y,a,L,r,zag)=>{const x1=x+Math.cos(a)*L*.54,y1=y+Math.sin(a)*L*.54,a2=a+zag,x2=x1+Math.cos(a2)*L*.46,y2=y1+Math.sin(a2)*L*.46;N.push([x,y,r,x1,y1,r*.93],[x1,y1,r*.93,x2,y2,r*.82]);};
 const F=[[17.5,46,.07,41,6.5],[6,48.5,.025,46,6.6],[-6,47,-.02,42.5,6.4],[-17,43,-.075,33,5.5]],L0=lerp(.8,1,t);
 for(const [y,x,a,l,r] of F)pal(x,y,a*lerp(.2,1,t),l*L0,r,-y*.011*(1-t*.7));
 const b=lerp(.46,.68,t);pal(9,15,b,40,11,-.26);
 const lad=()=>{c.moveTo(-8,-15);c.bezierCurveTo(8,-17,26,-24,42,-24.5);c.quadraticCurveTo(50,-22,50,-12);c.lineTo(50,18);c.quadraticCurveTo(48,24.5,40,24.5);c.bezierCurveTo(26,25,8,20,-8,15);c.closePath();};
 c.lineJoin=c.lineCap='round';
 if(o.ten){c.fillStyle=o.ten;c.beginPath();lad();for(const n of N)kapsula(c,...n);c.fill();c.restore();return;}
 if(o.obv){c.strokeStyle=o.obv[0];c.lineWidth=o.obv[1]*2/k;c.beginPath();lad();c.stroke();for(const n of N){c.beginPath();kapsula(c,...n);c.stroke();}}
 c.fillStyle=o.kistZal?o.kistZal(c):o.kozha;c.beginPath();lad();for(const n of N)kapsula(c,...n);c.fill();
 c.strokeStyle=o.kozhaT;c.lineWidth=2.1/k;c.beginPath();const d=lerp(.8,.3,t);for(let i=0;i<3;i++){const [y1,x1,,l1]=F[i],[y2,x2,,l2]=F[i+1],y=(y1+y2)/2,x=(x1+x2)/2;c.moveTo(x-2,y);c.lineTo(x+Math.min(l1,l2)*L0*d,y*(1+d*.16*t));}
 c.moveTo(13,7);c.quadraticCurveTo(26,3,37,11);c.stroke();
 c.restore();
}

/** Adult arm: a wide sleeve with straight sides; the elbow nearly stays put and the forearm swings around it. Forearm length changes because the arm comes toward the viewer, so there is no hose shape or side bump.
 *  chast 'verh' is the upper arm, drawn under the body so the jacket armhole gives a seam; 'niz' is the forearm, cuff and hand on top.
 *  o: S character scale; tw,sy shoulder axis; pl end of the jacket shoulder line; lok elbow at rest; lokN elbow shift at the peak; k0,k1 wrist at rest and at the peak; w0,w1,w2 half widths at shoulder, elbow, cuff; kx share of sideways travel; dov0,dov1 hand rotation relative to the forearm; dY right hand offset at rest;
 *  cvet, zal(c,x0,y0,x1,y1) sleeve fill; tenR sleeve shadow step; tenT arm shadow on the body; stol table edge, no body shadow below it; stolTen shadow on the table; skl folds; pug buttons; manzh, manzhL cuff; obv [colour,width]; the rest goes to kistV. */
function rukaV(c,p,o,side,chast){
 const hxP=side<0?p.hLx:p.hRx,hyP=side<0?p.hLy:p.hRy,t=Math.max(clamp(side<0?p.hLo:p.hRo),o.t0??.36),u0=clamp(-hyP/108,0,1.25),uO=clamp(-(side<0?p.hRy:p.hLy)/108,0,1.25),u=u0*lerp(1,.55,clamp((uO-u0)/.12)),ves=1-clamp(-hyP/40),dx=p.lean*22/o.S,dy=(p.bob*6-p.breath*2.2)/o.S,lN=o.lokN||[0,0],w=o.w1,
  wx=side*lerp(o.k0[0],o.k1[0],u)+hxP*(o.kx??.7)-dx*ves,wy=lerp(o.k0[1]+(side>0?o.dY||0:0),o.k1[1],u)-dy*ves,ex=side*(o.lok[0]+lN[0]*u)-dx*ves*.7,ey=o.lok[1]+lN[1]*u-dy*ves*.7,sx=side*o.tw,sy=o.sy,
  a1=Math.atan2(ey-sy,ex-sx),u1x=Math.cos(a1),u1y=Math.sin(a1),f=Math.atan2(wy-ey,wx-ex),cf=Math.cos(f),sf=Math.sin(f),
  bl=Math.hypot(u1x-cf,u1y-sf)||1,bx=(u1x-cf)/bl,by=(u1y-sf)/bl;
 // n1, n2 point to the outside of the bend; the outer elbow corner has a tight radius so the elbow reads as an angle, not a sausage
 let n1x=-u1y,n1y=u1x,n2x=-sf,n2y=cf;if(n1x*bx+n1y*by<0){n1x=-n1x;n1y=-n1y;}if(n2x*bx+n2y*by<0){n2x=-n2x;n2y=-n2y;}
 const kv=w/Math.max(n1x*bx+n1y*by,.46),px=ex+bx*kv,py=ey+by*kv,
  obv=()=>{if(o.obv){c.strokeStyle=o.obv[0];c.lineWidth=o.obv[1];c.lineJoin=c.lineCap='round';c.stroke();}},
  kras=()=>o.zal?o.zal(c,-o.tw,sy,o.tw,ey+w):o.cvet;
 const plecho=()=>{const g=lerp(o.w0,w,.42),ox=lerp(sx,ex,.42)+n1x*g,oy=lerp(sy,ey,.42)+n1y*g,d=Math.hypot(ox-side*o.pl[0],oy-o.pl[1])*.45;
  c.beginPath();c.moveTo(side*(o.pl[0]-70),o.pl[1]+6);c.lineTo(side*o.pl[0],o.pl[1]);c.bezierCurveTo(side*(o.pl[0]+d*.58),o.pl[1]+d*.38,ox-u1x*d,oy-u1y*d,ox,oy);c.lineTo(ex+n1x*w,ey+n1y*w);c.quadraticCurveTo(px,py,ex+n2x*w,ey+n2y*w);c.lineTo(ex-n1x*w,ey-n1y*w);c.lineTo(sx-n1x*o.w0,sy-n1y*o.w0);c.closePath();
  c.fillStyle=kras();c.fill();obv();};
 if(chast==='verh'){plecho();return;}
 const pr=()=>{c.beginPath();c.moveTo(wx+n2x*o.w2,wy+n2y*o.w2);c.lineTo(ex+n2x*w,ey+n2y*w);c.quadraticCurveTo(px,py,ex+n1x*w,ey+n1y*w);c.lineTo(ex-n2x*w,ey-n2y*w);c.lineTo(wx-n2x*o.w2,wy-n2y*o.w2);c.closePath();},
  krai=()=>{c.beginPath();c.moveTo(wx+n2x*o.w2,wy+n2y*o.w2);c.lineTo(ex+n2x*w,ey+n2y*w);c.quadraticCurveTo(px,py,ex+n1x*w,ey+n1y*w);c.moveTo(ex-n2x*w,ey-n2y*w);c.lineTo(wx-n2x*o.w2,wy-n2y*o.w2);},
  rk=f+side*lerp(o.dov0||0,o.dov1||0,clamp(u));
 // one sleeve above and on the table
 if(o.stol!=null){c.save();c.beginPath();c.rect(-420,o.stol-2,840,400);c.clip();plecho();c.restore();}
 if(o.stolTen&&ves>.02){c.globalAlpha=ves*.22;c.fillStyle=o.stolTen;c.beginPath();c.ellipse(wx-side*22,wy+o.w2+13,o.D*.72,8,0,0,6.3);c.fill();c.globalAlpha=1;}
 if(o.tenT){c.save();if(o.stol!=null){c.beginPath();c.rect(-420,-60,840,o.stol+60);c.clip();}c.translate(-side*5,10);c.fillStyle=o.tenT;pr();c.fill();if(ves<1){c.globalAlpha=1-ves;c.translate(side*3,-4);c.translate(wx+cf*7,wy+sf*7);c.rotate(rk);kistV(c,{...o,ten:o.tenK||'rgba(30,20,24,.12)'},t,side);}c.restore();}
 // the upper hand at rest casts a shadow on the lower one, otherwise without outlines they merge
 if(side>0&&ves>.02){c.save();c.globalAlpha=ves;c.translate(wx+cf*7-3,wy+sf*7+6);c.rotate(rk);kistV(c,{...o,ten:o.tenKist||'rgba(130,70,44,.34)'},t,side);c.restore();}
 c.save();c.translate(wx+cf*7,wy+sf*7);c.rotate(rk);kistV(c,o.obv?o:{...o,obv:[o.kozhaT,1.5]},t,side);c.restore();
 c.save();c.translate(wx,wy);c.rotate(f);c.beginPath();c.roundRect(-8,-o.w2+2.5,8+(o.manzhL||11),2*o.w2-5,3);c.fillStyle=o.manzh;c.fill();obv();c.restore();
 if(o.tenR){pr();c.fillStyle=o.tenR;c.fill();c.save();pr();c.clip();c.translate(-7,-9);pr();c.fillStyle=kras();c.fill();c.restore();}
 else{pr();c.fillStyle=kras();c.fill();}
 krai();obv();
 if(o.kromka){c.strokeStyle=o.kromka;c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(lerp(ex,wx,.16)-n2x*lerp(w,o.w2,.16)*.96,lerp(ey,wy,.16)-n2y*lerp(w,o.w2,.16)*.96);c.lineTo(wx-n2x*o.w2*.96,wy-n2y*o.w2*.96);c.stroke();}
 if(o.skl){c.strokeStyle=o.skl;c.lineWidth=2.6;c.lineCap='round';c.beginPath();for(let i=0;i<(o.sklN||1);i++){const d=w*(.62+i*.6),l=w*(.62-i*.2),a=w*.86;c.moveTo(ex+cf*d-n2x*a,ey+sf*d-n2y*a);c.quadraticCurveTo(ex+cf*(d+9)-n2x*(a-l*.5),ey+sf*(d+9)-n2y*(a-l*.5),ex+cf*(d+5)-n2x*(a-l),ey+sf*(d+5)-n2y*(a-l));}c.stroke();}
 if(o.pug){c.fillStyle=o.pug;c.beginPath();for(let i=0;i<3;i++){const x=wx-cf*(15+i*12)+n2x*o.w2*.62,y=wy-sf*(15+i*12)+n2y*o.w2*.62;c.moveTo(x+2.8,y);c.arc(x,y,2.8,0,6.3);}c.fill();}
}

/** Set head coordinates: neck base -> face centre, with nod, tilt and turn. o: hy, hs, osnova is the pivot below the face. */
function naGolovu(c,p,o){const hs=o.hs||1;c.translate(p.lean*7+p.yaw*5,(o.hy??-140)+p.pitch*7+p.bob*1.5);c.translate(0,o.osnova??110);c.rotate(p.roll);c.translate(0,-(o.osnova??110));c.scale(hs,hs);}

const SPISOK={};
const Stili={SPISOK,dobavit(s){SPISOK[s.id]=s;},POZA,
 /** One character in scene coordinates. */
 geroj(c,H,P,slot){const p=Object.assign({},POZA,P);if(H.sam){H[slot]&&H[slot](c,p);return;}c.save();c.translate(H.x+p.lean*22,H.y+p.bob*6-p.breath*2.2);c.scale(H.s,H.s);H[slot]&&H[slot](c,p);c.restore();},
 /** The whole scene: background, bodies, table, arms. */
 scena(c,S,pL,pA,W=1920,H=1080){S.fon(c,W,H);Stili.geroj(c,S.L,pL,'telo');Stili.geroj(c,S.A,pA,'telo');if(!S.rukiZaStolom)S.stol&&S.stol(c,W,H);Stili.geroj(c,S.L,pL,'ruki');Stili.geroj(c,S.A,pA,'ruki');if(S.rukiZaStolom)S.stol&&S.stol(c,W,H);},
 /** How many shapes the character draws in this pose (fill, stroke and fillRect calls). */
 schet(c,H,P){let n=0;const f=c.fill,s=c.stroke,fr=c.fillRect;c.fill=function(...a){n++;return f.apply(this,a);};c.stroke=function(...a){n++;return s.apply(this,a);};c.fillRect=function(...a){n++;return fr.apply(this,a);};
  Stili.geroj(c,H,P,'telo');Stili.geroj(c,H,P,'ruki');delete c.fill;delete c.stroke;delete c.fillRect;return n;}};
root.Kit={lerp,clamp,plashka,zal,arka,yajco,mnogo,sdvig,rot,glaz,glazMil,busina,brov,brovDuga,lico,ruka,dveRuki,rukaV,kistV,naGolovu};root.Stili=Stili;
})(window);
