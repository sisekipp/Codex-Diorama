import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader';
import { MeshoptCompression } from '@babylonjs/core/Meshes/Compression/meshoptCompression';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import '@babylonjs/loaders/glTF/glTFFileLoader';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import '@babylonjs/loaders/glTF/2.0/Extensions/EXT_meshopt_compression';
import '@babylonjs/loaders/glTF/2.0/Extensions/EXT_texture_webp';
import '@babylonjs/loaders/glTF/2.0/Extensions/KHR_mesh_quantization';
import type { Scene } from '@babylonjs/core/scene';
import { modelAssembly } from '../modelAssembly';
import { v,lamp } from './kit';
import { AIRCRAFT_SKIS,type ArrivalState } from './state';
import type { PolarMaterials } from './materials';
/** Imported CC0 Hercules by mgg8 / Aviation Gazetteer, with authored ski gear and articulation. */
export async function createImportedAircraft(scene:Scene,m:PolarMaterials){
  MeshoptCompression.Configuration={decoder:{url:'/decoders/meshopt_decoder.js'}};
  const container=await LoadAssetContainerAsync('/models/polar/hercules-articulated.glb',scene);container.addAllToScene();
  const root=new TransformNode('BOREAL ski transport POLAR 06',scene),airframe=container.meshes[0];airframe.parent=root;airframe.rotationQuaternion=null;airframe.rotation.setAll(0);airframe.scaling.set(.9,.9,-.9);
  for(const mesh of container.meshes){mesh.isPickable=false;mesh.receiveShadows=true;if(mesh.material instanceof PBRMaterial){mesh.material.environmentIntensity=.55;mesh.material.roughness=Math.max(.42,mesh.material.roughness??.6);}}
  const props=container.transformNodes.filter(n=>n.name.startsWith('BOREAL imported propeller')),wheels=container.transformNodes.filter(n=>n.name.startsWith('BOREAL imported rolling wheel'));
  // Assets with a mesh-bearing node expose those handles as Meshes instead of TransformNodes.
  for(const mesh of container.meshes){if(mesh.name.startsWith('BOREAL imported propeller')&&!props.includes(mesh))props.push(mesh);if(mesh.name.startsWith('BOREAL imported rolling wheel')&&!wheels.includes(mesh))wheels.push(mesh);}
  const a=modelAssembly(scene,'BOREAL Hercules polar conversion');a.root.parent=root;
  for(const [x,z]of AIRCRAFT_SKIS){const nose=x===0,length=nose?3.9:4.5;a.hull('formed landing ski',[{z:z-length/2-.3,halfWidth:.4,bottom:.35,top:.43},{z:z-length/2,halfWidth:.59,bottom:0,top:.1},{z:z+length/2,halfWidth:.59,bottom:0,top:.1}],m.navy).position.x=x;for(const side of [-1,1]){a.beam('ski steel running edge',v(x+side*.56,.02,z-length/2),v(x+side*.56,.02,z+length/2),.045,m.steel);a.tube('ski check cable',[v(x+side*.4,.1,z-length/2),v(x+side*.2,.8,z),v(x+side*.4,.1,z+length/2)],.025,m.steel);}for(let i=0;i<6;i++)a.cylinder('ski sole mounting bolt',x,.13,z-length/2+.3+i*.6,.07,.04,m.steel,'y',true);a.box('ski wheel support',x,.12,z,1.1,.12,2.6,m.navy);}
  // Ground logistics fittings and an opening rear loading platform retain the diorama interaction.
  a.box('rear cargo roller floor',0,1.9,10,2.6,.12,4,m.navy);for(let z=8.3;z<12;z+=.35)a.cylinder('cargo roller',0,2,z,.08,2.4,m.steel,'x',true);for(const x of [-.7,.7]){a.box('cargo supply pallet',x,2.3,9.3,1.1,.7,1.4,m.orange);a.box('cargo tie strap',x,2.66,9.3,.07,.025,1.5,m.navy);}
  const ramp=new TransformNode('BOREAL hinged aircraft cargo ramp',scene);ramp.parent=root;ramp.position.set(0,1.9,11);const r=modelAssembly(scene,'BOREAL imported aircraft ramp conversion');r.root.parent=ramp;r.box('ramp formed deck',0,0,1.9,2.7,.12,3.8,m.navy);for(let z=.15;z<3.8;z+=.25)r.box('ramp antislip grip',0,.075,z,2.5,.03,.04,m.steel,true);for(const side of [-1,1])r.box('ramp side channel',side*1.35,.1,1.9,.12,.22,3.8,m.steel);r.finish(80);
  for(const x of [-1.2,1.2]){a.sphere('landing lamp lens',x,1.7,-11,.28,.18,.12,m.white);lamp(scene,'BOREAL Hercules landing beam',root,x,1.7,-11.1,'#def0ff',220,65,[0,-.1,-1],.65);}
  a.box('rear cargo lamp',0,3.8,10.5,1,.06,.12,m.warm);const point=new TransformNode('BOREAL Hercules hold illumination',scene);point.parent=root;point.position.set(0,3,11);point.metadata={lamps:[{kind:'point',color:'#ffd29b',power:35,range:7}]};
  a.finish(85);let phase=0,lastTime=0;
  return {root,props,wheels,ramp,update(state:ArrivalState,time:number,reduced:boolean){const dt=Math.max(0,Math.min(.1,time-lastTime));lastTime=time;if(!reduced)phase+=dt*30*state.propeller;root.position.set(state.x,1.25+state.height,state.z);root.rotation.set(state.height>0?-.025:0,state.yaw,0);for(const [i,p]of props.entries()){p.rotationQuaternion=null;p.rotation.z=reduced?i*.4:phase+i*.4;}for(const w of wheels){w.rotationQuaternion=null;w.rotation.x=reduced?0:(302-state.z)/.54;}ramp.rotation.x=-Math.PI/2+state.ramp*(Math.PI/2+.42);}};
}
