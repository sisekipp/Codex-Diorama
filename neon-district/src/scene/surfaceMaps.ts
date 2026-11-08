import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Scene } from '@babylonjs/core/scene';
import type { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';

type Surface='paint'|'steel'|'concrete'|'rubber'|'fabric'|'asphalt';
const maps=new WeakMap<Scene,Map<Surface,ReturnType<typeof makeMaps>>>();
function makeMaps(scene:Scene,kind:Surface){
  const size=256,height=new Float32Array(size*size),rough=new Float32Array(size*size);
  const hash=(x:number,y:number)=>{let n=(x*374761393+y*668265263)>>>0;n=(n^(n>>>13))*1274126177;return ((n^(n>>>16))>>>0)/4294967296;};
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const n=hash(x,y),coarse=hash(Math.floor(x/8),Math.floor(y/8)),index=y*size+x;
    let h=n*.08,r=.8+n*.18;
    if(kind==='steel'){h=n*.025+Math.sin(y*Math.PI/2)*.015;r=.55+n*.35;}
    if(kind==='paint'){h=n*.018;r=.7+n*.25;if(hash(x,Math.floor(y/16))>.996){h=.09;r=.98;}}
    if(kind==='concrete'||kind==='asphalt'){h=n*.14+coarse*.055;r=.73+n*.27;if(n>.93)h-=.15;}
    if(kind==='fabric'){h=(Math.sin(x*Math.PI/2)*Math.sin(y*Math.PI/2)+1)*.035+n*.015;r=.93+n*.07;}
    if(kind==='rubber'){h=n*.055+Math.sin(x*Math.PI/4)*.012;r=.82+n*.18;}
    height[index]=h;rough[index]=r;
  }
  const texture=(name:string)=>{const t=new DynamicTexture(kind+' '+name,size,scene,true);t.wrapU=Texture.WRAP_ADDRESSMODE;t.wrapV=Texture.WRAP_ADDRESSMODE;t.anisotropicFilteringLevel=8;return t;};
  const color=texture('fine albedo'),normal=texture('micro normal'),arm=texture('occlusion roughness');
  const cc=color.getContext() as CanvasRenderingContext2D,nc=normal.getContext() as CanvasRenderingContext2D,rc=arm.getContext() as CanvasRenderingContext2D,cp=cc.createImageData(size,size),np=nc.createImageData(size,size),rp=rc.createImageData(size,size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=y*size+x,j=i*4,dx=(height[y*size+(x+1)%size]-height[y*size+(x+size-1)%size])*3,dy=(height[((y+1)%size)*size+x]-height[((y+size-1)%size)*size+x])*3,length=Math.hypot(dx,dy,1);
    const value=kind==='concrete'||kind==='asphalt'?218+Math.round(height[i]*110):241+Math.round(height[i]*55);
    cp.data.set([value,value,value,255],j);np.data.set([Math.round(128-dx/length*127),Math.round(128-dy/length*127),Math.round(128+127/length),255],j);rp.data.set([255,Math.round(rough[i]*255),255,255],j);
  }
  cc.putImageData(cp,0,0);nc.putImageData(np,0,0);rc.putImageData(rp,0,0);for(const t of [color,normal,arm])t.update();normal.gammaSpace=false;arm.gammaSpace=false;for(const t of [normal,arm]){t.uScale=kind==='asphalt'?8:kind==='concrete'?6:2;t.vScale=kind==='asphalt'?64:kind==='concrete'?6:2;}
  return {color,normal,arm};
}
export function surfaceMaps(scene:Scene,kind:Surface){let cache=maps.get(scene);if(!cache){cache=new Map();maps.set(scene,cache);}let result=cache.get(kind);if(!result){result=makeMaps(scene,kind);cache.set(kind,result);}return result;}
export function texturePhysical(material:PBRMaterial,kind:Surface,replaceColor=false){
  const t=surfaceMaps(material.getScene(),kind);if(replaceColor||!material.albedoTexture)material.albedoTexture=t.color;
  material.bumpTexture=t.normal;material.bumpTexture.level=kind==='paint'?.22:kind==='steel'?.35:.65;
  material.metallicTexture=t.arm;material.useRoughnessFromMetallicTextureAlpha=false;material.useRoughnessFromMetallicTextureGreen=true;material.useMetallnessFromMetallicTextureBlue=false;material.useAmbientOcclusionFromMetallicTextureRed=true;
  material.maxSimultaneousLights=8;material.enableSpecularAntiAliasing=true;
}

/** Preserve authored colors/prints; migrate opaque structural surfaces to one light response. */
export function upgradeSceneSurfaces(scene:Scene){
  const converted=new Map<StandardMaterial,PBRMaterial>(),asphalt:PBRMaterial[]=[];
  const describe=(name:string):{kind:Surface;metal:number;rough:number}|null=>{
    if(/asphalt/.test(name))return {kind:'asphalt',metal:0,rough:.93};
    if(/concrete|cast concrete/.test(name))return {kind:'concrete',metal:0,rough:.95};
    if(/rubber|refuse plastic|rubbish|soot/.test(name))return {kind:'rubber',metal:0,rough:.96};
    if(/upholstery/.test(name))return {kind:'fabric',metal:0,rough:.96};
    if(/paint|enamel|ivory|ochre|vehicle scarlet/.test(name))return {kind:'paint',metal:.25,rough:.48};
    if(/metal|steel|trim|graphite|copper|weld|rust/.test(name))return {kind:'steel',metal:/rust|oxid|graphite/.test(name)?.45:.8,rough:/rust|oxid/.test(name)?.78:.42};
    return null;
  };
  for(const material of [...scene.materials]){
    if(material instanceof PBRMaterial){material.maxSimultaneousLights=8;material.enableSpecularAntiAliasing=true;const d=describe(material.name);if(d){if(!material.bumpTexture)texturePhysical(material,d.kind);if(/asphalt/.test(material.name))asphalt.push(material);}continue;}
    if(!(material instanceof StandardMaterial))continue;material.maxSimultaneousLights=8;
    const d=describe(material.name);if(!d||material.alpha<.99||material.emissiveColor.r+material.emissiveColor.g+material.emissiveColor.b>.001)continue;
    const p=new PBRMaterial(material.name+' / physical',scene);p.albedoColor=material.diffuseColor.toLinearSpace();p.albedoTexture=material.diffuseTexture;p.metallic=d.metal;p.roughness=d.rough;p.environmentIntensity=.55;p.backFaceCulling=material.backFaceCulling;texturePhysical(p,d.kind);converted.set(material,p);if(d.kind==='asphalt')asphalt.push(p);
  }
  for(const mesh of scene.meshes){const source=(mesh as InstancedMesh).sourceMesh??mesh;if(source.material instanceof StandardMaterial){const replacement=converted.get(source.material);if(replacement)source.material=replacement;}}
  return {setWetness(value:number){const wet=value/100;for(const p of asphalt){p.roughness=.96-wet*.58;p.environmentIntensity=.35+wet*.35;}}};
}
