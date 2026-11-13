import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { Scene } from '@babylonjs/core/scene';
import { FreshSnowReflectance } from './snowMaterial';
import { texturePhysical } from '../surfaceMaps';
export function polarMaterials(scene:Scene){
  const physical=(name:string,color:string,metal:number,rough:number,kind:'paint'|'steel'|'rubber'|'fabric'|'concrete'='paint')=>{const m=new PBRMaterial('BOREAL '+name,scene);m.albedoColor=Color3.FromHexString(color).toLinearSpace();m.metallic=metal;m.roughness=rough;m.environmentIntensity=.65;texturePhysical(m,kind,true);return m;};
  const ivory=physical('frosted ivory enamel','#d6dfdb',.2,.55),red=physical('weathered rescue red','#a74736',.28,.5),orange=physical('safety orange','#e18e3e',.2,.55),navy=physical('marine blue steel','#213a46',.55,.52,'steel'),steel=physical('brushed galvanized metal','#81989b',.85,.35,'steel'),rubber=physical('cold rubber tracks','#19262c',0,.98,'rubber'),deck=physical('nonslip gray deck','#52666c',.15,.88,'concrete'),fabric=physical('insulated parka fabric','#ba5938',0,.97,'fabric'),cloth=physical('polar black webbing','#2e424a',0,.96,'fabric'),rock=physical('exposed coastal rock','#51616b',0,.96,'concrete');
  const snow=new PBRMaterial('BOREAL granular layered snow',scene);snow.albedoColor=Color3.FromHexString('#e0edf0').toLinearSpace();snow.metallic=0;snow.roughness=.88;snow.environmentIntensity=.5;snow.subSurface.isTranslucencyEnabled=true;snow.subSurface.translucencyIntensity=.16;snow.subSurface.tintColor=new Color3(.62,.84,.96);
  const snowColor=new Texture('/materials/polar-snow-color.jpg',scene),snowNormal=new Texture('/materials/polar-snow-normal.jpg',scene),snowArm=new Texture('/materials/polar-snow-arm.jpg',scene);snowNormal.gammaSpace=false;snowArm.gammaSpace=false;snowNormal.level=.16;snow.albedoTexture=snowColor;snow.bumpTexture=snowNormal;snow.metallicTexture=snowArm;snow.useRoughnessFromMetallicTextureAlpha=false;snow.useRoughnessFromMetallicTextureGreen=true;snow.useMetallnessFromMetallicTextureBlue=true;snow.useAmbientOcclusionFromMetallicTextureRed=false;
  let seed=731;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const cap=snow.clone('BOREAL settled roof snow')!;cap.bumpTexture=null;cap.albedoTexture=null;cap.metallicTexture=null;const snowShader=new FreshSnowReflectance(snow);snow.albedoTexture=null;snow.bumpTexture=null;snow.metallicTexture=null;
  const ice=physical('blue glacier ice','#83bfd0',.08,.23,'concrete');ice.subSurface.isTranslucencyEnabled=true;ice.subSurface.translucencyIntensity=.5;ice.subSurface.tintColor=new Color3(.1,.55,.8);
  const iceColor=new DynamicTexture('BOREAL compressed ice veins',{width:512,height:512},scene,false),ic=iceColor.getContext() as CanvasRenderingContext2D;ic.fillStyle='#badce4';ic.fillRect(0,0,512,512);
  for(let i=0;i<90;i++){let x=rand()*512,y=rand()*200-100;ic.strokeStyle=i%4?'rgba(72,139,165,.16)':'rgba(228,249,250,.55)';ic.lineWidth=.5+rand()*2;ic.beginPath();ic.moveTo(x,y);for(let j=0;j<30;j++){x+=(rand()-.5)*12;y+=12+rand()*15;ic.lineTo(x,y);}ic.stroke();}for(let i=0;i<18;i++){ic.strokeStyle='rgba(255,255,255,.11)';ic.lineWidth=2;ic.beginPath();ic.moveTo(0,i*30);ic.bezierCurveTo(180,i*30+12,310,i*30-13,512,i*30+6);ic.stroke();}iceColor.update();ice.albedoTexture=iceColor;
  const glass=new PBRMaterial('BOREAL frost rimmed glazing',scene);glass.albedoColor=new Color3(.3,.5,.57);glass.alpha=.2;glass.roughness=.16;glass.metallic=.05;glass.backFaceCulling=false;
  const goggle=physical('reflective goggle lens','#638a96',.9,.15);
  const light=(name:string,color:string)=>{const m=new StandardMaterial('BOREAL '+name,scene);m.diffuseColor=Color3.Black();m.emissiveColor=Color3.FromHexString(color);m.specularColor=Color3.Black();return m;};
  const warm=light('warm cabin light','#ffd19b'),white=light('searchlight lenses','#d4edff'),green=light('navigation green','#65cf9f'),signal=light('navigation red','#ee6353'),blue=light('runway blue','#6dbdff');
  const lettering=(title:string,sub:string)=>{const t=new DynamicTexture('BOREAL stencil '+title,{width:1024,height:256},scene,false),c=t.getContext() as CanvasRenderingContext2D;c.fillStyle='#1c3543';c.fillRect(0,0,1024,256);c.fillStyle='#e4e9dc';c.font='bold 105px sans-serif';c.fillText(title,30,130);c.fillStyle='#8cb7bc';c.font='25px monospace';c.fillText(sub,35,207);t.update();const m=new StandardMaterial('BOREAL lettering '+title,scene);m.diffuseTexture=t;m.emissiveTexture=t;m.emissiveColor=new Color3(.12,.13,.14);m.specularColor=Color3.Black();return m;};
  return {snowShader,ivory,red,orange,navy,steel,rubber,deck,fabric,cloth,rock,snow,cap,ice,glass,goggle,warm,white,green,signal,blue,lettering};
}
export type PolarMaterials=ReturnType<typeof polarMaterials>;
