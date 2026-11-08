import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import type { HarborKit } from './harborKit';

/** Wear follows drainage, exhausts, repairs and working areas rather than a global dirt tint. */
export function dressHarbor(scene:Scene,k:HarborKit){
  const {box,beam,cylinder,ring,chamfer,sphere,mat,label}=k;
  let seed=46319;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const solid=(name:string,color:string)=>{const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(color);m.specularColor=Color3.Black();return m;};
  const rust=solid('exposed rust and welds','#694134'),rubber=solid('oil stained rubber','#11191b'),paper=solid('sodden paper','#8d907b'),orange=solid('faded safety orange','#b76a36');
  const surface=(name:string,draw:(ctx:CanvasRenderingContext2D)=>void)=>{
    const t=new DynamicTexture(name,512,scene,false),ctx=t.getContext() as CanvasRenderingContext2D;ctx.clearRect(0,0,512,512);draw(ctx);t.hasAlpha=true;t.update();
    const m=new StandardMaterial(name+' overlay',scene);m.diffuseTexture=t;m.useAlphaFromDiffuseTexture=true;m.specularColor=Color3.Black();m.backFaceCulling=false;m.zOffset=-1;return m;
  };
  const stains=surface('irregular oil and tracked grime',ctx=>{
    for(let n=0;n<65;n++){const x=256+(random()-.5)*400,y=256+(random()-.5)*350;ctx.save();ctx.translate(x,y);ctx.rotate(random()*3);ctx.scale(8+random()*70,3+random()*26);const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'rgba(5,13,14,.12)');g.addColorStop(.45,'rgba(5,13,14,.055)');g.addColorStop(1,'rgba(5,13,14,0)');ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();}
    for(let n=0;n<35;n++){ctx.strokeStyle='rgba(9,16,17,.1)';ctx.lineWidth=.5+random()*.8;const x=random()*512,y=random()*512;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+random()*25,y+12+random()*60);ctx.stroke();}
  });
  const runoff=surface('rust bleeding below fittings',ctx=>{
    for(let n=0;n<85;n++){const x=60+random()*390,y=random()*80,len=80+random()*420;const gradient=ctx.createLinearGradient(0,y,0,y+len);gradient.addColorStop(0,'rgba(103,51,25,.7)');gradient.addColorStop(.35,'rgba(65,41,28,.35)');gradient.addColorStop(1,'rgba(45,35,26,0)');ctx.fillStyle=gradient;ctx.fillRect(x,y,1+random()*13,len);}
  });
  const soot=surface('vent exhaust feathered soot',ctx=>{const g=ctx.createRadialGradient(256,380,12,256,270,225);g.addColorStop(0,'rgba(4,10,12,.75)');g.addColorStop(.45,'rgba(5,11,13,.4)');g.addColorStop(1,'rgba(4,10,12,0)');ctx.fillStyle=g;ctx.fillRect(0,0,512,512);});
  const scratches=surface('chipped markings and concrete fissures',ctx=>{for(let n=0;n<14;n++){ctx.strokeStyle=n%3?'rgba(22,31,31,.12)':'rgba(133,139,120,.2)';ctx.lineWidth=.25+random()*.3;const x=random()*512,y=random()*512;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+4,y+20);ctx.lineTo(x-6,y+33);ctx.lineTo(x+random()*12,y+70);ctx.stroke();}});
  const decal=(name:string,x:number,y:number,z:number,w:number,h:number,material:StandardMaterial,floor=false)=>{const p=MeshBuilder.CreatePlane(name,{width:w,height:h,sideOrientation:Mesh.DOUBLESIDE},scene);p.position.set(x,y,z);p.material=material;p.isPickable=false;if(floor)p.rotation.x=Math.PI/2;p.freezeWorldMatrix();return p;};
  const puddle=new PBRMaterial('contaminated terminal puddles',scene);puddle.albedoColor=Color3.FromHexString('#152c2c');puddle.metallic=.35;puddle.roughness=.12;puddle.alpha=.68;puddle.environmentIntensity=.9;
  // Footprints, wheel scuffs and pooled runoff concentrate around chargers and drains.
  for(let bay=0;bay<3;bay++){
    const z=-85+bay*17;
    decal('landing pad tire scuffs',30,83.79,z,20,11,stains,true);decal('worn bay paint',30,83.8,z,21,12,scratches,true);
    decal('charger coolant leak',42.2,83.78,z,5.5,7,stains,true);
    decal('rust below charging cabinet',44.5,84.4,z-.53,.9,1.1,runoff);
    for(let i=0;i<7;i++)box('broken painted boundary',19.7,83.75,z-5+random()*10,.2,.035,.15+random()*.4,mat.concrete);
    const p=MeshBuilder.CreateDisc('dirty puddle around drain',{radius:1,tessellation:29},scene);p.position.set(46.6,83.9,z+2);p.rotation.x=Math.PI/2;p.scaling.set(1.2,2.5,1);p.material=puddle;p.isPickable=false;
  }
  decal('terminal long cracked expansion seam',33,83.8,-66,32,48,scratches,true);
  // Closed bay: physical barricades, hazard stripes and abandoned equipment.
  label('closed landing bay warning','03 / CLOSED','COOLANT LEAK · SERVICE ONLY',30,85.7,-45.9,8,2.1,'#e88b55');
  for(const x of [22,29,36]){
    for(const dx of [-.8,.8]){box('barricade foot',x+dx,84,-47.5,.7,.15,1.5,rubber);beam('barricade upright',new Vector3(x+dx,84,-47.5),new Vector3(x+dx,85.6,-47.5),.13,rust);}
    box('barricade weathered plank',x,85.1,-47.5,3,.65,.17,orange);
    for(let n=0;n<5;n++){const s=box('barricade black diagonal',x-1.2+n*.55,85.1,-47.61,.25,.7,.025,rubber);s.unfreezeWorldMatrix();s.rotation.z=-.4;s.freezeWorldMatrix();}
  }
  // Repair station: trolley, opened turbine, detached cowling, hose reels, tools.
  box('maintenance work trolley',34,84.6,-53,4,.2,2.1,mat.steel);
  for(const x of [32.5,35.5])for(const z of [-53.7,-52.3]){cylinder('trolley caster',x,84.05,z,.38,.2,rubber);beam('trolley leg',new Vector3(x,84,z),new Vector3(x,84.6,z),.12,mat.trim);}
  cylinder('removed lift turbine outer shell',34,85.15,-53,1.65,.85,mat.steel);cylinder('removed lift turbine black cavity',34,85.6,-53,1.27,.06,rubber);
  ring('removed turbine copper coil',34,85.65,-53,1.05,.14,rust);
  for(let n=0;n<9;n++){const a=n*Math.PI*2/9;beam('exposed turbine stator',new Vector3(34,85.68,-53),new Vector3(34+Math.cos(a)*.52,85.68,-53+Math.sin(a)*.52),.065,mat.trim);}
  chamfer('detached engine cowling',31.3,84.1,-55,1.5,.35,2.3,mat.taxi);
  for(let n=0;n<7;n++){box('scattered maintenance tools',32.4+random()*3,84.74,-53.8+random()*1.5,.08,.055,.3+random()*.3,n%2?mat.trim:orange);}
  for(let n=0;n<5;n++)ring('coiled service hose',38,84+n*.08,-54,1.6+n*.08,.07,rubber);
  const hose=MeshBuilder.CreateTube('trailing coolant hose',{path:[new Vector3(38,84,-54),new Vector3(37,83.9,-56),new Vector3(34,83.9,-57),new Vector3(32,83.9,-55)],radius:.065,tessellation:6},scene);hose.material=rubber;
  box('maintenance parts cabinet',42,85.2,-58,2.1,2.6,1.1,orange);
  for(let n=0;n<5;n++){box('parts cabinet drawer seam',42,84.4+n*.42,-58.57,1.9,.035,.03,rubber);box('parts cabinet handle',42,84.55+n*.42,-58.65,.65,.06,.09,mat.trim);}
  label('service workshop stencil','REPAIR / 09','SALVAGE · DO NOT DISCARD',43.5,88.2,-59,6,1.5,'#b5c6b9');
  // Overflowing refuse lives at the service edge, with scraps caught in drain grates.
  for(const z of [-62,-65]){chamfer('overflowing waste hopper',48,84.8,z,1.65,1.8,2.1,mat.dark);box('hopper open rim',48,85.75,z,1.8,.12,2.2,rust);for(let n=0;n<7;n++)sphere('crumpled rubbish bag',47.5+random(),85.6+random()*.6,z+(random()-.5)*1.6,.5,.45,.6,rubber);}
  for(let n=0;n<85;n++){
    const x=41+random()*8,z=-90+random()*47;const scrap=box('sodden discarded paper',x,83.92+random()*.025,z,.12+random()*.45,.025,.15+random()*.5,n%4?paper:rust);scrap.unfreezeWorldMatrix();scrap.rotation.y=random()*6.28;scrap.rotation.z=random()*.1;scrap.freezeWorldMatrix();
  }
  for(let n=0;n<16;n++){const z=-89+n*3;decal('gutter sediment',47.3,83.92,z,1.4,2,stains,true);}
  // Deck edges have spalled corners, bolted patches and salt run-off.
  for(let n=0;n<18;n++){
    const z=-91+n*2.7;box('terminal chipped concrete lip',11.1,83.45,z,.35,.12+random()*.35,.4+random()*.7,mat.dark);
    const drip=decal('rust dripping from terminal edge bolt',11.05,81.3,z,.65,2.4,runoff);drip.unfreezeWorldMatrix();drip.rotation.y=Math.PI/2;drip.freezeWorldMatrix();
  }
  for(const z of [-90,-76,-60]){
    box('terminal welded repair plate',25,83.87,z,3.4,.07,2.5,mat.steel);
    for(const dx of [-1.5,1.5])for(const dz of [-1,1])cylinder('repair plate corroded bolt',25+dx,83.94,z+dz,.1,.07,rust,undefined,8);
    decal('repair plate rust bleeding',25,83.96,z,3.4,2.5,runoff,true);
  }
  // Station wall repair patches, service doors, rusted joints and exhaust grime.
  for(const side of [-1,1]){
    for(let n=0;n<7;n++){
      const x=side*(5+n*6.5);decal('station water streaks below deck joints',x,83,-14.06,3.5,4.5,runoff);
      box('station replaced cladding patch',x,81.3,-14.13,2.4,1.35,.13,n%2?mat.paint:rust);
      for(const dx of [-1,1])box('station patch weld fastener',x+dx,81.8,-14.22,.1,.1,.08,mat.trim);
    }
    const x=side*22;
    box('station utility access door',x,91,-10,1.8,4,.18,mat.dark);box('station door handle',x+.6,90.8,-10.15,.08,.4,.12,mat.trim);
    for(let n=0;n<4;n++)beam('temporary cable bridge',new Vector3(x+n*.15,89,-9),new Vector3(x+n*.15,89,32),.08,rubber);
    decal('platform tracked dirt',side*17.5,88.92,10,8,43,stains,true);
  }
  // West facade: fitted after the lean, using the same parent/local coordinates.
  const west=scene.getTransformNodeByName('west inward leaning megablock');
  const facadeStart=scene.meshes.length;
  for(let level=0;level<9;level++){
    const y=65+level*14,x=-61+(level%3)*8,z=15.3;
    box('facade patched utility panel',x,y,z,4.2,3.2,.35,level%3?mat.paint:rust);
    box('wall mounted HVAC cabinet',x,y+2.1,z-1,3,1.4,1.7,mat.trim);
    for(let n=0;n<6;n++)box('HVAC ventilation louver',x,y+1.65+n*.16,z-1.88,2.7,.045,.09,mat.dark);
    decal('soot above extraction vent',x,y+4,z-1.9,4.5,5,soot);decal('rust underneath facade repair',x,y-3,z-.2,4,5,runoff);
    beam('exposed facade cable conduit',new Vector3(x+2.5,y-4,z-.4),new Vector3(x+2.5,y+7,z-.4),.16,rubber);
  }
  if(west){for(const mesh of scene.meshes.slice(facadeStart).filter(m=>m.isVisible)){mesh.unfreezeWorldMatrix();mesh.position.subtractInPlace(new Vector3(-51,0,31));mesh.parent=west;mesh.freezeWorldMatrix();}}
  for(let y=54;y<230;y+=30){
    const x=57,z=9.8;
    box('corporate tower service hatch',x,y,z,3.6,2.7,.18,mat.dark);
    for(let n=0;n<5;n++)box('corporate ventilation slot',x,y-.8+n*.4,z-.15,2.9,.13,.08,mat.trim);
    decal('corporate extraction soot',x,y+2.5,z-.21,4.5,4,soot);
    decal('corporate ring runoff',x,y-2.6,z-.22,3.6,2.5,runoff);
  }
  // Visible layered notices and obsolete advertisements; no people are introduced.
  for(let n=0;n<6;n++){const p=label('peeling service notice '+n,n%2?'PAY YOUR DOCK FEE':'LOWER RING',n%2?'OVERDUE / PORT AUTHORITY':'24H FREIGHT · LEVEL 09',39+n*.65,85.3+n*.08,-40.08-n*.025,2.2,1.8,n%2?'#a78962':'#6c9e98');p.rotation.z=(n-3)*.045;}
  // One failing lightbox and a single navigation lamp; shared materials stay untouched.
  const sign=scene.getMeshByName('terminal main sign');const signMaterial=sign?.material as StandardMaterial|undefined;
  const lampMaterial=mat.amber.clone('intermittent service beacon');box('intermittent service beacon',37.8,85.9,-47.5,.2,.3,.2,lampMaterial);
  const failed=surface('failed lettering segment',ctx=>{ctx.fillStyle='rgba(4,12,17,.92)';ctx.fillRect(395,45,25,265);ctx.fillRect(466,120,90,30);});decal('dead lightbox letter segments',29,90,-39.53,20,4,failed);
  return {setWetness(value:number){puddle.alpha=value/100*.68;puddle.roughness=.32-value/100*.22;},update(time:number,reduced:boolean){const intensity=reduced?1:Math.sin(time*2.1)>.97?.35:1;if(signMaterial)signMaterial.emissiveColor.setAll(1.05*intensity);lampMaterial.emissiveColor=mat.amber.emissiveColor.scale(reduced?.45:Math.sin(time*2.8)>.35?.7:.08);}};
}
