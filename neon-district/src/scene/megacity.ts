import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Light } from '@babylonjs/core/Lights/light';
import { SpotLight } from '@babylonjs/core/Lights/spotLight';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import type { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import type { Material } from '@babylonjs/core/Materials/material';
import type { Scene } from '@babylonjs/core/scene';
import type { Materials } from './materials';
import { createHarborKit } from './harborKit';
import { createHarborTraffic } from './harborTraffic';
import { dressHarbor } from './harborWear';
import { dressHarborDock } from './closeupInfrastructure';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';

/** NOX / PORT 09 — a layered city organized around a suspended transit harbor. */
export function buildMegacity(scene:Scene,m:Materials){
  const k=createHarborKit(scene),{mat,box,cylinder,beam,ring,chamfer,label}=k;
  let seed=9031;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const reflectors:AbstractMesh[]=[];
  const lightbox=(name:string,text:string,sub:string,x:number,y:number,z:number,w:number,h:number,color?:string)=>{const panel=label(name,text,sub,x,y,z,w,h,color);reflectors.push(panel);return panel;};
  const pipe=(name:string,a:Vector3,b:Vector3,diameter:number,material:Material=mat.steel)=>{
    const center=a.add(b).scale(.5),delta=b.subtract(a),mesh=cylinder(name,center.x,center.y,center.z,diameter,delta.length(),material,undefined,12);
    mesh.unfreezeWorldMatrix();mesh.rotation.x=Math.atan2(Math.hypot(delta.x,delta.z),delta.y);mesh.rotation.y=Math.atan2(delta.x,delta.z);mesh.freezeWorldMatrix();return mesh;
  };
  const railing=(x:number,y:number,z:number,length:number,axis:'x'|'z')=>{
    const along=(v:number)=>axis==='x'?new Vector3(x+v,y,z):new Vector3(x,y,z+v);
    for(let i=-length/2;i<=length/2;i+=2.3){const a=along(i);box('guardrail post',a.x,a.y+.65,a.z,.075,1.3,.075,mat.trim);}
    for(const h of [.5,1.25]){const a=along(-length/2),b=along(length/2);beam('guardrail horizontal',a.add(new Vector3(0,h,0)),b.add(new Vector3(0,h,0)),.065,mat.trim);}
  };
  // Actual window cavities: dark recess, glass, inset sill and shared strip lights.
  const frontWindows=(cx:number,z:number,width:number,start:number,end:number,spacing=4.1)=>{
    for(let y=start;y<end;y+=spacing)for(let x=cx-width/2+1.4;x<cx+width/2-1;x+=2.7){
      const lit=random();box('window deep reveal',x,y,z,1.9,2.4,.38,mat.dark);
      box('window glazing',x,y,z-.22,1.47,1.87,.055,lit>.8?mat.warm:lit>.6?mat.cold:mat.glass);
      box('window projecting sill',x,y-1.25,z-.22,2.05,.13,.65,mat.trim);
      box('window mullion',x,y,z-.27,.06,2,.06,mat.dark);
      if(lit>.9)for(let n=0;n<4;n++)box('window privacy louver',x,y-.55+n*.36,z-.35,1.5,.045,.09,mat.dark);
    }
  };
  const plant=(x:number,y:number,z:number,scale=1)=>{
    box('roof mechanical skid',x,y+.2,z,5*scale,.4*scale,3*scale,mat.steel);
    for(let n=0;n<3;n++){const xx=x+(n-1)*1.5*scale;cylinder('fan housing',xx,y+.65*scale,z,1.3*scale,.7*scale,mat.trim);cylinder('fan dark recess',xx,y+1.02*scale,z,.96*scale,.04,mat.dark);for(let b=0;b<4;b++){const fan=box('fan blade',xx,y+1.05*scale,z,.72*scale,.025,.12*scale,mat.steel);fan.unfreezeWorldMatrix();fan.rotation.y=b*Math.PI/4;fan.freezeWorldMatrix();}}
    pipe('rooftop vent',new Vector3(x+2*scale,y,z+1.3*scale),new Vector3(x+2*scale,y+3*scale,z+1.3*scale),.4*scale);
  };
  // Deep urban bowl. The foreground remains open; industrial blocks frame the old city below.
  const road=MeshBuilder.CreateGround('harbor lower boulevard',{width:22,height:260},scene);road.material=m.asphalt;road.position.z=20;
  for(let z=-105;z<140;z+=12){box('old city road marking',0,.03,z,.25,.03,4,m.gold);}
  for(const side of [-1,1])for(let i=0;i<5;i++){
    const x=side*(28+(i%2)*9),z=-34+i*37,h=17+random()*25;
    chamfer('lower industrial block',x,h/2,z,22,h,25,mat.concrete);box('industrial maintenance deck',x,h,z,24,.8,27,mat.steel);plant(x,h+.5,z,.75);
    frontWindows(x,z-12.7,18,4,h-3,4.5);
    for(let p=0;p<3;p++)pipe('industrial riser',new Vector3(x-side*11,1,z-5+p*2),new Vector3(x-side*11,h+2,z-5+p*2),.45,mat.trim);
    for(let q=0;q<5;q++)box('cargo stack',x-7+(q%3)*5,2.5+Math.floor(q/3)*4,z-15,4.4,4.4,8, q%2?mat.paint:mat.steel);
  }
  // East tower: a tapered cylindrical corporate structure with deep external ribs.
  const east=new Vector3(57,0,27);
  cylinder('east tower pedestal',east.x,21,east.z,42,42,mat.concrete,undefined,48);
  cylinder('east tower main shaft',east.x,137,east.z,34,198,mat.steel,undefined,48);
  cylinder('east tower upper setback',east.x,255,east.z,25,40,mat.paint,undefined,48);
  for(let y=45;y<270;y+=6){
    ring('east tower floor lip',east.x,y,east.z,y>235?25.6:35.4,.3,mat.dark);
    for(let n=0;n<18;n++){
      const a=n*Math.PI*2/18,r=y>235?12.6:17.1,x=east.x+Math.sin(a)*r,z=east.z+Math.cos(a)*r,lit=random();
      const window=box('east tower curved window',x,y+2.2,z,2.2,3.6,.12,lit>.8?mat.warm:lit>.62?mat.cold:mat.glass);window.unfreezeWorldMatrix();window.rotation.y=a;window.freezeWorldMatrix();
    }
  }
  for(let n=0;n<12;n++){const a=n*Math.PI*2/12;beam('east tower structural rib',new Vector3(east.x+Math.sin(a)*21,8,east.z+Math.cos(a)*21),new Vector3(east.x+Math.sin(a)*14,260,east.z+Math.cos(a)*14),.85,mat.concrete);}
  ring('east tower illuminated crown',east.x,277,east.z,27,.28,mat.cyan);cylinder('east tower roof',east.x,278,east.z,26,2,mat.dark);
  for(let n=0;n<7;n++){const a=n*Math.PI*2/7;box('east tower roof beacon',east.x+Math.cos(a)*11,280,east.z+Math.sin(a)*11,.25,.5,.25,mat.red);}
  beam('east tower antenna',new Vector3(east.x,278,east.z),new Vector3(east.x,305,east.z),.3,mat.trim);
  lightbox('east tower vertical identity','AERIS','UPPER CITY / 278',east.x,201,east.z-19,16,4.5,'#99dbd6');
  // West tower: an asymmetric, heavy inhabited monolith with exposed service cores.
  const westStart=scene.meshes.length;
  const wx=-51,wz=31;
  chamfer('west tower plinth',wx,28,wz,48,56,47,mat.concrete);
  chamfer('west inhabited spine',wx-3,119,wz+4,35,142,37,mat.steel);
  chamfer('west offset upper module',wx+1,207,wz+7,30,35,32,mat.paint);
  chamfer('west mechanical crown',wx-6,239,wz+9,23,28,26,mat.dark);
  for(const [x,z,width,start,end] of [[wx-3,wz-15,29,62,185],[wx+1,wz-9.2,23,194,221],[wx,wz-24,38,8,51]])frontWindows(x,z,width,start,end);
  for(let y=58;y<226;y+=14){box('west concrete floor blade',wx-3,y,wz+4,38,1.2,40,mat.concrete);box('west thin service lamp',wx-3,y+.7,wz-16.1,31,.08,.1,y%28===2?mat.amber:mat.dark);}
  for(const x of [wx-21,wx+18]){
    box('west exposed lift core',x,137,wz-9,5.5,218,9,mat.dark);
    for(let y=35;y<239;y+=8){box('lift core mechanical bracket',x,y,wz-13.7,6,.5,1.2,mat.trim);}
    for(let n=0;n<3;n++)pipe('west tower continuous pipe',new Vector3(x-1.5+n*1.45,14,wz-14.7),new Vector3(x-1.5+n*1.45,244,wz-14.7),.4+n*.1,mat.steel);
  }
  // Cantilevered residential terraces add a lived-in middle city.
  for(let level=0;level<5;level++){
    const y=54+level*18,x=wx+19+(level%2)*3,z=wz+2;
    chamfer('west hanging residential terrace',x,y,z,19,10,25,mat.concrete);
    frontWindows(x,z-12.7,15,y-2,y+3,6);
    box('residential balcony deck',x,y-5.4,z-3,21,.6,23,mat.steel);railing(x,y-5,z-14.3,20,'x');
    for(let k0=0;k0<4;k0++){box('balcony door canopy',x-7+k0*4.6,y+4.8,z-13.5,3.8,.18,2.2,mat.dark);box('balcony external cabinet',x-7+k0*4.6,y-3,z-13.6,1.2,1.4,.8,mat.paint);}
  }
  lightbox('west inhabited block identity','STACK 09','RESIDENTIAL / SERVICE CORE',wx-3,167,wz-16.5,21,5,'#ffc58a');
  for(let i=0;i<3;i++)plant(wx-8+i*7,254,wz+8,.9);
  const westRoot=new TransformNode('west inward leaning megablock',scene);westRoot.position.set(wx,0,wz);
  const westParts=scene.meshes.slice(westStart).filter(mesh=>mesh.isVisible);
  westParts.forEach(mesh=>{mesh.unfreezeWorldMatrix();mesh.setParent(westRoot);});westRoot.rotation.z=-.032;westRoot.computeWorldMatrix(true);westParts.forEach(mesh=>mesh.freezeWorldMatrix());
  // The suspended harbor deck: a destination, visually anchored to the two towers.
  chamfer('station main suspended deck',0,85,12,109,5,52,mat.concrete);
  chamfer('station lower service hull',0,80,12,94,5,40,mat.steel);
  for(const side of [-1,1]){
    beam('station diagonal tower support',new Vector3(side*44,49,31),new Vector3(side*20,82,2),2.4,mat.steel);
    beam('station structural cross brace',new Vector3(side*46,82,-7),new Vector3(side*15,78,28),1.1,mat.trim);
    box('station platform',side*17.5,88.2,12,10.5,1.2,48,mat.paint);
    box('station platform amber safety band',side*12.2,88.85,12,.2,.07,46,mat.amber);
    for(let z=-10;z<37;z+=3.5){box('platform tactile tile',side*13,88.85,z,.7,.04,1.5,mat.trim);}
    railing(side*23,88.8,12,46,'z');
  }
  // Twin tracks run through an open, cathedral-like curved roof.
  for(const side of [-1,1]){
    const x=side*8;
    box('skyrail track bed',x,87.3,15,5.4,2,300,mat.steel);
    for(const dx of [-1.7,1.7])box('skyrail polished rail',x+dx,88.45,15,.13,.19,300,mat.trim);
    for(let z=-130;z<164;z+=2.8)box('skyrail sleeper',x,88.2,z,4.5,.12,.2,mat.dark);
    for(let z=-125;z<160;z+=34){beam('railway external suspension',new Vector3(side*30,106,z),new Vector3(x,86,z),.5,mat.steel);}
  }
  const roofPath=(z:number,radius:number)=>Array.from({length:25},(_,i)=>{const a=Math.PI*i/24;return new Vector3(Math.cos(a)*radius,91+Math.sin(a)*22,z);});
  for(let z=-12;z<=37;z+=7){
    const rib=MeshBuilder.CreateTube('station arched roof rib',{path:roofPath(z,27),radius:.45,tessellation:8},scene);rib.material=mat.steel;rib.isPickable=false;
  }
  for(let step=1;step<12;step++){
    const a=step*Math.PI/12,x=Math.cos(a)*27,y=91+Math.sin(a)*22;
    box('station roof longitudinal purlin',x,y,12,.2,.3,52,mat.trim);
    if(step%3===0)box('station roof amber ribbon',x,y-.2,12,.1,.1,50,mat.amber);
  }
  // Side roof panels leave an open central skylight instead of an opaque box.
  for(const side of [-1,1])for(let n=0;n<5;n++){
    const a=(side<0?Math.PI-n*.15:n*.15),x=Math.cos(a)*27,y=91+Math.sin(a)*22;
    const panel=box('station weathered roof shingle',x,y,12,4.5,.25,51,mat.steel);panel.unfreezeWorldMatrix();panel.rotation.z=(side<0?Math.PI-a:-a);panel.freezeWorldMatrix();
  }
  lightbox('port central identity','NOX / PORT 09','SKYRAIL · AEROCABS · LOWER CITY',0,101,-14.1,34,6.7,'#ffd3a2');
  for(const side of [-1,1]){
    const x=side*18;
    lightbox('platform direction '+side,side<0?'01  NORTH':'02  SOUTH',side<0?'ORBITAL LOOP / 04:20':'LOWER RING / 01:35',x,95,-11.2,10,2.5,'#9ed8d0');
    for(let z=-4;z<35;z+=10){box('station platform bench',x,89.4,z,3.4,.2,.8,mat.trim);for(const dx of [-1.4,1.4])box('platform bench leg',x+dx,89,z,.14,.7,.5,mat.dark);box('platform service console',x+3,90,z+.5,.8,2.4,.8,mat.dark);box('console emissive screen',x+3,90.3,z+.08,.6,.85,.025,mat.cold);}
  }
  // Foreground aerocab terminal: painted bays, equipment and views into the harbor.
  chamfer('foreground aerocab terminal',31,81.5,-67,40,4,56,mat.paving);
  chamfer('terminal underside hull',31,78.5,-67,33,3,49,mat.steel);
  box('taxi terminal connector',28,84,-22,11,1,43,mat.paint);railing(22.5,84.6,-22,42,'z');railing(33.5,84.6,-22,42,'z');
  railing(50.5,83.8,-67,53,'z');railing(31,83.8,-94.5,38,'x');
  for(let bay=0;bay<3;bay++){
    const z=-85+bay*17;
    box('taxi bay floor panel',30,83.62,z,21,.1,12,mat.deck);
    for(const x of [19.7,40.3])box('bay yellow boundary',x,83.7,z,.16,.04,12,mat.amber);
    for(const dz of [-6,6])box('bay end line',30,83.72,z+dz,20,.04,.12,mat.trim);
    for(let n=0;n<6;n++)box('bay approach marker',16+n*.45,83.72,z, .22,.04,1.1,mat.warm);
    box('terminal charging pillar',44.5,85,z,1,2.5,1,mat.dark);box('charging terminal display',44.5,85.4,z-.52,.6,.8,.02,mat.cold);
    pipe('charging cable hanger',new Vector3(44.5,86.3,z),new Vector3(42.2,86.3,z),.1,mat.trim);
    lightbox('bay designation '+bay,'0'+(bay+1),bay===0?'DEPARTURES':'ARRIVALS',45.1,87.5,z-.6,2.2,1.4,'#ffc786');
  }
  for(let z=-90;z<-40;z+=6){box('terminal perimeter navigation lamp',11.3,84,z,.17,.12,.45,mat.cyan);}
  for(const z of [-88,-47]){
    pipe('terminal floodlight mast',new Vector3(48,84,z),new Vector3(48,94,z),.25,mat.steel);
    box('terminal floodlight bar',46.7,93.8,z,3,.3,.5,mat.trim);box('terminal floodlight diffuser',46.7,93.6,z,2.6,.06,.35,mat.warm);
  }
  lightbox('terminal main sign','AEROCABS','PORT 09 / BOARDING DECK',29,90,-39.5,20,4,'#ffd3a2');
  // A weather canopy, service cases, grates and conduits give the near deck readable scale.
  for(const x of [42,48])beam('terminal canopy column',new Vector3(x,84,-54),new Vector3(x,91,-54),.3,mat.steel);
  box('terminal canopy',45,91.2,-54,10,.4,15,mat.steel);
  for(let n=0;n<6;n++){
    const x=40+(n%3)*2.1,z=-45-Math.floor(n/3)*2.6;
    chamfer('foreground freight container',x,85,z,1.8,2.2,2.2,n%2?mat.paint:mat.dark);
    box('freight container latch',x,85,z-1.13,.5,.16,.07,mat.trim);
  }
  for(let z=-91;z<-40;z+=4){box('terminal drainage gutter',47.3,83.8,z,.65,.07,2.5,mat.dark);for(let n=0;n<6;n++)box('drain grate slat',47.3,83.85,z-1+n*.35,.6,.035,.065,mat.trim);}
  plant(47,84.2,-79,.65);
  // Distant skyline varies in silhouette: rounded corporate towers and rough stacked housing.
  for(let i=0;i<22;i++){
    const side=i%2?1:-1,x=side*(95+random()*90),z=50+random()*170,h=80+random()*190,w=18+random()*15;
    if(i%3===0){cylinder('distant cylindrical tower',x,h/2,z,w,h,mat.paint,undefined,16);ring('distant tower crown',x,h,z,w+.4,.15,mat.cold);}
    else{chamfer('distant stepped block',x,h*.35,z,w,h*.7,w*1.2,mat.concrete);chamfer('distant upper block',x+3,h*.85,z,w*.7,h*.3,w,mat.steel);}
    for(let y=12;y<h;y+=11)for(let n=0;n<5;n++)if(random()>.42)box('distant lit office',x-w*.35+n*w*.16,y,z-w*.61,.55,2,.07,random()>.7?mat.warm:mat.cold);
  }
  // Warm terminal illumination with local shadows anchors the objects to the deck.
  const spot=new SpotLight('harbor terminal floodlight',new Vector3(39,118,-57),new Vector3(-.18,-1,.12),1.5,1.3,scene);spot.diffuse=new Color3(1,.77,.49);spot.falloffType=Light.FALLOFF_PHYSICAL;spot.intensity=170;spot.range=100;spot.renderPriority=1;
  const shadows=new ShadowGenerator(768,spot);shadows.usePoissonSampling=true;shadows.bias=.001;shadows.normalBias=.12;shadows.setDarkness(.35);
  for(const mesh of scene.meshes){if(/foreground|terminal|freight|taxi|station arched|station weathered/.test(mesh.name)){shadows.addShadowCaster(mesh,false);}if(/terminal|platform|station main|taxi bay/.test(mesh.name)){const receiver=(mesh as InstancedMesh).sourceMesh??mesh;receiver.receiveShadows=true;}}
  const traffic=createHarborTraffic(scene,k);
  const wear=dressHarbor(scene,k);
  dressHarborDock(scene);
  // Keep the terminal's physical floodlight off the emissive/legacy materials.
  spot.includedOnlyMeshes=scene.meshes.filter(mesh=>mesh.material?.getClassName()==='PBRMaterial');
  for(const mesh of scene.meshes){if(mesh.parent?.name==='docked foreground taxi'||mesh.parent?.name==='taxi terminal arrival shuttle'||mesh.parent?.name==='terminal connected docking machinery')shadows.addShadowCaster(mesh,false);}
  return{road,reflectors,counts:traffic.counts,update(time:number,reduced:boolean){traffic.update(time,reduced);wear.update(time,reduced);},setWetness(value:number){wear.setWetness(value);const wet=Math.max(0,Math.min(1,value/100));mat.deck.roughness=.8-wet*.4;mat.paving.roughness=.95-wet*.22;mat.paint.roughness=.85-wet*.57;mat.steel.roughness=.75-wet*.45;mat.concrete.roughness=.95-wet*.25;mat.paint.environmentIntensity=.5+wet*.4;},setQuality(low:boolean){traffic.setLow(low);const map=shadows.getShadowMap();if(map)map.refreshRate=low?2:1;}};
}
