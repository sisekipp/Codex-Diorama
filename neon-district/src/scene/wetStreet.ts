import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { MirrorTexture } from '@babylonjs/core/Materials/Textures/mirrorTexture';
import type { Scene } from '@babylonjs/core/scene';
import { clampPercent } from './weather';

const vertex=`precision highp float;
attribute vec3 position;
uniform mat4 world;
uniform mat4 worldViewProjection;
varying vec3 vWorld;
varying vec4 vClip;
void main(){vWorld=(world*vec4(position,1.0)).xyz;vClip=worldViewProjection*vec4(position,1.0);gl_Position=vClip;}`;
const fragment=`precision highp float;
varying vec3 vWorld;
varying vec4 vClip;
uniform sampler2D reflectionSampler;
uniform vec3 eye;
uniform float time;
uniform float wetness;
uniform float rainfall;
uniform vec4 lampPositions[6];
uniform vec4 lampDirections[6];
uniform vec4 lampColors[6];
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){
 vec2 p=vWorld.xz;
 float grain=noise(p*42.0);
 float n=noise(p*.63)+.45*noise(p*2.1);
 float wetPatch=smoothstep(.25,1.05,n);
 float facing=abs(normalize(eye-vWorld).y);
 float fresnel=.25+.75*pow(1.0-facing,2.0);
 vec2 uv=vClip.xy/vClip.w*.5+.5;
 float wobble=(noise(p*vec2(12.0,3.0))-.5)*.005;
 vec2 cell=floor(p*2.0),local=fract(p*2.0)-.5;
 float phase=fract(time*1.6+hash(cell));
 float ripple=sin((length(local)-phase*.65)*65.0)*exp(-phase*4.0)*.0012*rainfall;
 uv+=vec2(wobble+ripple,(grain-.5)*.003);
 vec3 mirror=texture2D(reflectionSampler,clamp(uv,vec2(.002),vec2(.998))).rgb;
 vec3 lights=vec3(0.0);
 vec3 N=normalize(vec3((noise(p*18.0)-.5)*.12,1.0,(noise(p*23.0)-.5)*.12));
 vec3 V=normalize(eye-vWorld);
 for(int i=0;i<6;i++){
   if(lampColors[i].w<.001)continue;
   vec3 delta=vWorld-lampPositions[i].xyz;
   float distanceSquared=max(dot(delta,delta),.2);
   float rangeFade=pow(clamp(1.0-pow(sqrt(distanceSquared)/max(lampPositions[i].w,.1),4.0),0.0,1.0),2.0);
   float cone=lampDirections[i].w<0.0?1.0:smoothstep(lampDirections[i].w,min(.999,lampDirections[i].w+.12),dot(normalize(delta),lampDirections[i].xyz));
   vec3 L=-normalize(delta),H=normalize(V+L);
   float highlight=pow(max(dot(N,H),0.0),55.0);
   lights+=lampColors[i].rgb*lampColors[i].w/distanceSquared*rangeFade*cone*(.015+.45*highlight);
 }
 float micro=.48+.52*noise(p*vec2(32.0,9.0));
 vec3 color=mirror*(.6+wetPatch*.3)+lights*micro;
 float distanceFade=exp(-length(eye-vWorld)*.008);
 color=mix(vec3(.025,.047,.065),color,distanceFade);
 float alpha=wetness*(.18+.3*wetPatch)*fresnel;
 gl_FragColor=vec4(color,alpha);
}`;

/** Distorted planar reflections and broken neon highlights share one road draw. */
export function createWetStreet(scene:Scene,mirror:MirrorTexture){
  const surface=MeshBuilder.CreateGround('continuous rainwater film',{width:13.92,height:110},scene);surface.position.set(0,.045,15);surface.isPickable=false;
  const material=new ShaderMaterial('wet asphalt film',scene,{vertexSource:vertex,fragmentSource:fragment},{attributes:['position'],uniforms:['world','worldViewProjection','eye','time','wetness','rainfall','lampPositions','lampDirections','lampColors'],samplers:['reflectionSampler'],needAlphaBlending:true});
  material.setTexture('reflectionSampler',mirror);material.backFaceCulling=false;material.disableDepthWrite=true;surface.material=material;
  let wetness=.9;
  material.setFloat('wetness',wetness);material.setFloat('rainfall',.55);material.setFloat('time',0);material.setVector3('eye',Vector3.Zero());for(const key of ['lampPositions','lampDirections','lampColors'])material.setArray4(key,Array(24).fill(0));
  return {setLights(lights:{positions:number[];directions:number[];colors:number[]}){material.setArray4('lampPositions',lights.positions);material.setArray4('lampDirections',lights.directions);material.setArray4('lampColors',lights.colors);},setWetness(value:number){wetness=clampPercent(value)/100;material.setFloat('wetness',wetness);surface.setEnabled(wetness>0);},update(time:number,rain:number){material.setFloat('time',time);material.setFloat('rainfall',rain/100);material.setVector3('eye',scene.activeCamera!.globalPosition);},getWetness(){return wetness*100;}};
}
