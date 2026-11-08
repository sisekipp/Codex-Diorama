import { Vector3, Quaternion } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import { modelAssembly, vehiclePalette } from './modelAssembly';

/** Construction details repeat across the city, using a handful of consolidated material groups. */
export function refineEnvironment(scene:Scene,mega:boolean){
  const p=vehiclePalette(scene),a=modelAssembly(scene,mega?'Nox civic construction details':'Yoru civic construction details'),{box,cylinder,torus,beam,tube}=a;
  const fans:ReturnType<typeof a.articulate>[]=[],lamps:{position:number[];direction:number[];color:string;power:number;range:number;kind:string;angle:number}[]=[];
  const bolts=(x:number,y:number,z:number,width:number,height:number)=>{for(const dx of [-width/2,width/2])for(const dy of [-height/2,height/2])cylinder('panel recessed screw',x+dx,y+dy,z,.055,.025,p.steel,'z',true);};
  const fan=(x:number,y:number,z:number,size=1)=>{
    cylinder('HVAC ribbed fan casing',x,y,z,size*.95,size*.5,p.dark);cylinder('HVAC intake shadow',x,y+size*.27,z,size*.75,.035,p.rubber);torus('HVAC intake turned lip',x,y+size*.3,z,size*.82,size*.04,p.steel);
    fans.push(a.articulate('environment ventilation rotor',new Vector3(x,y+size*.3,z),'y',{kind:'fan',speed:2.4},()=>{cylinder('HVAC fan spindle',x,y+size*.33,z,size*.14,size*.08,p.steel);for(let n=0;n<6;n++){const angle=n*Math.PI/3;const blade=box('HVAC swept fan blade',x+Math.cos(angle)*size*.22,y+size*.31,z+Math.sin(angle)*size*.22,size*.37,.025,size*.1,p.steel,true);blade.rotation.y=-angle;}}));
    for(let n=0;n<5;n++)box('HVAC safety grille bar',x-size*.27+n*size*.135,y+size*.4,z,.02,.02,size*.6,p.dark,true);
  };
  // Signs have thickness, protective metal frames, brackets and service fixings.
  for(const sign of [...scene.meshes]){
    if(!sign.isVisible||!sign.material||!('emissiveTexture' in sign.material)||!sign.material.emissiveTexture)continue;
    const b=sign.getBoundingInfo().boundingBox,w=b.maximum.x-b.minimum.x,h=b.maximum.y-b.minimum.y,d=b.maximum.z-b.minimum.z;
    if(d>.015||w<1.1||h<.45)continue;
    const world=sign.computeWorldMatrix(true).clone(),place=(name:string,x:number,y:number,z:number,ww:number,hh:number,dd:number)=>{const v=Vector3.TransformCoordinates(new Vector3(x,y,z),world),part=box(name,v.x,v.y,v.z,ww,hh,dd,p.dark);part.rotationQuaternion=sign.absoluteRotationQuaternion.clone();return part;};
    place('sign boxed service housing',0,0,.15,w+.18,h+.18,.25);
    const reverse=sign.clone('reverse sign face',null,true);if(reverse){reverse.position.copyFrom(Vector3.TransformCoordinates(new Vector3(0,0,.29),world));reverse.rotationQuaternion=sign.absoluteRotationQuaternion.multiply(Quaternion.RotationAxis(Vector3.Up(),Math.PI));reverse.metadata=null;reverse.isPickable=false;}
    for(const yy of [-h/2-.04,h/2+.04])place('sign folded metal edge',0,yy,-.025,w+.25,.09,.12);
    for(const xx of [-w/2-.04,w/2+.04]){place('sign side folded return',xx,0,-.025,.09,h,.12);place('sign wall standoff',xx*.8,0,.4,.1,h*.55,.4);}
  }
  if(!mega){
    // Recessed wall panels and their brackets, with pipe flanges and roof plant on every street block.
    for(const tower of scene.meshes.filter(m=>m.isVisible&&m.name==='tower')){
      const {x,z}=tower.position,w=tower.scaling.x,d=tower.scaling.z,roof=tower.position.y+tower.scaling.y/2;
      for(let y=5.4;y<roof-2;y+=6.6)for(const side of [-1,1]){
        const xx=x+side*(w*.43),front=z-d/2-.24;box('facade removable rainscreen cassette',xx,y,front,.58,2.5,.11,p.dark);bolts(xx,y,front-.07,.42,2.27);
        box('rainscreen mounting bracket',xx,y-1.35,front,.74,.12,.36,p.steel,true);
      }
      const xx=x-Math.sign(x)*(w/2+.28);
      for(let y=4;y<roof-2;y+=5.5){const flange=cylinder('facade pipe bolted flange',xx,y,z,.36,.08,p.copper);for(let n=0;n<6;n++){const angle=n*Math.PI/3;cylinder('flange hex bolt',xx+Math.cos(angle)*.14,y+.06,z+Math.sin(angle)*.14,.04,.04,p.steel,'y',true);}flange.receiveShadows=true;}
      box('roof maintenance access hatch',x,roof+.07,z-2,1.5,.14,1.9,p.dark);for(const dx of [-.6,.6])box('roof access hatch hinge',x+dx,roof+.18,z-2.8,.16,.12,.2,p.steel,true);
      fan(x-1,roof+.45,z+.2,1.15);fan(x+1,roof+.45,z+.2,1.15);
      tube('roof plant insulated elbow',[new Vector3(x-2,roof+.25,z+1.5),new Vector3(x-2,roof+1.2,z+1.5),new Vector3(x-1.8,roof+1.4,z+1.5),new Vector3(x-.8,roof+1.4,z+1.5)],.13,p.rubber);
      for(const side of [-1,1])box('roof parapet folded cap',x,roof+.52,z+side*d/2,w+.28,.08,.4,p.steel);
    }
    // Replace flat vending displays with visible stock, a glass cover and physical controls.
    for(const m of scene.meshes)if(m.name==='vending display'||m.name==='vending cans')m.setEnabled(false);
    for(const machine of scene.meshes.filter(m=>m.isVisible&&m.name==='vending machine')){
      const {x,y,z}=machine.position;
      box('vending interior stock well',x,y+.12,z-.39,.83,1.56,.13,p.dark);
      for(let row=0;row<3;row++)for(let col=0;col<3;col++){
        const xx=x-.25+col*.25,yy=y-.35+row*.4;cylinder('vending stocked drink can',xx,yy,z-.49,.15,.27,row%2?p.ivory:p.copper);cylinder('vending can rolled rim',xx,yy+.14,z-.49,.15,.015,p.steel,'y',true);box('drink can label stripe',xx,yy,z-.57,.09,.1,.015,p.blue,true);
      }
      for(let row=0;row<3;row++)box('vending shelf lip',x,y-.5+row*.4,z-.54,.8,.035,.13,p.steel);
      a.patch('vending cover glass',[new Vector3(x-.43,y-.68,z-.6),new Vector3(x+.43,y-.68,z-.6),new Vector3(x+.43,y+.85,z-.6),new Vector3(x-.43,y+.85,z-.6)],p.glass);
      box('vending return slot',x,y-.91,z-.43,.73,.18,.07,p.rubber);box('vending collection flap',x,y-.9,z-.48,.63,.12,.035,p.steel);
      for(let n=0;n<5;n++)cylinder('vending push button',x+.49,y+.4-n*.16,z-.43,.06,.025,p.steel,'z',true);
      box('vending card reader',x+.49,y-.48,z-.43,.12,.19,.06,p.dark);box('vending payment slot',x+.49,y-.48,z-.47,.08,.025,.015,p.amber,true);
      lamps.push({position:[x,y+.3,z-.7],direction:[0,-.2,-1],color:'#80bba8',power:2,range:3,kind:'point',angle:2.5});
    }
    for(const bin of scene.meshes.filter(m=>m.isVisible&&(m.name==='bin'||m.name==='refuse bin body'))){
      const {x,z}=bin.position,y=bin.position.y+bin.scaling.y/2;
      for(const dx of [-.23,.23]){cylinder('refuse bin lid hinge',x+dx,y+.05,z+.35,.1,.15,p.steel,'x',true);box('refuse bin side handle',x+Math.sign(dx)*.39,y-.35,z,.06,.08,.23,p.dark,true);}
      for(const dx of [-.25,.25])cylinder('refuse bin rubber caster',x+dx,.16,z+.25,.23,.09,p.rubber,'x',true);
      box('refuse bin folded lid edge',x,y+.1,z-.34,.7,.1,.08,p.dark);
    }
    for(const cabinet of scene.meshes.filter(m=>m.isVisible&&m.name==='utility cabinet')){
      const {x,z}=cabinet.position;box('cabinet door gasket',x,1,z-.34,.94,1.82,.02,p.rubber);box('cabinet recessed door panel',x,1,z-.37,.85,1.72,.045,p.blue);
      for(const y of [.3,1.65])box('cabinet external hinge',x-.45,y,z-.42,.09,.21,.09,p.steel,true);cylinder('cabinet keyed latch',x+.29,1,z-.42,.09,.03,p.steel,'z',true);
      for(let n=0;n<6;n++)box('cabinet punched louver',x,1.3+n*.075,z-.42,.61,.027,.025,p.dark,true);
    }
    // Skybridge interior and bolted support assemblies remain visible through glazing.
    scene.meshes.filter(m=>m.name==='bridge glazing').forEach(m=>m.setEnabled(false));
    a.patch('bridge real glazing',[new Vector3(-8.4,10.2,12.18),new Vector3(8.4,10.2,12.18),new Vector3(8.4,12.8,12.18),new Vector3(-8.4,12.8,12.18)],p.glass);
    for(let x=-7;x<8;x+=2){box('bridge floor transverse joist',x,9.7,14,.17,.42,3.4,p.steel);for(const z of [12.7,15.3]){box('bridge column gusset',x,10.3,z,.45,.5,.09,p.dark);bolts(x,10.3,z-.07,.3,.35);}}
    for(let x=-6;x<8;x+=3){box('bridge inside bench',x,10.7,14.8,1.6,.16,.5,p.dark);box('bridge inside ceiling lamp',x,12.72,14,1.2,.04,.12,p.white);}
  }else{
    for(const x of [15,44.5])for(let z=-90;z<-40;z+=4){box('terminal paving expansion joint',x,83.54,z,x===15?6:9,.025,.035,p.rubber,true);for(const dx of [-2.5,2.5])cylinder('walkway plate fixing',x+dx,83.56,z+.15,.06,.035,p.steel,'y',true);}
    for(const z of [-85,-68,-51]){
      box('charger cabinet recessed service door',44.5,84.8,z-.55,.8,1.55,.055,p.blue);bolts(44.5,84.8,z-.6,.65,1.35);
      for(let n=0;n<5;n++)box('charger cabinet lower cooling louver',44.5,84.3+n*.09,z-.59,.6,.03,.04,p.dark,true);
      cylinder('charger emergency stop surround',44.8,85.9,z-.59,.14,.045,p.dark,'z');cylinder('charger red emergency stop',44.8,85.9,z-.64,.08,.04,p.red,'z');
      tube('charger service cable loop',[new Vector3(44.85,85.3,z-.5),new Vector3(45.2,84.8,z-.6),new Vector3(44.85,84.1,z-.6),new Vector3(44.1,84,z-.6),new Vector3(43.8,84.6,z-.6)],.045,p.rubber);
    }
    for(const bench of scene.meshes.filter(m=>m.name==='station platform bench')){
      const {x,y,z}=bench.position;box('platform bench contoured backrest',x,y+.46,z+.43,3.4,.65,.09,p.steel);
      for(const dx of [-1.5,0,1.5]){beam('platform bench back bracket',new Vector3(x+dx,y-.2,z+.2),new Vector3(x+dx,y+.7,z+.48),.055,p.dark);box('platform bench armrest',x+dx,y+.27,z,.065,.08,.7,p.dark);}
      for(let n=0;n<7;n++)box('platform bench drainage slot',x-1.35+n*.45,y+.12,z,.035,.02,.65,p.rubber,true);
    }
    for(const console of scene.meshes.filter(m=>m.name==='platform service console')){
      const {x,y,z}=console.position;for(let n=0;n<3;n++)cylinder('platform console tactile button',x-.2+n*.2,y-.35,z-.43,.065,.025,p.steel,'z',true);
      box('platform console card slot',x,y-.6,z-.43,.38,.045,.025,p.rubber);box('platform console speaker inset',x,y+.86,z-.42,.44,.16,.025,p.dark);
    }
    for(const side of [-1,1])for(let z=-8;z<36;z+=7){
      box('station platform edge access cover',side*20.6,88.86,z,1.3,.08,1.7,p.dark);for(const dx of [-.5,.5])for(const dz of [-.7,.7])cylinder('station access cover bolt',side*20.6+dx,88.93,z+dz,.07,.03,p.steel,'y',true);
      box('station canopy light fixture',side*18,102,z,2,.16,.4,p.dark);box('station canopy light diffuser',side*18,101.89,z,1.75,.035,.27,p.white);
      lamps.push({position:[side*18,101.85,z],direction:[0,-1,0],color:'#d8bd92',power:85,range:19,kind:'spot',angle:2.2});
    }
    for(const side of [-1,1]){
      const x=side*21.7;for(let z=-8;z<36;z+=4)box('station utility tray support',x,89.3,z,.6,.09,.14,p.steel,true);
      for(let n=0;n<3;n++)tube('station insulated conduit run',[new Vector3(x+n*.14,89.3,-10),new Vector3(x+n*.14,89.3,34),new Vector3(x+n*.14,90.8,37)],.045,p.rubber);
    }
    fan(45.5,86,-79,1.1);fan(48,86,-79,1.1);
  }
  const root=a.finish(mega?190:70);root.metadata.lamps=lamps;
  return {update(time:number,reduced:boolean){for(const f of fans)f.rotation.y=reduced?0:time*f.metadata.motion.speed;}};
}
