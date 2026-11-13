import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { Scene } from '@babylonjs/core/scene';
import { texturePhysical } from '../surfaceMaps';

export function marsMaterials(scene:Scene){
  const physical=(name:string,color:string,metal:number,rough:number,kind:'paint'|'steel'|'concrete'|'rubber'|'fabric'='paint')=>{const m=new PBRMaterial('ARES '+name,scene);m.albedoColor=Color3.FromHexString(color).toLinearSpace();m.metallic=metal;m.roughness=rough;m.environmentIntensity=.5;texturePhysical(m,kind,true);return m;};
  const white=physical('ivory ceramic panels','#c7c0a9',.16,.66),orange=physical('rescue ochre enamel','#b56837',.25,.57),dark=physical('cast graphite','#283137',.5,.74,'steel'),steel=physical('machined titanium','#9ba3a0',.85,.36,'steel'),rubber=physical('dusty tire rubber','#302a27',0,.98,'rubber'),suit=physical('insulated EVA fabric','#d5cab4',0,.94,'fabric'),cloth=physical('EVA orange webbing','#b15b2e',0,.93,'fabric'),stone=physical('basalt aggregate','#6b4433',0,.98,'concrete'),deck=physical('landing deck','#494b45',.15,.86,'concrete'),blue=physical('solar cells','#193d55',.65,.28,'paint'),green=physical('hydroponic foliage','#52633b',0,.88,'fabric');
  const sandstone=physical('warm sandstone','#a5744c',0,.99,'concrete'),basalt=physical('dark volcanic stone','#493b35',0,.99,'concrete');
  const glass=new PBRMaterial('ARES pressure glazing',scene);glass.albedoColor=Color3.FromHexString('#9cacaa').toLinearSpace();glass.metallic=.05;glass.roughness=.14;glass.alpha=.19;glass.backFaceCulling=false;glass.environmentIntensity=.6;
  const visor=new PBRMaterial('ARES gold visor',scene);visor.albedoColor=Color3.FromHexString('#b98639').toLinearSpace();visor.metallic=1;visor.roughness=.12;visor.environmentIntensity=.9;
  const light=(name:string,color:string,power=1)=>{const m=new StandardMaterial('ARES '+name,scene);m.diffuseColor=Color3.FromHexString(color).scale(.2);m.emissiveColor=Color3.FromHexString(color).scale(power);m.specularColor=Color3.Black();return m;};
  const warm=light('warm windows','#e4ba7b',.85),cold=light('cool instruments','#8ebcb4',.75),red=light('warning lamps','#e46a45',1.4),lamp=light('work lamp lenses','#e5d6af',1.1);
  const lettering=(title:string,subtitle:string)=>{const t=new DynamicTexture('ARES stencil '+title,{width:1024,height:256},scene,false),c=t.getContext() as CanvasRenderingContext2D;c.fillStyle='#303631';c.fillRect(0,0,1024,256);c.fillStyle='#e1c89a';c.font='bold 110px sans-serif';c.fillText(title,35,133);c.fillStyle='#a9b2a6';c.font='24px monospace';c.fillText(subtitle,40,207);t.update();const m=new StandardMaterial('ARES lettering '+title,scene);m.diffuseTexture=t;m.emissiveTexture=t;m.emissiveColor=new Color3(.12,.1,.07);m.specularColor=Color3.Black();return m;};
  return {white,orange,dark,steel,rubber,suit,cloth,stone,sandstone,basalt,deck,blue,green,glass,visor,warm,cold,red,lamp,lettering};
}
export type MarsMaterials=ReturnType<typeof marsMaterials>;
