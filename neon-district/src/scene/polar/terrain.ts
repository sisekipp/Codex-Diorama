import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { MirrorTexture } from '@babylonjs/core/Materials/Textures/mirrorTexture';
import { Color3,Color4 } from '@babylonjs/core/Maths/math.color';
import { Plane } from '@babylonjs/core/Maths/math.plane';
import type { Scene } from '@babylonjs/core/scene';
import { modelAssembly } from '../modelAssembly';
import { snowHeight,glacierHeight,mountainHeight,approachValley } from './terrainMath';
import type { PolarMaterials } from './materials';
export function createPolarTerrain(scene:Scene,m:PolarMaterials){
  const ground=MeshBuilder.CreateGround('BOREAL sculpted snow terrain',{width:600,height:600,subdivisions:300,updatable:true},scene),p=ground.getVerticesData(VertexBuffer.PositionKind)!;for(let i=0;i<p.length;i+=3)p[i+1]=snowHeight(p[i],p[i+2])-(p[i]>-62&&p[i]<100&&p[i+2]>-64&&p[i+2]<185?1.4:0);ground.updateVerticesData(VertexBuffer.PositionKind,p);const n:number[]=[];VertexData.ComputeNormals(p,ground.getIndices()!,n);ground.updateVerticesData(VertexBuffer.NormalKind,n);ground.setVerticesData(VertexBuffer.UVKind,Array.from(p).flatMap((n,i)=>i%3===0?[n/2,p[i+2]/2]:[]));ground.material=m.snow;ground.receiveShadows=true;ground.isPickable=false;
  const mirror=new MirrorTexture('BOREAL coastal reflections',512,scene,true);mirror.mirrorPlane=new Plane(0,-1,0,-.8);mirror.level=.7;mirror.blurKernel=14;mirror.renderParticles=false;mirror.clearColor=new Color4(.02,.055,.08,1);
  const waterMat=new PBRMaterial('BOREAL freezing dark water',scene);waterMat.albedoColor=new Color3(.012,.06,.09);waterMat.metallic=.45;waterMat.roughness=.18;waterMat.reflectionTexture=mirror;waterMat.environmentIntensity=.7;
  const water=MeshBuilder.CreateGround('BOREAL open water bay',{width:1100,height:1100,subdivisions:70,updatable:true},scene);water.position.y=-.8;water.material=waterMat;water.isPickable=false;const wp=water.getVerticesData(VertexBuffer.PositionKind)!;
  const a=modelAssembly(scene,'BOREAL snowbanks glacier and sea ice');
  let seed=984;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<180;i++){const x=-80-random()*170,z=-200+random()*480;if(Math.abs(x+94)<17&&Math.abs(z)<46)continue;const radius=1.3+random()*6;const floe=MeshBuilder.CreateCylinder('BOREAL floating broken sea ice',{diameter:radius*2,height:.4+random()*.6,tessellation:6+Math.floor(random()*3)},scene);floe.position.set(x,-.65+random()*.16,z);floe.rotation.set((random()-.5)*.04,random()*7,(random()-.5)*.07);floe.material=m.ice;const fp=floe.getVerticesData(VertexBuffer.PositionKind)!;for(let k=0;k<fp.length;k+=3){const angle=Math.atan2(fp[k+2],fp[k]),scale=1+.08*Math.sin(angle*3+i*2.1)+.06*Math.sin(angle*5-i);fp[k]*=scale;fp[k+2]*=scale;}floe.setVerticesData(VertexBuffer.PositionKind,fp);const fn:number[]=[];VertexData.ComputeNormals(fp,floe.getIndices()!,fn);floe.setVerticesData(VertexBuffer.NormalKind,fn);const top=floe.clone('snow crusted floe top')!;top.position.y+=.25;top.scaling.set(.96,.24,.96);top.material=m.cap;}
  // Fractured glacier front and continuous wind-worn upper snow surface.
  const glacierTop:number[]=[],glacierFront:number[]=[],gi:number[]=[],gf:number[]=[];
  for(let i=0;i<=60;i++){const x=-65+i*4.7,h=glacierHeight(x),z=155+4*Math.sin(i*.57);glacierFront.push(x,1,z,x,h,z+2);glacierTop.push(x,h+.12,z+2,x,h+8*(1-approachValley(x)),200);if(i<60){const b=i*2;gf.push(b,b+1,b+3,b,b+3,b+2);gi.push(b,b+2,b+3,b,b+3,b+1);}}
  for(const [name,positions,indices,material]of [['BOREAL fractured glacier face',glacierFront,gf,m.ice],['BOREAL glacier snow cap',glacierTop,gi,m.snow]] as const){const mesh=new Mesh(name,scene),data=new VertexData(),normals:number[]=[];VertexData.ComputeNormals(positions,indices,normals);Object.assign(data,{positions,indices,normals,uvs:positions.flatMap((n,i)=>i%3===0?[n*.016,positions[i+1]*.04]:[])});data.applyToMesh(mesh);mesh.material=material;material.backFaceCulling=false;}
  // Continuous alpine relief avoids conical, toy-like mountain silhouettes.
  const mountains=MeshBuilder.CreateGround('BOREAL continuous polar mountain range',{width:1100,height:550,subdivisions:190,updatable:true},scene);mountains.position.z=370;
  const mp=mountains.getVerticesData(VertexBuffer.PositionKind)!,colors:number[]=[];
  for(let i=0;i<mp.length;i+=3)mp[i+1]=mountainHeight(mp[i],mp[i+2]+370);
  const mn:number[]=[];VertexData.ComputeNormals(mp,mountains.getIndices()!,mn);for(let i=0;i<mp.length;i+=3){const snow=Math.max(.22,Math.min(1,(mn[i+1]-.35)*2.3));colors.push(.42+snow*.58,.51+snow*.49,.58+snow*.42,1);}mountains.updateVerticesData(VertexBuffer.PositionKind,mp,true);mountains.updateVerticesData(VertexBuffer.NormalKind,mn);mountains.setVerticesData(VertexBuffer.ColorKind,colors);mountains.setVerticesData(VertexBuffer.UVKind,Array.from(mp).flatMap((n,i)=>i%3===0?[n/2,(mp[i+2]+370)/2]:[]));mountains.material=m.snow;mountains.isPickable=false;
  // Visible fracture front, survey rope and exposed rocks at the glacier field.
  for(let i=0;i<13;i++){const x=8+i*3;a.box('blue crevasse inner face',x,.8,106+Math.sin(i*.8)*1.6,4,2.8,2.4,m.ice);a.sphere('crevasse snow lip',x,2.5,108+Math.sin(i*.8)*1.6,4.8,1.8,3,m.cap);}
  for(let i=0;i<110;i++){const x=-45+random()*200,z=70+random()*90;if(Math.abs(x-64)<18)continue;const r=.3+random()*1.7;const rock=MeshBuilder.CreateIcoSphere('BOREAL wind exposed rock',{radius:r,subdivisions:1},scene);rock.position.set(x,snowHeight(x,z)+r*.15,z);rock.scaling.y=.55;rock.material=m.rock;}
  a.finish(220);
  return {ground,mirror,update(time:number){for(let i=0;i<wp.length;i+=3)wp[i+1]=.035*Math.sin(wp[i]*.16+time*.55)+.025*Math.sin(wp[i+2]*.23-time*.4);water.updateVerticesData(VertexBuffer.PositionKind,wp);}};
}
