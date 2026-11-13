import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { Scene } from '@babylonjs/core/scene';
import type { MarsMaterials } from './materials';
import { terrainHeight, TERRAIN_SIZE } from './terrainMath';

export function createMarsTerrain(scene:Scene,m:MarsMaterials){
  const ground=MeshBuilder.CreateGround('ARES sculpted regolith',{width:TERRAIN_SIZE,height:TERRAIN_SIZE,subdivisions:230,updatable:false},scene),positions=ground.getVerticesData('position')!;
  for(let i=0;i<positions.length;i+=3){const x=positions[i],z=positions[i+2],edge=Math.max(Math.abs(x+4)/64,Math.abs(z+10)/56),weight=Math.max(0,Math.min(1,(1-edge)*8));positions[i+1]=terrainHeight(x,z)-weight*.48;}
  const normals:number[]=[];VertexData.ComputeNormals(positions,ground.getIndices()!,normals);ground.setVerticesData('position',positions,false);ground.setVerticesData('normal',normals,false);ground.refreshBoundingInfo();ground.isPickable=false;ground.receiveShadows=true;
  const sand=new PBRMaterial('ARES layered oxidized sand',scene);sand.albedoColor=Color3.FromHexString('#b47e53').toLinearSpace();sand.roughness=.96;sand.metallic=0;sand.environmentIntensity=.2;
  const color=new DynamicTexture('ARES regolith grain',512,scene,true),c=color.getContext() as CanvasRenderingContext2D;
  c.fillStyle='#bd9e7d';c.fillRect(0,0,512,512);let seed=812;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<48000;i++){const n=rand();c.fillStyle=n>.8?'#e2c69a55':n>.35?'#78533832':'#412c251b';c.fillRect(rand()*512,rand()*512,.6+rand()*1.4,.6+rand()*1.4);}color.update();color.uScale=color.vScale=22;sand.albedoTexture=color;
  const normal=new DynamicTexture('ARES sand micro relief',256,scene,true),nc=normal.getContext() as CanvasRenderingContext2D,pixels=nc.createImageData(256,256);for(let i=0;i<pixels.data.length;i+=4)pixels.data.set([110+rand()*36,110+rand()*36,250,255],i);nc.putImageData(pixels,0,0);normal.update();normal.gammaSpace=false;normal.uScale=normal.vScale=110;normal.level=.6;sand.bumpTexture=normal;ground.material=sand;
  const detail=MeshBuilder.CreateGround('ARES detailed wind-carved sand',{width:128,height:112,subdivisions:300},scene),dp=detail.getVerticesData('position')!;for(let i=0;i<dp.length;i+=3){dp[i]-=4;dp[i+2]-=10;dp[i+1]=terrainHeight(dp[i],dp[i+2])+.008;}const dn:number[]=[];VertexData.ComputeNormals(dp,detail.getIndices()!,dn);detail.setVerticesData('position',dp);detail.setVerticesData('normal',dn);detail.refreshBoundingInfo();detail.material=sand;detail.receiveShadows=true;detail.isPickable=false;
  const sources=[m.stone,m.sandstone,m.basalt].map((material,i)=>{const mesh=MeshBuilder.CreateIcoSphere('ARES rock source '+i,{radius:1,subdivisions:2,flat:false},scene);const p=mesh.getVerticesData('position')!;for(let n=0;n<p.length;n+=3){const scale=1+.13*Math.sin(p[n]*8+p[n+1]*5+i*2)+.09*Math.cos(p[n+2]*9-p[n]*3);p[n]*=scale;p[n+1]*=scale;p[n+2]*=scale;}mesh.setVerticesData('position',p);mesh.convertToFlatShadedMesh();mesh.material=material;mesh.isVisible=false;return mesh;});
  for(let i=0;i<1800;i++){
    const x=(rand()-.5)*255,z=(rand()-.5)*255;
    if((Math.hypot((x+17)/34,(z-7)/30)<1)||(Math.hypot(x-42,z-28)<22)||(Math.abs(z+25)<7&&Math.abs(x)<31)||(Math.hypot(x+45,z+13)<18))continue;
    const scale=.08+Math.pow(rand(),3)*2.3,rock=sources[i%3].createInstance('ARES scattered rock');rock.position.set(x,terrainHeight(x,z)+scale*.28,z);rock.scaling.set(scale,scale*(.35+rand()*.5),scale*(.6+rand()*.65));rock.rotation.set(rand()*.6,rand()*6.28,rand()*.5);rock.isPickable=false;rock.freezeWorldMatrix();
  }
  const warp=(mesh:Mesh,seed:number,height:number)=>{const p=mesh.getVerticesData('position')!;for(let n=0;n<p.length;n+=3){const angle=Math.atan2(p[n+2],p[n]),f=1+.16*Math.sin(angle*3+seed)+.1*Math.cos(angle*7+seed*.7),r=Math.hypot(p[n],p[n+2]);p[n]*=f;p[n+2]*=f;if(p[n+1]>0&&r>.1)p[n+1]+=height*.1*Math.sin(angle*3+seed*.3);}const normals:number[]=[];VertexData.ComputeNormals(p,mesh.getIndices()!,normals);mesh.setVerticesData('position',p);mesh.setVerticesData('normal',normals);mesh.refreshBoundingInfo();};
  // Large irregular buttes close the horizon, with separate geological ledges.
  for(let i=0;i<18;i++){
    const x=-125+i*15+rand()*8,z=109+rand()*20,h=12+rand()*20,w=10+rand()*13;
    const cliff=MeshBuilder.CreateCylinder('ARES distant stratified butte',{diameterTop:w*.8,diameterBottom:w*1.25,height:h,tessellation:12},scene);warp(cliff,i,h);cliff.position.set(x,terrainHeight(x,z)+h*.4,z);cliff.scaling.z=.55+rand()*.5;cliff.rotation.y=rand()*3;cliff.material=m.stone;cliff.isPickable=false;
    for(let n=0;n<4;n++){const ledge=MeshBuilder.CreateCylinder('ARES geological ledge',{diameterTop:w*(1.13-n*.06),diameterBottom:w*(1.16-n*.06),height:.25+rand()*.35,tessellation:12},scene);warp(ledge,i,.4);ledge.position.set(x,cliff.position.y-h*.35+n*h*.2,z);ledge.scaling.z=cliff.scaling.z;ledge.rotation.y=cliff.rotation.y;ledge.material=n%2?m.stone:m.sandstone;ledge.isPickable=false;}
  }
  return {ground,height:terrainHeight};
}
