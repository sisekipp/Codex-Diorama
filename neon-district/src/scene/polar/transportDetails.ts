import type { Scene } from '@babylonjs/core/scene';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { modelAssembly } from '../modelAssembly';
import { v,railing } from './kit';
import type { PolarMaterials } from './materials';
export function shipFittings(scene:Scene,m:PolarMaterials,parent:TransformNode){
  const a=modelAssembly(scene,'BOREAL maritime deck fittings');a.root.parent=parent;
  for(const side of [-1,1]){
    // Exterior companionway and individual perforated treads connect the decks.
    for(let i=0;i<14;i++){const z=-1.2-i*.36,y=3.9+i*.42;a.box('ship exterior stair tread',side*5.1,y,z,1.3,.08,.45,m.steel);a.box('stair nonslip nosing',side*5.1,y+.05,z-.2,1.25,.025,.065,m.navy,true);}
    railing(a,m,v(side*5.8,4,-1),v(side*5.8,9.6,-6));a.beam('companionway stringer',v(side*4.6,3.8,-1),v(side*4.6,9.6,-6),.1,m.navy);
    a.box('watertight service door',side*5.4,8.8,-4.8,.08,2,.85,m.ivory);a.torus('door dogging wheel',side*5.46,8.7,-4.8,.35,.04,m.steel,'x');for(let i=0;i<6;i++)a.box('watertight door dog',side*5.5,8+i*.3,-5.2,.07,.06,.12,m.navy,true);
    a.tube('deck fire main',[v(side*6.8,3.95,7),v(side*6.8,3.95,25)],.065,m.red);for(const z of [8,17,25]){a.cylinder('fire hydrant riser',side*6.8,4.3,z,.15,.7,m.red);a.torus('hydrant handwheel',side*6.8,4.75,z,.32,.035,m.red);a.cylinder('fire hose reel drum',side*6.6,4.9,z,.8,.35,m.red,'x');a.torus('hose reel rim',side*6.82,4.9,z,.85,.04,m.steel,'x');}
    for(const z of [-18,7,24]){a.cylinder('steel deck fairlead',side*7,4,z,.45,.3,m.steel);a.cylinder('fairlead roller',side*7,4.3,z,.25,.45,m.navy,'z');}
    a.sphere('covered liferaft capsule',side*6.3,7.4,-2,1.25,1.25,2.4,m.ivory);for(const z of [-2.7,-1.3])a.torus('liferaft retaining strap',side*6.3,7.4,z,1.3,.045,m.navy,'z');
  }
  // Funnel maintenance ladder, cage, grilles and access platform.
  for(const x of [-.7,.7])a.cylinder('funnel ladder stringer',x,10.9,6.2,.055,8,m.steel);for(let i=0;i<25;i++)a.beam('ladder rung',v(-.7,7+i*.3,6.2),v(.7,7+i*.3,6.2),.045,m.steel);for(let y=9;y<15;y+=1.1){const ring=a.torus('ladder safety cage',0,y,6.2,1.55,.035,m.steel);ring.scaling.z=.65;}
  a.box('funnel service platform',0,14,7,3,.12,2,m.steel);railing(a,m,v(-1.5,14,8),v(1.5,14,8));
  for(const x of [-1.6,0,1.6])a.cylinder('bridge roof navigation dome',x,12,-6.7,.8,.8,m.ivory);a.cylinder('satellite radome pedestal',2.7,12.1,-8,.55,.9,m.ivory);a.sphere('satellite antenna radome',2.7,13.2,-8,1.5,1.7,1.5,m.ivory);
  // Capstan controls, ropes and actual linked anchor chain on the forecastle.
  for(const side of [-1,1]){for(let i=0;i<28;i++){const z=-26-i*.16;a.torus('individual anchor chain link',side*2.2,5.23+(i%2)*.035,z,.19,.035,m.navy,i%2?'x':'y',true);}a.box('windlass motor housing',side*2,5.48,-24.9,1.4,.6,.9,m.navy);a.cylinder('windlass handwheel',side*2,5.9,-24.9,.45,.1,m.steel);a.box('winch control stand',side*4.5,4.25,25,.4,.9,.35,m.ivory);a.sphere('winch red stop',side*4.5,4.75,24.83,.1,.1,.06,m.signal);}
  for(let z=8;z<29;z+=2)for(const x of [-5.8,5.8]){a.box('working deck panel joint',x,3.77,z,1.7,.018,.025,m.navy,true);a.cylinder('deck flush access cover',x,3.79,z+.5,.5,.035,m.steel);for(let i=0;i<6;i++){const q=i*Math.PI/3;a.cylinder('hatch cover bolt',x+Math.cos(q)*.2,3.82,z+.5+Math.sin(q)*.2,.025,.02,m.navy,'y',true);}}
  // Small welding and repair station on the stern deck.
  a.box('ship service locker',-5,4.8,23,1.7,2,1,m.ivory);a.box('locker inset door',-5,4.8,22.48,1.5,1.8,.04,m.navy);a.box('locker vent label',-5,5.3,22.44,1,.25,.02,m.lettering('D12','DECK SERVICE'));a.cylinder('portable gas bottle',-3.7,4.4,25,.45,1.2,m.orange);a.sphere('gas bottle domed shoulder',-3.7,5.03,25,.45,.3,.45,m.orange);a.tube('deck service hose',[v(-3.7,5.2,25),v(-3.5,4,26),v(-1,3.9,27)],.04,m.rubber);
  a.finish(90);
}
