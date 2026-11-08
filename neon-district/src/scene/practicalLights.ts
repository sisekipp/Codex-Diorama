import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { SpotLight } from '@babylonjs/core/Lights/spotLight';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import { Light } from '@babylonjs/core/Lights/light';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Scene } from '@babylonjs/core/scene';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { rankLight } from './renderMath';

type Socket={position?:number[];direction?:number[];color:string;power:number;range:number;kind:'spot'|'point';angle?:number};
type Emitter={node:TransformNode;socket:Socket;local:Vector3;direction:Vector3;world:Vector3;worldDirection:Vector3;score:number};
/** A fixed pool keeps shader light counts stable while lights follow their authored sockets. */
export function createPracticalLighting(scene:Scene){
  const emitters:Emitter[]=[];
  const add=(node:TransformNode,socket:Socket)=>emitters.push({node,socket,local:Vector3.FromArray(socket.position??[0,0,0]),direction:Vector3.FromArray(socket.direction??[0,-1,0]),world:Vector3.Zero(),worldDirection:Vector3.Zero(),score:0});
  for(const node of scene.transformNodes)for(const socket of node.metadata?.lamps??[])add(node,socket);
  for(const mesh of scene.meshes){
    if(!mesh.isVisible)continue;
    if(mesh.metadata?.practicalLight)add(mesh,{...mesh.metadata.practicalLight,position:[0,0,-.3]});
    if(mesh.name==='lamp light')add(mesh,{position:[0,-.15,0],direction:[0,-1,0],color:'#80babf',power:65,range:15,kind:'spot',angle:2.15});
    if(mesh.name==='terminal floodlight diffuser')add(mesh,{position:[0,-.12,0],direction:[0,-1,0],color:'#efca92',power:100,range:20,kind:'spot',angle:2.1});
    if(mesh.name==='recessed workshop strip light')add(mesh,{position:[0,-.1,0],direction:[0,-1,0],color:'#9dd6bd',power:30,range:7,kind:'spot',angle:2.6});
  }
  // Geometry lamp offsets are in meters; instance source scaling must not scale those offsets.
  for(const e of emitters){if(e.node.getClassName()==='InstancedMesh')e.local.setAll(0);}
  const kinds=['spot','spot','point','spot','spot','point'] as const;
  const pool=kinds.map((kind,i)=>{
    const light=kind==='spot'?new SpotLight('practical spotlight '+i,Vector3.Zero(),new Vector3(0,-1,0),1.1,1,scene):new PointLight('practical area spill '+i,Vector3.Zero(),scene);
    light.falloffType=Light.FALLOFF_GLTF;light.intensityMode=Light.INTENSITYMODE_LUMINOUSINTENSITY;light.intensity=0;light.renderPriority=80-i;light.radius=.12;return {light,kind};
  });
  const beamShadow=new ShadowGenerator(512,pool[0].light as SpotLight);beamShadow.usePoissonSampling=true;beamShadow.bias=.001;beamShadow.normalBias=.025;beamShadow.setDarkness(.45);pool[0].light.shadowMinZ=.1;
  for(const mesh of scene.meshes){if(mesh.material?.name==='closeup smoked cockpit glazing'||/lenses/.test(mesh.material?.name??''))continue;let owner=mesh.parent;while(owner){if(/parked electric coupe|parked scarlet coupe|slow passing electric coupe|motorcycle|docked foreground taxi|arrival shuttle|harbor transit train|delivery van/.test(owner.name)){beamShadow.addShadowCaster(mesh,false);break;}owner=owner.parent;}}
  for(const light of scene.lights){if(light.name==='night ambient')light.renderPriority=100;if(light.name==='moonlight')light.renderPriority=90;if(light.name==='harbor terminal floodlight')light.renderPriority=85;}
  let low=false;
  const update=()=>{
    const eye=scene.activeCamera!.position;
    for(const e of emitters){const matrix=e.node.computeWorldMatrix();Vector3.TransformCoordinatesToRef(e.local,matrix,e.world);Vector3.TransformNormalToRef(e.direction,matrix,e.worldDirection);e.worldDirection.normalize();e.score=e.node.isEnabled()?rankLight(Vector3.DistanceSquared(eye,e.world),e.socket.power,e.socket.range):0;}
    const sorted={spot:emitters.filter(e=>e.socket.kind==='spot'&&e.score>0).sort((a,b)=>b.score-a.score),point:emitters.filter(e=>e.socket.kind==='point'&&e.score>0).sort((a,b)=>b.score-a.score)};
    let spot=0,point=0;
    for(const [index,entry]of pool.entries()){
      const e=entry.kind==='spot'?sorted.spot[spot++]:sorted.point[point++];
      if(!e||(low&&index>=3)){entry.light.intensity=0;continue;}
      entry.light.position.copyFrom(e.world);entry.light.diffuse=Color3.FromHexString(e.socket.color).toLinearSpace();entry.light.range=e.socket.range;entry.light.shadowMaxZ=e.socket.range;entry.light.intensity=e.socket.power;
      if(entry.light instanceof SpotLight){entry.light.direction.copyFrom(e.worldDirection);entry.light.angle=e.socket.angle??1.05;entry.light.innerAngle=entry.light.angle*.65;}
    }
  };
  const filmLights=()=>{const positions:number[]=[],directions:number[]=[],colors:number[]=[];for(const {light}of pool){positions.push(light.position.x,light.position.y,light.position.z,Math.min(light.range,1e4));const direction=light instanceof SpotLight?light.direction:Vector3.Zero();directions.push(direction.x,direction.y,direction.z,light instanceof SpotLight?Math.cos(light.angle/2):-1);colors.push(light.diffuse.r,light.diffuse.g,light.diffuse.b,light.isEnabled()?light.intensity:0);}return {positions,directions,colors};};
  update();
  return {update,filmLights,setLow(value:boolean){low=value;const map=beamShadow.getShadowMap();if(map)map.refreshRate=low?2:1;for(const m of scene.materials)if(m instanceof StandardMaterial||m instanceof PBRMaterial)m.maxSimultaneousLights=low?6:9;update();},diagnostics(){return {emitters:emitters.length,active:pool.filter(e=>e.light.intensity>0).length};}};
}
