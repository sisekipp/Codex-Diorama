import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import { modelAssembly, vehiclePalette } from './modelAssembly';

export function createStreetCoupe(scene:Scene){
  const a=modelAssembly(scene,'parked electric coupe'),p=vehiclePalette(scene),{box,beam,patch,hull,lathe,cylinder,torus}=a;
  // Narrow structural tub leaves real openings behind the outer wheel arch strips.
  hull('formed monocoque',[{z:-2.5,halfWidth:.73,bottom:.46,top:.77},{z:-2.18,halfWidth:.94,bottom:.4,top:.95},{z:-1.25,halfWidth:.89,bottom:.39,top:1.04},{z:.75,halfWidth:.9,bottom:.38,top:.97},{z:1.8,halfWidth:.9,bottom:.45,top:.96},{z:2.4,halfWidth:.79,bottom:.5,top:.79}],p.blue);
  hull('hood and shoulder crown',[{z:-2.3,halfWidth:.83,bottom:.78,top:.91},{z:-1.35,halfWidth:.9,bottom:.9,top:1.03},{z:-.85,halfWidth:.87,bottom:.94,top:1.07}],p.blue);
  hull('rear shoulder',[{z:1,halfWidth:.88,bottom:.86,top:1.04},{z:1.9,halfWidth:.91,bottom:.8,top:.96},{z:2.3,halfWidth:.8,bottom:.7,top:.83}],p.blue);
  hull('thin sculpted roof',[{z:-.43,halfWidth:.7,bottom:1.59,top:1.65},{z:.28,halfWidth:.75,bottom:1.65,top:1.73},{z:1.02,halfWidth:.69,bottom:1.57,top:1.65}],p.blue);
  for(const side of [-1,1]){
    box('door skin',side*.97,.77,.04,.11,.4,1.74,p.blue);box('door inset rocker',side*.97,.46,.07,.16,.1,1.7,p.dark);
    for(const z of [-1.5,1.52]){
      a.articulate('coupe rolling wheel',new Vector3(side*1.03,.47,z),'x',{kind:'wheel',radius:.457},()=>{
      lathe('rounded tire carcass',side*1.03,.47,z,[[.27,-.18],[.36,-.175],[.435,-.12],[.457,-.04],[.457,.08],[.424,.16],[.32,.19]],p.rubber,'x');
      cylinder('brake rotor',side*1.13,.47,z,.58,.035,p.steel,'x');torus('rim rolled lip',side*1.22,.47,z,.58,.045,p.steel,'x');cylinder('recessed wheel center',side*1.23,.47,z,.15,.055,p.dark,'x');
      for(let n=0;n<7;n++){const angle=n*Math.PI*2/7;beam('swept alloy spoke',new Vector3(side*1.235,.47+Math.cos(angle)*.08,z+Math.sin(angle)*.08),new Vector3(side*1.235,.47+Math.cos(angle+.2)*.28,z+Math.sin(angle+.2)*.28),.038,p.steel,true);cylinder('wheel lug bolt',side*1.265,.47+Math.cos(angle)*.105,z+Math.sin(angle)*.105,.025,.025,p.copper,'x',true);}
      for(let n=0;n<40;n++){const ang=n*Math.PI*2/40;for(const offset of [-.085,.085]){const tread=box('siped tire tread',side*1.03+offset,.47+Math.cos(ang)*.454,z+Math.sin(ang)*.454,.085,.008,.022,p.dark,true);tread.rotation.x=-ang;tread.rotation.y=offset>0?.3:-.3;}}
      });
      box('brake caliper',side*1.17,.48,z+.23,.06,.2,.1,p.copper,true);
      // Profiled arch geometry follows the wheel, leaving a visible empty wheel opening.
      for(let n=0;n<18;n++){const t1=Math.PI*.02+n*Math.PI*.96/18,t2=t1+Math.PI*.96/18;const v=(angle:number,r:number)=>new Vector3(side*1.105,.47+Math.sin(angle)*r,z+Math.cos(angle)*r);patch('rolled open wheel arch',[v(t1,.49),v(t2,.49),v(t2,.58),v(t1,.58)],p.blue);beam('arch exposed lip',v(t1,.49),v(t2,.49),.018,p.dark,true);}
    }
    const lowerFront=new Vector3(side*.9,1.02,-.96),upperFront=new Vector3(side*.7,1.62,-.4),upperRear=new Vector3(side*.7,1.61,.99),lowerRear=new Vector3(side*.91,1.02,1.46);
    patch('side glass with visible interior',[lowerFront,upperFront,upperRear,lowerRear],p.glass);
    beam('raked A pillar',lowerFront,upperFront,.075,p.blue);beam('rear sail pillar',upperRear,lowerRear,.11,p.blue);beam('side window gasket',lowerFront,lowerRear,.035,p.rubber,true);beam('B pillar',new Vector3(side*.9,1.04,.43),new Vector3(side*.73,1.67,.43),.048,p.dark);
    box('flush door handle',side*1.04,.94,.61,.055,.055,.25,p.steel,true);
    beam('mirror support',new Vector3(side*.91,1.1,-.77),new Vector3(side*1.21,1.15,-.73),.055,p.dark);
    a.sphere('sculpted wing mirror',side*1.23,1.16,-.72,.31,.15,.23,p.blue);box('mirror insert',side*1.23,1.16,-.59,.23,.09,.022,p.steel,true);
    for(const z of [-.84,.94])box('door panel gap',side*1.034,.78,z,.01,.35,.013,p.rubber,true);
    box('headlamp recessed socket',side*.68,.77,-2.43,.55,.2,.1,p.dark);for(let n=0;n<4;n++)cylinder('headlight projector lens',side*.68-.18+n*.12,.79,-2.493,.075,.04,p.white,'z',true);
    box('rear lamp socket',side*.63,.79,2.35,.65,.15,.09,p.dark);for(let n=0;n<6;n++)box('rear segmented optic',side*.63-.25+n*.1,.8,2.405,.065,.065,.025,p.red,true);
    box('sport seat base',side*.43,.79,.18,.55,.16,.7,p.seat);const back=box('seat contoured backrest',side*.43,1.13,.52,.54,.7,.17,p.seat);back.rotation.x=.15;a.sphere('seat head restraint',side*.43,1.52,.56,.35,.18,.14,p.seat,true);
    for(let n=0;n<5;n++)box('seat upholstery seam',side*.43,1.0+n*.08,.415,.42,.008,.01,p.dark,true);
  }
  patch('raked windscreen',[new Vector3(-.88,1.05,-.98),new Vector3(.88,1.05,-.98),new Vector3(.69,1.61,-.43),new Vector3(-.69,1.61,-.43)],p.glass);
  patch('rear glazing',[new Vector3(-.7,1.6,1.02),new Vector3(.7,1.6,1.02),new Vector3(.88,1.04,1.49),new Vector3(-.88,1.04,1.49)],p.glass);
  box('dashboard',0,1.02,-.58,1.55,.22,.32,p.dark);box('instrument display',-.42,1.15,-.56,.25,.09,.025,p.amber,true);box('center transmission tunnel',0,.82,.1,.17,.17,.85,p.dark);
  const steering=torus('steering wheel',-.43,1.12,-.3,.29,.025,p.rubber,'z',true);steering.rotation.x=.3;
  for(const side of [-1,1]){
    hull('hood raised character crease',[{z:-2.12,halfWidth:.025,bottom:.94,top:.96},{z:-1.4,halfWidth:.045,bottom:1.04,top:1.055},{z:-1.06,halfWidth:.025,bottom:1.055,top:1.07}],p.dark).position.x=side*.48;
    box('hood vent recessed well',side*.57,1.056,-1.15,.3,.012,.4,p.dark);for(let n=0;n<5;n++)box('hood extractor louver',side*.57,1.07,-1.3+n*.065,.26,.02,.025,p.steel,true);
    box('amber side repeater',side*1.075,.82,-.91,.035,.045,.12,p.amber,true);
  }
  for(let n=0;n<13;n++)box('recessed radiator fins',-.72+n*.12,.58,-2.46,.042,.17,.05,p.dark,true);
  hull('front aero splitter',[{z:-2.58,halfWidth:.8,bottom:.35,top:.4},{z:-2.3,halfWidth:1.01,bottom:.35,top:.42}],p.dark);
  for(const z of [-2.51,2.43])box('number plate',0,.6,z,.45,.13,.024,p.ivory,true);
  for(let n=0;n<5;n++)box('rear diffuser vertical vane',-.68+n*.34,.4,2.37,.035,.16,.3,p.dark,true);
  const root=a.finish(50);root.metadata.lamps=[{position:[-.68,.79,-2.55],direction:[0,-.12,-1],color:'#b8e4ef',power:140,range:22,kind:'spot'},{position:[.68,.79,-2.55],direction:[0,-.12,-1],color:'#b8e4ef',power:140,range:22,kind:'spot'},{position:[0,.8,2.46],color:'#e54f45',power:9,range:5,kind:'point'}];return root;
}

export function createStreetMotorcycle(scene:Scene){
  const a=modelAssembly(scene,'parked street motorcycle'),p=vehiclePalette(scene),{box,beam,tube,cylinder,lathe,torus,hull}=a;
  for(const z of [-.97,1.02]){
    a.articulate('motorcycle rolling wheel',new Vector3(0,.46,z),'x',{kind:'wheel',radius:.447},()=>{
    lathe('crowned motorcycle tire',0,.46,z,[[.27,-.12],[.37,-.115],[.434,-.065],[.447,0],[.434,.065],[.37,.115],[.27,.12]],p.rubber,'x');
    for(const side of [-1,1]){torus('motorcycle rim lip',side*.125,.46,z,.59,.03,p.steel,'x');cylinder('drilled brake disc',side*.14,.46,z,.45,.018,p.steel,'x');for(let n=0;n<18;n++){const t=n*Math.PI*2/18;cylinder('brake rotor drilled recess',side*.154,.46+Math.cos(t)*.18,z+Math.sin(t)*.18,.018,.003,p.dark,'x',true);}}
    for(let n=0;n<10;n++){const t=n*Math.PI*2/10;beam('cast wheel spoke',new Vector3(.12,.46,z),new Vector3(.12,.46+Math.cos(t)*.28,z+Math.sin(t)*.28),.025,p.dark,true);}
    for(let n=0;n<36;n++){const t=n*Math.PI*2/36;const tread=box('motorcycle tread channel',0,.46+Math.cos(t)*.446,z+Math.sin(t)*.446,.18,.007,.018,p.dark,true);tread.rotation.x=-t;}
    });
    for(const side of [-1,1])box('brake caliper',side*.16,.54,z+.17,.09,.18,.1,p.copper,true);
  }
  for(const side of [-1,1]){
    tube('curved exposed trellis frame',[new Vector3(side*.2,.5,.9),new Vector3(side*.22,.61,.2),new Vector3(side*.23,1.03,-.25),new Vector3(side*.15,1.2,-.57)],.043,p.blue);
    beam('frame diagonal',new Vector3(side*.2,.55,.38),new Vector3(side*.22,1.03,-.25),.045,p.dark);
    beam('rear swingarm',new Vector3(side*.18,.61,.1),new Vector3(side*.17,.46,1.02),.07,p.dark);
    beam('inverted fork outer sleeve',new Vector3(side*.145,1.25,-.63),new Vector3(side*.145,.8,-.84),.078,p.copper);
    beam('fork polished stanchion',new Vector3(side*.145,.85,-.82),new Vector3(side*.145,.46,-.97),.048,p.steel);
    tube('exhaust header',[new Vector3(side*.12,.66,-.25),new Vector3(side*.26,.38,-.2),new Vector3(side*.29,.35,.45),new Vector3(side*.32,.53,.82)],.045,p.copper);
    lathe('tapered exhaust silencer',side*.31,.53,.8,[[.06,0],[.09,.05],[.09,.3],[.065,.38]],p.dark,'z');
    tube('brake hydraulic line',[new Vector3(side*.37,1.34,-.47),new Vector3(side*.2,1.14,-.67),new Vector3(side*.18,.57,-.8)],.009,p.rubber,true);
    beam('handlebar',new Vector3(0,1.24,-.61),new Vector3(side*.4,1.33,-.5),.025,p.steel);cylinder('textured grip',side*.4,1.33,-.5,.06,.18,p.rubber,'x',true);
    beam('mirror stalk',new Vector3(side*.32,1.33,-.5),new Vector3(side*.42,1.53,-.55),.018,p.dark,true);a.sphere('rear view mirror',side*.43,1.55,-.55,.18,.09,.04,p.steel,true);
  }
  hull('sculpted fuel tank',[{z:-.54,halfWidth:.17,bottom:1,top:1.14},{z:-.23,halfWidth:.28,bottom:.89,top:1.24},{z:.16,halfWidth:.22,bottom:.95,top:1.16}],p.blue);
  cylinder('flush fuel filler',0,1.235,-.18,.11,.018,p.steel,'y',true);
  hull('saddle profile',[{z:.13,halfWidth:.18,bottom:.95,top:1.05},{z:.45,halfWidth:.23,bottom:.96,top:1.08},{z:.89,halfWidth:.16,bottom:1.02,top:1.13}],p.seat);
  for(let n=0;n<8;n++)box('stitched seat rib',0,1.09,.25+n*.07,.35,.009,.013,p.dark,true);
  cylinder('engine crankcase',0,.65,.07,.37,.4,p.dark,'x');cylinder('engine inspection cover',-.22,.65,.07,.25,.045,p.steel,'x');
  for(let n=0;n<7;n++)box('cylinder head cooling fin',0,.72+n*.035,-.14,.4,.015,.34,p.steel,true);
  // Visible chain follows the sprockets and returns beneath the swingarm.
  torus('rear drive sprocket',-.18,.46,1.02,.4,.04,p.steel,'x',true);
  const chain:Vector3[]=[];for(let n=0;n<=24;n++){const t=n*Math.PI/24;chain.push(new Vector3(-.215,.46+Math.cos(t)*.2,1.02+Math.sin(t)*.2));}chain.push(new Vector3(-.215,.51,.08),new Vector3(-.215,.68,.08),new Vector3(-.215,.66,1.02));tube('drive chain loop',chain,.015,p.dark,true);
  for(let n=0;n<20;n++)box('chain link plates',-.23,.66,.15+n*.043,.015,.035,.024,p.steel,true);
  const spring:Vector3[]=[];for(let n=0;n<=180;n++){const t=n/180;spring.push(new Vector3(.045*Math.cos(t*Math.PI*22),.6+t*.34,.5+.045*Math.sin(t*Math.PI*22)));}tube('rear coil spring',spring,.011,p.copper,true);
  cylinder('headlamp bezel',0,1.13,-.75,.29,.16,p.dark,'z');cylinder('headlamp glass',0,1.13,-.844,.235,.015,p.white,'z');box('instrument pod',0,1.31,-.56,.22,.1,.18,p.dark);box('instrument LCD',0,1.37,-.57,.17,.015,.12,p.white,true);
  box('rear lamp',0,1.08,.94,.21,.05,.03,p.red);beam('side stand',new Vector3(-.17,.53,.26),new Vector3(-.36,.07,.4),.025,p.dark);
  const root=a.finish(38);root.metadata.lamps=[{position:[0,1.13,-.91],direction:[0,-.18,-1],color:'#e5e1bf',power:90,range:18,kind:'spot'},{position:[0,1.08,.99],color:'#dc4438',power:4,range:3,kind:'point'}];return root;
}
