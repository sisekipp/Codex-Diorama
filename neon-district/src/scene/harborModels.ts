import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import { modelAssembly, vehiclePalette } from './modelAssembly';

/** A six-metre aerocab, built around a pressure cabin and four ducted lift fans. */
export function createAerocab(scene:Scene,name:string,shuttle=false){
  const a=modelAssembly(scene,name),p=vehiclePalette(scene),paint=shuttle?p.ivory:p.ochre,{hull,box,beam,patch,lathe,cylinder,torus,tube}=a;
  hull('aerocab contoured pressure hull',[{z:-3.45,halfWidth:.66,bottom:.36,top:.83},{z:-2.7,halfWidth:1.17,bottom:.12,top:1.08},{z:-1.6,halfWidth:1.29,bottom:.1,top:1.32},{z:1.6,halfWidth:1.28,bottom:.12,top:1.29},{z:2.8,halfWidth:1.03,bottom:.25,top:1.07},{z:3.25,halfWidth:.77,bottom:.4,top:.78}],paint);
  hull('recessed underbody keel',[{z:-2.9,halfWidth:.63,bottom:.02,top:.27},{z:0,halfWidth:.96,bottom:-.08,top:.22},{z:2.8,halfWidth:.72,bottom:.1,top:.38}],p.dark);
  hull('canopy roof',[{z:-1.4,halfWidth:.8,bottom:1.94,top:2.06},{z:-.45,halfWidth:.98,bottom:2.05,top:2.18},{z:1.44,halfWidth:.91,bottom:2.03,top:2.16},{z:2,halfWidth:.71,bottom:1.76,top:1.88}],paint);
  patch('broad cockpit windscreen',[new Vector3(-1.03,1.23,-2.13),new Vector3(1.03,1.23,-2.13),new Vector3(.79,1.98,-1.43),new Vector3(-.79,1.98,-1.43)],p.glass);
  for(const side of [-1,1]){
    const lower=new Vector3(side*1.12,1.25,-2.09),upper=new Vector3(side*.83,2.03,-1.4),backTop=new Vector3(side*.89,2.06,1.38),backBottom=new Vector3(side*1.18,1.22,1.94);
    patch('cabin side glazing',[lower,upper,backTop,backBottom],p.glass);beam('aerocab windshield surround',lower,upper,.1,paint);beam('rear canopy buttress',backTop,backBottom,.15,paint);
    for(const z of [-.48,.95])beam('aerocab glazing mullion',new Vector3(side*1.18,1.22,z),new Vector3(side*.96,2.1,z),.055,p.dark);
    hull('outer side sill',[{z:-2.18,halfWidth:1.18,bottom:.33,top:.48},{z:0,halfWidth:1.32,bottom:.25,top:.49},{z:2.16,halfWidth:1.12,bottom:.36,top:.52}],p.dark);
    for(const z of [-1.85,1.75]){
      const x=side*1.68;
      beam('turbine articulated outrigger',new Vector3(side*1,.55,z),new Vector3(x,.42,z),.18,p.dark);
      lathe('profiled lift turbine housing',x,.12,z,[[.35,-.14],[.55,-.1],[.64,.1],[.64,.32],[.58,.42],[.43,.4]],paint);
      cylinder('lift fan shadowed cavity',x,.53,z,1.02,.05,p.rubber);torus('intake machined lip',x,.57,z,1.15,.055,p.steel);
      a.articulate('aerocab lift fan',new Vector3(x,.575,z),'y',{kind:'fan',speed:18},()=>{
      cylinder('fan rotor hub',x,.59,z,.22,.13,p.dark);
      for(let n=0;n<11;n++){const t=n*Math.PI*2/11;const blade=box('pitched ducted fan blade',x+Math.cos(t)*.29,.575,z+Math.sin(t)*.29,.45,.025,.11,p.steel,true);blade.rotation.y=-t;blade.rotation.z=.18;}
      });
      for(let n=0;n<8;n++){const t=n*Math.PI/4;cylinder('turbine cowl fastener',x+Math.cos(t)*.59,.565,z+Math.sin(t)*.59,.035,.035,p.dark,'y',true);}
      torus('sooted lower exhaust collar',x,.01,z,.87,.11,p.dark);cylinder('lift exhaust amber core',x,-.055,z,.56,.025,p.amber);
      beam('landing leg shock strut',new Vector3(side*1.04,.25,z),new Vector3(side*1.4,-.22,z+.12),.085,p.steel);box('landing skid pad',side*1.4,-.25,z+.13,.45,.09,.66,p.rubber);
      tube('turbine power cable',[new Vector3(side*1.1,.8,z+.3),new Vector3(side*1.38,.69,z+.41),new Vector3(x,.6,z+.33)],.035,p.copper,true);
    }
    for(const z of [-.69,1.21]){box('passenger door shut line',side*1.292,.88,z,.012,.65,.018,p.rubber,true);box('external door hinge',side*1.31,.98,z,.06,.19,.12,p.steel,true);}
    box('recessed door handle',side*1.32,1.11,.92,.035,.07,.32,p.dark,true);box('boarding step',side*1.36,.3,.25,.32,.09,1.75,p.steel);
    for(let n=0;n<8;n++)box('boarding step traction ribs',side*1.37,.35,-.45+n*.2,.3,.015,.035,p.dark,true);
    for(const z of [-.45,.9]){box('passenger seat cushion',side*.51,.99,z,.65,.17,.63,p.seat);box('passenger seat back',side*.51,1.4,z+.28,.65,.69,.16,p.seat);a.sphere('seat headrest',side*.51,1.85,z+.28,.38,.2,.15,p.seat,true);}
    box('recessed front light housing',side*.63,.84,-3.18,.52,.17,.16,p.dark);for(let n=0;n<3;n++)cylinder('aerocab optic',side*.63-.14+n*.14,.86,-3.28,.09,.04,p.white,'z',true);
    box('tail light housing',side*.58,.82,3.13,.51,.18,.09,p.dark);for(let n=0;n<4;n++)box('tail segmented lens',side*.58-.18+n*.12,.84,3.19,.08,.075,.03,p.red,true);
    box('replaceable side access plate',side*1.295,.8,.25,.04,.36,.68,p.ivory,true);
    for(const dz of [-.26,.26])for(const dy of [-.12,.12])cylinder('access plate screw',side*1.325,.8+dy,.25+dz,.025,.025,p.steel,'x',true);
  }
  box('cockpit instrument binnacle',0,1.25,-1.68,1.65,.24,.34,p.dark);box('navigation display',0,1.4,-1.65,.28,.12,.04,p.amber,true);
  for(const x of [-.39,.39]){beam('flight control yoke',new Vector3(x,1.25,-1.3),new Vector3(x,1.48,-1.23),.045,p.dark,true);}
  hull('front impact chin',[{z:-3.57,halfWidth:.63,bottom:.28,top:.45},{z:-3.28,halfWidth:.89,bottom:.23,top:.46}],p.dark);
  box('nose cooling intake cavity',0,.58,-3.43,.63,.2,.04,p.rubber);for(let n=0;n<7;n++)box('nose cooling intake louver',-.24+n*.08,.58,-3.465,.027,.17,.03,p.steel,true);
  for(const side of [-1,1]){
    hull('raised hood shoulder ridge',[{z:-3.08,halfWidth:.04,bottom:.99,top:1.025},{z:-2.5,halfWidth:.065,bottom:1.14,top:1.18},{z:-2.14,halfWidth:.045,bottom:1.25,top:1.28}],p.dark).position.x=side*.71;
    box('nose removable inspection panel',side*.49,1.1,-2.55,.41,.025,.43,p.dark,true);
    for(let n=0;n<5;n++)box('nose inspection panel vent',side*.49,1.125,-2.7+n*.065,.32,.025,.022,p.steel,true);
    box('front landing position marker',side*1.12,.82,-2.5,.07,.07,.17,p.amber,true);
    for(let n=0;n<4;n++)box('side sill sacrificial abrasion strip',side*1.32,.51,-.6+n*.5,.025,.06,.35,p.steel,true);
    box('aft radiator protective frame',side*1.02,.87,2.15,.13,.57,.8,p.dark);
    for(let n=0;n<8;n++)box('aft radiator deep cooling fin',side*1.1,.66+n*.06,2.15,.07,.025,.65,p.steel,true);
  }
  for(let n=0;n<8;n++)box('rear heat exchanger fin',0,1.15,2.15+n*.09,1.28,.05,.04,p.dark,true);
  box('taxi roof lantern housing',0,2.24,.35,1.15,.21,.47,p.dark);box('taxi roof illuminated number',0,2.26,.105,.91,.12,.02,shuttle?p.white:p.amber);
  for(const x of [-.85,.85])beam('roof luggage rail',new Vector3(x,2.25,-.65),new Vector3(x,2.25,1.15),.045,p.steel,true);
  const root=a.finish(150);root.metadata.lamps=[{position:[-.63,.86,-3.35],direction:[0,-.16,-1],color:'#b7e5d9',power:150,range:25,kind:'spot'},{position:[.63,.86,-3.35],direction:[0,-.16,-1],color:'#b7e5d9',power:150,range:25,kind:'spot'},{position:[0,.84,3.25],color:'#d94b39',power:10,range:6,kind:'point'},{position:[0,-.12,0],direction:[0,-1,0],color:'#e8a658',power:8,range:4,kind:'spot'}];return root;
}

export function createTrainMechanics(scene:Scene){
  const a=modelAssembly(scene,'skyrail train mechanical assembly'),p=vehiclePalette(scene),{box,cylinder,beam,torus,tube}=a;
  for(let car=0;car<4;car++){
    const z=car*10.5;
    for(const bogie of [-3.1,3.1]){
      box('bogie welded frame',0,-.8,z+bogie,3.3,.32,2.1,p.dark);
      for(const axle of [-.65,.65]){cylinder('solid railway axle',0,-.98,z+bogie+axle,.22,3.7,p.steel,'x');for(const side of [-1,1]){latheWheel(side*1.65,z+bogie+axle);box('bogie axle bearing housing',side*1.84,-.96,z+bogie+axle,.25,.32,.37,p.dark,true);}}
      for(const side of [-1,1]){cylinder('pneumatic suspension bellows',side*1.22,-.35,z+bogie,.46,.35,p.rubber,'y',true);beam('bogie suspension link',new Vector3(side*1.8,-.7,z+bogie-.6),new Vector3(side*1.8,-.45,z+bogie+.6),.09,p.steel,true);}
    }
    box('roof cooling equipment',0,3.35,z,2.9,.42,2.7,p.dark);
    for(const dz of [-.7,.7]){cylinder('roof cooling fan recess',0,3.59,z+dz,.9,.03,p.rubber);torus('roof fan surround',0,3.62,z+dz,.96,.045,p.steel);for(let n=0;n<6;n++){const slat=box('roof fan safety grille',-.35+n*.14,3.65,z+dz,.025,.025,.65,p.steel,true);slat.rotation.y=.2;}}
    for(const side of [-1,1]){for(let n=0;n<7;n++)box('roof equipment cooling louver',side*1.46,3.35,z-.9+n*.3,.03,.24,.12,p.steel,true);box('train door threshold',side*2.3,-.64,z+2.2,.22,.09,1.15,p.steel);for(let n=0;n<4;n++)box('train door threshold traction',side*2.31,-.585,z+1.8+n*.22,.2,.02,.05,p.dark,true);}
    for(let n=0;n<7;n++)box('articulated coupling bellows fold',0,.5,z+5.03+n*.065,2.7,2.7,.033,p.rubber,true);
    tube('coupling pressure line',[new Vector3(.8,-.4,z+4.85),new Vector3(.8,-.8,z+5.3),new Vector3(.8,-.4,z+5.65)],.045,p.copper,true);
  }
  // Local railway wheel axis is X, with a flange retaining it against the rail.
  function latheWheel(x:number,z:number){a.articulate('skyrail rolling wheel',new Vector3(x,-.98,z),'x',{kind:'wheel',radius:.47},()=>{a.lathe('flanged train wheel',x,-.98,z,[[.29,-.13],[.43,-.12],[.47,-.08],[.47,.09],[.51,.11],[.51,.16],[.3,.18]],p.steel,'x');for(let n=0;n<6;n++){const angle=n*Math.PI/3;box('train wheel balance mark',x+.19,-.98+Math.cos(angle)*.32,z+Math.sin(angle)*.32,.018,.09,.035,p.dark,true);}});}
  return a.finish(170);
}
