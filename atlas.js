
function atlas(canvasId, data, opts){
opts=opts||{};const cv=document.getElementById(canvasId),cx=cv.getContext('2d');
const N=data.nodes,L=data.links,idx={};N.forEach((n,i)=>idx[n.id]=i);
const E=L.map(l=>({a:idx[l.s],b:idx[l.t],op:l.op,bridge:l.bridge})).filter(e=>e.a!=null&&e.b!=null);
let W,H,tf={x:0,y:0,k:1},sel=null,hov=null,q='';
function size(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*devicePixelRatio;
cv.height=H*devicePixelRatio;cx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}
size();addEventListener('resize',()=>{size();draw()});
N.forEach((n,i)=>{const a=i/N.length*Math.PI*2,r=Math.min(W,H)*.35*(0.4+0.6*Math.random());
n.x=W/2+r*Math.cos(a);n.y=H/2+r*Math.sin(a);n.vx=0;n.vy=0;
n.r=3+Math.min(9,Math.sqrt(n.deg||1)*1.6)});
const adj=N.map(()=>new Set());E.forEach(e=>{adj[e.a].add(e.b);adj[e.b].add(e.a)});
let tick=0,MAX=280;
function step(){
for(let i=0;i<N.length;i++){const a=N[i];
for(let j=i+1;j<N.length;j++){const b=N[j];
let dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy+0.01;if(d2>90000)continue;
const f=1400/d2;dx*=f;dy*=f;a.vx+=dx;a.vy+=dy;b.vx-=dx;b.vy-=dy}}
E.forEach(e=>{const a=N[e.a],b=N[e.b];let dx=b.x-a.x,dy=b.y-a.y;
const d=Math.sqrt(dx*dx+dy*dy)+0.01,f=(d-70)*0.004;dx*=f;dy*=f;
a.vx+=dx;a.vy+=dy;b.vx-=dx;b.vy-=dy});
N.forEach(n=>{n.vx+=(W/2-n.x)*0.0012;n.vy+=(H/2-n.y)*0.0012;
n.x+=n.vx*=0.82;n.y+=n.vy*=0.82})}
function draw(){cx.clearRect(0,0,W,H);cx.save();
cx.translate(tf.x,tf.y);cx.scale(tf.k,tf.k);
const dim=sel!=null;
E.forEach(e=>{const a=N[e.a],b=N[e.b];
const on=!dim||e.a===sel||e.b===sel;
cx.globalAlpha=on?(e.op?0.85:0.28):0.05;
cx.strokeStyle=e.bridge?'#e8b64c':e.op?'#5ac8a8':'#3a3a55';
cx.setLineDash(e.bridge?[4,4]:[]);cx.lineWidth=e.op?1.6:0.7;
cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()});
cx.setLineDash([]);
N.forEach((n,i)=>{const on=!dim||i===sel||adj[sel].has(i);
const hit=q&&n.id.includes(q);
cx.globalAlpha=on?1:0.12;
cx.fillStyle=n.color||'#8a8ab0';
cx.beginPath();cx.arc(n.x,n.y,n.r,0,7);cx.fill();
if(n.cert){cx.strokeStyle='#e8b64c';cx.lineWidth=1.6;
cx.beginPath();cx.arc(n.x,n.y,n.r+2.2,0,7);cx.stroke()}
if(hit){cx.strokeStyle='#fff';cx.lineWidth=1.2;
cx.beginPath();cx.arc(n.x,n.y,n.r+5,0,7);cx.stroke()}
if((i===hov||i===sel||(tf.k>1.7&&on)||hit)&&(n.deg>2||i===hov||hit)){
cx.globalAlpha=1;cx.fillStyle='#d8d8e0';cx.font='11px ui-monospace';
cx.fillText(n.label,n.x+n.r+4,n.y+3)}});
cx.restore()}
function loop(){if(tick++<MAX){step();draw();requestAnimationFrame(loop)}else draw()}
loop();
function pt(ev){const r=cv.getBoundingClientRect();
return{x:(ev.clientX-r.left-tf.x)/tf.k,y:(ev.clientY-r.top-tf.y)/tf.k}}
function near(p){let best=null,bd=144;N.forEach((n,i)=>{
const d=(n.x-p.x)**2+(n.y-p.y)**2;if(d<bd){bd=d;best=i}});return best}
const tip=document.getElementById('tip');
cv.addEventListener('mousemove',ev=>{const i=near(pt(ev));hov=i;
if(i!=null){tip.style.display='block';tip.style.left=(ev.clientX+14)+'px';
tip.style.top=(ev.clientY+10)+'px';
tip.innerHTML='<b>'+N[i].label+'</b>'+(N[i].cert?' <span style="color:#e8b64c">●certified</span>':'')+'<br>'+(N[i].def||'')+(N[i].module?'<br><i>'+N[i].module+'</i>':'')}
else tip.style.display='none';draw()});
cv.addEventListener('click',ev=>{const i=near(pt(ev));sel=(i===sel)?null:i;draw()});
let drag=null;
cv.addEventListener('mousedown',ev=>drag={x:ev.clientX,y:ev.clientY});
addEventListener('mouseup',()=>drag=null);
addEventListener('mousemove',ev=>{if(drag){tf.x+=ev.clientX-drag.x;
tf.y+=ev.clientY-drag.y;drag={x:ev.clientX,y:ev.clientY};draw()}});
cv.addEventListener('wheel',ev=>{ev.preventDefault();
const f=ev.deltaY<0?1.12:0.89;tf.k=Math.max(.25,Math.min(6,tf.k*f));draw()},{passive:false});
const qi=document.getElementById('q');
if(qi)qi.addEventListener('input',()=>{q=qi.value.trim().replace(/ /g,'_');draw()});
}
