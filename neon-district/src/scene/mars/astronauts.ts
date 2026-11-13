import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import type { MarsMaterials } from './materials';
import { modelAssembly } from '../modelAssembly';

export function createAstronaut(scene:Scene,m:MarsMaterials,name:string,tool=false){
  const body=modelAssembly(scene,name),{box,sphere,cylinder,torus,tube}=body;
  sphere('EVA shaped pressure torso',0,1.24,0,.64,.7,.42,m.suit);sphere('EVA hip section',0,.94,0,.53,.31,.38,m.suit);
  cylinder('EVA neck pressure coupling',0,1.59,0,.39,.12,m.steel);sphere('EVA helmet shell',0,1.86,0,.68,.65,.65,m.white);sphere('EVA visor gasket',0,1.87,-.25,.59,.46,.27,m.dark);sphere('EVA reflective gold visor',0,1.88,-.31,.54,.4,.2,m.visor);
  for(const x of [-.31,.31]){cylinder('helmet visor pivot',x,1.87,-.05,.14,.08,m.steel,'x',true);box('helmet work light',x,2.02,-.18,.09,.06,.08,m.lamp,true);}
  box('EVA chest control unit',0,1.3,-.245,.37,.25,.12,m.dark);for(let n=0;n<3;n++)cylinder('EVA chest control dial',-.12+n*.12,1.31,-.32,.045,.025,n===0?m.red:m.steel,'z',true);
  box('EVA chest status display',0,1.39,-.31,.2,.055,.02,m.cold,true);box('EVA utility belt',0,.98,-.18,.51,.1,.13,m.dark);
  for(const x of [-.22,.22]){box('EVA shoulder strap',x,1.28,-.19,.055,.57,.06,m.cloth);box('EVA belt utility pouch',x,.91,-.22,.13,.18,.11,m.orange);}
  box('EVA life support backpack',0,1.27,.34,.5,.66,.34,m.white);box('EVA backpack service panel',0,1.27,.535,.37,.45,.045,m.dark);for(let n=0;n<6;n++)box('backpack radiator fin',0,1.11+n*.055,.57,.3,.025,.035,m.steel,true);
  for(const x of [-.2,.2]){cylinder('EVA oxygen bottle',x,1.29,.46,.16,.65,m.steel);torus('oxygen bottle retaining band',x,1.22,.46,.17,.025,m.dark);tube('EVA breathing hose',[new Vector3(x,1.02,.46),new Vector3(x*1.7,1.0,.2),new Vector3(x*1.5,1.16,-.23),new Vector3(x,1.26,-.26)],.026,m.dark,true);}
  const root=body.finish(65),legs:{hip:TransformNode;knee:TransformNode;foot:TransformNode}[]=[],arms:{shoulder:TransformNode;elbow:TransformNode}[]=[];
  for(const side of [-1,1]){
    const thigh=modelAssembly(scene,'EVA upper leg');thigh.sphere('EVA thigh pressure sleeve',0,-.19,0,.24,.43,.26,m.suit);thigh.torus('EVA hip flex ring',0,-.06,0,.23,.045,m.dark);thigh.box('EVA thigh pocket',side*.12,-.2,-.03,.08,.22,.17,m.cloth,true);const hip=thigh.finish(65);hip.parent=root;hip.position.set(side*.16,.96,0);
    const shin=modelAssembly(scene,'EVA lower leg');shin.sphere('EVA calf pressure sleeve',0,-.2,.015,.22,.42,.24,m.suit);shin.sphere('EVA knee protective plate',0,0,-.12,.25,.22,.1,m.white);shin.torus('EVA ankle locking ring',0,-.37,0,.21,.04,m.steel);const knee=shin.finish(65);knee.parent=hip;knee.position.y=-.4;
    const boot=modelAssembly(scene,'EVA boot');boot.hull('EVA boot shaped toe',[{z:-.24,halfWidth:.085,bottom:-.045,top:.04},{z:-.14,halfWidth:.11,bottom:-.065,top:.09},{z:.13,halfWidth:.095,bottom:-.06,top:.12}],m.suit);boot.box('EVA dark boot sole',0,-.065,-.04,.23,.045,.39,m.dark);for(let n=0;n<5;n++)boot.box('EVA sole traction rib',0,-.091,-.18+n*.075,.22,.014,.022,m.rubber,true);const foot=boot.finish(50);foot.parent=knee;foot.position.set(0,-.48,-.045);legs.push({hip,knee,foot});
    const upper=modelAssembly(scene,'EVA upper arm');upper.sphere('EVA shoulder cup',0,-.04,0,.3,.3,.3,m.white);upper.sphere('EVA upper arm sleeve',0,-.23,0,.23,.37,.24,m.suit);upper.torus('EVA arm mission band',0,-.2,0,.24,.055,m.cloth);const shoulder=upper.finish(65);shoulder.parent=root;shoulder.position.set(side*.36,1.48,0);shoulder.rotation.z=side*.12;
    const lower=modelAssembly(scene,'EVA forearm');lower.sphere('EVA elbow flex joint',0,0,0,.22,.2,.22,m.dark);lower.sphere('EVA forearm sleeve',0,-.18,0,.22,.34,.23,m.suit);lower.torus('EVA glove locking ring',0,-.31,0,.21,.04,m.steel);lower.sphere('EVA articulated glove',0,-.4,-.025,.19,.22,.21,m.suit);lower.sphere('EVA glove thumb',-side*.09,-.38,-.08,.09,.14,.1,m.dark,true);
    if(tool&&side===1){lower.cylinder('EVA handheld drill',0,-.43,-.17,.12,.23,m.orange,'z');lower.cylinder('EVA drill bit',0,-.43,-.36,.025,.18,m.steel,'z',true);}
    const elbow=lower.finish(60);elbow.parent=shoulder;elbow.position.y=-.39;arms.push({shoulder,elbow});
  }
  return {root,legs,arms,pose(phase:number,working=false){legs.forEach((leg,i)=>{const swing=Math.sin(phase+i*Math.PI);leg.hip.rotation.x=working?0:swing*.32;leg.knee.rotation.x=working?.1:Math.max(0,-swing)*.55;});arms.forEach((arm,i)=>{arm.shoulder.rotation.x=working?-.75:-Math.sin(phase+i*Math.PI)*.27;arm.elbow.rotation.x=working?-.75:-.14;});}};
}
