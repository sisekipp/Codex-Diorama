import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { texturePhysical } from './surfaceMaps';
import type { Scene } from '@babylonjs/core/scene';
import type { Material } from '@babylonjs/core/Materials/material';

const palettes=new WeakMap<Scene,ReturnType<typeof makePalette>>();
function makePalette(scene:Scene){
  const physical=(name:string,color:string,metal:number,rough:number)=>{const p=new PBRMaterial('closeup '+name,scene);p.albedoColor=Color3.FromHexString(color).toLinearSpace();p.metallic=metal;p.roughness=rough;p.environmentIntensity=.65;return p;};
  const blue=physical('ceramic petrol paint','#3b6970',.5,.32),ochre=physical('aged aerocab enamel','#c38943',.38,.38),ivory=physical('ivory enamel','#a5b3aa',.3,.4);
  for(const p of [blue,ochre,ivory]){p.clearCoat.isEnabled=true;p.clearCoat.intensity=.45;p.clearCoat.roughness=.26;}
  const steel=physical('machined steel','#7b9298',.85,.33),dark=physical('graphite cast metal','#24353d',.65,.62),rubber=physical('rubber and soot','#101b21',.05,.95),copper=physical('oxidized copper','#8c6142',.7,.64),seat=physical('stitched upholstery','#283439',0,.93);
  const glass=physical('smoked cockpit glazing','#658b91',.1,.22);glass.alpha=.24;glass.metallic=0;glass.roughness=.15;glass.environmentIntensity=.55;glass.backFaceCulling=false;
  const glow=(name:string,color:string)=>{const p=new StandardMaterial('closeup '+name,scene);p.diffuseColor=Color3.FromHexString(color);p.emissiveColor=p.diffuseColor.scale(.9);p.specularColor=Color3.Black();return p;};
  const white=glow('headlight lenses','#a8e5df'),red=glow('rear lenses','#dc625e'),amber=glow('status lenses','#d7a56a');
  for(const material of [blue,ochre,ivory])texturePhysical(material,'paint',true);
  for(const material of [steel,dark,copper])texturePhysical(material,'steel',true);texturePhysical(rubber,'rubber',true);texturePhysical(seat,'fabric',true);
  return {blue,ochre,ivory,steel,dark,rubber,copper,seat,glass,white,red,amber};
}
export function vehiclePalette(scene:Scene){let p=palettes.get(scene);if(!p){p=makePalette(scene);palettes.set(scene,p);}return p;}

export type HullSection={z:number;halfWidth:number;bottom:number;top:number};
/** Units are meters. Local +Y up, -Z nose; every finished part remains under one root. */
export function modelAssembly(scene:Scene,name:string){
  const root=new TransformNode(name,scene),parts:{mesh:Mesh;fine:boolean;parent:TransformNode}[]=[];
  const add=(mesh:Mesh,material:Material,fine=false)=>{mesh.material=material;mesh.parent=root;mesh.isPickable=false;parts.push({mesh,fine,parent:root});return mesh;};
  const box=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,material:Material,fine=false)=>{const p=add(MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene),material,fine);p.position.set(x,y,z);return p;};
  const sphere=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,material:Material,fine=false)=>{const p=add(MeshBuilder.CreateSphere(name,{diameter:1,segments:16},scene),material,fine);p.position.set(x,y,z);p.scaling.set(w,h,d);return p;};
  const cylinder=(name:string,x:number,y:number,z:number,diameter:number,height:number,material:Material,axis:'x'|'y'|'z'='y',fine=false)=>{const p=add(MeshBuilder.CreateCylinder(name,{diameter,height,tessellation:32},scene),material,fine);p.position.set(x,y,z);if(axis==='x')p.rotation.z=Math.PI/2;if(axis==='z')p.rotation.x=Math.PI/2;return p;};
  const tube=(name:string,points:Vector3[],radius:number,material:Material,fine=false)=>add(MeshBuilder.CreateTube(name,{path:points,radius,tessellation:8,cap:Mesh.CAP_ALL},scene),material,fine);
  const beam=(name:string,a:Vector3,b:Vector3,width:number,material:Material,fine=false)=>{const d=b.subtract(a),c=a.add(b).scale(.5),p=box(name,c.x,c.y,c.z,width,width,d.length(),material,fine);p.rotation.set(-Math.atan2(d.y,Math.hypot(d.x,d.z)),Math.atan2(d.x,d.z),0);return p;};
  const torus=(name:string,x:number,y:number,z:number,diameter:number,thickness:number,material:Material,axis:'x'|'y'|'z'='y',fine=false)=>{const p=add(MeshBuilder.CreateTorus(name,{diameter,thickness,tessellation:48},scene),material,fine);p.position.set(x,y,z);if(axis==='x')p.rotation.z=Math.PI/2;if(axis==='z')p.rotation.x=Math.PI/2;return p;};
  const lathe=(name:string,x:number,y:number,z:number,profile:[number,number][],material:Material,axis:'x'|'y'|'z'='y',fine=false)=>{const p=add(MeshBuilder.CreateLathe(name,{shape:profile.map(([radius,height])=>new Vector3(radius,height,0)),tessellation:48,cap:Mesh.CAP_ALL},scene),material,fine);p.position.set(x,y,z);if(axis==='x')p.rotation.z=-Math.PI/2;if(axis==='z')p.rotation.x=Math.PI/2;return p;};
  const patch=(name:string,points:Vector3[],material:Material,fine=false)=>{const p=new Mesh(name,scene),data=new VertexData();data.positions=points.flatMap(v=>[v.x,v.y,v.z]);data.indices=[];for(let n=1;n<points.length-1;n++)data.indices.push(0,n,n+1);const normals:number[]=[];VertexData.ComputeNormals(data.positions,data.indices,normals);data.normals=normals;data.uvs=points.flatMap((_,i)=>[i===1||i===2?1:0,i>1?1:0]);data.applyToMesh(p);return add(p,material,fine);};
  const hull=(name:string,sections:HullSection[],material:Material)=>{
    const positions:number[]=[],uvs:number[]=[],indices:number[]=[];
    // Eight bevelled corners per station. Separate face vertices preserve edge highlights.
    const contour=(s:HullSection)=>{const w=s.halfWidth,b=s.bottom,t=s.top,c=Math.min(.09,(t-b)*.22);return[[-w+c,b],[w-c,b],[w,b+c],[w,t-c],[w-c,t],[-w+c,t],[-w,t-c],[-w,b+c]];};
    for(let j=0;j<sections.length-1;j++)for(let i=0;i<8;i++){
      const a=sections[j],b=sections[j+1],ca=contour(a),cb=contour(b),q=(i+1)%8,start=positions.length/3;
      positions.push(ca[i][0],ca[i][1],a.z,ca[q][0],ca[q][1],a.z,cb[q][0],cb[q][1],b.z,cb[i][0],cb[i][1],b.z);uvs.push(0,j/sections.length,1,j/sections.length,1,(j+1)/sections.length,0,(j+1)/sections.length);indices.push(start,start+2,start+1,start,start+3,start+2);
    }
    for(const [s,reverse] of [[sections[0],false],[sections[sections.length-1],true]] as const){const c=contour(s),base=positions.length/3;for(const [x,y]of c){positions.push(x,y,s.z);uvs.push((x/s.halfWidth+1)/2,(y-s.bottom)/(s.top-s.bottom));}for(let n=1;n<7;n++)indices.push(base,base+(reverse?n+1:n),base+(reverse?n:n+1));}
    const data=new VertexData(),normals:number[]=[];VertexData.ComputeNormals(positions,indices,normals);Object.assign(data,{positions,indices,normals,uvs});const mesh=new Mesh(name,scene);data.applyToMesh(mesh);return add(mesh,material);
  };
  const articulate=(name:string,center:Vector3,axis:'x'|'y',motion:{kind:'wheel'|'fan';radius?:number;speed?:number},build:()=>void)=>{
    const start=parts.length,handle=new TransformNode(name,scene);handle.parent=root;handle.position.copyFrom(center);handle.metadata={motion:{...motion,axis}};build();
    for(const part of parts.slice(start)){part.mesh.position.subtractInPlace(center);part.mesh.parent=handle;part.parent=handle;}
    return handle;
  };
  const finish=(fineDistance=70)=>{
    const groups=new Map<string,{meshes:Mesh[];parent:TransformNode;fine:boolean}>();
    for(const {mesh,fine,parent}of parts){mesh.parent=null;mesh.computeWorldMatrix(true);const key=parent.uniqueId+':'+mesh.material!.uniqueId+':'+fine;const group=groups.get(key)??{meshes:[],parent,fine};group.meshes.push(mesh);groups.set(key,group);}
    for(const {meshes,parent,fine}of groups.values()){
      const material=meshes[0].material,merged=Mesh.MergeMeshes(meshes,true,true,undefined,false,false)!;
      merged.name=(parent===root?name:parent.name)+' / '+material!.name+(fine?' / fine':' / structure');merged.parent=parent;merged.isPickable=false;merged.receiveShadows=material?.name!=='closeup smoked cockpit glazing';if(fine)merged.addLODLevel(fineDistance,null);
    }
    root.metadata={authoredModel:true,localFrame:'Y up / -Z front / meters'};return root;
  };
  return {root,box,sphere,cylinder,tube,beam,torus,lathe,patch,hull,articulate,finish};
}
