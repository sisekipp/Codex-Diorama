import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import type { Scene } from '@babylonjs/core/scene';
import { modelAssembly, vehiclePalette } from './modelAssembly';

function stencil(scene:Scene,text:string,sub:string){const t=new DynamicTexture(text,{width:1024,height:256},scene,false),c=t.getContext() as CanvasRenderingContext2D;c.fillStyle='#14232a';c.fillRect(0,0,1024,256);c.fillStyle='#c5d4c0';c.font='bold 83px monospace';c.fillText(text,35,110);c.font='27px monospace';c.fillStyle='#90b5b1';c.fillText(sub,38,190);t.update();const m=new StandardMaterial(text,scene);m.diffuseTexture=t;m.emissiveTexture=t;m.emissiveColor=new Color3(.38,.45,.43);return m;}

export function dressStreetWorkshop(scene:Scene){
  const p=vehiclePalette(scene),a=modelAssembly(scene,'KISEKI open workshop'),{box,beam,cylinder,torus,tube}=a;
  // Lift the selected building shell off its ground-floor opening; no facade plane hides the room.
  for(const mesh of scene.meshes){if(Math.abs(mesh.position.x-12)<.05&&Math.abs(mesh.position.z+15)<.05){if(mesh.name==='tower'){mesh.unfreezeWorldMatrix();mesh.scaling.y-=3.6;mesh.position.y+=1.8;mesh.freezeWorldMatrix();}if(mesh.name==='plinth')mesh.setEnabled(false);}}
  for(const mesh of scene.meshes){
    if(mesh.name==='front column'&&Math.abs(mesh.position.z+20.11)<.05&&mesh.position.x>7&&mesh.position.x<17){mesh.unfreezeWorldMatrix();mesh.scaling.y-=3.6;mesh.position.y+=1.8;mesh.freezeWorldMatrix();}
    if(/^(ground access ladder|ladder rung)$/.test(mesh.name)&&Math.abs(mesh.position.z+21)<.05){mesh.unfreezeWorldMatrix();mesh.position.x+=3.3;mesh.freezeWorldMatrix();}
  }
  for(const mesh of scene.meshes){if(/^(repair bay back|roller shutter slat|shutter bottom bar|parts shelf|spare part case|spare part label|diagnostic stand|diagnostic screen)$/.test(mesh.name))mesh.setEnabled(false);}
  box('garage inset floor',11.9,.2,-18.9,7.2,.2,5,p.dark);box('garage inset back wall',11.9,1.8,-16.5,7.2,3.2,.15,p.dark);
  for(const x of [8.4,15.4]){box('garage masonry pier',x,1.8,-19,.45,3.6,4.7,p.dark);box('garage door guide channel',x,1.8,-21.45,.13,3.5,.16,p.steel);}
  box('garage lintel',11.9,3.35,-20.8,7.5,.45,1.3,p.dark);
  for(let n=0;n<7;n++)cylinder('rolled shutter lamella',11.9,3.35+n*.04,-21.45,.18,6.8,p.steel,'x',true);
  for(const x of [9.2,14.5]){
    box('vehicle lift column',x,1.55,-18.6,.32,2.7,.45,p.blue);box('lift base foot',x,.35,-18.6,.7,.14,.9,p.steel);
    cylinder('lift hydraulic ram',x,1.3,-18.85,.1,1.7,p.steel);beam('lift articulated support arm',new Vector3(x,.6,-18.65),new Vector3(11.6+(x<10?-.6:.6),.6,-19.4),.13,p.dark);
    for(const dz of [-.3,.3])cylinder('lift base anchor',x,.45,-18.6+dz,.07,.07,p.copper,'y',true);
  }
  box('workbench top',12.5,1.05,-17.2,4.3,.12,.9,p.steel);for(const x of [10.6,14.4])box('workbench drawer bank',x,.7,-17.2,.8,.65,.78,p.blue);
  for(const x of [10.6,14.4])for(let n=0;n<4;n++){box('workbench drawer',x,.47+n*.14,-17.62,.71,.115,.04,p.dark,true);box('drawer pull',x,.49+n*.14,-17.66,.4,.025,.06,p.steel,true);}
  box('tool pegboard',12.4,2.0,-16.75,4.8,1.3,.08,p.steel);
  for(let n=0;n<10;n++){const x=10.5+n*.4;cylinder('tool ring spanner',x,2.25,-16.83,.1,.025,p.dark,'z',true);box('tool spanner shaft',x,2.05,-16.86,.032,.31,.025,p.dark,true);}
  for(let n=0;n<6;n++){cylinder('bench socket set',11.2+n*.22,1.18,-17.3,.11,.16,p.steel,'y',true);}
  box('lift diagnostic console',9.1,1.7,-19.1,.45,.32,.19,p.dark);box('lift diagnostic LCD',9.1,1.7,-19.21,.36,.22,.025,p.white,true);
  for(const z of [-20,-18]){cylinder('workshop compressed gas bottle',14.7,.98,z,.32,1.3,p.copper);torus('bottle protective collar',14.7,1.7,z,.25,.05,p.dark);cylinder('gas regulator',14.7,1.64,z-.2,.16,.07,p.steel,'z',true);}
  tube('workshop coiled pneumatic hose',Array.from({length:130},(_,n)=>{const t=n/129;return new Vector3(14+.18*Math.cos(t*30),.5+.18*Math.sin(t*30),-18.3+t*2);}),.02,p.rubber,true);
  for(let n=0;n<3;n++)torus('spare workshop tire',9.2,.52+n*.26,-17.4,.65,.2,p.rubber);
  box('recessed workshop strip light',11.8,3.12,-18.3,3,.04,.15,p.white);
  box('garage workbay stencil',12.3,2.8,-16.62,3.3,.7,.02,stencil(scene,'KISEKI / 07','DRIVE SYSTEMS · SERVICE'));
  const root=a.finish(48);const light=new PointLight('workshop practical light',new Vector3(11.8,2.8,-19),scene);light.diffuse=new Color3(.6,.86,.8);light.intensity=2;light.range=8;light.includedOnlyMeshes=root.getChildMeshes();
  // Segment construction reads as actual kerbs, with individual grate slots and drain frames.
  const street=modelAssembly(scene,'foreground pavement fittings');
  for(const side of [-1,1])for(let n=0;n<12;n++){
    const z=-24+n*1.4;street.box('beveled kerb block',side*7.06,.22,z,.28,.21,1.32,p.steel);
    if(n%3===0){street.box('storm drain recessed frame',side*6.7,.07,z,.43,.1,.9,p.dark);for(let k=0;k<8;k++)street.box('storm drain cast slot',side*6.7,.13,z-.35+k*.1,.33,.015,.035,p.steel,true);}
  }
  street.finish(45);
}

export function dressHarborDock(scene:Scene){
  const p=vehiclePalette(scene),a=modelAssembly(scene,'terminal connected docking machinery'),{box,beam,cylinder,torus,tube}=a;
  // Service arm and its cable physically terminate at the parked taxi's right rear turbine.
  box('dock machinery pedestal',38.5,84.5,-70,1.4,1.4,1.5,p.dark);
  cylinder('dock arm yaw bearing',38.5,85.25,-70,.9,.22,p.steel);
  beam('dock articulated outer arm',new Vector3(38.5,85.4,-70),new Vector3(35.5,86,-70.2),.22,p.blue);
  cylinder('dock arm hinge pin',35.5,86,-70.2,.4,.5,p.steel,'z');
  beam('dock articulated inner arm',new Vector3(35.5,86,-70.2),new Vector3(32.4,85.6,-70.7),.18,p.blue);
  beam('dock arm hydraulic cylinder',new Vector3(38,85.6,-70.4),new Vector3(35.7,86.25,-70.4),.11,p.steel);
  tube('connected charging umbilical',[new Vector3(38.5,85,-69.8),new Vector3(36.4,86.3,-69.9),new Vector3(33.8,85.9,-70.3),new Vector3(32.4,85.6,-70.7),new Vector3(30.26,84.8,-71.46)],.085,p.rubber);
  cylinder('charging plug coupling',30.26,84.8,-71.46,.23,.28,p.copper,'x');
  for(let n=0;n<4;n++)torus('charging umbilical strain relief',32.3,85.3-n*.12,-70.7,.23,.035,p.dark,'y',true);
  box('dock telemetry display housing',38.5,85.45,-70.78,.75,.54,.12,p.dark);box('dock telemetry readout',38.5,85.45,-70.86,.63,.4,.025,stencil(scene,'CHARGING','PORT 09 / 83%'));
  for(const x of [37.95,39.05])for(const z of [-70.55,-69.45])cylinder('dock base anchor bolt',x,83.96,z,.12,.13,p.copper,'y',true);
  for(const z of [-73.5,-70.5]){box('landing skid chock',30.2,83.93,z,.7,.26,.4,p.copper);}
  for(let n=0;n<4;n++){const z=-76+n*2.7;box('deck expansion joint gasket',29,83.87,z,17,.025,.04,p.rubber,true);}
  const root=a.finish(165);
  // One readable station section: steel I-beams, gussets and mechanically attached rails.
  const rail=modelAssembly(scene,'station engineered foreground span');
  for(const side of [-1,1]){
    for(const x of [side*5.5,side*10.5]){
      rail.box('bridge I beam web',x,85.6,-35,.17,2.4,50,p.dark);for(const y of [84.45,86.75])rail.box('bridge I beam flange',x,y,-35,.85,.16,50,p.steel);
      for(let z=-58;z<-10;z+=5){rail.box('bridge transverse stiffener',x,85.6,z,.66,2.1,.11,p.steel,true);for(const yy of [85,86.3])rail.cylinder('bridge structural rivet',x+.36,yy,z,.1,.05,p.copper,'x',true);}
    }
    for(let z=-65;z<34;z+=3){for(const dx of [-1.7,1.7]){const x=side*8+dx;rail.box('rail fastening base plate',x,88.3,z,.44,.08,.5,p.steel);for(const xx of [-.16,.16]){rail.cylinder('rail clip bolt',x+xx,88.39,z,.065,.08,p.copper,'y',true);}}}
    for(let z=-10;z<38;z+=7){rail.patch('arched rib connection gusset',[new Vector3(side*26.4,91,z-.6),new Vector3(side*26.4,93.8,z),new Vector3(side*26.4,91,z+.6)],p.steel);for(let y=91.3;y<93;y+=.4)rail.cylinder('roof rib connection bolt',side*26.45,y,z,.12,.09,p.copper,'x',true);}
  }
  rail.finish(180);return root;
}
