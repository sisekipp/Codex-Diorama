import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import type { Scene } from '@babylonjs/core/scene';

/** Closed 26-face unit solid: six panels, twelve edge bevels and eight corner chamfers. */
export function beveledBox(name:string,scene:Scene,bevel=.035){
  const positions:number[]=[],indices:number[]=[],uvs:number[]=[];const q=.5-bevel;
  const face=(points:number[][])=>{const base=positions.length/3;positions.push(...points.flat());for(let n=0;n<points.length;n++)uvs.push(n===1||n===2?1:0,n>1?1:0);const center=[0,1,2].map(axis=>points.reduce((sum,p)=>sum+p[axis],0)/points.length);
    const u=points[0].map((v,i)=>v-points[1][i]),v=points[2].map((v,i)=>v-points[1][i]),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],reverse=normal.reduce((sum,n,i)=>sum+n*center[i],0)<0;
    for(let n=1;n<points.length-1;n++)indices.push(base,base+(reverse?n+1:n),base+(reverse?n:n+1));};
  for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){const other=[0,1,2].filter(i=>i!==axis);face([[-q,-q],[q,-q],[q,q],[-q,q]].map(([a,b])=>{const p=[0,0,0];p[axis]=sign*.5;p[other[0]]=a;p[other[1]]=b;return p;}));}
  for(let axis=0;axis<3;axis++)for(const first of [-1,1])for(const second of [-1,1]){const [a,b]=[0,1,2].filter(i=>i!==axis);face([[-q,.5,q],[q,.5,q],[q,q,.5],[-q,q,.5]].map(([along,x,y])=>{const p=[0,0,0];p[axis]=along;p[a]=x*first;p[b]=y*second;return p;}));}
  for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])face([[x*.5,y*q,z*q],[x*q,y*.5,z*q],[x*q,y*q,z*.5]]);
  const data=new VertexData(),normals:number[]=[];VertexData.ComputeNormals(positions,indices,normals);Object.assign(data,{positions,indices,normals,uvs});const mesh=new Mesh(name,scene);data.applyToMesh(mesh);return mesh;
}
