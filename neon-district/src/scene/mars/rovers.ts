import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import type { MarsMaterials } from './materials';
import { modelAssembly } from '../modelAssembly';

export function createMarsRover(scene:Scene,m:MarsMaterials,kind:'explorer'|'cargo'|'robot',name:string){
  const a=modelAssembly(scene,name),{box,beam,cylinder,lathe,torus,hull,patch,tube}=a,small=kind==='robot',width=small?.68:1.25,radius=small?.34:.68;
  hull('rover protected chassis',[{z:-2.8,halfWidth:width*.75,bottom:.65,top:1.1},{z:-2.3,halfWidth:width,bottom:.55,top:1.25},{z:2.2,halfWidth:width,bottom:.55,top:1.25},{z:2.65,halfWidth:width*.8,bottom:.65,top:1.1}],m.dark);
  for(const side of [-1,1])for(const z of [-1.9,0,1.9]){
    const x=side*(width+.25);
    beam('rocker bogie articulated link',new Vector3(side*width,.9,z*.72),new Vector3(x,radius,z),.13,m.steel);
    cylinder('bogie pivot housing',side*width,.94,z*.72,.3,.2,m.dark,'x');
    const spring:Vector3[]=[];for(let n=0;n<=60;n++){const t=n/60;spring.push(new Vector3(x+.05*Math.cos(t*37),radius+.1+t*.42,z+.05*Math.sin(t*37)));}tube('rover suspension coil',spring,.018,m.orange,true);
    a.articulate('ARES rover rolling wheel',new Vector3(x,radius,z),'x',{kind:'wheel',radius},()=>{
      lathe('regolith wheel curved carcass',x,radius,z,[[radius*.55,-.23],[radius*.88,-.22],[radius,-.14],[radius,.14],[radius*.88,.23],[radius*.55,.24]],m.rubber,'x');torus('rover rim outer lip',x+side*.25,radius,z,radius*1.27,.055,m.steel,'x');cylinder('wheel geared drive hub',x+side*.26,radius,z,radius*.5,.08,m.dark,'x');
      for(let n=0;n<9;n++){const t=n*Math.PI*2/9;beam('rover alloy spoke',new Vector3(x+side*.27,radius,z),new Vector3(x+side*.27,radius+Math.cos(t)*radius*.57,z+Math.sin(t)*radius*.57),.055,m.steel,true);}
      for(let n=0;n<28;n++){const t=n*Math.PI*2/28;const tread=box('rover angled sand grouser',x,radius+Math.cos(t)*radius,z+Math.sin(t)*radius,.49,.035,.09,m.dark,true);tread.rotation.x=-t;tread.rotation.y=.25;}
    });
  }
  if(kind==='explorer'){
    hull('rover pressure cabin roof',[{z:-2,halfWidth:.85,bottom:2.7,top:2.84},{z:-.9,halfWidth:1.15,bottom:3.08,top:3.23},{z:.85,halfWidth:1.1,bottom:3.05,top:3.2}],m.white);
    box('rover cabin floor',0,1.35,-.6,2.3,.25,3.1,m.white);box('rover cabin rear bulkhead',0,2.15,.9,2.3,1.7,.15,m.white);
    patch('rover raked windshield',[new Vector3(-1.1,1.6,-2.15),new Vector3(1.1,1.6,-2.15),new Vector3(.85,2.76,-2),new Vector3(-.85,2.76,-2)],m.glass);
    for(const side of [-1,1]){
      patch('rover side pressure window',[new Vector3(side*1.1,1.6,-2.1),new Vector3(side*.85,2.76,-2),new Vector3(side*1.1,3.1,.75),new Vector3(side*1.1,1.6,.75)],m.glass);
      for(const z of [-2,.65])beam('rover cabin pillar',new Vector3(side*1.1,1.5,z),new Vector3(side*(z<0?.85:1.1),z<0?2.8:3.14,z),.09,m.white);
      box('rover lower door',side*1.14,1.7,-.45,.1,.42,2.7,m.white);box('rover recessed door latch',side*1.2,1.95,.35,.06,.1,.29,m.dark,true);
      box('rover EVA boarding step',side*1.35,.97,-.4,.3,.13,1.5,m.steel);box('rover bucket seat',side*.5,1.68,-.1,.65,.16,.7,m.dark);box('rover seat back',side*.5,2.07,.2,.65,.75,.15,m.dark);
      box('rover roof equipment rail',side*.78,3.36,-.25,.055,.1,2.3,m.steel);
    }
    box('rover instrument panel',0,1.9,-1.57,1.8,.25,.35,m.dark);box('rover navigation display',0,2.07,-1.6,.45,.13,.03,m.cold);
    box('rover rear service deck',0,1.6,1.9,2.2,.6,1.3,m.orange);for(let n=0;n<5;n++)box('rover rear heat exchanger fin',0,1.96,1.45+n*.2,1.6,.035,.08,m.dark,true);
    cylinder('rover roof scanning mast',.5,3.7,.35,.08,.8,m.steel);a.sphere('rover lidar head',.5,4.13,.35,.42,.18,.36,m.dark);
  }else if(kind==='cargo'){
    box('cargo rover flatbed',0,1.32,.7,2.6,.18,3.8,m.white);box('cargo rover cab lower',0,1.6,-1.8,2.3,.7,1.6,m.orange);
    hull('cargo rover cab canopy',[{z:-2.4,halfWidth:.9,bottom:2.43,top:2.55},{z:-1.15,halfWidth:1.1,bottom:2.67,top:2.8}],m.white);
    patch('cargo rover windscreen',[new Vector3(-1.03,1.95,-2.58),new Vector3(1.03,1.95,-2.58),new Vector3(.9,2.44,-2.38),new Vector3(-.9,2.44,-2.38)],m.glass);
    for(const side of [-1,1]){beam('cargo cab windshield pillar',new Vector3(side*1.04,1.9,-2.57),new Vector3(side*.9,2.48,-2.38),.08,m.white);box('cargo cab side wall',side*1.07,2.2,-1.63,.09,.95,1.4,m.orange);}
    for(let n=0;n<6;n++){const x=n%2?-.65:.65,z=-.2+Math.floor(n/2)*1.05;cylinder('cargo oxygen bottle',x,2.13,z,.64,1.4,m.white);torus('cargo bottle tie down',x,2.13,z,.65,.045,m.dark);cylinder('cargo bottle valve',x,2.92,z,.14,.2,m.steel);}
    for(const x of [-1.16,1.16])beam('cargo tie down strap',new Vector3(x,1.44,-.5),new Vector3(x,3.15,1.8),.05,m.dark);
  }else{
    box('robot protected electronics',0,1.15,0,1.35,.6,2.8,m.orange);box('robot solar deck',0,1.5,.25,1.5,.06,2.3,m.blue);
    for(let n=0;n<7;n++)box('robot solar bus bar',0,1.54,-.7+n*.3,1.4,.012,.015,m.steel,true);
    cylinder('robot sensor mast',0,1.95,-.8,.07,1,m.steel);box('robot stereo camera',0,2.45,-.8,.5,.18,.21,m.dark);for(const x of [-.17,.17])cylinder('robot optical lens',x,2.45,-.93,.11,.05,m.cold,'z');
    beam('robot manipulator upper arm',new Vector3(.55,1.2,-1),new Vector3(.9,1.55,-1.8),.09,m.white);beam('robot manipulator forearm',new Vector3(.9,1.55,-1.8),new Vector3(.7,.65,-2.3),.07,m.steel);
  }
  for(const side of [-1,1]){box('rover headlight recessed housing',side*width*.68,1.2,-2.72,.4,.18,.13,m.dark);cylinder('rover front projector',side*width*.68,1.2,-2.81,.13,.045,m.lamp,'z');box('rover rear warning lens',side*width*.75,1.15,2.66,.2,.1,.035,m.red);}
  const root=a.finish(85);root.metadata.lamps=[{position:[-width*.68,1.2,-2.86],direction:[0,-.16,-1],color:'#e4cda0',power:160,range:24,kind:'spot'},{position:[width*.68,1.2,-2.86],direction:[0,-.16,-1],color:'#e4cda0',power:160,range:24,kind:'spot'}];
  if(small)root.scaling.setAll(.7);
  return {root,wheels:root.getChildTransformNodes(false).filter(node=>node.metadata?.motion?.kind==='wheel'),wheelRadius:radius,width:width+.25};
}
