'use strict';
/* Character: flat graphics on Canvas 2D, everything from pose parameters. The drawing is a pure function of the pose, so seeking and frame-by-frame export give the same frame.
 *   Personazh.narisovat(ctx, look, poza, x, y, masshtab) draws body and head; narisovatRuki draws the arms over the table.
 * look is the appearance (LOOKS.lena, LOOKS.artem): colours, proportions, hairstyle. A new character is a new look; mouth and motion are shared.
 * The mouth is not a set of images: its contour is built from open, wide, round, teeth, tongue, press, bite, smile, so shapes morph into each other without pops. */
(function(root){
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const POZA={open:0,wide:0,round:0,teeth:.4,tongue:0,press:0,bite:0,smile:.3,yaw:0,pitch:0,roll:0,gx:0,gy:0,blink:0,brow:0,browL:0,lean:0,bob:0,breath:0,hair:0,hLx:0,hLy:0,hRx:0,hRy:0,hLo:0,hRo:0};

function kontur(c,pts){c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=6)c.bezierCurveTo(pts[i],pts[i+1],pts[i+2],pts[i+3],pts[i+4],pts[i+5]);c.closePath();}

/** Mouth. (mx,my) is the centre in head coordinates. One colour: a dark shape without separate lips. */
function rot_(c,L,p,mx,my){
 const hw=50*(L.rotW||1)*(1+.30*p.wide-.42*p.round-.10*p.press),H=Math.min(p.open*60+p.bite*5,(L.golovaH-my+9*p.open-6)/.68),u=H*.32,d=H*.68,lift=(-p.smile*13+p.round*1.5)*(1-.75*p.bite),
  q=lerp(.62,.42,p.round),r=lerp(.30,.92,clamp(p.round+p.open*.35)),cy=my+p.open*3;
 const Lx=mx-hw,Rx=mx+hw,Cy=cy+lift,Ty=cy-u,By=cy+d;
 const path=()=>{c.beginPath();c.moveTo(Lx,Cy);
  c.bezierCurveTo(Lx,Cy-u*r-.4,mx-hw*q,Ty,mx,Ty);c.bezierCurveTo(mx+hw*q,Ty,Rx,Cy-u*r-.4,Rx,Cy);
  c.bezierCurveTo(Rx,Cy+d*r+.4,mx+hw*q,By,mx,By);c.bezierCurveTo(mx-hw*q,By,Lx,Cy+d*r+.4,Lx,Cy);c.closePath();};
 const hh=u+d;
 if(hh>.6){c.save();path();c.fillStyle=L.rotVnutri;c.fill();c.clip();
  // the tongue lies low; on t, d, n, l, r its tip rises to the teeth
  const ty=lerp(By+7,lerp(By-3,Ty+hh*.42,p.tongue),clamp(hh/14));
  c.fillStyle=L.yazyk;c.beginPath();c.ellipse(mx,ty+16,hw*.74,19+p.tongue*5,0,0,6.3);c.fill();
  const th=Math.min(clamp(p.teeth)*hh,20)+1.5;c.fillStyle='#fff';c.beginPath();c.roundRect(mx-hw-4,Ty-3,2*hw+8,th+3,[0,0,8,8]);c.fill();
  c.restore();}
 c.lineJoin=c.lineCap='round';c.strokeStyle=L.rotKontur||L.rotVnutri;c.lineWidth=lerp(6,4,clamp(hh/10))+p.press*1.4+(L.rotKontur?1.5:0);path();c.stroke();
 // on v, f the lower lip rests on the upper teeth
 if(p.bite>.02){c.globalAlpha=p.bite;c.lineWidth=11;c.beginPath();c.moveTo(mx-hw*.8,By+2);c.quadraticCurveTo(mx,By+8,mx+hw*.8,By+2);c.stroke();c.globalAlpha=1;}
 // on m, b, p the lips are pressed: a shadow under them
 if(p.press>.02&&!L.boroda){c.globalAlpha=p.press*.55;c.strokeStyle=L.kozhaTen;c.lineWidth=5;c.beginPath();c.moveTo(mx-15,By+11);c.quadraticCurveTo(mx,By+15,mx+15,By+11);c.stroke();c.globalAlpha=1;}
}

function glaz(c,L,p,x,y,sc,side){
 const rx=(L.glazRx||25)*sc,ry=(L.glazRy||29)*sc,bl=clamp(p.blink),z=clamp(bl/.8),pr=L.prikryt||0;
 // the upper lid moves to the closing line, the lower lid rises to meet it
 const sm=y+ry*.42,top=lerp(y-ry-3+(2*ry+6)*pr,sm,z),niz=lerp(y+ry+4,sm,z*z);
 if(z<.98){c.save();c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.3);c.clip();
  c.fillStyle='#fff';c.fillRect(x-rx-2,y-ry-2,2*rx+4,2*ry+4);
  const px=x+p.gx*10*sc,py=y+p.gy*10*sc+2,zr=(L.zrachok||16.5)*sc;c.fillStyle=L.glaz;c.beginPath();c.arc(px,py,zr,0,6.3);c.fill();
  c.fillStyle='#fff';c.beginPath();c.arc(px-zr*.3,py-zr*.36,zr*.3,0,6.3);c.fill();
  c.fillStyle=L.kozha;c.beginPath();c.moveTo(x-rx-3,y-ry-4);c.lineTo(x+rx+3,y-ry-4);c.lineTo(x+rx+3,top-2);c.quadraticCurveTo(x,top+ry*.3*(1-z),x-rx-3,top-2);c.closePath();c.fill();
  c.beginPath();c.moveTo(x-rx-3,y+ry+5);c.lineTo(x+rx+3,y+ry+5);c.lineTo(x+rx+3,niz);c.quadraticCurveTo(x,niz+ry*.12,x-rx-3,niz);c.closePath();c.fill();
  const sh=Math.max(0,p.smile-.5)*.6*(1-bl);if(sh>.02){c.beginPath();c.ellipse(x,y+ry*1.46,rx*1.5,ry*(.42+sh),0,0,6.3);c.fill();}
  c.restore();
  if(top>y-ry){c.save();c.beginPath();c.rect(x-rx-4,y-ry-4,2*rx+8,top-y+ry+3);c.clip();c.strokeStyle=L.kozha;c.lineWidth=2.6;c.beginPath();c.ellipse(x,y,rx+.6,ry+.6,0,0,6.3);c.stroke();c.restore();}}
 c.strokeStyle=L.liniya;c.lineCap='round';
 if(L.resnicy){const v=1-bl*1.7;c.lineWidth=6*sc;c.globalAlpha=clamp(v*1.4);c.beginPath();c.ellipse(x,y,rx+.5,ry+.5,0,Math.PI*1.08,Math.PI*1.92);c.stroke();
  c.lineWidth=5*sc;c.beginPath();c.moveTo(x+side*rx*.9,y-ry*.42);c.lineTo(x+side*(rx+8*sc),y-ry*.72);c.stroke();c.globalAlpha=1;}
 const a=clamp((bl-.22)/.3);if(a>0){c.globalAlpha=a;c.lineWidth=5*sc;c.beginPath();c.moveTo(x-rx*.95,top-4);c.quadraticCurveTo(x,top+9*sc,x+rx*.95,top-4);c.stroke();c.globalAlpha=1;}
}

/** Head. The origin is the centre of the face. */
function golova(c,L,p){
 const W=L.golovaW,H=L.golovaH,j=p.open*12+p.bite,yw=p.yaw,fe=yw*24,fn=yw*36,fm=yw*28,py=p.pitch*13,cw=L.chelyust;
 // ears: the far one hides behind the head, the near one comes out
 const ex=s=>s*(W+2)-yw*16,eY=8+py*.4;
 if(L.uhi!==false)for(const s of [-1,1]){const k=1-.25*Math.max(0,s*yw*1.4);c.fillStyle=L.kozha;c.beginPath();c.ellipse(ex(s),eY,18*k,24,0,0,6.3);c.fill();c.fillStyle=L.kozhaTen;c.beginPath();c.ellipse(ex(s)-s*2,eY+1,8*k,12,0,0,6.3);c.fill();}
 const lico=()=>kontur(c,[-W,-H*.2, -W,-H*1.06,W,-H*1.06,W,-H*.2, W,H*.46,W*cw,H+j,0,H+j, -W*cw,H+j,-W,H*.46,-W,-H*.2]);
 lico();c.fillStyle=L.kozha;c.fill();
 c.save();lico();c.clip();
 // hair shadow on the forehead: one tone step
 if(L.volosyPered){c.save();c.translate(0,11);c.globalAlpha=.55;L.volosyPered(c,p,yw,L.kozhaTen);c.restore();}
 if(L.rumyanec){c.globalAlpha=.4;c.fillStyle=L.rumyanec;for(const s of [-1,1]){c.beginPath();c.ellipse(s*(L.glazX+20)+fe*.9,L.glazY+(L.glazRy||29)+17+py,20,12,0,0,6.3);c.fill();}c.globalAlpha=1;}
 c.restore();
 L.boroda&&L.boroda(c,p,j,fm,py);
 // mouth, nose, eyes and brows shift with head turn: this makes a flat face behave like a 3D one
 rot_(c,L,p,fm,L.rotY+py*1.05);
 const nx=fn,ny=L.nosY+py,ns=clamp(yw/.15,-1,1);
 c.strokeStyle=L.nos;c.lineWidth=7;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(nx-ns*1,ny-15);c.quadraticCurveTo(nx+ns*15,ny+7,nx+ns*3,ny+9);c.stroke();
 const eY2=L.glazY+py*.8,near=1+Math.abs(yw)*.08,far=1-Math.abs(yw)*.13,sl=yw>0?far:near,sr=yw>0?near:far;
 glaz(c,L,p,-L.glazX+fe,eY2,sl,-1);glaz(c,L,p,L.glazX+fe,eY2,sr,1);
 // eyebrows: a thick rounded line
 c.strokeStyle=L.brovi;c.lineCap='round';c.lineWidth=L.brovTol;
 for(const s of [-1,1]){const raise=(p.brow+(s<0?p.browL:0))*15,bx=s*L.glazX+fe,by=eY2-(L.brovY||46)-raise,t=p.brow*5;
  c.beginPath();c.moveTo(bx-s*25,by+6-t*.2);c.quadraticCurveTo(bx+s*2,by-6-t,bx+s*27,by+5-t*.4);c.stroke();}
 L.ochki&&L.ochki(c,p,fe,eY2);
 L.volosyPered&&L.volosyPered(c,p,yw);
}

/** Arm: shoulder and hand are given, the elbow comes from bone lengths and bends outward and down. */
function ruka(c,L,sx,sy,hx,hy,side,open){
 const a=L.plecho,b=L.predplechye,dl=Math.hypot(hx-sx,hy-sy)||1,d=Math.min(a+b-1,dl),ux=(hx-sx)/dl,uy=(hy-sy)/dl,ca=clamp((a*a+d*d-b*b)/(2*a*d),-1,1),h=a*Math.sqrt(1-ca*ca);
 let nx=-uy,ny=ux;if(nx*side<0){nx=-nx;ny=-ny;}
 const ex=sx+ux*a*ca+nx*h,ey=sy+uy*a*ca+ny*h;
 c.lineCap='round';c.lineJoin='round';c.strokeStyle=L.rukav;c.lineWidth=L.rukaTol;c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo(ex,ey,hx,hy);c.stroke();
 const ang=Math.atan2(hy-ey,hx-ex);
 c.save();c.translate(hx,hy);c.rotate(ang);
 c.fillStyle=L.manzheta;c.beginPath();c.roundRect(-13,-L.rukaTol/2-1,16,L.rukaTol+2,6);c.fill();
 c.fillStyle=L.kozha;c.beginPath();c.ellipse(17,0,21,19,0,0,6.3);c.fill();
 const t=lerp(.45,1.1,open),s2=side;c.lineWidth=15;c.strokeStyle=L.kozha;c.beginPath();c.moveTo(8,s2*11);c.lineTo(10+Math.cos(t)*13,s2*(12+Math.sin(t)*10));c.stroke();
 c.restore();
}

function narisovat(c,L,P,x,y,s){
 const p=Object.assign({},POZA,P);
 c.save();c.translate(x+p.lean*22,y+p.bob*6-p.breath*2.2);c.scale(s,s);
 const tw=L.plechi,hx=p.lean*7+p.yaw*5,hy=-140-(L.golovaDy||0)+p.pitch*7+p.bob*1.5,hs=L.golovaK,naGolovu=()=>{c.translate(hx,hy);c.translate(0,110);c.rotate(p.roll);c.translate(0,-110);c.scale(hs,hs);};
 if(L.volosyZad){c.save();naGolovu();L.volosyZad(c,p,p.yaw);c.restore();}
 c.save();c.scale(1+p.breath*.006,1+p.breath*.012);
 c.fillStyle=L.odezhda;kontur(c,[-46,-12, -74,2,-tw+8,14,-tw,62, -tw-2,140,-tw+6,240,-tw+8,330, -60,340,60,340,tw-8,330, tw-6,240,tw+2,140,tw,62, tw-8,14,74,2,46,-12, 24,6,-24,6,-46,-12]);c.fill();
 L.odezhdaDetali&&L.odezhdaDetali(c,p);c.restore();
 c.fillStyle=L.kozhaTen;c.beginPath();c.roundRect(-30,-60,60,74,22);c.fill();
 c.save();naGolovu();golova(c,L,p);c.restore();
 c.restore();
}

/** Arms are drawn separately, over the table. */
function narisovatRuki(c,L,P,x,y,s){
 const p=Object.assign({},POZA,P);c.save();c.translate(x+p.lean*22,y+p.bob*6-p.breath*2.2);c.scale(s,s);
 const tw=L.plechi;
 const ves=y=>1-clamp(-y/40),dx=p.lean*22/s,dy=(p.bob*6-p.breath*2.2)/s;
 ruka(c,L,-tw+13,40,-62+p.hLx-dx*ves(p.hLy),192+p.hLy-dy*ves(p.hLy),-1,p.hLo);
 ruka(c,L,tw-13,40,62+p.hRx-dx*ves(p.hRy),192+p.hRy-dy*ves(p.hRy),1,p.hRo);
 c.restore();
}

// -- appearance: original characters in a flat geometric manner --
const LOOKS={};
LOOKS.lena={storona:1,golovaW:100,golovaH:114,golovaK:1.3,chelyust:.56,uhi:false,glazX:41,glazY:-4,nosY:26,rotY:66,brovTol:9,plechi:108,plecho:92,predplechye:94,rukaTol:30,resnicy:true,
 kozha:'#F9C9A6',kozhaTen:'#E9A67E',rumyanec:'#F58F78',nos:'#E9A67E',rotVnutri:'#6B1730',yazyk:'#F1647E',glaz:'#2E2230',liniya:'#2E2230',brovi:'#7E2F1C',
 odezhda:'#16A6A0',rukav:'#128F8A',manzheta:'#0E7A76',
 volosyZad(c,p,yw){const dx=-yw*10,h=p.hair*16;c.fillStyle='#A23E20';kontur(c,[-120+dx,-30, -130,-158,130,-158,120+dx,-30, 128,30,130+h,76,112+h,104, 70,112,-70,112,-112+h,104, -130+h,76,-128,30,-120+dx,-30]);c.fill();},
 volosyPered(c,p,yw,cvet){const dx=yw*15,h=p.hair*6;c.fillStyle=cvet||'#C9512B';
  // straight fringe and two strands along the cheeks
  kontur(c,[-112,10, -126,-150,126,-150,112,10, 112,40,110+h,78,94+h,82, 90,84,88+dx*.5,40,86+dx*.7,-6, 80,-54,62+dx,-76,40+dx,-76, 0+dx,-72,-40+dx,-72,-42+dx,-76, -60+dx,-76,-80,-54,-86+dx*.7,-6, -88+dx*.5,40,-90,84,-94+h,82, -110+h,78,-112,40,-112,10]);c.fill();
  if(!cvet){c.strokeStyle='#E5734A';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(-54+dx,-112);c.quadraticCurveTo(-8+dx,-132,36+dx,-120);c.stroke();}},
 odezhdaDetali(c){c.fillStyle='#FBF3E0';c.beginPath();c.moveTo(-52,-6);c.quadraticCurveTo(0,44,52,-6);c.quadraticCurveTo(0,22,-52,-6);c.fill();}};
LOOKS.artem={storona:-1,brovY:52,golovaW:104,golovaH:112,golovaK:1.3,chelyust:.72,glazX:47,glazY:-6,nosY:24,rotY:64,brovTol:12,plechi:118,plecho:96,predplechye:98,rukaTol:33,resnicy:false,
 volosyZad(c){c.fillStyle='#23203A';c.beginPath();c.ellipse(0,-58,110,94,0,0,6.3);c.fill();},
 kozha:'#C98A5E',kozhaTen:'#A96C44',nos:'#A96C44',rotVnutri:'#4F1423',yazyk:'#E8667A',glaz:'#241B22',liniya:'#241B22',brovi:'#1F1B2E',
 odezhda:'#F2B51D',rukav:'#E0A30F',manzheta:'#FFF4D6',
 volosyPered(c,p,yw,cvet){const dx=yw*14,h=p.hair*4;c.fillStyle=cvet||'#23203A';
  // short haircut with a flat top
  kontur(c,[-112,8, -118,-44,-112,-86,-92+dx,-112, -96+dx,-142,-58+dx+h,-156,-10+dx+h,-154, 34+dx+h,-160,86+dx,-150,96+dx,-112, 112,-90,118,-44,112,8, 106,-30,100,-58,84+dx,-72, 40+dx,-66,-40+dx,-66,-84+dx,-72, -100,-58,-106,-30,-112,8]);c.fill();
  if(!cvet){c.strokeStyle='#3F3A63';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(-58+dx,-124);c.quadraticCurveTo(-6+dx,-138,48+dx,-128);c.stroke();}},
 ochki(c,p,fe,ey){c.strokeStyle='#23203A';c.lineWidth=7;c.beginPath();c.ellipse(-47+fe,ey,35,36,0,0,6.3);c.moveTo(47+fe+35,ey);c.ellipse(47+fe,ey,35,36,0,0,6.3);c.moveTo(-12+fe,ey-5);c.quadraticCurveTo(fe,ey-13,12+fe,ey-5);c.stroke();},
 odezhdaDetali(c){c.fillStyle='#FFF4D6';c.beginPath();c.moveTo(-44,-4);c.quadraticCurveTo(0,50,44,-4);c.quadraticCurveTo(0,20,-44,-4);c.fill();
  c.strokeStyle='#D4960A';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(-30,58);c.lineTo(-30,110);c.moveTo(30,58);c.lineTo(30,110);c.stroke();}};

// second pair: long faces, calm half-lidded gaze, cool palette
LOOKS.lena2={storona:1,golovaDy:12,golovaW:88,golovaH:124,golovaK:1.3,chelyust:.5,glazX:40,glazY:-12,nosY:24,rotY:70,rotW:.86,brovTol:7,plechi:100,plecho:92,predplechye:94,rukaTol:27,resnicy:false,prikryt:.2,glazRx:22,glazRy:25,zrachok:14,
 kozha:'#9A6044',kozhaTen:'#7A472F',nos:'#6C3D28',rotVnutri:'#2B0B14',yazyk:'#E8667A',glaz:'#1E1520',liniya:'#1E1520',brovi:'#17121C',
 odezhda:'#D6336C',rukav:'#BE2559',manzheta:'#FBE3EC',
 volosyZad(c,p,yw){const dx=-yw*10,h=p.hair*20;c.fillStyle='#17121C';kontur(c,[-106+dx,-30, -116,-176,116,-176,106+dx,-30, 118,70,124+h,150,116+h,212, 60,226,-60,226,-116+h,212, -124+h,150,-118,70,-106+dx,-30]);c.fill();},
 volosyPered(c,p,yw,cvet){const dx=yw*13;c.fillStyle=cvet||'#241A2B';kontur(c,[-96,20, -112,-150,112,-150,96,20, 92,-30,74+dx,-84,4+dx,-98, -66+dx,-84,-92,-30,-96,20]);c.fill();
  if(!cvet){c.strokeStyle='#4A3A57';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(-50+dx,-118);c.quadraticCurveTo(0+dx,-134,44+dx,-120);c.stroke();}},
 odezhdaDetali(c){c.fillStyle='#BE2559';c.beginPath();c.roundRect(-38,-14,76,30,12);c.fill();}};
LOOKS.artem2={storona:-1,golovaDy:12,golovaW:92,golovaH:124,golovaK:1.3,chelyust:.82,glazX:42,glazY:-12,nosY:22,rotY:68,rotW:.9,brovTol:11,plechi:116,plecho:96,predplechye:98,rukaTol:31,resnicy:false,prikryt:.14,glazRx:22,glazRy:25,zrachok:14,
 volosyZad(c){c.fillStyle='#E2A23A';c.beginPath();c.ellipse(0,-64,98,100,0,0,6.3);c.fill();},
 kozha:'#F4D1B5',kozhaTen:'#DDA886',nos:'#DDA886',rotVnutri:'#5A1626',yazyk:'#EC6A7C',glaz:'#21313F',liniya:'#21313F',brovi:'#B9772A',
 odezhda:'#2F4B8F',rukav:'#263E79',manzheta:'#DCE5FA',
 volosyPered(c,p,yw,cvet){const dx=yw*14,h=p.hair*7;c.fillStyle=cvet||'#E2A23A';
  // tall quiff to one side
  kontur(c,[-96,6, -102,-60,-92,-104,-66+dx,-120, -60+dx,-160,-6+dx+h,-186,60+dx+h,-168, 104+dx+h,-154,104,-92,96,6, 92,-40,84,-70,60+dx,-82, 20+dx,-74,-38+dx,-76,-74+dx,-86, -88,-60,-92,-30,-96,6]);c.fill();
  if(!cvet){c.strokeStyle='#F5C766';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(-34+dx,-132);c.quadraticCurveTo(8+dx,-164,62+dx+h,-148);c.stroke();}},
 odezhdaDetali(c){c.fillStyle='#DCE5FA';c.beginPath();c.moveTo(-40,-6);c.quadraticCurveTo(0,46,40,-6);c.quadraticCurveTo(0,20,-40,-6);c.fill();}};
// third pair: round faces, child proportions, features below centre, big eyes
LOOKS.lena3={storona:1,golovaW:108,golovaH:106,golovaK:1.34,chelyust:.56,glazX:50,glazY:12,nosY:32,rotY:68,rotW:.86,brovTol:8,plechi:96,plecho:86,predplechye:88,rukaTol:28,resnicy:true,glazRx:28,glazRy:32,zrachok:19,
 kozha:'#FFD9BD',kozhaTen:'#F4B48F',rumyanec:'#FF8F86',nos:'#F4B48F',rotVnutri:'#7A1B36',yazyk:'#F7708A',glaz:'#332A4A',liniya:'#332A4A',brovi:'#C98B23',
 odezhda:'#FF6B5E',rukav:'#EE5749',manzheta:'#FFE9D6',
 volosyZad(c,p,yw){const dx=-yw*12,h=p.hair*18;c.fillStyle='#E9A92E';for(const s of [-1,1]){c.beginPath();c.arc(s*112+dx+h*.6,-116,44,0,6.3);c.fill();}
  kontur(c,[-116+dx,0, -130,-150,130,-150,116+dx,0, 120,40,100,60,84,70, 40,76,-40,76,-84,70, -100,60,-120,40,-116+dx,0]);c.fill();},
 volosyPered(c,p,yw,cvet){const dx=yw*14;c.fillStyle=cvet||'#F7C13F';
  kontur(c,[-112,6, -128,-138,128,-138,112,6, 106,-34,90,-52,60+dx,-58, 40+dx,-92,-10+dx,-86,-30+dx,-46, -50+dx,-62,-90,-48,-112,6]);c.fill();
  if(!cvet){c.fillStyle='#FF6B5E';for(const s of [-1,1]){c.beginPath();c.ellipse(s*92+dx*.6,-92,15,10,s*.8,0,6.3);c.fill();}}},
 odezhdaDetali(c){c.fillStyle='#FFE9D6';c.beginPath();c.arc(0,62,9,0,6.3);c.arc(0,104,9,0,6.3);c.fill();}};
LOOKS.artem3={storona:-1,golovaW:110,golovaH:104,golovaK:1.34,chelyust:.6,glazX:51,glazY:12,nosY:32,rotY:68,rotW:.88,brovTol:11,plechi:104,plecho:88,predplechye:90,rukaTol:30,resnicy:false,glazRx:28,glazRy:32,zrachok:19,
 kozha:'#8E5838',kozhaTen:'#6E4027',nos:'#5F3620',rotVnutri:'#2B0B14',yazyk:'#E8667A',glaz:'#1B1320',liniya:'#1B1320',brovi:'#20141A',
 odezhda:'#5CC15A',rukav:'#49A948',manzheta:'#E6F7DF',
 volosyZad(c,p,yw){},
 volosyPered(c,p,yw,cvet){const dx=yw*12,h=p.hair*4;c.fillStyle=cvet||'#2A1C22';
  // cloud of curls made of circles
  const K=[[-110,-68,34],[-124,-26,22],[-72,-104,42],[-26,-124,48],[28,-126,48],[74,-104,42],[112,-68,34],[124,-26,22],[0,-96,50]];c.beginPath();for(const [x,y,r] of K){c.moveTo(x+dx*(1+y/200)+h+r,y);c.arc(x+dx*(1+y/200)+h,y,r,0,6.3);}c.fill();
  if(!cvet){c.fillStyle='#4A3540';c.beginPath();c.arc(-40+dx,-134,10,0,6.3);c.arc(18+dx,-150,8,0,6.3);c.fill();}},
 odezhdaDetali(c){c.fillStyle='#E6F7DF';c.beginPath();c.moveTo(-40,-4);c.quadraticCurveTo(0,44,40,-4);c.quadraticCurveTo(0,18,-40,-4);c.fill();}};
// fourth pair: adult teachers, glasses and a bun, moustache and beard
LOOKS.lena4={storona:1,golovaW:98,golovaH:112,golovaK:1.28,chelyust:.6,glazX:44,glazY:-4,nosY:26,rotY:66,brovTol:7,plechi:110,plecho:92,predplechye:94,rukaTol:30,resnicy:false,glazRx:21,glazRy:24,zrachok:14,
 kozha:'#F2BFA0',kozhaTen:'#DD9C7A',rumyanec:'#EE8E7C',nos:'#DD9C7A',rotVnutri:'#65162B',yazyk:'#EE6A80',glaz:'#2C2433',liniya:'#2C2433',brovi:'#7A7E93',
 odezhda:'#6C4BC4',rukav:'#5A3CAE',manzheta:'#E9E2FB',
 volosyZad(c,p,yw){const dx=-yw*10,h=p.hair*10;c.fillStyle='#A9AEC4';c.beginPath();c.arc(dx+h,-136,44,0,6.3);c.fill();kontur(c,[-112+dx,-14, -122,-146,122,-146,112+dx,-14, 112,20,104,44,96,50, 40,56,-40,56,-96,50, -104,44,-112,20,-112+dx,-14]);c.fill();},
 volosyPered(c,p,yw,cvet){const dx=yw*14;c.fillStyle=cvet||'#C4C9DC';kontur(c,[-104,4, -120,-132,120,-132,104,4, 96,-46,70+dx,-82,0+dx,-88, -70+dx,-82,-96,-46,-104,4]);c.fill();
  if(!cvet){c.strokeStyle='#E2E5F0';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(-50+dx,-110);c.quadraticCurveTo(0+dx,-124,48+dx,-110);c.stroke();}},
 ochki(c,p,fe,ey){c.strokeStyle='#D4375F';c.lineWidth=6;c.beginPath();c.roundRect(-44-32+fe,ey-27,64,54,20);c.roundRect(44-32+fe,ey-27,64,54,20);c.moveTo(-12+fe,ey-6);c.quadraticCurveTo(fe,ey-12,12+fe,ey-6);c.stroke();},
 odezhdaDetali(c){c.fillStyle='#E9E2FB';c.beginPath();c.moveTo(-44,-6);c.lineTo(0,70);c.lineTo(44,-6);c.quadraticCurveTo(0,18,-44,-6);c.fill();}};
LOOKS.artem4={storona:-1,rotKontur:'#F0C3A0',golovaW:104,golovaH:112,golovaK:1.28,chelyust:.74,glazX:46,glazY:-10,nosY:18,rotY:62,brovTol:13,plechi:122,plecho:96,predplechye:98,rukaTol:33,resnicy:false,glazRx:21,glazRy:24,zrachok:14,
 kozha:'#EDBB94',kozhaTen:'#D3966C',nos:'#D3966C',rotVnutri:'#541526',yazyk:'#E8667A',glaz:'#2A2320',liniya:'#2A2320',brovi:'#5A2E17',
 odezhda:'#1E7F6D',rukav:'#176C5C',manzheta:'#F3E6CC',
 volosyPered(c,p,yw,cvet){const dx=yw*14;c.fillStyle=cvet||'#6E3517';
  kontur(c,[-110,4, -116,-80,-104,-126,0+dx,-136, 104,-126,116,-80,110,4, 104,-34,94,-62,74+dx,-70, 30+dx,-78,-30+dx,-78,-74+dx,-70, -94,-62,-104,-34,-110,4]);c.fill();},
 boroda(c,p,j,fm,py){c.fillStyle='#6E3517';
  // the beard follows the jaw with room around the mouth; moustache above the upper lip
  kontur(c,[-104,4, -106,66,-74,116+j,0,120+j, 74,116+j,106,66,104,4, 92,30,84,34,74+fm,40, 46+fm,34,20+fm,38,fm,44, -20+fm,38,-46+fm,34,-74+fm,40, -84,34,-92,30,-104,4]);c.fill();},
 odezhdaDetali(c){c.fillStyle='#F3E6CC';c.beginPath();c.moveTo(-42,-4);c.lineTo(0,46);c.lineTo(42,-4);c.quadraticCurveTo(0,16,-42,-4);c.fill();
  c.fillStyle='#E0B13C';c.beginPath();c.moveTo(-11,28);c.lineTo(11,28);c.lineTo(15,150);c.lineTo(0,170);c.lineTo(-15,150);c.closePath();c.fill();}};

root.Personazh={narisovat,narisovatRuki,LOOKS,POZA};
})(window);
