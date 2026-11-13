import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Matrix,Quaternion,Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import type { PolarMaterials } from './materials';
import type { SnowPhysics } from './snowPhysics';
import '@babylonjs/core/Meshes/thinInstanceMesh';
/** Visible clumps are the solver's mass-bearing particles, not an unrelated decorative emitter. */
export function createSnowClumps(scene:Scene,m:PolarMaterials,physics:SnowPhysics){
  const mesh=MeshBuilder.CreateIcoSphere('BOREAL physical airborne snow clumps',{radius:1,subdivisions:1},scene);mesh.material=m.cap;mesh.isPickable=false;mesh.alwaysSelectAsActiveMesh=true;mesh.doNotSyncBoundingInfo=true;
  const matrices=new Float32Array(1200*16),position=new Vector3(),scale=new Vector3();mesh.thinInstanceSetBuffer('matrix',matrices,16,false);mesh.thinInstanceCount=0;mesh.isVisible=false;
  return {mesh,update(){const count=Math.min(1200,physics.particles.length);mesh.isVisible=count>0;mesh.thinInstanceCount=count;for(let i=0;i<count;i++){const p=physics.particles[i];position.set(p.x,p.y,p.z);scale.set(p.radius*1.3,p.radius*.85,p.radius);Matrix.Compose(scale,Quaternion.RotationYawPitchRoll(p.spin+p.age*2,p.spin+p.age*3,p.age),position).copyToArray(matrices,i*16);}if(count)mesh.thinInstanceBufferUpdated('matrix');}};
}
