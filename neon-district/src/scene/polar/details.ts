import type { Scene } from '@babylonjs/core/scene';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { modelAssembly } from '../modelAssembly';
import { v,railing } from './kit';
import type { PolarMaterials } from './materials';
export function refinePolarStation(scene:Scene,m:PolarMaterials){
  const a=modelAssembly(scene,'BOREAL station fittings and field equipment'),fans:TransformNode[]=[];
  for(const [x,z,w,d]of [[-10,8,15,9],[9,12,13,9],[-8,28,17,8]]){
    for(const side of [-1,1]){
      const sx=x+side*(w/2+.16);
      for(let dz=-d/2+.4;dz<d/2;dz+=1.3){a.box('facade folded cassette rib',sx,4.75,z+dz,.08,3.4,.045,m.steel,true);for(const y of [3.1,6.2])a.cylinder('facade hex fastener',sx+side*.05,y,z+dz,.045,.03,m.steel,'x',true);}
      a.tube('insulated heat recovery pipe',[v(sx,2.5,z-d/2+1),v(sx,2.3,z),v(sx,2.5,z+d/2-1)],.12,m.ivory);for(let dz=-d/2+1;dz<d/2;dz+=1.5)a.torus('pipe clamp',sx,2.35,z+dz,.28,.03,m.steel,'z',true);
      a.box('underfloor cable tray',sx,2.22,z,.24,.18,d,m.steel);for(let dz=-d/2;dz<d/2;dz+=.5)a.box('tray cross rung',sx,2.32,z+dz,.28,.025,.05,m.navy,true);
      a.box('external distribution cabinet',sx+side*.2,4.1,z+d/2-1,.45,1.2,.85,m.ivory);a.box('cabinet access seam',sx+side*.44,4.1,z+d/2-1,.02,1.05,.7,m.navy);a.cylinder('cabinet quarter turn latch',sx+side*.46,4.1,z+d/2-.8,.07,.03,m.steel,'x',true);
      for(const dz of [-d/2+1,d/2-1]){a.box('baseplate anchor foot',x+side*(w/2-1),1.28,z+dz,1.1,.14,1.1,m.steel);for(const dx of [-.4,.4])for(const dd of [-.4,.4])a.cylinder('foundation anchor bolt',x+side*(w/2-1)+dx,1.4,z+dz+dd,.085,.15,m.steel,'y',true);}
    }
    for(let dx=-w/2+.5;dx<w/2;dx+=2.2){for(const y of [3.7,5.7])a.box('window rubber compression seal',x+dx+.6,y,z-d/2-.15,1.6,.045,.045,m.rubber,true);a.box('window latch',x+dx,4.6,z-d/2-.17,.055,.15,.035,m.steel,true);}
    // Expanded lab interior: open shelving, specimen trays and desk instruments.
    a.box('laboratory shelf side',x-w/2+1,4.3,z+2.5,.1,2.8,1,m.steel);a.box('laboratory shelf side',x-w/2+3.5,4.3,z+2.5,.1,2.8,1,m.steel);
    for(let row=0;row<4;row++){a.box('laboratory shelf board',x-w/2+2.25,3+row*.65,z+2.5,2.6,.07,1,m.ivory);for(let j=0;j<5;j++){const xx=x-w/2+1.3+j*.42;a.box('labeled sample storage box',xx,3.24+row*.65,z+2.5,.35,.4,.7,j%2?m.navy:m.orange);a.box('sample box label',xx,3.26+row*.65,z+2.13,.22,.08,.02,m.ivory,true);}}
    a.cylinder('laboratory microscope base',x+1,3.73,z-1,.3,.08,m.navy);a.beam('microscope arm',v(x+1,3.8,z-1),v(x+1,4.2,z-1.12),.065,m.steel);a.cylinder('microscope eyepiece',x+1,4.22,z-1.17,.08,.25,m.navy,'z');
    const node=new TransformNode('BOREAL warm room spill',scene);node.position.set(x,4.4,z-d/2+.8);node.metadata={lamps:[{kind:'point',color:'#ffc789',power:35,range:8}]};
    // Roof drainage, iced gutter and paired fan bank.
    a.box('roof edge gutter',x,6.48,z-d/2-.23,w,.1,.18,m.navy);a.tube('downpipe elbow',[v(x+w/2-.2,6.5,z-d/2-.2),v(x+w/2+.15,6.1,z-d/2-.2),v(x+w/2+.15,2.2,z-d/2-.2)],.065,m.steel);
    for(const dx of [-2,2]){a.cylinder('roof fan duct',x+dx,7.1,z+1.2,1.5,.5,m.navy);a.torus('fan guard rim',x+dx,7.4,z+1.2,1.55,.05,m.steel);const fan=new TransformNode('BOREAL rotating roof extractor',scene);fan.position.set(x+dx,7.39,z+1.2);const f=modelAssembly(scene,'BOREAL extractor impeller');f.root.parent=fan;for(let j=0;j<7;j++){const q=j*Math.PI*2/7;f.beam('fan impeller blade',v(Math.cos(q)*.12,0,Math.sin(q)*.12),v(Math.cos(q+.35)*.6,0,Math.sin(q+.35)*.6),.13,m.steel);}f.finish(65);fans.push(fan);for(let j=-3;j<=3;j++)a.box('extractor wire grille',x+dx+j*.18,7.48,z+1.2,.018,.025,1.3,m.navy,true);}
    // Exterior fire equipment and a short grated service catwalk.
    a.cylinder('red fire extinguisher bottle',x-w/2+.8,3.4,z-d/2-.3,.22,.65,m.red);a.cylinder('extinguisher neck',x-w/2+.8,3.8,z-d/2-.3,.08,.12,m.steel);a.tube('extinguisher hose',[v(x-w/2+.8,3.8,z-d/2-.3),v(x-w/2+.61,3.5,z-d/2-.4),v(x-w/2+.65,3.2,z-d/2-.4)],.025,m.rubber);
    a.box('service catwalk deck',x+w/2+.7,2.7,z,1.2,.1,d,m.deck);railing(a,m,v(x+w/2+1.25,2.75,z-d/2),v(x+w/2+1.25,2.75,z+d/2));
  }
  // Workshop hoist and suspended motor, with real chains and lifting sling.
  a.box('workshop overhead hoist rail',-20,6.8,-16,15,.3,.25,m.navy);a.box('hoist trolley',-22,6.5,-16,1,.35,.8,m.orange);for(const x of [-22.25,-21.75]){a.cylinder('hanging hoist chain',x,5.1,-16,.035,2.5,m.steel);for(let i=0;i<20;i++)a.torus('chain link',x,4+i*.115,-16,.085,.018,m.steel,i%2?'x':'z',true);}a.torus('hoist forged hook',-22,3.9,-16,.4,.07,m.orange,'z');
  a.box('service engine block',-25,2.4,-17,1.4,1.1,1.2,m.navy);for(let i=0;i<6;i++){a.cylinder('engine cylinder head fastener',-25.5+i*.2,3,-17,.09,.15,m.steel);a.tube('engine fuel line',[v(-25.5+i*.2,3,-17),v(-25.5+i*.2,3.15,-17.4),v(-25.5+i*.2,2.7,-17.6)],.025,m.steel,true);}
  for(const x of [-26,-14]){a.box('mobile workshop trolley',x,1.8,-18,1.3,1.1,.9,m.red);for(const dx of [-.5,.5])for(const dz of [-.3,.3])a.cylinder('trolley rubber caster',x+dx,1.25,-18+dz,.18,.09,m.rubber,'x');for(let row=0;row<4;row++){a.box('trolley drawer seam',x,1.45+row*.23,-18.47,1.1,.025,.025,m.navy);a.box('trolley drawer handle',x,1.5+row*.23,-18.5,.4,.035,.04,m.steel);}a.tube('trolley handle',[v(x-.55,2.25,-18),v(x-.55,2.6,-18),v(x+.55,2.6,-18),v(x+.55,2.25,-18)],.035,m.steel);}
  for(let i=0;i<3;i++){const x=-27+i*.7;a.cylinder('welding gas cylinder',x,2.25,-12,.35,1.8,m.navy);a.sphere('gas cylinder shoulder',x,3.15,-12,.35,.25,.35,m.navy);a.cylinder('gas valve',x,3.35,-12,.08,.15,m.steel);a.torus('gas valve handwheel',x,3.46,-12,.18,.025,m.orange);}
  a.tube('workshop coiled air hose',Array.from({length:100},(_,i)=>{const q=i/99*Math.PI*8;return v(-16+Math.cos(q)*.8,1.36+i*.001,-18+Math.sin(q)*.8);}),.035,m.orange);a.tube('air hose tail',[v(-15.2,1.4,-18),v(-14,1.3,-20),v(-17,1.35,-21)],.035,m.orange);
  for(let i=0;i<3;i++){const x=-27+i*1.2;a.cylinder('spare track roller tire',x,1.65,-9,.85,.3,m.rubber,'z');a.cylinder('spare roller machined hub',x,1.65,-9.18,.5,.04,m.steel,'z');}
  for(let i=0;i<6;i++){const x=-8+(i%3)*1.5,z=-18+Math.floor(i/3)*1.3;a.box('ribbed expedition equipment case',x,1.55,z,1.1,.65,.9,m.navy);for(const dx of [-.45,.45]){a.box('case metal corner guard',x+dx,1.6,z-.46,.12,.5,.05,m.steel);a.box('case locking clasp',x+dx,1.65,z-.5,.09,.16,.04,m.orange);}a.box('case carry handle',x,1.89,z,.4,.06,.1,m.steel);a.box('case frost cover',x,1.9,z+.2,1.12,.06,.5,m.cap);}
  // Ice-core survey equipment: marked cores, cable drums, geophones and perimeter ropes.
  for(let i=0;i<10;i++){const z=59+i*1.5;a.cylinder('field safety stake',15,1.8,z,.06,1.6,m.orange);if(i<9)a.beam('survey perimeter rope',v(15,2.4,z),v(15,2.4,z+1.5),.018,m.cloth);}
  for(let i=0;i<4;i++){const x=4+i*2.3;a.box('seismometer housing',x,1.5,78,.65,.6,.65,m.ivory);a.cylinder('survey GPS aerial',x,2.1,78,.025,.6,m.steel);a.tube('instrument cable',[v(x,1.3,78),v(x+1,1.22,77),v(9,1.3,72)],.025,m.navy);}
  // Fuel compound fittings: tank jackets, ladder cages, analog gauges and thermal pipe lagging.
  for(let i=0;i<3;i++){const x=21+i*4;for(const y of [1.8,3.3,5])a.torus('tank steel reinforcing band',x,y,27,3.03,.055,m.steel);for(const dx of [-.35,.35])a.cylinder('tank access ladder rail',x+dx,3.3,25.43,.045,4,m.steel);for(let j=0;j<12;j++)a.beam('tank ladder rung',v(x-.35,1.5+j*.3,25.43),v(x+.35,1.5+j*.3,25.43),.035,m.steel);a.cylinder('tank pressure gauge bezel',x,2.2,25.35,.33,.1,m.steel,'z');a.cylinder('tank pressure gauge face',x,2.2,25.28,.26,.03,m.ivory,'z');a.beam('pressure dial needle',v(x,2.2,25.25),v(x+.07,2.29,25.25),.015,m.navy,true);a.box('tank identification plate',x,3.4,25.48,1.4,.5,.025,m.lettering('F'+(i+1),'POLAR FUEL'));a.cylinder('tank top manway',x,5.85,27,.8,.15,m.navy);for(let j=0;j<8;j++){const q=j*Math.PI/4;a.cylinder('manway flange bolt',x+Math.cos(q)*.35,5.95,27+Math.sin(q)*.35,.04,.05,m.steel,'y',true);}}
  for(let i=0;i<8;i++){const x=18+i*1.2;a.box('insulated pipe segment',x,1.7,22,1.15,.3,.3,m.ivory);a.torus('pipe jacket joint',x+.6,1.7,22,.34,.025,m.steel,'x',true);}
  for(const side of [-1,1]){a.tube('generator lifting eye',[v(25+side*2,3.65,14),v(25+side*2,3.95,14),v(25+side*1.7,3.95,14),v(25+side*1.7,3.65,14)],.04,m.steel);a.box('generator access hinge',25+side*2.7,2.5,12.9,.15,.7,.08,m.steel);}
  a.box('generator oil service hatch',25,2.3,12.85,2,1.4,.06,m.ivory);a.box('generator control display',25,2.5,12.8,.65,.35,.03,m.blue);a.sphere('generator emergency stop',26,2.4,12.77,.15,.15,.09,m.signal);a.tube('exhaust rain deflector',[v(27.2,6.55,15.9),v(27.6,6.55,16.1)],.035,m.steel);
  for(let i=0;i<4;i++){const x=-63+(i%2)*4,z=-15+Math.floor(i/2)*10;a.box('shipping container registry',x,2.5,z-2.55,2,.6,.035,m.lettering('BX'+(10+i),'BOREAL RESUPPLY'));for(const dx of [-1.4,1.4]){a.cylinder('container locking rod',x+dx,2.3,z-2.58,.045,2,m.steel);for(const y of [1.5,3.1])a.box('container locking cam',x+dx,y,z-2.63,.2,.09,.08,m.steel);}}
  for(let i=0;i<10;i++){const z=-22+i*3;a.box('dock expansion seam',-66,1.145,z,16,.012,.025,m.navy,true);for(const x of [-73,-59])a.cylinder('dock flush bolt',x,1.16,z,.06,.025,m.steel,'y',true);}
  a.box('old outpost boarded window',-32.5,2.8,74.4,1.2,.8,.05,m.navy);for(let j=0;j<3;j++)a.box('old window timber board',-32.5,2.5+j*.25,74.35,1.25,.16,.05,m.steel);a.box('old station number plate',-29,3,74.35,.8,.4,.03,m.lettering('02','RETIRED'));
  a.finish(60);
  return {update(time:number,reduced:boolean){for(const f of fans)f.rotation.y=reduced?0:time*2.2;}};
}
