import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { Scene } from '@babylonjs/core/scene';
import type { MarsMaterials } from './materials';
import type { LaunchState } from './state';
import { modelAssembly } from '../modelAssembly';
import { terrainHeight } from './terrainMath';

function landingRing(scene:Scene,x:number,z:number,level:number,outer:number,inner:number,m:MarsMaterials){
  const positions:number[]=[],indices:number[]=[],uvs:number[]=[];
  const quad=(points:Vector3[])=>{const base=positions.length/3;points.forEach((p,i)=>{positions.push(p.x,p.y,p.z);uvs.push(i===1||i===2?1:0,i>1?1:0);});indices.push(base,base+2,base+1,base,base+3,base+2);};
  const v=(a:number,r:number,y:number)=>new Vector3(x+Math.cos(a)*r,y,z+Math.sin(a)*r);
  for(let i=0;i<48;i++){const a=i*Math.PI/24,b=(i+1)*Math.PI/24;quad([v(a,inner,level),v(b,inner,level),v(b,outer,level),v(a,outer,level)]);quad([v(a,outer,level),v(b,outer,level),v(b,outer,level-.8),v(a,outer,level-.8)]);quad([v(b,inner,level),v(a,inner,level),v(a,inner,level-.8),v(b,inner,level-.8)]);}
  const normals:number[]=[];VertexData.ComputeNormals(positions,indices,normals);const data=new VertexData();Object.assign(data,{positions,indices,normals,uvs});const mesh=new Mesh('ARES launch pad open flame well',scene);data.applyToMesh(mesh);mesh.material=m.deck;mesh.receiveShadows=true;mesh.isPickable=false;return mesh;
}
export function createMarsLaunch(scene:Scene,m:MarsMaterials){
  const padY=terrainHeight(42,28)+1,deck=modelAssembly(scene,'ARES launch infrastructure'),{box,beam,cylinder}=deck;
  landingRing(scene,42,28,padY,10,3,m);cylinder('launch well scorched floor',42,padY-.77,28,5.9,.08,m.dark);
  const warning=m.red.clone('ARES launch warning beacons');
  for(let n=0;n<16;n++){
    const angle=n*Math.PI/8,x=42+Math.cos(angle)*8.5,z=28+Math.sin(angle)*8.5;
    const stripe=box('launch apron hazard marking',x,padY+.025,z,1.6,.035,.3,n%2?m.dark:m.orange);stripe.rotation.y=-angle;
    if(n%2===0){cylinder('launch navigation bollard',42+Math.cos(angle)*10.8,padY+.25,28+Math.sin(angle)*10.8,.17,.9,m.dark);cylinder('launch warning lens',42+Math.cos(angle)*10.8,padY+.78,28+Math.sin(angle)*10.8,.18,.16,warning);}
  }
  for(const side of [-1,1]){box('flame trench basalt channel',42+side*7,padY-.65,28,9,.25,3,m.dark);for(const dz of [-1.7,1.7])box('flame trench protective wall',42+side*7,padY-.15,28+dz,9,1.2,.35,m.deck);}
  // Four-column gantry with repeated cross bracing and open access platforms.
  for(const x of [49.5,52.5])for(const z of [26.5,29.5])beam('launch gantry main column',new Vector3(x,padY-1,z),new Vector3(x,padY+26,z),.28,m.steel);
  for(let y=padY+1;y<padY+26;y+=4){
    for(const z of [26.5,29.5]){beam('launch gantry cross brace',new Vector3(49.5,y,z),new Vector3(52.5,y+4,z),.12,m.dark);beam('launch gantry diagonal return',new Vector3(52.5,y,z),new Vector3(49.5,y+4,z),.12,m.dark);}
    box('launch gantry open service landing',51,y,28,4,.16,4,m.steel);for(const z of [26.1,29.9])beam('launch gantry landing rail',new Vector3(49,y+1,z),new Vector3(53,y+1,z),.055,m.orange);
    for(let n=0;n<12;n++)box('launch gantry stair tread',51,y+.32+n*.3,30+n*.18,1.3,.08,.28,m.dark,true);
  }
  box('launch gantry upper bridge',49.7,padY+26,28,6.5,.25,4.5,m.white);box('launch gantry warning beacon',51,padY+27,28,.25,.3,.25,warning);
  box('launch site identification',42,padY+.75,17.7,7,1,.1,m.lettering('PAD / 01','ARES HEAVY · KEEP CLEAR'));
  for(const x of [30,54]){cylinder('launch perimeter lamp mast',x,padY+4,19,.18,9,m.steel);box('launch perimeter floodlight',x,padY+8.2,19,1.2,.15,.4,m.lamp);}
  const platform=deck.finish(210);platform.metadata.lamps=[{position:[30,padY+8,19],direction:[.3,-1,.3],color:'#ddc393',power:140,range:25,kind:'spot',angle:1.9},{position:[54,padY+8,19],direction:[-.3,-1,.3],color:'#ddc393',power:140,range:25,kind:'spot',angle:1.9}];
  // A separate second landing pad and a small idle cargo lander.
  const second=modelAssembly(scene,'ARES secondary landing pad');second.cylinder('secondary landing deck',61,1.4,-4,14,.6,m.deck);second.torus('secondary touchdown marking',61,1.72,-4,8,.08,m.orange);second.cylinder('secondary lander hull',61,4,-4,3.3,3.5,m.white);second.sphere('secondary lander domed tank',61,5.9,-4,3.3,1.2,3.3,m.white);
  for(let n=0;n<4;n++){const a=n*Math.PI/2;second.beam('secondary lander articulated leg',new Vector3(61+Math.cos(a)*1.4,3.4,-4+Math.sin(a)*1.4),new Vector3(61+Math.cos(a)*2.6,1.85,-4+Math.sin(a)*2.6),.14,m.steel);second.cylinder('secondary lander foot pad',61+Math.cos(a)*2.6,1.8,-4+Math.sin(a)*2.6,.8,.12,m.dark);}second.finish(180);
  const rocket=modelAssembly(scene,'ARES launch vehicle'),r=rocket;
  r.cylinder('rocket first stage pressure hull',0,8.2,0,3.6,12.4,m.white);r.cylinder('rocket second stage',0,16.4,0,2.8,4,m.white);
  r.lathe('rocket tapered interstage',0,14.4,0,[[1.8,0],[1.8,.15],[1.4,.8]],m.dark);r.lathe('rocket ogive payload fairing',0,18.4,0,[[1.4,0],[1.4,.5],[1.25,1.5],[.95,2.5],[.55,3.4],[.03,4.3]],m.white);
  for(const y of [2.2,4.4,8.3,13.9,14.5,18.2])r.torus('rocket reinforced stage joint',0,y,0,y>14.4?2.84:3.66,.085,m.steel);
  r.cylinder('rocket lower thermal skirt',0,1.85,0,3.75,.7,m.dark);r.cylinder('rocket mission color band',0,9.4,0,3.62,.4,m.orange);
  for(const x of [-.62,.62])for(const z of [-.62,.62]){r.lathe('rocket expansion nozzle',x,.2,z,[[.52,0],[.48,.15],[.28,.8],[.23,1.2]],m.dark);r.torus('rocket nozzle lip',x,.22,z,1.03,.055,m.steel);r.cylinder('rocket nozzle chamber',x,1.5,z,.4,.55,m.steel);}
  r.lathe('rocket central engine nozzle',0,.2,0,[[.5,0],[.44,.2],[.25,1.1]],m.steel);
  for(let n=0;n<4;n++){
    const angle=n*Math.PI/2,points=[new Vector3(1.77,2.4,0),new Vector3(3,1.35,0),new Vector3(2.55,4.8,0),new Vector3(1.77,4.4,0)].map(p=>new Vector3(Math.cos(angle)*p.x,p.y,Math.sin(angle)*p.x));r.patch('rocket stabilizer fin',points,m.orange);r.patch('rocket stabilizer fin reverse',[...points].reverse(),m.orange);
  }
  for(const x of [-1.82,1.82]){r.cylinder('rocket protected service conduit',x,8.5,.15,.075,10,m.steel);for(let y=4;y<13;y+=1.4)r.torus('rocket conduit clamp',x,y,.15,.13,.025,m.dark);}
  r.box('rocket mission stencil',0,11.2,-1.825,1.7,.7,.025,m.lettering('ARES','OUTPOST 07 / CARGO'));r.box('rocket serial panel',0,6.2,-1.825,1,.35,.025,m.lettering('07','TRANSFER VEHICLE'));
  const vehicle=rocket.finish(260);vehicle.position.set(42,padY+.08,28);
  const arms=[12,18].map(height=>{const arm=modelAssembly(scene,'ARES retracting service arm');arm.box('service arm main truss',-3.3,0,0,6.6,.3,.6,m.steel);for(const z of [-.3,.3])arm.beam('service arm handrail',new Vector3(0,.7,z),new Vector3(-6.6,.7,z),.055,m.orange);arm.tube('service arm umbilical',[new Vector3(0,-.2,.1),new Vector3(-3,-.5,.1),new Vector3(-6.5,-.25,.1)],.08,m.dark);arm.cylinder('service arm disconnect coupling',-6.6,-.25,.1,.35,.3,m.steel,'x');const root=arm.finish(230);root.position.set(50.5,padY+height,28);return root;});
  return {vehicle,padY,warning,update(state:LaunchState,reduced:boolean){vehicle.position.y=padY+.08+state.height;arms.forEach(arm=>{arm.rotation.y=-state.arm*Math.PI*.63;});const blink=reduced?.6:state.phase==='countdown'||state.phase==='ignition'?(Math.sin(state.elapsed*7)>0?1.5:.12):.5;warning.emissiveColor=Color3.FromHexString('#e46a45').scale(blink);}};
}
export type MarsLaunch=ReturnType<typeof createMarsLaunch>;
