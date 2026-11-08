import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { HDRCubeTexture } from '@babylonjs/core/Materials/Textures/hdrCubeTexture';
import type { Material } from '@babylonjs/core/Materials/material';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { beveledBox } from './beveledBox';
import { texturePhysical } from './surfaceMaps';
import type { Scene } from '@babylonjs/core/scene';

/** Shared authored geometry and local CC0 PBR surfaces for the harbor. */
export function createHarborKit(scene:Scene){
  const environment=new HDRCubeTexture('/materials/harbor-light.hdr',scene,64,false,true,false,true);environment.rotationY=2.1;scene.environmentTexture=environment;scene.environmentIntensity=.3;
  const standard=(name:string,color:string,glow=0)=>{const mat=new StandardMaterial(name,scene);mat.diffuseColor=Color3.FromHexString(color);mat.specularColor=new Color3(.2,.27,.3);mat.emissiveColor=Color3.FromHexString(color).scale(glow);return mat;};
  const physical=(name:string,asset:'metal'|'concrete',color:string,metallic:number)=>{
    const material=new PBRMaterial(name,scene);material.albedoColor=Color3.FromHexString(color).toLinearSpace();material.metallic=metallic;material.roughness=.66;
    const load=(map:string)=>{const t=new Texture(`/materials/${asset}-${map}.jpg`,scene);t.uScale=2;t.vScale=3;t.gammaSpace=map==='color';return t;};
    material.albedoTexture=load('color');material.bumpTexture=load('normal');material.bumpTexture.level=.6;
    material.metallicTexture=load('arm');material.useRoughnessFromMetallicTextureAlpha=false;material.useRoughnessFromMetallicTextureGreen=true;material.useMetallnessFromMetallicTextureBlue=false;material.useAmbientOcclusionFromMetallicTextureRed=true;
    material.environmentIntensity=.38;material.maxSimultaneousLights=4;return material;
  };
  const mat={steel:physical('harbor oxidized steel','metal','#74848a',.65),concrete:physical('harbor cast concrete','concrete','#727a77',.08),dark:standard('harbor graphite','#142129'),trim:standard('harbor edge metal','#52676c'),glass:standard('harbor smoked glass','#102931'),warm:standard('harbor warm interiors','#e1ae6a',.8),cold:standard('harbor pale interiors','#8fb9b5',.55),amber:standard('harbor amber navigation','#ffc078',1.5),cyan:standard('harbor teal navigation','#7bd7d2',1.35),red:standard('harbor warning lamps','#e75f48',1.5),paint:physical('harbor painted structure','metal','#677b7d',.35),taxi:standard('harbor taxi ochre','#c58a45'),white:standard('harbor ivory paint','#8caaa4')};
  texturePhysical(mat.paint,'paint',true);mat.paint.metallic=.2;
  const deck=new PBRMaterial('harbor non slip landing deck',scene);texturePhysical(deck,'paint',true);deck.environmentIntensity=.5;deck.albedoColor=Color3.FromHexString('#25383d').toLinearSpace();deck.metallic=.15;deck.roughness=.65;
  const paving=new PBRMaterial('harbor aggregate paving',scene);paving.environmentIntensity=.45;paving.albedoColor=Color3.FromHexString('#657274').toLinearSpace();texturePhysical(paving,'concrete',true);paving.metallic=0;paving.roughness=.9;
  mat.glass.specularColor=new Color3(.07,.11,.12);mat.glass.specularPower=12;
  const sources=new Map<string,Mesh>();let sequence=0;
  const instance=(key:string,make:()=>Mesh,name:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,material:Material,parent?:TransformNode)=>{
    const id=key+material.uniqueId;let source=sources.get(id);if(!source){source=make();source.material=material;source.isVisible=false;source.isPickable=false;sources.set(id,source);}
    const mesh=source.createInstance(name);mesh.position.set(x,y,z);mesh.scaling.set(sx,sy,sz);mesh.parent=parent??null;mesh.isPickable=false;if(!parent)mesh.freezeWorldMatrix();return mesh;
  };
  const box=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,material:Material,parent?:TransformNode)=>{const bevel=Math.min(w,h,d)>.25&&/cabinet|console|freight|cargo|pillar|bench|container|skid|housing/.test(name);return instance('box'+bevel,()=>bevel?beveledBox('harbor beveled source '+sequence++,scene):MeshBuilder.CreateBox('harbor box source '+sequence++,{size:1},scene),name,x,y,z,w,h,d,material,parent);};
  const cylinder=(name:string,x:number,y:number,z:number,diameter:number,height:number,material:Material,parent?:TransformNode,tessellation=32)=>instance('cylinder'+tessellation,()=>MeshBuilder.CreateCylinder('harbor cylinder source '+sequence++,{diameter:1,height:1,tessellation},scene),name,x,y,z,diameter,height,diameter,material,parent);
  const sphere=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,material:Material,parent?:TransformNode)=>instance('sphere',()=>MeshBuilder.CreateSphere('harbor sphere source '+sequence++,{diameter:1,segments:12},scene),name,x,y,z,w,h,d,material,parent);
  const beam=(name:string,a:Vector3,b:Vector3,width:number,material:Material=mat.steel,parent?:TransformNode)=>{const delta=b.subtract(a),center=a.add(b).scale(.5),mesh=box(name,center.x,center.y,center.z,width,width,delta.length(),material,parent);mesh.unfreezeWorldMatrix();mesh.rotation.set(-Math.atan2(delta.y,Math.hypot(delta.x,delta.z)),Math.atan2(delta.x,delta.z),0);if(!parent)mesh.freezeWorldMatrix();return mesh;};
  const ring=(name:string,x:number,y:number,z:number,diameter:number,thickness:number,material:Material,parent?:TransformNode)=>instance('ring'+thickness/diameter,()=>MeshBuilder.CreateTorus('harbor ring source '+sequence++,{diameter:1,thickness:thickness/diameter,tessellation:64},scene),name,x,y,z,diameter,diameter,diameter,material,parent);
  // Chamfered architectural volumes: eight side faces and inset edges, not a rectangular box.
  const chamfer=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,material:Material,parent?:TransformNode)=>instance('chamfer',()=>{
    const contour=[[-.36,-.5],[.36,-.5],[.5,-.36],[.5,.36],[.36,.5],[-.36,.5],[-.5,.36],[-.5,-.36]];
    const positions:number[]=[],indices:number[]=[],uvs:number[]=[];
    for(let i=0;i<8;i++){
      const a=contour[i],b=contour[(i+1)%8],base=positions.length/3;
      positions.push(a[0],-.5,a[1],b[0],-.5,b[1],b[0],.5,b[1],a[0],.5,a[1]);uvs.push(0,0,1,0,1,1,0,1);indices.push(base,base+2,base+1,base,base+3,base+2);
    }
    for(const top of [-.5,.5]){const base=positions.length/3;positions.push(0,top,0);uvs.push(.5,.5);for(const p of contour){positions.push(p[0],top,p[1]);uvs.push(p[0]+.5,p[1]+.5);}for(let i=0;i<8;i++){const a=base+1+i,b=base+1+(i+1)%8;if(top>0)indices.push(base,b,a);else indices.push(base,a,b);}}
    const normals:number[]=[];VertexData.ComputeNormals(positions,indices,normals);const data=new VertexData();data.positions=positions;data.indices=indices;data.normals=normals;data.uvs=uvs;const mesh=new Mesh('harbor chamfer source '+sequence++,scene);data.applyToMesh(mesh);return mesh;
  },name,x,y,z,w,h,d,material,parent);
  const label=(name:string,text:string,subtitle:string,x:number,y:number,z:number,w:number,h:number,color='#ffd29a')=>{
    const tex=new DynamicTexture(name+' lettering',{width:1024,height:256},scene,false),ctx=tex.getContext() as CanvasRenderingContext2D;
    ctx.fillStyle='#0b1921';ctx.fillRect(0,0,1024,256);ctx.fillStyle=color;ctx.fillRect(25,25,8,206);ctx.font='bold 112px sans-serif';ctx.fillText(text,65,137);ctx.font='25px monospace';ctx.fillText(subtitle,70,207);tex.update();
    const material=new StandardMaterial(name+' lightbox',scene);material.diffuseTexture=tex;material.emissiveTexture=tex;material.emissiveColor=new Color3(1.1,1.1,1.1);material.backFaceCulling=false;material.specularColor=Color3.Black();const panel=MeshBuilder.CreatePlane(name,{width:w,height:h,sideOrientation:Mesh.DOUBLESIDE},scene);panel.position.set(x,y,z);panel.material=material;panel.isPickable=false;panel.metadata={practicalLight:{color,power:30,range:14,kind:'point'}};return panel;
  };
  return{mat:{...mat,deck,paving},box,cylinder,sphere,beam,ring,chamfer,label,environment};
}
export type HarborKit=ReturnType<typeof createHarborKit>;
