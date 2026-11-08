import { Color3 } from '@babylonjs/core/Maths/math.color';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import type { Scene } from '@babylonjs/core/scene';

export const C={cyan:'#64f5e6',pink:'#ff3994',gold:'#ffc684',blue:'#598cd4'};
export function createMaterials(scene:Scene){
  const mat=(name:string,color:string,emission=0)=>{
    const m=new StandardMaterial(name,scene); const c=Color3.FromHexString(color);
    m.diffuseColor=c; m.specularColor=new Color3(.22,.28,.34); m.specularPower=48;
    if(emission){m.emissiveColor=c.scale(emission);m.diffuseColor=c.scale(.2);}
    return m;
  };
  const concrete=(name:string,color:string)=>{
    const m=mat(name,color);const t=new DynamicTexture(name+' texture',256,scene,false);const ctx=t.getContext();
    ctx.fillStyle=color;ctx.fillRect(0,0,256,256);
    let seed=91;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<11000;i++){ctx.fillStyle=random()>.5?'rgba(220,230,240,.035)':'rgba(0,0,0,.08)';ctx.fillRect(random()*256,random()*256,random()*3+1,random()*3+1);}
    ctx.strokeStyle='rgba(0,0,0,.25)';for(let y=0;y<256;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();}
    const detail=ctx as CanvasRenderingContext2D;
    for(let i=0;i<16;i++){
      const x=random()*256,y=random()*256;
      const streak=detail.createLinearGradient(x,y,x,y+55);streak.addColorStop(0,'rgba(4,12,18,.19)');streak.addColorStop(1,'rgba(4,12,18,0)');detail.fillStyle=streak;detail.fillRect(x,y,2+random()*7,55);
    }
    detail.strokeStyle='rgba(7,14,20,.22)';detail.lineWidth=.7;
    for(let i=0;i<5;i++){let x=random()*256,y=random()*256;detail.beginPath();detail.moveTo(x,y);for(let k=0;k<5;k++){x+=(random()-.5)*9;y+=random()*7;detail.lineTo(x,y);}detail.stroke();}
    t.update();t.uScale=2;t.vScale=4;m.diffuseTexture=t;m.diffuseColor=Color3.White();return m;
  };
  const surface=(name:string,color:string,kind:'rust'|'wood'|'paint'|'bag')=>{
    const material=mat(name,color);material.diffuseColor=Color3.White();
    const tex=new DynamicTexture(name+' wear',256,scene,false),ctx=tex.getContext() as CanvasRenderingContext2D;
    ctx.fillStyle=color;ctx.fillRect(0,0,256,256);let state=813;
    const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};
    for(let i=0;i<4500;i++){
      ctx.fillStyle=kind==='rust'?(random()>.5?'#95624366':'#1b2a3466'):kind==='wood'?(random()>.5?'#99704c55':'#1a1a1f66'):kind==='bag'?'#64838c16':'#abb9b92b';
      ctx.fillRect(random()*256,random()*256,kind==='wood'?1:random()*4+1,kind==='wood'?random()*50+5:random()*3+1);
    }
    if(kind==='paint'){ctx.strokeStyle='#ac9e7966';ctx.lineWidth=.7;for(let i=0;i<30;i++){const x=random()*256,y=random()*256;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+random()*18,y+random()*3);ctx.stroke();}}
    if(kind==='bag'){ctx.strokeStyle='#8296a225';for(let i=0;i<16;i++){ctx.beginPath();ctx.moveTo(128,0);ctx.quadraticCurveTo(random()*256,120,random()*256,256);ctx.stroke();}}
    tex.update();material.diffuseTexture=tex;return material;
  };
  const print=(name:string,kind:'poster'|'menu'|'hazard'|'license'|'screen')=>{
    const material=mat(name,'#ffffff');const tex=new DynamicTexture(name+' print',{width:512,height:512},scene,false),ctx=tex.getContext() as CanvasRenderingContext2D;
    ctx.fillStyle=kind==='poster'?'#acada0':kind==='hazard'?'#b99e4c':kind==='license'?'#d1c49a':'#101f29';ctx.fillRect(0,0,512,512);
    if(kind==='poster'){
      ctx.fillStyle='#333d42';ctx.fillRect(25,25,462,462);ctx.fillStyle='#d84b83';ctx.fillRect(48,48,416,154);
      ctx.fillStyle='#e7d9cc';ctx.font='bold 64px sans-serif';ctx.fillText('NIGHT',64,113);ctx.fillText('SHIFT',64,178);
      ctx.strokeStyle='#8bddcd';ctx.lineWidth=5;for(let i=0;i<8;i++){ctx.beginPath();ctx.arc(256,300,23+i*15,.3,5.7);ctx.stroke();}
      ctx.fillStyle='#c8c7b4';ctx.font='18px monospace';ctx.fillText('SECTOR 07 / 23:00 — LATE',48,459);
      ctx.fillStyle='#c9c5ac';for(let i=0;i<12;i++)ctx.fillRect(45+i*36,480,10+(i%3)*4,25);
    }else if(kind==='menu'){
      ctx.strokeStyle='#a9b6a4';ctx.lineWidth=4;ctx.strokeRect(22,22,468,468);ctx.fillStyle='#d5c5a0';ctx.font='bold 54px serif';ctx.fillText('NAMI',58,98);ctx.fillStyle='#7ee1c1';ctx.font='22px monospace';ctx.fillText('夜食 / NIGHT MENU',58,142);
      ctx.font='24px monospace';['SHOYU RAMEN   12','MISO RAMEN    14','GYOZA         06','RICE BOWL     09','MATCHA        04'].forEach((text,i)=>{ctx.fillStyle=i%2?'#a2b6ac':'#d3c8ac';ctx.fillText(text,58,220+i*48);});
      ctx.fillStyle='#cf7c91';ctx.font='19px monospace';ctx.fillText('OPEN UNTIL SUNRISE',58,466);
    }else if(kind==='hazard'){
      ctx.fillStyle='#1d282b';for(let x=-512;x<1024;x+=160){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+75,0);ctx.lineTo(x+587,512);ctx.lineTo(x+512,512);ctx.fill();}
      ctx.fillStyle='#e7d6a5';ctx.fillRect(160,202,192,100);ctx.fillStyle='#273035';ctx.font='bold 27px monospace';ctx.fillText('CAUTION',195,264);
    }else if(kind==='license'){
      ctx.strokeStyle='#303b3d';ctx.lineWidth=12;ctx.strokeRect(15,15,482,482);ctx.fillStyle='#284646';ctx.font='bold 62px monospace';ctx.fillText('YR 07',83,204);ctx.font='bold 75px monospace';ctx.fillText('2049',91,338);
    }else{
      ctx.strokeStyle='#3b8c8a44';ctx.lineWidth=1;for(let y=0;y<512;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);ctx.stroke();}for(let x=0;x<512;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,512);ctx.stroke();}
      ctx.strokeStyle='#73e5bf';ctx.lineWidth=6;ctx.beginPath();for(let x=0;x<512;x++){const y=270+Math.sin(x*.04)*30-(x%160>100&&x%160<115?150:0);if(!x)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();ctx.fillStyle='#a3ebda';ctx.font='26px monospace';ctx.fillText('NEURAL LINK / ONLINE',27,55);ctx.font='18px monospace';ctx.fillText('DIAGNOSTICS  98.7%',27,462);
    }
    tex.update();material.diffuseTexture=tex;if(kind==='screen'){material.emissiveTexture=tex;material.emissiveColor=new Color3(.7,.9,.8);}return material;
  };
  const asphalt=concrete('wet asphalt','#17212a');
  const roadTex=new DynamicTexture('patched asphalt texture',512,scene,false),rc=roadTex.getContext() as CanvasRenderingContext2D;
  rc.fillStyle='#18242d';rc.fillRect(0,0,512,512);let roadSeed=77;const roadRandom=()=>{roadSeed=(roadSeed*1664525+1013904223)>>>0;return roadSeed/4294967296;};
  for(let i=0;i<28000;i++){rc.fillStyle=roadRandom()>.5?'#b4bec616':'#00000026';rc.fillRect(roadRandom()*512,roadRandom()*512,1+roadRandom(),1+roadRandom());}
  for(let i=0;i<9;i++){const x=roadRandom()*512,y=roadRandom()*512;rc.fillStyle='#0a151c66';rc.beginPath();rc.ellipse(x,y,15+roadRandom()*70,12+roadRandom()*40,roadRandom()*3,0,Math.PI*2);rc.fill();}
  rc.strokeStyle='#060f17aa';rc.lineWidth=1.7;
  for(let i=0;i<13;i++){let x=roadRandom()*512,y=roadRandom()*512;rc.beginPath();rc.moveTo(x,y);for(let k=0;k<8;k++){x+=(roadRandom()-.5)*24;y+=roadRandom()*15;rc.lineTo(x,y);if(k===4){rc.lineTo(x-15,y+9);rc.moveTo(x,y);}}rc.stroke();}
  roadTex.update();roadTex.uScale=1;roadTex.vScale=6;asphalt.diffuseTexture?.dispose();asphalt.diffuseTexture=roadTex;
  const roadSpec=new DynamicTexture('wet asphalt specularity',256,scene,false),sc=roadSpec.getContext() as CanvasRenderingContext2D;sc.fillStyle='#444444';sc.fillRect(0,0,256,256);
  for(let i=0;i<24;i++){const x=roadRandom()*256,y=roadRandom()*256,g=sc.createRadialGradient(x,y,1,x,y,15+roadRandom()*25);g.addColorStop(0,'#eeeeee');g.addColorStop(1,'#444444');sc.fillStyle=g;sc.fillRect(x-42,y-42,84,84);}
  roadSpec.update();roadSpec.vScale=6;asphalt.specularTexture=roadSpec;
  const windowMaterial=(name:string,color:string)=>{
    const material=mat(name,color,.65);
    const texture=new DynamicTexture(name+' interior',{width:128,height:256},scene,false);
    const ctx=texture.getContext() as CanvasRenderingContext2D;
    const gradient=ctx.createLinearGradient(0,0,128,256);gradient.addColorStop(0,color);gradient.addColorStop(.45,color);gradient.addColorStop(1,'#1b2229');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,256);
    ctx.fillStyle='rgba(10,17,25,.35)';ctx.fillRect(0,0,128,30);ctx.fillRect(0,200,128,56);ctx.fillRect(0,0,16,256);ctx.fillRect(112,0,16,256);
    ctx.fillStyle='rgba(5,12,20,.25)';for(let y=24;y<250;y+=22)ctx.fillRect(0,y,128,3);
    ctx.fillStyle='rgba(10,17,25,.65)';ctx.fillRect(78,148,30,75);ctx.fillRect(60,188,52,9);
    ctx.fillStyle='rgba(255,248,210,.2)';ctx.fillRect(26,23,73,4);
    texture.update();material.diffuseTexture=texture;material.emissiveTexture=texture;return material;
  };
  const wetPuddle=mat('reflective puddles','#24333e');wetPuddle.specularColor=new Color3(.9,.95,1);wetPuddle.specularPower=160;wetPuddle.alpha=.23;
  return {mat,concrete,wetPuddle,rust:surface('oxidized steel','#51483f','rust'),wood:surface('aged timber','#44382d','wood'),painted:surface('worn petrol paint','#2e454b','paint'),bag:surface('refuse plastic','#16242c','bag'),paper:mat('aged paper','#aaa993'),ceramic:mat('ceramic','#a9b9af'),yellow:mat('warning yellow','#c2a353'),orange:mat('cone orange','#c76a42'),amber:mat('amber lamps','#ffb45c',.9),shopWarm:mat('warm shop backlight','#d5ae7c',.4),poster:print('night shift poster','poster'),menu:print('chalk menu','menu'),hazard:print('hazard paint','hazard'),license:print('number plate','license'),screen:print('diagnostic screen','screen'),walls:[concrete('midnight concrete','#263346'),concrete('petrol concrete','#253e46'),concrete('plum concrete','#3b2d43'),concrete('blue concrete','#29364a')],metal:mat('graphite metal','#182633'),trim:mat('facade trim','#3c4b58'),black:mat('glass','#081521'),window:mat('unlit windows','#0b1b27'),cyan:mat('cyan neon',C.cyan,1.35),pink:mat('pink neon',C.pink,1.35),gold:windowMaterial('warm windows','#d6a266'),blue:windowMaterial('blue windows','#5a89b6'),white:mat('soft white','#d7edee',1.2),asphalt};
}
export type Materials=ReturnType<typeof createMaterials>;
