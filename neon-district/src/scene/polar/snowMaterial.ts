import { MaterialPluginBase } from '@babylonjs/core/Materials/materialPluginBase';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import type { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';
import type { Scene } from '@babylonjs/core/scene';
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine';
import type { SubMesh } from '@babylonjs/core/Meshes/subMesh';
const declarations=`uniform vec4 snowField;uniform vec4 snowGrid;uniform vec4 snowPatch;uniform float snowKind;uniform float snowClock;uniform float snowWind;`;
const functions=`
uniform sampler2D snowState;
vec2 snowUV(vec2 p){vec2 cells=vec2((p.x-snowField.x)/snowGrid.z,(snowField.y-p.y)/snowGrid.z);return (cells+.5)/snowGrid.xy;}
float snowInside(vec2 p){vec2 q=snowUV(p);return step(0.,q.x)*step(q.x,1.)*step(0.,q.y)*step(q.y,1.);}
vec4 snowSample(vec2 p){return texture2D(snowState,clamp(snowUV(p),.5/snowGrid.xy,1.-.5/snowGrid.xy));}
float snowDecode(vec4 s){return -6.+32.*dot(s.rg,vec2(65280.,255.))/65535.;}
float snowHash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float snowNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(snowHash(i),snowHash(i+vec2(1.,0.)),f.x),mix(snowHash(i+vec2(0.,1.)),snowHash(i+1.),f.x),f.y);}
float snowRipples(vec2 p){float shear=sin(p.y*.37)*1.7;return .006*sin(p.x*5.8+p.y*1.4+shear+snowNoise(p*.6)*3.)+.002*sin(p.x*12.7-p.y*2.1)+.007*(snowNoise(p*1.3)-.5);}
float snowHeightAt(vec2 p){vec4 state=snowSample(p);return snowDecode(state)+snowRipples(p)*(1.-state.b)*(.35+.65*(1.-state.a));}
`;
/** State-driven PBR snow. Geometry, normals and material response read one conserved material field. */
export class FreshSnowReflectance extends MaterialPluginBase{
  state:RawTexture;
  grid=[1,1,.25,0];
  patch=[0,0,16,0];
  time=0;
  wind=0;
  constructor(material:PBRMaterial){super(material,'BOREAL physical snow shader',180,{},true,false);this.registerForExtraEvents=true;this._enable(true);this.state=RawTexture.CreateRGBATexture(new Uint8Array([48,0,0,0]),1,1,material.getScene(),false,false,Texture.BILINEAR_SAMPLINGMODE);this.state.gammaSpace=false;}
  getClassName(){return 'FreshSnowReflectance';}
  getSamplers(samplers:string[]){samplers.push('snowState');}
  getUniforms(){return {ubo:[{name:'snowField',size:4,type:'vec4'},{name:'snowGrid',size:4,type:'vec4'},{name:'snowPatch',size:4,type:'vec4'},{name:'snowKind',size:1,type:'float'},{name:'snowClock',size:1,type:'float'},{name:'snowWind',size:1,type:'float'}],vertex:declarations,fragment:declarations};}
  hardBindForSubMesh(buffer:UniformBuffer,_scene:Scene,_engine:AbstractEngine,sub:SubMesh){const kind=sub.getMesh().metadata?.physicalSnow??0;buffer.updateFloat4('snowField',-62,185,162,249);buffer.updateFloat4('snowGrid',this.grid[0],this.grid[1],this.grid[2],this.grid[3]);buffer.updateFloat4('snowPatch',this.patch[0],this.patch[1],this.patch[2],this.patch[3]);buffer.updateFloat('snowKind',kind);buffer.updateFloat('snowClock',this.time);buffer.updateFloat('snowWind',this.wind);buffer.setTexture('snowState',this.state);}
  getCustomCode(stage:string):Record<string,string>|null{if(stage==='vertex')return {
    CUSTOM_VERTEX_DEFINITIONS:functions,
    CUSTOM_VERTEX_UPDATE_POSITION:`if(snowKind>.5){vec2 snowWorld=(world*vec4(positionUpdated,1.)).xz;positionUpdated.y=snowHeightAt(snowWorld)+.014;}`,
    CUSTOM_VERTEX_UPDATE_NORMAL:`if(snowKind>.5){vec2 p=(world*vec4(positionUpdated,1.)).xz;float e=snowGrid.z;float h=positionUpdated.y-.014;normalUpdated=normalize(vec3(h-snowHeightAt(p+vec2(e,0.)),e,h-snowHeightAt(p+vec2(0.,e))));}`,
  };if(stage!=='fragment')return null;return {
    CUSTOM_FRAGMENT_DEFINITIONS:functions,
    CUSTOM_FRAGMENT_UPDATE_ALBEDO:`surfaceAlbedo=vec3(.82,.89,.94);`,
    CUSTOM_FRAGMENT_BEFORE_LIGHTS:`
      vec2 snowP=vPositionW.xz;
      if(snowKind>1.5&&snowInside(snowP)<.5)discard;
      if(snowKind>.5&&snowKind<1.5&&snowPatch.w>.5&&max(abs(snowP.x-snowPatch.x),abs(snowP.y-snowPatch.y))<snowPatch.z-.035)discard;
      #define SHADOWDEPTH_SOFTTRANSPARENTSHADOW
      #define SHADOWDEPTH_FRAGMENT
      vec4 snowLocal=snowKind>.5?snowSample(snowP):vec4(0.);
      float snowPacking=snowLocal.b,snowFresh=1.-snowLocal.a;
      float powder=(snowNoise(snowP*1.4)*.55+snowNoise(snowP*5.7)*.3+snowNoise(snowP*23.)*.15);
      surfaceAlbedo=mix(vec3(.84,.90,.94),vec3(.65,.77,.85),snowPacking*.65)*(.94+.08*powder);
      float crystal=snowNoise(snowP*155.);
      float detailFade=1.-smoothstep(8.,42.,length(vEyePosition.xyz-vPositionW));
      vec2 micro=vec2(snowNoise(snowP*74.+vec2(.17,0.))-snowNoise(snowP*74.-vec2(.17,0.)),snowNoise(snowP*74.+vec2(0.,.17))-snowNoise(snowP*74.-vec2(0.,.17)));
      vec3 physicalNormal=normalW;
      if(snowKind>.5){float e=snowGrid.z;physicalNormal=normalize(vec3(snowHeightAt(snowP-vec2(e,0.))-snowHeightAt(snowP+vec2(e,0.)),2.*e,snowHeightAt(snowP-vec2(0.,e))-snowHeightAt(snowP+vec2(0.,e))));}
      normalW=normalize(physicalNormal+vec3(micro.x,0.,micro.y)*.15*detailFade*(1.-snowPacking*.8));
      // Tiny frost facets alter the lit specular lobe; they are never emissive.
      surfaceAlbedo*=1.-.025*crystal*detailFade;
    `,
    CUSTOM_FRAGMENT_UPDATE_METALLICROUGHNESS:`vec4 packingSample=snowKind>.5?snowSample(vPositionW.xz):vec4(0.);metallicRoughness.r=0.;metallicRoughness.g=mix(.9,.39,clamp(packingSample.b*1.8,0.,1.));`,
    CUSTOM_FRAGMENT_BEFORE_FINALCOLORCOMPOSITION:`
      #ifdef SPECULARTERM
      float facet=smoothstep(.985,.9998,snowHash(floor(vPositionW.xz*160.)))*(1.-smoothstep(4.,28.,length(vEyePosition.xyz-vPositionW)));
      finalSpecularScaled*=1.+facet*3.;
      #endif
    `,
  };}
}
