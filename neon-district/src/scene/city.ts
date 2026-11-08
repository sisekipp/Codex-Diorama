import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Scene } from '@babylonjs/core/scene';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import type { Materials } from './materials';
import { addStreetDetails } from './details';
import { beveledBox } from './beveledBox';
import { createStreetCoupe } from './streetModels';
import { dressStreetWorkshop } from './closeupInfrastructure';

export function buildCity(scene:Scene,m:Materials){
  let seed=2077;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const templates=new Map<string,Mesh>();
  const reflectors:AbstractMesh[]=[];
  const box=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,material:StandardMaterial)=>{
    const bevel=Math.min(w,h,d)>.25&&/tower|plinth|cabinet|vending machine|bin|HVAC|air conditioning|counter|cart|bench/.test(name);
    const key=material.name+bevel;let source=templates.get(key);
    if(!source){source=bevel?beveledBox('source '+key,scene):MeshBuilder.CreateBox('source '+key,{size:1},scene);source.material=material;source.isVisible=false;templates.set(key,source);}
    const mesh=source.createInstance(name);mesh.position.set(x,y,z);mesh.scaling.set(w,h,d);mesh.freezeWorldMatrix();mesh.isPickable=false;mesh.checkCollisions=name==='tower'||name==='landmark tower';
    if(name==='tower'||material===m.cyan||material===m.pink||material===m.white||((material===m.gold||material===m.blue)&&y<16&&z<35))reflectors.push(mesh);
    return mesh;
  };
  const pipe=(name:string,points:Vector3[],radius=.06,material=m.trim)=>{const p=MeshBuilder.CreateTube(name,{path:points,radius,tessellation:6},scene);p.material=material;p.isPickable=false;return p;};
  const sign=(text:string,x:number,y:number,z:number,w:number,h:number,color:string,rotation=0,sub='')=>{
    const texture=new DynamicTexture('sign '+text,{width:1024,height:512},scene,false);
    const ctx=texture.getContext() as CanvasRenderingContext2D;ctx.fillStyle='#08131c';ctx.fillRect(0,0,1024,512);
    ctx.strokeStyle=color;ctx.lineWidth=9;ctx.strokeRect(16,16,992,480);
    ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`bold ${text.length>7?100:155}px sans-serif`;
    ctx.fillText(text,512,sub?215:260);if(sub){ctx.font='32px monospace';ctx.fillText(sub,512,380);}
    ctx.fillStyle=color;ctx.fillRect(40,460,140,4);ctx.fillRect(844,460,140,4);texture.update();
    const material=new StandardMaterial('sign material '+text,scene);material.diffuseTexture=texture;material.emissiveTexture=texture;material.emissiveColor=new Color3(2.4,2.4,2.4);material.specularColor=Color3.Black();material.backFaceCulling=false;
    const mesh=MeshBuilder.CreatePlane('sign '+text,{width:w,height:h,sideOrientation:Mesh.DOUBLESIDE},scene);mesh.position.set(x,y,z);mesh.rotation.y=rotation;mesh.material=material;mesh.metadata={practicalLight:{color,power:24,range:11,kind:'point'}};reflectors.push(mesh);return mesh;
  };
  // The road is a continuous ribbon; pavements and tactile edges give a human scale.
  const road=MeshBuilder.CreateGround('wet boulevard',{width:14,height:110,subdivisions:1},scene);road.material=m.asphalt;road.position.z=15;
  for(const side of [-1,1]){
    box('sidewalk',side*9,.12,13,4,.24,102,m.trim);
    for(let z=-34;z<62;z+=2.2){box('curb joints',side*7.05,.25,z,.2,.14,2,m.metal);box('drain',side*6.75,.025,z,.25,.025,1.1,m.black);}
    for(let z=-28;z<50;z+=13){
      box('lamp post',side*6.3,3.6,z,.12,7.2,.12,m.metal);box('lamp arm',side*5.7,7.15,z,1.3,.12,.12,m.trim);box('lamp light',side*5.15,7.08,z,.7,.07,.28,m.cyan);
    }
  }
  for(let z=-32;z<62;z+=5){box('lane marking',0,.019,z,.1,.025,2,m.gold);}
  for(let x=-5.5;x<6;x+=1.2)box('crosswalk',x,.022,-14,.65,.025,3.5,m.trim);
  for(const z of [-10,18,38]){box('service cover',-2,.027,z,1.3,.025,.9,m.metal);for(let k=0;k<7;k++)box('cover grooves',-2.5+k*.16,.045,z,.04,.015,.65,m.black);}

  const building=(x:number,z:number,w:number,d:number,h:number,index:number)=>{
    const material=m.walls[index%4];
    box('tower',x,h/2,z,w,h,d,material);
    box('plinth',x,1.8,z,w+.35,3.6,d+.35,m.metal);
    // Structural ribs and cornices, each facade built with real geometry.
    for(let y=4;y<h;y+=3.3){box('front floor band',x,y,z-d/2-.04,w+.12,.16,.16,m.trim);box('side floor band',x-Math.sign(x)*w/2,y,z,.16,.16,d,m.trim);}
    for(let k=0;k<=Math.floor(w/2);k++)box('front column',x-w/2+k*2, h/2,z-d/2-.11,.14,h,.2,m.metal);
    for(let y=5;y<h-1;y+=3.3){
      for(let xx=x-w/2+.8;xx<x+w/2-.4;xx+=1.5){
        const lit=rand();const wm=lit>.82?m.gold:lit>.64?m.blue:m.window;
        box('window recess',xx,y,z-d/2-.12,1.15,1.95,.12,m.black);box('window pane',xx,y,z-d/2-.2,.92,1.65,.025,wm);
        box('window mullion',xx,y,z-d/2-.24,.045,1.8,.04,m.trim);
        box('projecting window sill',xx,y-.98,z-d/2-.26,1.25,.1,.4,m.trim);
        if(lit>.85){for(let sl=0;sl<4;sl++)box('window blind',xx,y-.55+sl*.32,z-d/2-.27,.95,.045,.02,m.metal);}
      }
      const sx=x-Math.sign(x)*(w/2+.1);
      for(let zz=z-d/2+.8;zz<z+d/2-.5;zz+=1.65){
        const wm=rand()>.78?m.gold:rand()>.6?m.blue:m.window;
        box('side window recess',sx,y,zz,.1,2,1.25,m.black);box('side window glass',sx-Math.sign(x)*.07,y,zz,.03,1.7,1,wm);
        box('side window sill',sx-Math.sign(x)*.1,y-.98,zz,.32,.09,1.3,m.trim);
      }
    }
    const sx=x-Math.sign(x)*(w/2+.24);
    for(let y=7;y<h-3;y+=7){
      box('air conditioning',sx,y,z-d/2+1.4,.6,.8,1.15,m.trim);
      for(let i=0;i<5;i++)box('vent grille',sx-Math.sign(x)*.32,y-.26+i*.12,z-d/2+1.4,.03,.035,.9,m.black);
      box('balcony',sx-Math.sign(x)*.35,y-1.2,z+d/2-2,1.1,.16,2.7,m.metal);
      for(let b=0;b<5;b++)box('balcony railing',sx-Math.sign(x)*.8,y-.65,z+d/2-3.1+b*.55,.05,1.1,.05,m.trim);
      box('balcony handrail',sx-Math.sign(x)*.8,y-.1,z+d/2-2,.06,.08,2.7,m.trim);
    }
    for(let p=0;p<2;p++)pipe('facade plumbing',[new Vector3(sx,1,z+p*.45),new Vector3(sx,h-2,z+p*.45),new Vector3(x,h-2,z+p*.45)],.075);
    box('roof parapet front',x,h+.25,z-d/2,w+.25,.5,.25,m.trim);box('roof parapet rear',x,h+.25,z+d/2,w+.25,.5,.25,m.trim);
    for(let k=0;k<3;k++){
      const rx=x-w/2+1+k*(w-2)/3;
      box('rooftop HVAC',rx,h+.7,z,1.2,1.4,2,m.metal);
      for(let q=0;q<5;q++)box('rooftop slats',rx,h+1.42,z-.7+q*.32,1,.025,.08,m.trim);
    }
    pipe('antenna',[new Vector3(x,h,z+2),new Vector3(x,h+4+rand()*3,z+2)],.045);
    box('aviation beacon',x,h+4,z+2,.12,.15,.12,m.pink);
    // Ground-floor storefronts, louvers, awnings and doors.
    box('shop glazing',sx,1.6,z,.04,2.6,d-1,m.black);
    box('awning',sx-Math.sign(x)*.65,3.35,z,1.6,.18,d+.15,m.metal);
    for(let zz=z-d/2+1;zz<z+d/2;zz+=2){box('shop frames',sx-Math.sign(x)*.08,1.5,zz,.14,2.9,.1,m.trim);box('shop warm light',sx+Math.sign(x)*.05,2.8,zz,.05,.1,1.4,m.gold);}
  };
  // A dense, layered street with varying heights and setbacks.
  const slots=[-17,-5,7,19,31,43,55];
  slots.forEach((z,i)=>{building(-12-(i%2)*.5,z,8.4,10,20+i*3+(i%3)*4,i);building(12+(i%3)*.6,z+2,8.5,10,25+i*3+(i%2)*5,i+1);});
  // Distant skyline closes the perspective and remains visible from the rooftops.
  for(let i=0;i<30;i++){
    const x=(i-15)*5.5;const z=68+rand()*20;const h=22+rand()*48;const w=3+rand()*4;
    box('skyline tower',x,h/2,z,w,h,5,m.walls[i%4]);
    for(let y=4;y<h;y+=2.3)for(let xx=x-w/2+.4;xx<x+w/2;xx+=.8){if(rand()>.35)box('skyline window',xx,y,z-2.55,.23,.5,.02,rand()>.7?m.gold:m.blue);}
    if(i%3===0){box('skyline crown',x,h,z,w+.2,.12,5.1,m.cyan);pipe('skyline spire',[new Vector3(x,h,z),new Vector3(x,h+9,z)],.08,m.metal);}
  }
  // A landmark tower with an illuminated crown, visible at the vanishing point.
  box('landmark tower',-2,28,66,12,56,10,m.walls[0]);
  for(let y=2;y<55;y+=2.5)for(let x=-7;x<4;x+=1)box('landmark facade',x,y,60.95,.28,1.5,.02,rand()>.55?m.blue:m.window);
  for(const x of [-8,4])box('landmark neon spine',x,29,60.8,.14,58,.1,m.cyan);
  sign('夜 露',-2,49,60.7,8,5,'#62efdf',0,'Y O R U   C O R P O R A T I O N');
  // Skybridge with glazing and structural beams.
  box('skybridge floor',0,10,14,17,.4,3.5,m.metal);box('skybridge roof',0,13,14,17,.3,3.7,m.metal);
  for(let x=-8;x<=8;x+=1.4){box('bridge mullion',x,11.5,12.2,.1,3,.12,m.trim);}
  box('bridge glazing',0,11.5,12.3,16.8,2.7,.05,m.black);box('bridge light',0,10.3,12.05,17,.09,.08,m.cyan);
  sign('渡辺電気',0,11.65,11.98,5.6,1.55,'#7cf7e2',0,'W A T A N A B E   E L E C T R I C');
  // Suspended blade signs face arriving visitors, with brackets linking them to the buildings.
  for(const [x,y,z,text,color] of [[-6.2,7,-12,'夜 市','#59f4d4'],[6.1,9,-1,'HOTEL','#ff518f'],[-5.9,5.2,5,'NAMI','#ff789f'],[5.8,6.2,20,'24 / 7','#ffc980']] as const){
    sign(text,x,y,z,2.3,1.8,color,0,text==='HOTEL'?'VACANCY':'SECTOR 07');
    box('blade sign bracket',x+Math.sign(x)*.7,y+.7,z,1.5,.08,.08,m.metal);
  }
  // Original neon signage, legible from street and oblique views.
  sign('ラーメン',-7.55,4.9,-17,5.2,1.9,'#ff669b',Math.PI/2,'NAMI · NOODLE BAR');
  sign('NAMI',-10.7,6.6,-22.15,5,1.9,'#ff5196',0,'OPEN ALL NIGHT');
  sign('HOTEL',8,14,-5,2.2,6.2,'#ff4c92',-Math.PI/2,'24 / 7');
  sign('夜市',-7.65,11.8,-5,2,5.5,'#64f5e6',Math.PI/2,'NIGHT MARKET');
  sign('KISEKI',10.8,8,-8.15,5.8,2.3,'#6af5e7',0,'未来はここに');
  sign('明日の夢',-11,18,1.85,6.4,4.5,'#8a8bff',0,'D R E A M   A N O T H E R   D R E A M');
  sign('カラオケ',7.6,5,9,4,1.5,'#ffcf89',-Math.PI/2,'KARAOKE · 24H');
  sign('新世界',11,24,15.85,5.4,7,'#ff509f',0,'S H I N S E K A I');
  sign('ARCADE',-7.5,6,29,4.6,1.7,'#b391ff',Math.PI/2,'INSERT YOUR DREAM');
  sign('07',-10.5,17,-22.2,2.5,3,'#62efdf',0,'SECTOR');
  // Neon strips emphasize facade edges and the wet pavement.
  for(const side of [-1,1])for(let i=0;i<5;i++){
    box('vertical neon',side*7.7,8+i,slots[i]+4,.055,8,.07,side<0?m.cyan:m.pink);
    box('street neon',side*7,.3,slots[i],.07,.08,8,side<0?m.pink:m.cyan);
  }
  // Sagging utility cables cross above the road.
  for(let k=0;k<7;k++){
    const z=-6+k*8;const y=15+k*.7;
    const path=Array.from({length:17},(_,j)=>{const x=-9+j*18/16;return new Vector3(x,y-2.3*(1-(x/9)**2),z+Math.sin(j*.2)*.4);});pipe('overhead cable',path,.025,m.black);
  }
  // Vending machines, utility boxes, bins and road barriers.
  for(const side of [-1,1])for(let i=0;i<5;i++){
    const z=-18+i*12;
    box('utility cabinet',side*8,1,z,1.1,2,.6,m.trim);box('cabinet door',side*8,.95,z-.32,.9,1.7,.03,m.metal);
    for(let k=0;k<5;k++)box('cabinet vent',side*8,1.2+k*.1,z-.35,.65,.035,.02,m.black);
    box('bin',side*7.5,.45,z+2,.65,.9,.65,m.metal);box('bin lid',side*7.5,.95,z+2,.72,.12,.72,m.trim);
    if(i%2===0){box('vending machine',side*8.2,1.2,z+4,1.2,2.4,.75,m.metal);box('vending display',side*8.2,1.35,z+3.6,.85,1.6,.02,m.cyan);for(let r=0;r<3;r++)for(let c=0;c<3;c++)box('vending cans',side*8.2-.25+c*.25,.9+r*.4,z+3.55,.13,.25,.05,r%2?m.pink:m.gold);}
  }
  for(let i=0;i<8;i++){const z=-23+i*6;box('bollard',i%2?-6:6,.5,z,.15,1,.15,m.trim);box('bollard reflector',i%2?-6:6,.85,z,.17,.12,.17,m.cyan);}
  const car=createStreetCoupe(scene);car.position.set(3.9,0,-16.2);car.rotation.y=.08;
  // Small glowing lanterns under the restaurant canopy.
  for(let z=-20;z<-13;z+=1.1){const lantern=MeshBuilder.CreateSphere('paper lantern',{diameter:.45,segments:8},scene);lantern.scaling.y=1.25;lantern.position.set(-7,2.9,z);lantern.material=m.gold;}
  // Reflection ripples: transparent irregular light streaks, extending signs into the road.
  const puddleMaterials=Array.from({length:8},(_,i)=>{const rm=m.mat('puddle '+i,i%2?'#ec4d96':'#5ddaca',.3);rm.alpha=.04+i*.014;return rm;});
  for(let i=0;i<230;i++){
    const rm=puddleMaterials[i%8];
    box('neon puddle',(-5+rand()*10),.032,-25+rand()*75,.05+rand()*.2,.008,.3+rand()*2,rm);
  }
  addStreetDetails(scene,m,{box,sign});
  dressStreetWorkshop(scene);
  return {road,reflectors,car};
}
