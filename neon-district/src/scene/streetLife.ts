import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import type { Scene } from '@babylonjs/core/scene';
import type { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Materials } from './materials';
import { createStreetMotorcycle } from './streetModels';
import { createDeliveryVan } from './deliveryVan';
import { rollingAngle, streetDrive } from './motionMath';

export function populateStreet(scene:Scene,m:Materials,originalCar:TransformNode,reflectors:AbstractMesh[]){
  const sources=new Map<string,Mesh>();
  let seed=415;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const rubber=m.mat('matte rubber','#10191f');const scarlet=m.mat('vehicle scarlet','#663340');
  const make=(kind:'box'|'sphere'|'cylinder',name:string,parent:TransformNode|null,position:Vector3,scale:Vector3,material:StandardMaterial)=>{
    const key=kind+material.name;let source=sources.get(key);
    if(!source){source=kind==='box'?MeshBuilder.CreateBox('life source '+key,{size:1},scene):kind==='sphere'?MeshBuilder.CreateSphere('life source '+key,{diameter:1,segments:10},scene):MeshBuilder.CreateCylinder('life source '+key,{diameter:1,height:1,tessellation:12},scene);source.material=material;source.isVisible=false;sources.set(key,source);}
    const instance=source.createInstance(name);instance.parent=parent;instance.position.copyFrom(position);instance.scaling.copyFrom(scale);instance.isPickable=false;return instance;
  };
  const box=(name:string,p:TransformNode|null,x:number,y:number,z:number,w:number,h:number,d:number,mat:StandardMaterial)=>make('box',name,p,new Vector3(x,y,z),new Vector3(w,h,d),mat);
  const sphere=(name:string,p:TransformNode|null,x:number,y:number,z:number,w:number,h:number,d:number,mat:StandardMaterial)=>make('sphere',name,p,new Vector3(x,y,z),new Vector3(w,h,d),mat);


  // Reuse the detailed coupe geometry for a second parked car and one slow passing car.
  const cloneCar=(name:string,x:number,z:number,angle:number)=>{
    const clone=originalCar.clone(name,null)!;clone.position.set(x,0,z);clone.rotation.y=angle;return clone;
  };
  const parked=cloneCar('parked scarlet coupe',-4.4,17,Math.PI);
  parked.getChildMeshes().filter(mesh=>mesh.material?.name==='closeup ceramic petrol paint').forEach(mesh=>{mesh.material=scarlet;});
  const passing=cloneCar('slow passing electric coupe',1.65,35,0);
  // A delivery van adds a separate silhouette rather than another identical car.
  const van=createDeliveryVan(scene);van.position.set(4.25,0,32);van.rotation.y=Math.PI;

  const bike=createStreetMotorcycle(scene);bike.position.set(6,0,-20.5);bike.rotation.set(0,.55,-.09);
  // A second bike is visible further down the opposite kerb.
  const secondBike=bike.clone('second parked motorcycle',null)!;secondBike.position.set(5.4,0,12);secondBike.rotation.set(0,Math.PI+.1,.09);

  // Refuse accumulates near bins and curbs, with crushed cartons and loose litter.
  for(let pile=0;pile<18;pile++){
    const side=pile%2?1:-1,x=side*(7.5+rand()*.6),z=-26+pile*4.4;
    box('refuse bin body',null,x,.73,z,.78,1.15,.8,m.painted);box('refuse bin lid',null,x,1.33,z,.87,.12,.87,rubber);
    for(let k=0;k<4;k++){
      const bx=x-side*(.4+rand()*.55),bz=z+.5+rand()*.8,by=.35+rand()*.13;
      const bag=sphere('overflowing tied rubbish bag',null,bx,by,bz,.45+rand()*.3,.55+rand()*.25,.5,m.bag);bag.rotation.set(rand()*.4,rand()*3,rand()*.3);
      sphere('rubbish bag tie',null,bx,by+.32,bz,.1,.13,.09,m.bag);
    }
    const carton=box('crushed cardboard carton',null,x-side*.65,.17,z-.6,.65,.26,.6,m.wood);carton.rotation.y=rand()*2;carton.rotation.z=.12;
    for(let k=0;k<7;k++){
      const paper=box('curb litter',null,x-side*(.4+rand()*1.5),.1,z-1+rand()*2.5,.12+rand()*.16,.008,.15+rand()*.22,k%3?m.paper:m.poster);paper.rotation.set(.05,rand()*6,.06);
    }
    const can=make('cylinder','discarded drink can',null,new Vector3(x-side*.9,.15,z+.4),new Vector3(.12,.25,.12),m.rust);can.rotation.z=1.2;
  }
  for(const root of [originalCar,parked,passing,van,bike,secondBike]){
    root.getChildMeshes().filter(mesh=>mesh.material===m.white||mesh.material===m.pink).forEach(mesh=>reflectors.push(mesh));
  }
  const rollingWheels=passing.getChildTransformNodes(false).filter(node=>node.metadata?.motion?.kind==='wheel');

  return {
    update(time:number,reducedMotion:boolean){
      if(reducedMotion)return;
      const drive=streetDrive(time);passing.position.z=drive.z;passing.rotation.y=0;
      rollingWheels.forEach(wheel=>{wheel.rotation.x=rollingAngle(drive.distance,wheel.metadata.motion.radius);});
    },counts:{cars:4,motorcycles:2}
  };
}
