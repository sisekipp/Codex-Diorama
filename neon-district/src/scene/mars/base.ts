import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import type { MarsMaterials } from './materials';
import { modelAssembly } from '../modelAssembly';
import { terrainHeight } from './terrainMath';

export function createMarsBase(scene:Scene,m:MarsMaterials){
  const a=modelAssembly(scene,'ARES connected research base'),{box,beam,cylinder,torus,tube,hull,patch}=a;
  const lamps:{position:number[];direction?:number[];color:string;power:number;range:number;kind:string;angle?:number}[]=[];
  const label=(text:string,sub:string,x:number,y:number,z:number,w:number,h:number)=>box('ARES physical identification '+text,x,y,z,w,h,.035,m.lettering(text,sub));
  const bolt=(x:number,y:number,z:number)=>cylinder('ARES captive panel fastener',x,y,z,.085,.04,m.steel,'z',true);
  const habitat=(x:number,z:number,w:number,d:number,title:string)=>{
    const y=terrainHeight(x,z)+.9;
    box('habitat suspended floor cassette',x,y,z,w,.35,d,m.dark);box('habitat floor finish',x,y+.2,z,w-.3,.08,d-.3,m.deck);
    hull('habitat faceted thermal roof',[{z:z-d/2-.2,halfWidth:w*.43,bottom:y+3.5,top:y+3.7},{z:z-d/2+.4,halfWidth:w/2+.2,bottom:y+3.5,top:y+3.95},{z:z+d/2-.4,halfWidth:w/2+.2,bottom:y+3.5,top:y+3.95},{z:z+d/2+.2,halfWidth:w*.43,bottom:y+3.5,top:y+3.7}],m.white).position.x=x;
    box('habitat rear insulated wall',x,y+1.9,z+d/2,w,3.6,.22,m.white);
    for(const side of [-1,1]){
      box('habitat end bulkhead',x+side*w/2,y+1.9,z,.22,3.6,d,m.white);
      for(const dz of [-d*.35,d*.35]){cylinder('habitat adjustable support leg',x+side*(w/2-.6),y-.55,z+dz,.3,1.1,m.steel);box('habitat foot pad',x+side*(w/2-.6),terrainHeight(x+side*(w/2-.6),z+dz)+.13,z+dz,.95,.22,.95,m.dark);}
      for(let zz=z-d/2+.8;zz<z+d/2;zz+=1.5){box('habitat side thermal panel joint',x+side*(w/2+.13),y+2,zz,.025,3,.045,m.dark,true);}
    }
    box('habitat front kick panel',x,y+.6,z-d/2,w,1,.22,m.white);box('habitat window header',x,y+3.2,z-d/2,w,.6,.22,m.white);
    for(let n=0;n<4;n++){
      const xx=x-w*.375+n*w*.25;patch('habitat transparent observation glazing',[new Vector3(xx-w*.115,y+1.08,z-d/2-.12),new Vector3(xx+w*.115,y+1.08,z-d/2-.12),new Vector3(xx+w*.115,y+2.9,z-d/2-.12),new Vector3(xx-w*.115,y+2.9,z-d/2-.12)],m.glass);
      for(const dx of [-w*.125,w*.125])box('habitat structural window jamb',xx+dx,y+1.96,z-d/2-.15,.09,1.95,.13,m.dark);
      box('habitat deep window sill',xx,y+1.03,z-d/2-.18,w*.24,.09,.45,m.steel);
      box('habitat interior workbench',xx,y+.95,z+d*.2,w*.2,.16,1.1,m.dark);box('habitat bench pedestal',xx,y+.55,z+d*.2,.65,.8,.75,m.white);
      box('habitat interior instrument screen',xx,y+1.5,z+d*.2-.35,.6,.4,.05,m.cold);for(let j=0;j<3;j++)cylinder('habitat specimen vessel',xx-.3+j*.3,y+1.16,z+d*.2,.18,.24,m.steel,'y',true);
    }
    for(let n=0;n<3;n++){const xx=x-w*.33+n*w*.33;box('habitat ceiling light diffuser',xx,y+3.42,z,2,.045,.15,m.warm);}
    lamps.push({position:[x,y+3,z],color:'#edbc7d',power:36,range:11,kind:'point'});
    label(title,'ARES / PRESSURIZED HABITAT',x,y+3.25,z-d/2-.19,w*.66,.43);
    for(const dx of [-w*.42,w*.42])for(const yy of [.35,3.25])bolt(x+dx,y+yy,z-d/2-.15);
    for(let n=0;n<3;n++){box('habitat rooftop radiator bank',x-w*.3+n*w*.3,y+4.1,z+.3,w*.22,.3,d*.55,m.dark);for(let fin=0;fin<8;fin++)box('habitat radiator fin',x-w*.3+n*w*.3,y+4.28,z-d*.2+fin*d*.05,w*.2,.025,.055,m.steel,true);}
    return y;
  };
  const level=habitat(-18,10,12,8,'ARES / OUTPOST 07');habitat(-4,12,10,7,'LAB / 02');habitat(-18,27,11,8,'COMMS / 03');
  cylinder('habitat pressure connector',-10.5,level+1.8,12,2.3,3.8,m.white,'x');for(let n=0;n<5;n++)torus('connector external pressure rib',-12+n*.75,level+1.8,12,2.35,.07,m.dark,'x');
  cylinder('main gallery pressure tube',-18,level+1.8,18.5,2.4,10,m.white,'z');for(let z=14.5;z<23;z+=1)torus('gallery external pressure rib',-18,level+1.8,z,2.45,.075,m.dark,'z');
  cylinder('EVA airlock tunnel',-18,level+1.2,3.6,2.5,5,m.white,'z');torus('EVA front pressure seal',-18,level+1.2,1.02,2.55,.16,m.orange,'z');cylinder('EVA sealed outer door',-18,level+1.2,.96,2.2,.12,m.dark,'z');box('EVA outer door vision panel',-18,level+1.6,.87,.4,.5,.025,m.cold);for(let n=0;n<5;n++)box('EVA access stair',-18,.72+n*.18,.2-n*.42,2.7,.16,.48,m.steel);
  label('EVA / 01','DEPRESSURIZATION LOCK',-18,level+2.85,.88,2.7,.5);
  for(const x of [-19.5,-16.5])beam('airlock stair handrail',new Vector3(x,1.7,-1.7),new Vector3(x,2.6,.4),.065,m.orange);
  // Open hangar with an actual unobstructed bay and visible internal equipment.
  const hx=-24,hz=-6,hy=terrainHeight(hx,hz),width=18,depth=14;
  box('hangar armored floor',hx,hy+.12,hz,width,.24,depth,m.deck);box('hangar rear wall',hx,hy+3.4,hz+7,width,6.8,.24,m.white);
  for(const side of [-1,1]){box('hangar insulated side wall',hx+side*9,hy+3.2,hz,.25,6.4,depth,m.white);for(let z=hz-6;z<=hz+6;z+=3)beam('hangar wall buttress',new Vector3(hx+side*9.5,hy,z),new Vector3(hx+side*9.1,hy+6,z),.25,m.dark);}
  for(let z=hz-7;z<=hz+7;z+=2){const path=Array.from({length:25},(_,n)=>{const t=n*Math.PI/24;return new Vector3(hx+Math.cos(t)*9,hy+6.4+Math.sin(t)*2.5,z);});tube('hangar arched structural rib',path,.13,m.dark);}
  for(let n=0;n<16;n++){const t=(n+.5)*Math.PI/16,x=hx+Math.cos(t)*9,y=hy+6.4+Math.sin(t)*2.5;const panel=box('hangar curved roof cassette',x,y,hz,1.85,.12,14,m.white);panel.rotation.z=Math.atan2(-2.5*Math.cos(t),9*Math.sin(t));}
  for(const x of [hx-7,hx+7]){box('hangar interior service bench',x,hy+1.1,hz+3,2.6,.18,5,m.steel);box('hangar storage cabinet',x,hy+1.25,hz+5,2,2.3,1.2,m.orange);for(let n=0;n<5;n++)box('hangar drawer handle',x,hy+.4+n*.4,hz+4.36,.7,.055,.08,m.dark,true);}
  for(const x of [hx-6,hx+6])box('hangar interior work light',x,hy+6,hz,3,.07,.2,m.lamp);lamps.push({position:[hx,hy+5.6,hz],direction:[0,-1,0],color:'#e7c99e',power:130,range:18,kind:'spot',angle:2.3});
  label('ROVER / SERVICE','FIELD SYSTEMS · ARES 07',hx,hy+6.6,hz-7.2,10,1);
  for(let n=0;n<8;n++)box('hangar door warning stripe',hx-8+n*.65,hy+.27,hz-6.8,.33,.025,.7,n%2?m.orange:m.dark);
  // Greenhouse: transparent dome, meridian ribs, lit hydroponic beds and plants.
  const gx=-40,gz=18,gy=terrainHeight(gx,gz)+.45,r=7.5;
  cylinder('greenhouse foundation ring',gx,gy,gz,15.7,.6,m.dark);const dome=MeshBuilder.CreateSphere('ARES greenhouse pressure dome',{diameter:r*2,segments:32,slice:.5},scene);dome.position.set(gx,gy+.2,gz);dome.material=m.glass;dome.isPickable=false;
  for(let n=0;n<10;n++){const angle=n*Math.PI/5,path=Array.from({length:19},(_,i)=>{const t=i*Math.PI/36;return new Vector3(gx+Math.sin(t)*r*Math.cos(angle),gy+.2+Math.cos(t)*r,gz+Math.sin(t)*r*Math.sin(angle));});tube('greenhouse meridian frame',path,.065,m.steel);}
  for(const y of [2,4,6])torus('greenhouse latitude frame',gx,gy+y,gz,Math.sqrt(r*r-y*y)*2,.055,m.steel);
  for(const x of [gx-3.3,gx-1.1,gx+1.1,gx+3.3]){box('hydroponic growing bed',x,gy+.55,gz,1.25,.55,8,m.white);box('hydroponic nutrient surface',x,gy+.86,gz,1.06,.05,7.8,m.dark);for(let n=0;n<5;n++){const z=gz-3+n*1.5;cylinder('plant growth stem',x,gy+1.1,z,.035,.5,m.green);for(let leaf=0;leaf<3;leaf++){const angle=leaf*2.1;const part=a.sphere('greenhouse edible foliage',x+Math.cos(angle)*.18,gy+1.27,z+Math.sin(angle)*.18,.23,.36,.48,m.green);part.rotation.z=angle*.1;}}box('hydroponic grow strip',x,gy+2.35,gz,.06,.06,8,m.warm);}
  cylinder('greenhouse access vestibule',gx+7.5,gy+1.35,gz,2.4,3,m.white,'x');lamps.push({position:[gx,gy+3,gz],color:'#d9ce94',power:30,range:11,kind:'point'});label('BOTANY / 04','LIFE SUPPORT · FOOD SYSTEMS',gx,gy+1,gz-7.8,6,.65);
  // Solar fields with cell grids, mounting frames and connected power cables.
  for(let row=0;row<3;row++)for(let col=0;col<4;col++){
    const x=-55+col*5.5,z=-21+row*5,y=terrainHeight(x,z)+1.2;const panel=box('solar panel glass cell array',x,y,z,5,.1,3.8,m.blue);panel.rotation.x=-.28;
    for(const dx of [-2.3,2.3])beam('solar adjustable support',new Vector3(x+dx,terrainHeight(x+dx,z),z),new Vector3(x+dx,y,z),.12,m.steel);
    for(let n=0;n<10;n++){const zz=z-1.7+n*.37;box('solar panel interconnect strip',x,y+Math.sin(.28)*(zz-z)+.08,zz,4.85,.012,.018,m.steel,true);}
    for(const dx of [-2.48,2.48]){const rail=box('solar panel perimeter frame',x+dx,y,z,.06,.16,3.95,m.steel);rail.rotation.x=-.28;}
  }
  tube('buried solar power trunk',[new Vector3(-45,.72,-12),new Vector3(-36,.72,-12),new Vector3(-35,.72,1),new Vector3(-24,1.2,5)],.11,m.dark);
  // Fuel farm, pipework and pump station visibly connect to the launch infrastructure.
  for(let n=0;n<3;n++){
    const x=15+n*4.5,z=16,y=terrainHeight(x,z);cylinder('cryogenic storage tank',x,y+3.8,z,3.3,6.7,m.white);a.sphere('tank domed upper head',x,y+7.1,z,3.3,1.1,3.3,m.white);a.sphere('tank dished lower head',x,y+.5,z,3.3,.8,3.3,m.dark);
    for(const h of [1.1,5.9])torus('tank reinforced circumferential band',x,y+h,z,3.39,.1,m.steel);for(let h=1;h<7;h+=.4)box('tank service ladder rung',x,y+h,z-1.8,.6,.055,.16,m.steel,true);for(const dx of [-.33,.33])box('tank ladder upright',x+dx,y+4,z-1.8,.055,6.4,.1,m.dark);
    label('0'+(n+1),n===0?'OXYGEN':'PROPELLANT',x,y+4.4,z-1.7,1.2,.7);
    tube('fuel tank delivery line',[new Vector3(x,y+1,z),new Vector3(x,.9,21),new Vector3(31,1,21),new Vector3(42,1,26)],.16,m.steel);
  }
  box('propellant pumping skid',25,1.5,20,5,1.8,3,m.dark);for(let n=0;n<3;n++){cylinder('pump motor housing',23.5+n*1.4,2,20,.8,1.7,m.steel,'z');torus('pump valve handwheel',23.5+n*1.4,2.3,18.9,.45,.055,m.orange,'z');}
  // Field science station and an older landing site give the terrain a history.
  const sy=terrainHeight(-31,44);box('sampling rig foot',-31,sy+.3,44,3,.6,3,m.dark);for(const x of [-32,-30])beam('sampling drill mast',new Vector3(x,sy+.5,44),new Vector3(x,sy+5.6,44),.18,m.white);cylinder('sampling drill string',-31,sy+2.7,44,.14,5,m.steel);
  for(let n=0;n<7;n++){cylinder('sealed geology sample tube',-35+n*.4,terrainHeight(-35+n*.4,42)+.4,42,.18,.65,m.orange);box('sample flag stake',-35+n*.4,terrainHeight(-35+n*.4,42)+1,42,.025,.9,.025,m.steel,true);}
  const ay=terrainHeight(-47,43);box('antenna plinth',-47,ay+.4,43,4,.8,4,m.dark);cylinder('antenna mast',-47,ay+4,43,.5,7,m.steel);
  const dish=a.articulate('ARES tracking dish',new Vector3(-47,ay+8,43),'y',{kind:'fan',speed:.025},()=>{a.lathe('antenna parabolic reflector',-47,ay+8,43,[[0,0],[.5,.03],[1,.12],[2,.48],[3,.95]],m.white);for(let n=0;n<4;n++){const angle=n*Math.PI/2;beam('antenna feed support',new Vector3(-47+Math.cos(angle)*2.7,ay+8.8,43+Math.sin(angle)*2.7),new Vector3(-47,ay+10.2,43),.065,m.dark);}cylinder('antenna receiver',-47,ay+10.2,43,.3,.4,m.steel);});dish.rotation.x=.65;
  for(let i=0;i<5;i++){const x=66+i*2,z=-31+(i%2)*3,y=terrainHeight(x,z);box('old landing site survey marker',x,y+.65,z,.09,1.3,.09,m.steel);box('old landing site pennant',x+.3,y+1.1,z,.6,.32,.035,m.orange);}
  for(const [x,z]of [[-17,-15],[-29,-15]]){const y=terrainHeight(x,z);box('EVA service tool trolley',x,y+.8,z,1.5,.12,.8,m.steel);for(const dx of [-.55,.55])for(const dz of [-.28,.28])cylinder('tool trolley caster',x+dx,y+.12,z+dz,.22,.08,m.dark,'x');for(let n=0;n<5;n++)box('EVA trolley field tool',x-.5+n*.22,y+.91,z,.08,.06,.35,m.orange,true);}
  const root=a.finish(190);root.metadata.lamps=lamps;
  return {root,greenhouse:dome,update(time:number,reduced:boolean){dish.rotation.y=reduced?0:Math.sin(time*.025)*.35;}};
}
