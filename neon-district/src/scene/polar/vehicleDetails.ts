import { modelAssembly } from '../modelAssembly';
import { v } from './kit';
import type { PolarMaterials } from './materials';
export function vehicleFittings(a:ReturnType<typeof modelAssembly>,m:PolarMaterials,kind:'plow'|'cargo'|'mobile'){
  if(kind==='mobile'){
    const wind=a.patch('snowmobile curved windscreen',[v(-.5,1.35,-1.35),v(.5,1.35,-1.35),v(.38,2,-1),v(-.38,2,-1)],m.glass);wind.material!.backFaceCulling=false;
    a.tube('windscreen edge seal',[v(-.5,1.35,-1.36),v(-.38,2,-1.01),v(.38,2,-1.01),v(.5,1.35,-1.36)],.025,m.navy);
    for(const side of [-1,1]){a.tube('snowmobile side grab rail',[v(side*.65,1,-.7),v(side*.75,1,.5),v(side*.55,1.3,1.35)],.045,m.steel);a.box('running board',side*.75,.8,.4,.3,.1,1.9,m.navy);for(let j=0;j<8;j++)a.box('running board grip tooth',side*.75,.87,-.35+j*.19,.28,.04,.04,m.steel,true);a.beam('ski upper suspension wishbone',v(side*.3,.8,-1),v(side*.8,.35,-2),.065,m.navy);a.beam('ski lower suspension wishbone',v(side*.45,.45,-.6),v(side*.8,.22,-2),.065,m.navy);a.cylinder('ski damper piston',side*.62,.58,-1.6,.07,.55,m.steel);a.tube('ski coil spring',Array.from({length:65},(_,i)=>{const q=i/64*Math.PI*14;return v(side*.62+Math.cos(q)*.09,.34+i/64*.45,-1.6+Math.sin(q)*.09);}),.018,m.orange);a.box('cowling side intake',side*.61,1.25,-.7,.03,.23,.65,m.navy);for(let j=0;j<5;j++)a.box('intake slat',side*.64,1.26,-.95+j*.12,.025,.2,.035,m.steel,true);a.box('snowmobile rescue badge',side*.62,1.4,-.5,.025,.18,.5,m.ivory);}
    a.tube('rear cargo rack',[v(-.5,1.4,1.1),v(-.5,1.4,1.7),v(.5,1.4,1.7),v(.5,1.4,1.1)],.035,m.steel);a.box('snowmobile strapped equipment bag',0,1.55,1.35,.75,.25,.5,m.cloth);for(const x of [-.22,.22])a.box('bag tie strap',x,1.69,1.35,.035,.02,.55,m.orange);return;
  }
  // Formed fenders, exposed suspension and machined road-wheel fittings.
  for(const side of [-1,1]){
    a.hull('formed fender edge',[{z:-2.2,halfWidth:.38,bottom:1.45,top:1.53},{z:-1.8,halfWidth:.4,bottom:1.66,top:1.75},{z:1.8,halfWidth:.4,bottom:1.66,top:1.75},{z:2.2,halfWidth:.38,bottom:1.45,top:1.53}],m.red).position.x=side*1.55;
    a.box('rubber rear mud flap',side*1.55,.85,2.27,.75,1.1,.045,m.rubber);a.box('mudflap snow stripe',side*1.55,.42,2.3,.7,.12,.02,m.cap);
    for(let i=0;i<5;i++){const z=-1.75+i*.875;a.beam('suspension swing arm',v(side*1.33,1.1,z+.28),v(side*1.56,.6,z),.1,m.steel);for(let j=0;j<6;j++){const q=j*Math.PI/3;a.cylinder('road wheel hub stud',side*1.82,.6+Math.cos(q)*.16,z+Math.sin(q)*.16,.045,.04,m.steel,'x',true);}}
    a.tube('cab external grab handle',[v(side*1.36,2.2,-.2),v(side*1.47,2.2,-.2),v(side*1.47,3.3,-.2),v(side*1.36,3.3,-.2)],.035,m.steel);
    for(let i=0;i<3;i++){a.box('perforated entry rung',side*1.6,1.25+i*.25,-.1,.65,.07,.4,m.steel);for(let j=0;j<4;j++)a.box('entry rung grip recess',side*1.6,1.29+i*.25,-.24+j*.09,.4,.01,.035,m.navy,true);}
    a.box('cab door seam',side*1.29,2.35,-.15,.025,1.8,.035,m.navy);a.box('door locking latch',side*1.34,2.2,-.45,.06,.12,.3,m.steel);a.box('roof work lamp mount',side*1.1,3.8,-1.95,.3,.15,.3,m.navy);a.box('roof work lamp lens',side*1.1,3.88,-2.12,.23,.12,.03,m.white);
    a.tube('hydraulic hose pair',[v(side*.8,1.5,1.5),v(side*1.1,1.8,.6),v(side*1,1.25,-1.6)],.025,m.rubber,true);
  }
  a.tube('front protective bumper',[v(-1.5,1.6,-2.45),v(-1.5,1.4,-2.6),v(1.5,1.4,-2.6),v(1.5,1.6,-2.45)],.085,m.navy);for(const x of [-.9,.9])a.torus('front towing eye',x,1.3,-2.63,.2,.05,m.steel,'z');
  for(let i=0;i<6;i++){a.cylinder('dashboard dial bezel',-.8+i*.28,2.65,-1.85,.12,.03,m.steel,'z',true);a.cylinder('dashboard dial face',-.8+i*.28,2.65,-1.87,.095,.035,m.navy,'z',true);}a.beam('control lever',v(.3,2.1,-.9),v(.3,2.6,-1.1),.035,m.steel);a.sphere('control lever knob',.3,2.61,-1.1,.1,.1,.1,m.rubber);a.cylinder('cabin fire extinguisher',1,2,-.1,.2,.55,m.red);
  a.tube('roof aerial', [v(.9,3.8,-.2),v(.92,4.6,-.15)],.018,m.navy);a.box('rear hitch receiver',0,1.2,2.4,.45,.3,.5,m.navy);a.torus('rear towing pintle',0,1.2,2.72,.25,.07,m.steel,'z');
  if(kind==='cargo')for(const side of [-1,1]){for(let z=.9;z<2.6;z+=.6){a.box('cargo side rack stake',side*1.35,2.1,z,.08,.65,.08,m.steel);a.torus('load tie-down ring',side*1.37,1.95,z,.14,.035,m.steel,'x');}a.box('equipment crate label',side*.65,2.5,.87,.55,.22,.025,m.ivory);a.box('cargo strap buckle',side*.65,2.45,.82,.14,.15,.06,m.steel);a.sphere('irregular snow on supply crate',side*.65,3.1,1.9,1.1,.18,1,m.cap);}
  if(kind==='plow')return a.articulate('BOREAL hydraulic moldboard',v(0,.2,-3.8),'y',{kind:'fan',speed:0},()=>{
    a.box('plow cutting edge',0,.2,-3.87,5,.13,.18,m.steel);a.box('moldboard frost lip',0,1.35,-3.95,4.8,.09,.2,m.cap);
    for(let i=0;i<6;i++){const y0=.18+i*.19,y1=y0+.19,z0=-3.72-.38*Math.sin(i/6*Math.PI),z1=-3.72-.38*Math.sin((i+1)/6*Math.PI);a.patch('continuous curved moldboard',[v(-2.5,y0,z0),v(2.5,y0,z0),v(2.5,y1,z1),v(-2.5,y1,z1)],m.orange);}
    for(const x of [-2,-1,0,1,2]){a.beam('moldboard reinforcing rib',v(x,.2,-3.65),v(x,1.3,-3.65),.09,m.navy);a.cylinder('cutting edge bolt',x,.28,-3.83,.08,.04,m.steel,'z',true);}
    for(const side of [-1,1]){a.patch('blade end plate',[v(side*2.5,.18,-3.7),v(side*2.5,.2,-4),v(side*2.5,1.3,-3.8),v(side*2.5,1.3,-3.55)],m.navy);a.tube('blade flexible hydraulic feed',[v(side*.9,1.6,-2),v(side*1,1.4,-2.8),v(side*1.2,.7,-3.6)],.035,m.rubber);}
  });
}
