import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Matrix, Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import { terrainHeight } from './terrainMath';
import { trailOpacity } from './state';
import '@babylonjs/core/Meshes/thinInstanceMesh';

const vertex=`precision highp float;attribute vec3 position;attribute vec2 uv;attribute vec4 world0;attribute vec4 world1;attribute vec4 world2;attribute vec4 world3;attribute vec4 trailTint;uniform mat4 viewProjection;varying vec2 vUV;varying vec4 vTint;void main(){vUV=uv;vTint=trailTint;gl_Position=viewProjection*mat4(world0,world1,world2,world3)*vec4(position,1.0);}`;
const fragment=`precision highp float;varying vec2 vUV;varying vec4 vTint;uniform sampler2D mark;uniform float illumination;void main(){vec4 ink=texture2D(mark,vUV);gl_FragColor=vec4(ink.rgb*illumination,ink.a*vTint.a);}`;
export function createMarsTracks(scene:Scene){
  const make=(foot:boolean,capacity:number)=>{
    const texture=new DynamicTexture(foot?'ARES boot sole imprint':'ARES chevron tire imprint',{width:128,height:256},scene,false),c=texture.getContext() as CanvasRenderingContext2D;
    c.clearRect(0,0,128,256);
    if(foot){c.fillStyle='rgba(67,43,30,.7)';c.beginPath();c.roundRect(25,12,78,152,26);c.fill();c.fillRect(31,179,66,57);c.strokeStyle='rgba(198,142,87,.7)';c.lineWidth=5;c.stroke();c.strokeStyle='rgba(179,120,74,.8)';c.lineWidth=7;for(let n=0;n<6;n++){c.beginPath();c.moveTo(32,30+n*23);c.lineTo(62,45+n*23);c.lineTo(96,28+n*23);c.stroke();}for(let n=0;n<3;n++)c.fillRect(35,187+n*16,58,6);
    }else{const g=c.createLinearGradient(0,0,128,0);g.addColorStop(0,'rgba(58,37,27,0)');g.addColorStop(.12,'rgba(79,49,29,.5)');g.addColorStop(.88,'rgba(79,49,29,.5)');g.addColorStop(1,'rgba(58,37,27,0)');c.fillStyle=g;c.fillRect(0,0,128,256);c.strokeStyle='rgba(205,143,84,.48)';c.lineWidth=8;for(let n=-1;n<7;n++){c.beginPath();c.moveTo(12,n*44+20);c.lineTo(64,n*44+40);c.lineTo(116,n*44+20);c.stroke();}}
    texture.hasAlpha=true;texture.update();
    const material=new ShaderMaterial('ARES terrain mark '+foot,scene,{vertexSource:vertex,fragmentSource:fragment},{attributes:['position','uv','world0','world1','world2','world3','trailTint'],uniforms:['viewProjection','illumination'],samplers:['mark'],needAlphaBlending:true});material.setTexture('mark',texture);material.setFloat('illumination',.9);material.backFaceCulling=false;material.disableDepthWrite=true;material.zOffset=-1;
    const mesh=MeshBuilder.CreatePlane(foot?'ARES persistent footprints':'ARES persistent wheel tracks',{size:1},scene);mesh.material=material;mesh.isPickable=false;mesh.alwaysSelectAsActiveMesh=true;mesh.doNotSyncBoundingInfo=true;
    const matrices=new Float32Array(capacity*16),colors=new Float32Array(capacity*4),born=new Float64Array(capacity);born.fill(-10000);mesh.thinInstanceSetBuffer('matrix',matrices,16,false);mesh.thinInstanceSetBuffer('trailTint',colors,4,false);mesh.thinInstanceCount=0;
    return {mesh,material,matrices,colors,born,capacity,cursor:0,count:0,dirty:false};
  };
  const feet=make(true,1300),tires=make(false,2800);let tick=0;
  const stamp=(kind:'foot'|'tire',x:number,z:number,yaw:number,time:number)=>{
    const group=kind==='foot'?feet:tires,i=group.cursor;group.cursor=(i+1)%group.capacity;group.count=Math.min(group.capacity,group.count+1);group.born[i]=time;
    const scale=kind==='foot'?new Vector3(.25,.48,1):new Vector3(.43,.63,1),rotation=Quaternion.RotationYawPitchRoll(yaw,Math.PI/2,0);
    Matrix.Compose(scale,rotation,new Vector3(x,terrainHeight(x,z)+.028+(i%7)*.0005,z)).copyToArray(group.matrices,i*16);group.colors.set([1,1,1,1],i*4);group.dirty=true;
  };
  return {stamp,update(time:number,wind:number,day:number){tick++;for(const group of [feet,tires]){if(group.dirty){group.mesh.thinInstanceCount=group.count;group.mesh.thinInstanceBufferUpdated('matrix');group.dirty=false;}if(tick%4===0){for(let i=0;i<group.count;i++)group.colors[i*4+3]=trailOpacity(time-group.born[i],wind);group.mesh.thinInstanceBufferUpdated('trailTint');}group.material.setFloat('illumination',.18+day*.32);}},diagnostics(){return {footprints:feet.count,tireMarks:tires.count};}};
}
export type MarsTracks=ReturnType<typeof createMarsTracks>;
