import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import { modelAssembly, vehiclePalette } from './modelAssembly';

export function createDeliveryVan(scene:Scene){
  const a=modelAssembly(scene,'delivery van'),p=vehiclePalette(scene),{hull,box,cylinder,beam,torus,patch}=a;
  hull('van contoured cargo hull',[{z:-.85,halfWidth:1.04,bottom:.65,top:2.38},{z:-.4,halfWidth:1.11,bottom:.57,top:2.56},{z:2.5,halfWidth:1.11,bottom:.6,top:2.56},{z:2.77,halfWidth:1.01,bottom:.66,top:2.4}],p.ivory);
  hull('van shaped nose',[{z:-2.85,halfWidth:.81,bottom:.48,top:1.03},{z:-2.5,halfWidth:1.06,bottom:.42,top:1.35},{z:-1.4,halfWidth:1.08,bottom:.43,top:1.43},{z:-.75,halfWidth:1.05,bottom:.48,top:1.21}],p.blue);
  hull('van cab roof',[{z:-1.7,halfWidth:.8,bottom:2.02,top:2.13},{z:-.8,halfWidth:.98,bottom:2.17,top:2.29},{z:-.48,halfWidth:1.01,bottom:2.17,top:2.29}],p.blue);
  patch('van actual windscreen',[new Vector3(-.97,1.36,-2.38),new Vector3(.97,1.36,-2.38),new Vector3(.79,2.03,-1.74),new Vector3(-.79,2.03,-1.74)],p.glass);
  for(const side of [-1,1]){
    patch('van cab side glazing',[new Vector3(side*1.04,1.38,-2.35),new Vector3(side*.8,2.04,-1.71),new Vector3(side*.97,2.19,-.75),new Vector3(side*1.07,1.35,-.75)],p.glass);
    beam('van A pillar',new Vector3(side*1.04,1.35,-2.39),new Vector3(side*.8,2.06,-1.73),.075,p.blue);beam('van door back pillar',new Vector3(side*1.07,1.2,-.72),new Vector3(side*.98,2.2,-.72),.09,p.blue);
    box('van sliding door gasket',side*1.115,1.57,.6,.025,1.64,.028,p.rubber,true);box('van panel upper seam',side*1.115,2.27,.85,.025,.022,3,p.rubber,true);
    box('van sliding door runner',side*1.135,1.24,.94,.05,.09,2.2,p.steel);box('van cargo recessed handle',side*1.14,1.66,.84,.045,.085,.28,p.dark,true);
    box('van replaceable rubbing strip',side*1.13,.82,.9,.055,.14,3.15,p.dark);box('van cab handle',side*1.1,1.25,-.9,.04,.07,.24,p.steel,true);
    for(const z of [-1.78,1.92])a.articulate('van rolling wheel',new Vector3(side*1.055,.47,z),'x',{kind:'wheel',radius:.46},()=>{
      a.lathe('van rounded commercial tire',side*1.055,.47,z,[[.24,-.16],[.38,-.15],[.452,-.08],[.46,.07],[.42,.15],[.27,.16]],p.rubber,'x');torus('van rim flange',side*1.23,.47,z,.55,.04,p.steel,'x');cylinder('van hub cap',side*1.24,.47,z,.2,.07,p.dark,'x');for(let n=0;n<8;n++){const angle=n*Math.PI/4;cylinder('van wheel ventilation hole',side*1.25,.47+Math.cos(angle)*.18,z+Math.sin(angle)*.18,.07,.025,p.dark,'x',true);}
    });
    box('van projector housing',side*.72,1.05,-2.78,.48,.17,.12,p.dark);for(let n=0;n<3;n++)cylinder('van projector lamp',side*.72-.14+n*.14,1.06,-2.86,.075,.04,p.white,'z');
    for(const y of [1.02,2.03])box('van cargo door hinge',side*.97,y,2.79,.13,.21,.09,p.steel,true);box('van vertical tail lamp',side*.92,1.38,2.82,.13,.64,.035,p.red);
    beam('van wing mirror arm',new Vector3(side*1.02,1.72,-1.9),new Vector3(side*1.31,1.73,-1.84),.05,p.dark);box('van mirror case',side*1.34,1.74,-1.82,.17,.29,.17,p.dark);box('van mirror insert',side*1.34,1.74,-1.72,.13,.23,.015,p.steel,true);
    box('van roof rack side rail',side*.84,2.7,.88,.055,.11,3.2,p.dark);
  }
  for(let n=0;n<9;n++)box('van recessed front grille',-.56+n*.14,.72,-2.84,.05,.2,.04,p.dark,true);
  box('van cargo central door seal',0,1.56,2.79,.028,1.64,.03,p.rubber);for(const x of [-.17,.17]){cylinder('van rear door locking rod',x,1.57,2.85,.038,1.61,p.steel,'y',true);box('van rear door cam latch',x,1.22,2.9,.13,.07,.06,p.dark,true);}
  box('van rear step',0,.42,2.86,1.83,.11,.36,p.dark);box('van cab dashboard',0,1.25,-1.88,1.7,.25,.45,p.dark);for(const x of [-.43,.43]){box('van seat',x,1.03,-1.05,.56,.16,.55,p.seat);box('van seat back',x,1.39,-.83,.56,.65,.16,p.seat);}
  const root=a.finish(60);root.metadata.lamps=[{position:[-.72,1.06,-2.9],direction:[0,-.12,-1],color:'#b6d9df',power:50,range:18,kind:'spot'},{position:[.72,1.06,-2.9],direction:[0,-.12,-1],color:'#b6d9df',power:50,range:18,kind:'spot'},{position:[0,1.38,2.88],color:'#d75241',power:8,range:5,kind:'point'}];return root;
}
