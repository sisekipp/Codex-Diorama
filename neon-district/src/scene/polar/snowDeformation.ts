import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer';
import type { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import type { Scene } from '@babylonjs/core/scene';
import type { PolarMaterials } from './materials';
import { SnowPhysics,type BladeContact,type SnowContact } from './snowPhysics';
import { snowHeight } from './terrainMath';
import { createSnowClumps } from './snowClumps';
/** Conservative material field, GPU-displaced surface, and a camera-local 12.5 cm detail mesh. */
export function createSnowDeformation(scene:Scene,m:PolarMaterials){
  const nx=648,nz=996,spacing=.25,left=-62,back=185;
  const physics=new SnowPhysics({left,back,columns:nx,rows:nz,spacing,surface:snowHeight,depth:(x,z)=>snowHeight(x,z)<-.5?0:.58+.08*Math.sin(x*.07+z*.05),particleLimit:900});
  const mesh=MeshBuilder.CreateGround('BOREAL mass conserving displaced snow',{width:162,height:249,subdivisionsX:162,subdivisionsY:249},scene);mesh.position.set(19,0,60.5);mesh.material=m.snow;mesh.metadata={physicalSnow:1,physics};mesh.receiveShadows=true;mesh.isPickable=false;mesh.alwaysSelectAsActiveMesh=true;
  // CPU positions provide broad bounds only. All moving snow height and normals come from the GPU field.
  const p=mesh.getVerticesData(VertexBuffer.PositionKind)!;for(let i=0;i<p.length;i+=3)p[i+1]=snowHeight(p[i]+19,p[i+2]+60.5);mesh.setVerticesData(VertexBuffer.PositionKind,p);
  const detail=MeshBuilder.CreateGround('BOREAL local granular snow detail',{width:32,height:32,subdivisions:256},scene);detail.material=m.snow;detail.metadata={physicalSnow:2};detail.receiveShadows=true;detail.isPickable=false;detail.alwaysSelectAsActiveMesh=true;
  const detailLow=MeshBuilder.CreateGround('BOREAL efficient local snow detail',{width:32,height:32,subdivisions:128},scene);detailLow.material=m.snow;detailLow.metadata={physicalSnow:2};detailLow.receiveShadows=true;detailLow.isPickable=false;detailLow.alwaysSelectAsActiveMesh=true;detailLow.setEnabled(false);
  const data=new Uint8Array((nx+1)*(nz+1)*4);
  function encode(i:number){const value=Math.round(Math.max(0,Math.min(65535,(physics.surfaceAt(i)+6)/32*65535))),j=i*4;data[j]=value>>8;data[j+1]=value&255;data[j+2]=Math.round(physics.packing[i]*255);data[j+3]=Math.round(physics.disturbed[i]*255);}
  for(let i=0;i<physics.mass.length;i++)encode(i);
  const texture=RawTexture.CreateRGBATexture(data,nx+1,nz+1,scene,false,false,Texture.BILINEAR_SAMPLINGMODE);texture.name='BOREAL height mass packing disturbance';texture.gammaSpace=false;texture.wrapU=texture.wrapV=Texture.CLAMP_ADDRESSMODE;m.snowShader.state.dispose();m.snowShader.state=texture;m.snowShader.grid=[nx+1,nz+1,spacing,1];
  const clumps=createSnowClumps(scene,m,physics);let lastTime=0,lastUpload=-1,accumulator=0,low=false,stamps=0,skiStamps=0,lastAudit=-10,balance=physics.massBalance();
  const height=(x:number,z:number)=>x<left||x>100||z<-64||z>back?snowHeight(x,z):physics.height(x,z);
  return {mesh,detail,detailLow,physics,height,reset(){physics.reset();stamps=0;skiStamps=0;lastAudit=-10;lastUpload=-1;},referenceHeight:snowHeight,setLow(value:boolean){low=value;physics.particleLimit=value?350:900;detail.setEnabled(!value);detailLow.setEnabled(value);m.snowShader.patch[3]=1;},plow(blade:BladeContact){physics.plow(blade);},stamp(kind:SnowContact,x:number,z:number,yaw:number,time:number){physics.contact(kind,x,z,yaw,time);stamps++;if(kind==='ski')skiStamps++;},update(time:number,wind=30,snowfall=0,reduced=false){
    const dt=Math.max(0,Math.min(.1,time-lastTime));lastTime=time;if(!reduced){accumulator+=dt;for(let k=0;accumulator>=1/30&&k<3;k++){physics.step(1/30,wind,snowfall);accumulator-=1/30;}}
    const target=(scene.activeCamera as ArcRotateCamera|null)?.target??scene.activeCamera?.position;if(target){const camera=scene.activeCamera!,x=Math.round((target.x+(camera.position.x-target.x)*.2)*2)/2,z=Math.round((target.z+(camera.position.z-target.z)*.2)*2)/2;detail.position.set(x,0,z);detailLow.position.copyFrom(detail.position);m.snowShader.patch=[x,z,16,1];}
    m.snowShader.time=time;m.snowShader.wind=wind/100;
    if(physics.changed.size&&time-lastUpload>(low?.16:.08)){for(const i of physics.changed)encode(i);physics.changed.clear();texture.update(data);lastUpload=time;}
    clumps.update();
  },diagnostics(){if(lastTime-lastAudit>3){balance=physics.massBalance();lastAudit=lastTime;}return {snowImpressions:stamps,skiImpressions:skiStamps,deformedVertices:physics.active.size,snowMovedKg:physics.displacedKg,snowPlowedKg:physics.bladeKg,snowClumps:physics.particles.length,snowMassErrorKg:balance.error,snowAirborneKg:balance.airborne};}};
}
export type SnowSurface=ReturnType<typeof createSnowDeformation>;
