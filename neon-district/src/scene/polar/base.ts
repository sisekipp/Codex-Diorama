import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { modelAssembly } from '../modelAssembly';
import type { Scene } from '@babylonjs/core/scene';
import type { PolarMaterials } from './materials';
import { v,railing,icicles,lamp } from './kit';
export function createPolarBase(scene:Scene,m:PolarMaterials){
  const a=modelAssembly(scene,'BOREAL station architecture'),steam:TransformNode[]=[];
  const sign=(text:string,sub:string,x:number,y:number,z:number,w=5)=>a.box('station enamel sign '+text,x,y,z,w,w/4,.035,m.lettering(text,sub));
  const module=(x:number,z:number,w:number,d:number,label:string)=>{
    const floor=2.7,top=6.5;
    a.box('insulated structural floor',x,floor,z,w,.4,d,m.navy);a.box('ceiling panel',x,top,z,w,.25,d,m.ivory);a.box('deep settled roof snow',x,top+.23,z,w+.3,.35,d+.25,m.cap);
    for(const side of [-1,1]){a.box('side wall insulated sill',x+side*w/2,3.35,z,.22,1.1,d,m.red);a.box('side wall insulated lintel',x+side*w/2,6.1,z,.22,.8,d,m.red);a.box('side elevation glazing',x+side*w/2,4.75,z,.05,1.9,d-.2,m.glass);for(let dz=-d/2;dz<=d/2;dz+=1.3)a.box('side elevation mullion',x+side*w/2,4.75,z+dz,.25,2,.07,m.navy);a.box('roof edge flashing',x+side*w/2,6.4,z,.15,.3,d+.3,m.steel);for(let i=0;i<d;i+=1.3)a.box('wall vertical panel seam',x+side*(w/2+.12),4.6,z-d/2+i,.035,3.6,.035,m.navy);}
    a.box('rear wall',x,4.7,z+d/2,w,3.8,.2,m.ivory);a.box('front sill',x,3.3,z-d/2,w,1.1,.2,m.red);a.box('front lintel',x,6.05,z-d/2,w,.85,.2,m.red);
    for(let dx=-w/2;dx<=w/2;dx+=2.2){a.box('window frame mullion',x+dx,4.7,z-d/2,.1,2.1,.25,m.navy);if(dx+1.9<w/2)a.box('transparent frost glass',x+dx+1,4.7,z-d/2-.025,1.95,1.95,.035,m.glass);a.box('frosty window bottom edge',x+dx+.9,3.73,z-d/2-.06,1.9,.1,.1,m.cap);}
    for(const dx of [-w/2+1,w/2-1])for(const dz of [-d/2+1,d/2-1]){a.box('raised steel foundation pile',x+dx,1.9,z+dz,.28,2.4,.28,m.steel);a.box('spread footing',x+dx,1.2,z+dz,1,.15,1,m.navy);a.beam('foundation diagonal brace',v(x+dx,1.3,z+dz),v(x-dx,2.5,z+dz),.09,m.steel);}
    for(let dx=-w/2+1.6;dx<w/2-1;dx+=2.5){a.box('interior desk',x+dx,3.6,z-1.1,1.7,.12,.85,m.ivory);a.box('desk steel leg',x+dx,3.15,z-1.1,.12,.9,.15,m.steel);a.box('instrument screen frame',x+dx,4.05,z-1, .8,.55,.09,m.navy);a.box('lit monitor screen',x+dx,4.06,z-1.06,.68,.42,.025,m.blue);a.box('chair cushion',x+dx,3.3,z+.15,.65,.16,.7,m.cloth);a.box('chair back',x+dx,3.65,z+.42,.65,.65,.12,m.cloth);a.cylinder('sample jar',x+dx+.6,3.8,z-1.1,.12,.25,m.glass);}
    a.box('interior ceiling warm strip',x,6.27,z,w-1,.08,.13,m.warm);lamp(scene,'BOREAL warm interior '+label,a.root,x,5.8,z,'#ffd09c',130,13);
    sign(label,'BOREAL / POLAR RESEARCH',x,5.95,z-d/2-.13,Math.min(w-1,6));icicles(a,m,x,6.5,z-d/2-.15,Math.floor(w*2),w);
    for(let i=0;i<3;i++){a.box('roof HVAC box',x-w/3+i*w/3,6.9,z+1,1.2,.6,1.4,m.steel);a.box('snow on HVAC',x-w/3+i*w/3,7.23,z+1,1.3,.12,1.5,m.cap);for(let j=0;j<5;j++)a.box('vent grille fin',x-w/3+i*w/3-.45+j*.22,6.88,z+.28,.05,.42,.035,m.navy,true);}
    const vent=new TransformNode('BOREAL ventilation outlet',scene);vent.position.set(x+w/2-1,7.1,z+1);steam.push(vent);
  };
  module(-10,8,15,9,'STATION 12');module(9,12,13,9,'RESEARCH');module(-8,28,17,8,'HABITAT');
  // Glazed elevated corridors.
  for(const [x,z,w,d]of [[-1,10,8,3],[-9,18,3,13]] as number[][]){a.box('corridor deck',x,2.7,z,w,.3,d,m.navy);a.box('corridor roof',x,5.7,z,w,.15,d,m.red);a.box('corridor roof snow',x,5.85,z,w+.2,.2,d+.2,m.cap);for(const side of [-1,1])a.box('corridor glazing',x+side*(w/2-.04),4.15,z,.06,2.7,d,m.glass);for(let n=-d/2;n<=d/2;n+=1.3)a.box('corridor side frame',x-w/2,4.2,z+n,.1,2.8,.1,m.navy);}
  // Entrance porch, weather vestibule, grating and stairs.
  a.box('entrance porch',-12,2.7,1,7,.2,4,m.deck);a.box('vestibule case',-12,4.15,2.5,3.5,2.9,2,m.red);a.box('recessed insulated door',-12,4.1,1.46,2.4,2.65,.08,m.navy);a.box('door frosted window',-12,4.65,1.4,1.65,.7,.035,m.glass);a.box('door latch',-11.1,3.9,1.34,.07,.35,.09,m.steel);a.box('porch worklight',-12,5.6,1.2,2,.12,.2,m.warm);lamp(scene,'porch light',a.root,-12,5.4,.6);
  for(let i=0;i<7;i++)a.box('grated entrance tread',-12,1.25+i*.22,-3+i*.48,3,.15,.6,m.steel);railing(a,m,v(-13.6,1.2,-3),v(-13.6,2.7,.5));railing(a,m,v(-10.4,1.2,-3),v(-10.4,2.7,.5));
  // Open vehicle workshop: a real opening, exposed interior and tools.
  const hx=-20,hz=-16,w=17,d=12;a.box('workshop floor',hx,1.18,hz,w,.2,d,m.deck);a.box('workshop rear wall',hx,4.6,hz+d/2,w,6.7,.25,m.red);
  for(const side of [-1,1]){a.box('workshop side wall',hx+side*w/2,4.6,hz,.22,6.7,d,m.ivory);a.box('workshop front jamb',hx+side*(w/2-.4),4.6,hz-d/2,.7,6.7,.4,m.navy);}
  a.box('workshop roof',hx,8.05,hz,w+.4,.3,d+.4,m.red);a.box('deep workshop roof snow',hx,8.35,hz,w+.6,.4,d+.6,m.cap);a.box('rolled door header',hx,7.7,hz-d/2,16,.65,.7,m.steel);for(let i=0;i<22;i++)a.box('rolled shutter ridge',hx-7.7+i*.72,7.72,hz-d/2-.36,.06,.6,.04,m.navy,true);
  for(let z=hz-d/2;z<hz+d/2;z+=2){for(const side of [-1,1])a.box('workshop steel column',hx+side*(w/2-.3),4.6,z,.15,6.5,.18,m.navy);a.box('roof crossbeam',hx,7.6,z,w,.15,.2,m.steel);a.box('warm work strip',hx,7.45,z,9,.07,.15,m.warm);}
  for(const dx of [-5,5]){a.box('tool cabinet',hx+dx,2.05,hz+4,3,1.6,1,m.red);for(let i=0;i<5;i++){a.box('tool drawer',hx+dx,1.48+i*.27,hz+3.46,2.8,.22,.06,m.navy);a.box('drawer handle',hx+dx,1.49+i*.27,hz+3.4,.8,.03,.04,m.steel,true);}a.box('workbench top',hx+dx,2.9,hz+4,3.3,.18,1.3,m.steel);for(let j=0;j<4;j++){a.torus('spanner closed end',hx+dx-1+j*.6,3.02,hz+4,.14,.035,m.steel);a.box('spanner shank',hx+dx-1+j*.6,3.01,hz+4.18,.055,.03,.3,m.steel,true);}}
  a.box('tool pegboard',hx,4.7,hz+5.78,4.6,2.1,.1,m.navy);for(let i=0;i<12;i++)a.cylinder('socket on tool board',hx-2+i*.35,4.6,hz+5.68,.1,.25,m.steel,'y',true);
  for(const x of [-24,-16]){a.cylinder('service lift hydraulic',x,1.6,-15,.32,.9,m.orange);a.box('lift rail',x,2,-15,.5,.15,5,m.steel);}lamp(scene,'workshop interior left',a.root,-25,6.7,-15,'#ffd29b',180,18);lamp(scene,'workshop interior right',a.root,-15,6.7,-15,'#ffd29b',180,18);sign('WORKSHOP','GROUND OPERATIONS',hx,7.7,hz-6.38,6);icicles(a,m,hx,8.45,hz-6.25,30,17);
  // Dock and transfer lane.
  a.box('pier structural deck',-66,.5,-8,17,1,32,m.navy);a.box('pier nonslip surface',-66,1.07,-8,16.8,.12,31.8,m.deck);for(let z=-22;z<=8;z+=5){a.cylinder('dock mooring bollard',-73,1.4,z,.55,.65,m.orange);a.cylinder('bollard cap',-73,1.74,z,.9,.15,m.steel);for(const x of [-72,-60])a.cylinder('pier pile',x,-1.5,z,.65,5,m.steel);a.box('rubber pier fender',-74.6,-.1,z,.4,1.7,2.4,m.rubber);a.box('pier snowy edge',-59.3,1.22,z,.6,.3,4.5,m.cap);}railing(a,m,v(-58,1.15,-23),v(-58,1.15,8));
  for(let i=0;i<4;i++){const x=-63+(i%2)*4,z=-15+Math.floor(i/2)*10;a.box('dock cargo container',x,2.3,z,3.2,2.2,5,m.orange);for(let j=0;j<9;j++)a.box('container corrugation',x-1.63,2.3,z-2.2+j*.55,.06,2.05,.08,m.navy,true);a.box('container snow cover',x,3.5,z,3.4,.2,5.2,m.cap);}
  // Fuel/power compound with exhaust, hose and spare drums.
  for(let i=0;i<3;i++){const x=21+i*4;a.cylinder('fuel tank',x,3.4,27,3,4.5,m.ivory);a.sphere('tank cap',x,5.7,27,3,.5,3,m.cap);a.tube('fuel pipe',[v(x,1.7,27),v(x,1.7,22),v(18,1.7,22)],.09,m.steel);a.torus('valve wheel',x,1.8,24,.4,.05,m.red,'z');}
  a.box('generator enclosure',25,2.4,15,6,2.5,4,m.navy);for(let i=0;i<14;i++)a.box('generator intake louver',22+i*.42,2.5,12.94,.16,1.7,.08,m.steel,true);a.tube('generator exhaust stack',[v(27,3.5,16),v(27,6.2,16),v(27.4,6.5,16)],.16,m.navy);const exhaust=new TransformNode('BOREAL generator exhaust',scene);exhaust.position.set(27.4,6.6,16);steam.push(exhaust);
  for(let i=0;i<6;i++){const x=21+(i%3)*1.5,z=6+Math.floor(i/3)*1.8;a.cylinder('supply drum',x,1.8,z,.85,1.3,m.orange);for(const y of [1.3,2.25])a.torus('drum reinforcing hoop',x,y,z,.87,.035,m.steel);}
  // Radio mast, radar and wind indicators.
  const radar=new TransformNode('BOREAL rotating radar azimuth',scene);radar.position.set(-2,16,30);const r=modelAssembly(scene,'BOREAL radar reflector');r.root.parent=radar;r.box('radar panel',0,0,0,4,.9,.15,m.ivory);for(let i=0;i<12;i++)r.box('radar ribs',-1.9+i*.35,0,-.12,.04,.85,.04,m.steel,true);r.finish();
  for(const side of [-1,1])a.beam('radio lattice mast leg',v(-2+side*.9,1.2,30),v(-2+side*.3,16,30),.13,m.steel);for(let y=2;y<16;y+=1.6){a.beam('mast cross brace',v(-2-.85,y,30),v(-2+.85,y+1.5,30),.055,m.steel);}a.box('mast obstruction lamp',-2,16.9,30,.18,.18,.18,m.signal);
  // Core drilling and archive beyond the runway apron.
  a.box('drilling platform',8,1.6,68,8,.5,7,m.deck);for(const side of [-1,1])a.beam('drilling A frame',v(8+side*2,1.8,68),v(8,8,68),.18,m.orange);a.cylinder('ice bore drill',8,3.6,68,.3,5,m.steel);for(let i=0;i<14;i++)a.torus('drill screw flight',8,1.3+i*.3,68,.55,.05,m.steel);
  for(let i=0;i<8;i++){a.box('ice core storage crate',14+(i%4)*1.5,1.6,65+Math.floor(i/4)*2,1.1,.8,1.4,m.navy);a.cylinder('archived ice core',14+(i%4)*1.5,2.1,65+Math.floor(i/4)*2,.22,1.1,m.ice,'z');}
  sign('ICE CORE','FIELD LAB / 03',8,5.6,65,4);
  // Old timber shelter almost buried in drift.
  a.box('abandoned orange hut',-31,2,77,6,3,5,m.red);a.box('old hut roof',-31,3.6,77,6.7,.3,5.6,m.navy);a.sphere('buried old outpost snow',-32,2.8,79,10,5.5,8,m.cap);a.box('old hatch visible above drift',-31,2.3,74.43,1.3,2,.07,m.navy);a.beam('old antenna leaning',v(-29,3,77),v(-27,7,77),.07,m.steel);
  for(const [x,z]of [[-49,-26],[-39,-27],[30,-12],[80,-80],[80,130]]){a.cylinder('floodlight pole',x,5,z,.16,8,m.steel);a.box('floodlight head',x,9,z,1.5,.3,.7,m.navy);a.box('floodlight diffuser',x,8.8,z,1.3,.08,.6,m.white);lamp(scene,'BOREAL area floodlight',a.root,x,8.7,z,'#cde7ff',150,24);}
  // Delineate snow runway without painting broad black asphalt.
  for(let i=0;i<25;i++)for(const side of [-1,1]){const z=-94+i*10;a.cylinder('runway marker pole',64+side*10.5,1.65,z,.08,1.1,m.orange);a.sphere('blue runway beacon',64+side*10.5,2.2,z,.18,.18,.18,m.blue);}
  for(let i=0;i<4;i++)a.box('runway threshold snow paint',58+i*4,1.13,143,1.2,.025,5,m.orange);
  a.finish(95);
  return {steam,update(time:number,reduced:boolean){radar.rotation.y=reduced?0:time*.12;}};
}
