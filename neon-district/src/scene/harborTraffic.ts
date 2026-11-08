import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import type { Material } from '@babylonjs/core/Materials/material';
import type { HarborKit } from './harborKit';
import { getTrainState } from './harborMotion';
import { rollingAngle, rotorAngle } from './motionMath';
import { createAerocab, createTrainMechanics } from './harborModels';

export function createHarborTraffic(scene:Scene,k:HarborKit){
  const{box,chamfer,beam,mat}=k;
  let seed=730;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const vehicle=(name:string,color:Material=mat.taxi)=>{
    const root=new TransformNode(name,scene);
    chamfer('aerocab sculpted body',0,.25,0,2.1,.68,4.9,color,root);
    chamfer('aerocab tapered cabin',0,.86,.2,1.68,.8,2.7,mat.glass,root);
    chamfer('aerocab roof',0,1.28,.35,1.6,.12,2.25,color,root);
    for(const side of [-1,1]){
      chamfer('aerocab turbine pod',side*1.1,.05,.4,.42,.48,3.2,mat.steel,root);
      box('aerocab headlight',side*.75,.45,-2.46,.38,.12,.04,mat.cyan,root);box('aerocab rear lamp',side*.74,.4,2.46,.4,.08,.04,mat.red,root);
      box('aerocab door inset',side*1.02,.5,.2,.025,.27,1.6,mat.dark,root);box('aerocab door handle',side*1.045,.65,.5,.035,.05,.25,mat.trim,root);
      box('aerocab hover glow',side*1.1,-.22,.6,.16,.045,1.15,mat.amber,root);
      beam('aerocab window pillar',new Vector3(side*.8,.65,.9),new Vector3(side*.77,1.2,.9),.055,color,root);
      for(let i=0;i<4;i++)box('aerocab rear intake',side*.69,.63,1.7+i*.12,.3,.022,.06,mat.dark,root);
    }
    // Soot-dark exhaust collars, abraded sills and mismatched repaired panels.
    for(const side of [-1,1]){
      box('aerocab soot stained exhaust',side*1.1,.06,2.02,.4,.35,.22,mat.dark,root);
      box('aerocab chipped lower sill',side*1.04,.08,-.1,.045,.08,2.8,mat.trim,root);
      for(let n=0;n<3;n++)box('aerocab exposed fastener',side*1.055,.42,-1+n*.9,.035,.055,.055,mat.steel,root);
    }
    box('aerocab replacement hood panel',.4,.605,-1.8,.65,.035,.6,mat.steel,root);
    if(color===mat.taxi)box('taxi roof lantern',0,1.48,.4,.72,.23,.32,mat.amber,root);
    root.metadata={lamps:[{position:[0,.45,-2.52],direction:[0,-.12,-1],color:'#a1dacf',power:22,range:12,kind:'spot'},{position:[0,.4,2.5],color:'#d74839',power:4,range:3,kind:'point'}]};
    return root;
  };
  const parked=createAerocab(scene,'docked foreground taxi');parked.position.set(29,84,-72);parked.rotation.y=-.23;
  const routes:{root:TransformNode;path:Vector3[];offset:number;duration:number;bank:number}[]=[];
  // Curved closed air corridors have coherent direction and never teleport at a visible endpoint.
  for(let lane=0;lane<4;lane++){
    const y=[39,64,112,151][lane];
    const path=[new Vector3(-105,y,-130),new Vector3(-14-lane*4,y,-90),new Vector3(6+lane*4,y,8),new Vector3(24+lane*3,y,102),new Vector3(130,y,145),new Vector3(155,y,60),new Vector3(126,y,-145),new Vector3(-40,y,-170)];
    for(let i=0;i<18;i++){
      const root=vehicle(`harbor flying vehicle ${lane}-${i}`,i%4===0?mat.taxi:i%3===0?mat.white:mat.paint);
      root.scaling.setAll(.7+random()*.4);routes.push({root,path,offset:i/18+lane*.037,duration:90+lane*18,bank:lane%2?.06:-.06});
    }
  }
  const spline=(points:Vector3[],phase:number)=>{
    const scaled=((phase%1+1)%1)*points.length,index=Math.floor(scaled),t=scaled-index;
    const p0=points[(index-1+points.length)%points.length],p1=points[index%points.length],p2=points[(index+1)%points.length],p3=points[(index+2)%points.length];
    return Vector3.CatmullRom(p0,p1,p2,p3,t);
  };
  // A shuttle leaves the foreground taxi stand, flies a circuit and returns to its berth.
  const shuttle=createAerocab(scene,'taxi terminal arrival shuttle',true);
  const shuttlePath=[new Vector3(21,86,-69),new Vector3(13,88,-84),new Vector3(-3,97,-98),new Vector3(-14,108,-30),new Vector3(7,109,66),new Vector3(90,98,130),new Vector3(124,91,-54),new Vector3(31,87,-90)];
  const trains:{root:TransformNode;direction:number;phase:number;doors:TransformNode[];wheels:TransformNode[]}[]=[];
  for(const direction of [1,-1]){
    const train=new TransformNode('harbor transit train '+direction,scene);train.rotation.y=direction>0?Math.PI:0;const doors:TransformNode[]=[];
    for(let car=0;car<4;car++){
      const z=car*10.5;
      chamfer('train rounded body',0,1,z,4.4,3.8,10.1,mat.white,train);
      chamfer('train dark roof',0,3,z,4.05,.34,9.9,mat.dark,train);
      box('train wheel enclosure',0,-1.03,z,3.7,.7,9.9,mat.steel,train);
      for(const side of [-1,1]){
        box('train continuous glazing',side*2.205,1.65,z,.035,1.55,8.5,mat.glass,train);
        for(let n=0;n<5;n++)box('train recessed window',side*2.23,1.65,z-3.4+n*1.65,.025,1.13,1.24,mat.warm,train);
        box('train side line',side*2.24,.4,z,.04,.22,9.3,mat.paint,train);
        const door=new TransformNode('train sliding door',scene);door.parent=train;door.position.set(side*2.24,.75,z+2.2);
        box('train door leaf',0,0,0,.05,2.6,.9,mat.steel,door);box('train door window',side*.04,.5,0,.025,.7,.6,mat.glass,door);doors.push(door);
      }
      for(const side of [-1,1]){box('train grime below windows',side*2.25,-.25,z,.035,.2,9.1,mat.dark,train);for(let n=0;n<5;n++)box('train lower access panel',side*2.26,-.55,z-3.5+n*1.7,.025,.38,1.2,mat.steel,train);}
      box('train articulated coupling',0,.45,z+5.18,1.45,1.2,.6,mat.dark,train);
    }
    const nose=chamfer('train streamlined cab',0,1,-5.5,4.1,3.1,2.6,mat.white,train);nose.rotation.x=-.08;
    box('train front glass',0,1.8,-6.82,3.35,1.28,.045,mat.glass,train);
    for(const side of [-1,1])box('train front lamp',side*1.4,.5,-6.86,.33,.22,.04,mat.cyan,train);
    const mechanics=createTrainMechanics(scene);mechanics.parent=train;
    train.metadata={lamps:[{position:[-1.4,.5,-7],direction:[0,-.15,-1],color:'#c6e4df',power:220,range:35,kind:'spot'},{position:[1.4,.5,-7],direction:[0,-.15,-1],color:'#c6e4df',power:220,range:35,kind:'spot'}]};
    trains.push({root:train,direction,phase:direction>0?0:35,doors,wheels:mechanics.getChildTransformNodes(false).filter(node=>node.metadata?.motion?.kind==='wheel')});
  }
  const liftFans=[parked,shuttle].flatMap(root=>root.getChildTransformNodes(false).filter(node=>node.metadata?.motion?.kind==='fan'));
  return{counts:{cars:routes.length+2,motorcycles:0,trains:2},update(time:number,reducedMotion:boolean){
    const t=reducedMotion?0:time;
    for(const route of routes){const phase=t/route.duration+route.offset,p=spline(route.path,phase),next=spline(route.path,phase+.002),delta=next.subtract(p);route.root.position.copyFrom(p);route.root.rotation.set(Math.atan2(delta.y,Math.hypot(delta.x,delta.z)),-Math.atan2(delta.x,-delta.z),Math.sin(phase*Math.PI*2)*route.bank);}
    const trip=(t%110);const phase=trip<10?0:(trip-10)/100;
    const p=spline(shuttlePath,phase),ahead=spline(shuttlePath,phase+.002),d=ahead.subtract(p);shuttle.position.copyFrom(p);shuttle.rotation.y=-Math.atan2(d.x,-d.z);
    for(const train of trains){const state=getTrainState(t,train.direction,train.phase);train.root.position.set(train.direction>0?-8:8,90,state.z);train.wheels.forEach(wheel=>{wheel.rotation.x=rollingAngle(Math.cos(train.root.rotation.y)*state.z,wheel.metadata.motion.radius);});train.doors.forEach((door,i)=>{door.position.z=Math.floor(i/2)*10.5+2.2+state.doorOffset;});}
    liftFans.forEach(fan=>{fan.rotation.y=rotorAngle(t,fan.parent===parked?3:fan.metadata.motion.speed,reducedMotion);});
    parked.position.y=84;
  },setLow(low:boolean){routes.forEach((route,i)=>route.root.setEnabled(!low||i%3!==0));}};
}
