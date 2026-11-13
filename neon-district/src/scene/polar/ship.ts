import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { shipFittings } from './transportDetails';
import { modelAssembly } from '../modelAssembly';
import { v,railing,lamp,icicles } from './kit';
import type { PolarMaterials } from './materials';
export function createIcebreaker(scene:Scene,m:PolarMaterials){
  const a=modelAssembly(scene,'BOREAL icebreaker RV BOREALIS'),root=a.root;
  // Ten-sided ice-strengthened transverse sections, fine bow and broad working stern.
  const stations=[[-37,.25],[-34,2.4],[-29,5.5],[-21,7.5],[-8,8],[12,8],[26,7.6],[31,6.2],[32,5.5]];
  const sections:number[][]=[];for(let j=0;j<stations.length-1;j++)for(let k=0;k<8;k++){const t=k/8,a=stations[Math.max(0,j-1)],b=stations[j],c=stations[j+1],d=stations[Math.min(stations.length-1,j+2)];sections.push(b.map((_,n)=>.5*(2*b[n]+(-a[n]+c[n])*t+(2*a[n]-5*b[n]+4*c[n]-d[n])*t*t+(-a[n]+3*b[n]-3*c[n]+d[n])*t*t*t)));}sections.push(stations.at(-1)!);const positions:number[]=[],indices:number[]=[],uvs:number[]=[];
  const ring=(z:number,w:number)=>{const sheer=.65*Math.exp(-1*((z+34)/12)**2);return Array.from({length:25},(_,i)=>{const angle=-Math.PI/2+i/24*Math.PI,x=w*Math.sin(angle),y=-2.9+6.4*(1-Math.cos(angle)**2.6)+sheer;return [x,y,z];});};
  for(let j=0;j<sections.length-1;j++){const p=ring(sections[j][0],sections[j][1]),q=ring(sections[j+1][0],sections[j+1][1]);for(let k=0;k<24;k++){const b=positions.length/3;positions.push(...p[k],...p[k+1],...q[k+1],...q[k]);uvs.push(j/(sections.length-1),k/24,j/(sections.length-1),(k+1)/24,(j+1)/(sections.length-1),(k+1)/24,(j+1)/(sections.length-1),k/24);indices.push(b,b+2,b+1,b,b+3,b+2);}}
  for(const j of [0,sections.length-1]){const p=ring(sections[j][0],sections[j][1]),b=positions.length/3;positions.push(...p.flat());for(let k=0;k<p.length;k++)uvs.push(k/(p.length-1),j===0?0:1);for(let k=1;k<p.length-1;k++)indices.push(b,b+(j===0?k:k+1),b+(j===0?k+1:k));}
  const hull=new Mesh('BOREAL ice strengthened profiled hull',scene),data=new VertexData(),normals:number[]=[];VertexData.ComputeNormals(positions,indices,normals);Object.assign(data,{positions,indices,normals,uvs});data.applyToMesh(hull);hull.forceSharedVertices();const marine=m.red.clone('BOREAL salt worn icebreaker enamel')!;marine.albedoColor=Color3.White();marine.roughness=.48;marine.bumpTexture=m.red.bumpTexture;marine.metallicTexture=m.red.metallicTexture;
  const paint=new DynamicTexture('BOREAL layered marine paint and salt streaks',{width:2048,height:512},scene,false),pc=paint.getContext() as CanvasRenderingContext2D;pc.fillStyle='#a84c39';pc.fillRect(0,0,2048,512);
  // The UV follows the full ship length and hull section, so welds and weathering stay in scale.
  pc.fillStyle='#233f4b';pc.fillRect(0,0,2048,76);pc.fillRect(0,436,2048,76);pc.fillStyle='#d8ddd0';pc.fillRect(0,73,2048,5);pc.fillRect(0,434,2048,5);
  let seed=91;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<650;i++){const x=rand()*2048,y=rand()*512;pc.fillStyle=i%3?'rgba(44,42,30,.09)':'rgba(231,222,194,.12)';pc.fillRect(x,y,.4+rand()*3,4+rand()*28);}
  pc.strokeStyle='rgba(26,43,47,.14)';pc.lineWidth=1;for(let x=0;x<2048;x+=90){pc.beginPath();pc.moveTo(x,0);pc.lineTo(x,512);pc.stroke();}paint.update();marine.albedoTexture=paint;hull.material=marine;hull.parent=root;hull.receiveShadows=true;
  a.hull('upper sheer deck',sections.map(([z,w])=>({z,halfWidth:w,bottom:3.4,top:3.7})),m.navy);
  for(let j=0;j<sections.length-1;j++)for(const side of [-1,1]){const [z,w]=sections[j],[nz,nw]=sections[j+1];a.beam('ice belt welded rubbing strake',v(side*w*.98,.9,z),v(side*nw*.98,.9,nz),.15,m.steel);railing(a,m,v(side*w,3.75,z),v(side*nw,3.75,nz));a.beam('snow on bulwark',v(side*w,3.78,z),v(side*nw,3.78,nz),.13,m.cap);}
  const widthAt=(z:number)=>{const i=sections.findIndex(p=>p[0]>=z);if(i<=0)return sections[0][1];const p=sections[i-1],q=sections[i],t=(z-p[0])/(q[0]-p[0]);return p[1]+(q[1]-p[1])*t;};
  for(let z=-24;z<28;z+=4)for(const side of [-1,1]){const x=side*widthAt(z)*.95;a.cylinder('round hull porthole gasket',x,2.65,z,.5,.08,m.navy,'x');a.cylinder('round hull porthole',x+side*.05,2.65,z,.35,.09,m.goggle,'x');}

  for(const side of [-1,1]){
    a.tube('heavy ice rubbing belt',sections.map(([z,w])=>v(side*w*.985,.85,z)),.16,m.navy);
    a.tube('deck drain pipe', [v(side*7.3,3.2,-8),v(side*7.6,1.5,-8),v(side*7.6,1.2,-6)],.08,m.steel);
    for(let z=-18;z<27;z+=3){a.box('deck scupper opening',side*7.93,3.1,z,.04,.18,.55,m.navy);a.box('hull patch plate',side*widthAt(z)*.91,1.8,z,.035,.65,1.4,m.red);for(const dz of [-.55,.55])a.sphere('weld rivet',side*widthAt(z)*.92,2,z+dz,.045,.045,.045,m.steel,true);}
  }
  // Forward forecastle, anchors and winch.
  a.hull('raised forecastle',[{z:-33,halfWidth:2.7,bottom:3.7,top:5.1},{z:-25,halfWidth:6.4,bottom:3.7,top:5.1},{z:-18,halfWidth:7.4,bottom:3.7,top:5.1}],m.ivory);
  for(const side of [-1,1]){a.cylinder('anchor windlass drum',side*2,5.45,-26,1.1,1.2,m.steel,'x');a.tube('anchor chain run',[v(side*2,5.4,-26),v(side*3,5.3,-29),v(side*3.5,3.5,-31)],.09,m.navy);a.beam('anchor stock',v(side*4,1,-30),v(side*4,-.2,-30),.2,m.navy);a.beam('anchor fluke',v(side*4,-.2,-30),v(side*4+side*.7,.4,-30),.18,m.navy);}
  // Chamfered, stepped accommodation block with continuous window bands and a raked bridge.
  const outline=(w:number,d:number,z:number)=>[[-w/2+1,z-d/2],[w/2-1,z-d/2],[w/2,z-d/2+1],[w/2,z+d/2-1],[w/2-1,z+d/2],[-w/2+1,z+d/2],[-w/2,z+d/2-1],[-w/2,z-d/2+1]];
  function deckhouse(y:number,w:number,d:number,z:number,bridge=false){
    const polygon=outline(w,d,z),roof=outline(w+(bridge?1.1:.15),d+(bridge?1:.15),z+.25),height=bridge?2.65:2.4;
    a.patch('chamfered accommodation deck',polygon.map(([x,z])=>v(x,y,z)),m.deck);
    a.patch('overhanging insulated roof',roof.map(([x,z])=>v(x,y+height+.12,z)),m.ivory);
    a.patch('wind settled roof crust',roof.map(([x,z])=>v(x,y+height+.19,z)),m.cap);
    for(let i=0;i<polygon.length;i++){const p=polygon[i],q=polygon[(i+1)%polygon.length],P=roof[i],Q=roof[(i+1)%roof.length],length=Math.hypot(p[0]-q[0],p[1]-q[1]);
      a.patch('enamel cabin lower fascia',[v(p[0],y,p[1]),v(q[0],y,q[1]),v(q[0],y+.85,q[1]),v(p[0],y+.85,p[1])],m.ivory);
      a.patch('continuous tinted panoramic glazing',[v(p[0],y+.85,p[1]),v(q[0],y+.85,q[1]),v(Q[0],y+height-.2,Q[1]),v(P[0],y+height-.2,P[1])],m.goggle);
      a.beam('bridge continuous brow',v(P[0],y+height,P[1]),v(Q[0],y+height,Q[1]),.13,m.ivory);
      const count=Math.max(1,Math.round(length/(bridge?1.65:2)));for(let j=0;j<=count;j++){const t=j/count;a.beam('angled glazing mullion',v(p[0]+(q[0]-p[0])*t,y+.8,p[1]+(q[1]-p[1])*t),v(P[0]+(Q[0]-P[0])*t,y+height,P[1]+(Q[1]-P[1])*t),.085,m.ivory);}
    }
    for(const side of [-1,1])for(let zc=z-d/2+2;zc<z+d/2-1;zc+=2.4){a.box('cabin door and panel seam',side*(w/2+.025),y+.38,zc,.035,.65,1.55,m.ivory);a.box('cabin ventilator',side*(w/2+.055),y+.35,zc,.04,.22,.6,m.navy);}
  }
  deckhouse(3.8,13,19,-8);deckhouse(6.35,11.7,15.5,-8.8);deckhouse(8.9,13.9,10,-11,true);
  for(const side of [-1,1]){a.box('bridge wing projecting deck',side*7.3,8.95,-10,2.2,.18,7,m.navy);railing(a,m,v(side*8.3,9.1,-13.4),v(side*8.3,9.1,-6.6));a.cylinder('bridge roof horn',side*5.2,12,-9,.3,1.2,m.steel,'z');a.torus('lifebuoy rescue ring',side*7.1,9.6,-7,1,.16,m.orange,'x');}
  for(let x=-4.8;x<=4.8;x+=1.6){a.box('bridge control pedestal',x,9.6,-13,1.3,.9,.8,m.navy);a.box('bridge instrument display',x,10.1,-13,.85,.05,.55,m.blue);}
  lamp(scene,'BOREAL ship bridge interior',root,0,11,-10,'#ffd19b',180,18);icicles(a,m,0,11.85,-16.5,26,13);
  // Twin raked uptakes leave a recognisable research-ship silhouette rather than a solid tower.
  for(const side of [-1,1]){a.hull('raked exhaust uptake',[{z:1,halfWidth:1.1,bottom:5.5,top:12.7},{z:4,halfWidth:1.1,bottom:5.5,top:13.7},{z:5,halfWidth:.9,bottom:5.5,top:13.7}],m.orange);const uptake=scene.meshes.at(-1)!;uptake.position.x=side*2;a.cylinder('black exhaust outlet',side*2,13.8,4,1.25,.7,m.navy);for(let i=0;i<9;i++)a.box('uptake ventilation grille',side*3.12,8+i*.3,3,.04,.12,2,m.navy);}
  const exhaust=new TransformNode('BOREAL icebreaker exhaust',scene);exhaust.parent=root;exhaust.position.set(0,14.2,4);
  for(let z=1;z<=7;z+=1.2)for(const side of [-1,1])a.box('ship ventilation louver',side*2.55,9.5,z,.1,3,.12,m.navy,true);
  a.cylinder('main radar mast',0,16,-5,.22,8,m.steel);a.beam('mast yard',v(-4,18,-5),v(4,18,-5),.14,m.steel);for(const x of [-4,0,4])a.cylinder('VHF antenna',x,19.5,-5,.045,2.5,m.steel);
  for(const side of [-1,1]){a.cylinder('radar scanner support',side*2.5,13.7,-10,.14,3.7,m.steel);a.cylinder('searchlight pedestal',side*4,12.55,-13,.18,1.5,m.ivory);}
  const radars=[-1,1].map(side=>{const h=new TransformNode('BOREAL ship radar scanner',scene);h.parent=root;h.position.set(side*2.5,15.5,-10);const b=modelAssembly(scene,'BOREAL scanner bar');b.root.parent=h;b.box('radar bar',0,0,0,3.8,.3,.35,m.ivory);b.finish();return h;});
  for(const side of [-1,1]){a.sphere('enclosed orange lifeboat',side*6,7.8,3,2.4,2.4,6.5,m.orange);a.box('lifeboat glazed hood',side*6,8.7,2.6,1.8,.7,2.5,m.glass);for(const z of [1,5]){a.beam('lifeboat davit',v(side*4,8.4,z),v(side*6,10,z),.16,m.steel);a.beam('lifeboat fall',v(side*6,10,z),v(side*6,8.7,z),.025,m.navy);}}
  // Stern cargo deck with individually ribbed containers, hatch, winches and hose reels.
  for(let i=0;i<4;i++){const x=i%2===0?-3.9:1,z=13+Math.floor(i/2)*9;a.box('deck container',x,5.1,z,3.5,2.7,7,m.ivory);a.box('container snow patch',x,6.55,z,3.6,.15,7.1,m.cap);for(let j=0;j<12;j++)a.box('container vertical rib',x-1.79,5.1,z-3.2+j*.57,.055,2.5,.09,m.steel,true);for(const dx of [-1.4,1.4])a.cylinder('container door locking bar',x+dx,5.1,z-3.55,.045,2.4,m.steel);}
  for(const side of [-1,1]){a.cylinder('stern capstan',side*5,4.1,28,.9,.7,m.steel);a.torus('coiled mooring cable',side*5,3.86,25,1.3,.14,m.navy);a.tube('fuel transfer hose',[v(side*7,3.8,10),v(side*8,2.5,10),v(side*8.5,1.5,6)],.12,m.rubber);}
  // Lattice crane with a separate slewing root and vertically travelling hook/load.
  a.cylinder('cargo crane pedestal',4.5,5.3,13,1.8,3,m.orange);
  const crane=new TransformNode('BOREAL slewing cargo crane',scene);crane.parent=root;crane.position.set(4.5,6.8,13);const c=modelAssembly(scene,'BOREAL crane boom');c.root.parent=crane;c.box('slew housing',0,0,0,3,1.5,2.5,m.orange);c.box('crane cab',-.5,1.2,1,1.8,1.8,1.7,m.ivory);c.box('crane cab window',-.5,1.4,1.87,1.5,1.15,.035,m.glass);for(const side of [-1,1]){c.beam('boom upper chord',v(0,1,side*.7),v(22,4.5,side*.35),.18,m.orange);c.beam('boom lower chord',v(0,-.2,side*.7),v(22,3.4,side*.35),.18,m.orange);for(let i=0;i<11;i++)c.beam('boom lattice diagonal',v(i*2,.1+i*.15,side*(.7-i*.03)),v(i*2+2,1.3+(i+1)*.15,side*(.7-(i+1)*.03)),.07,m.steel,true);}c.beam('topping wire',v(0,4,0),v(22,4.5,0),.035,m.navy);c.finish(100);
  const hook=new TransformNode('BOREAL cargo lifting block',scene);hook.parent=crane;hook.position.set(22,0,0);const load=modelAssembly(scene,'BOREAL suspended supply pallet');load.root.parent=hook;load.box('pallet',0,0,0,2.5,.2,2.3,m.steel);for(const x of [-.65,.65]){load.box('strapped cargo crate',x,.65,0,1.15,1.2,2,m.orange);load.box('cargo strap',x,1.26,0,.09,.03,2.1,m.navy);}for(const side of [-1,1])load.beam('sling wire',v(side*1.1,.1,0),v(0,2.5,0),.025,m.steel);load.torus('lifting hook',0,2.7,0,.35,.07,m.orange,'z');load.finish();
  const cable=modelAssembly(scene,'BOREAL lifting cable');cable.root.parent=crane;cable.cylinder('winch cable',22,2,0,.035,4,m.navy);cable.finish();
  // Hull registration, navigation and working searchlights illuminate nearby geometry.
  for(const side of [-1,1]){const plate=MeshBuilder.CreatePlane('BOREAL hull registry lettering',{width:9,height:2.25},scene);plate.parent=root;plate.position.set(side*8.04,2,-10);plate.rotation.y=-side*Math.PI/2;plate.material=m.lettering('BOREALIS','POLAR RESEARCH / 012');a.sphere('navigation lantern',side*7,11,-13,.22,.35,.22,side<0?m.signal:m.green);}

  for(const x of [-4,4]){a.cylinder('searchlight housing',x,13.35,-13,.65,.7,m.navy,'z');a.cylinder('searchlight glass',x,13.35,-13.38,.54,.03,m.white,'z');lamp(scene,'BOREAL ship search beam',root,x,13.35,-13.4,'#d4edff',220,65,[0,-.25,-1],.55);}
  for(const side of [-1,1]){a.tube('mooring line to bollard',[v(side*5,3.8,27),v(side*8,2.8,26),v(side*12,2,24)],.06,m.cloth);for(let z=-3;z<25;z+=2.5){a.box('deck steel tread plate',side*6.8,3.74,z,1.1,.025,1.8,m.steel,true);}}a.finish(115);shipFittings(scene,m,root);root.position.set(-94,-.6,-3);root.rotation.y=.08;
  return {root,exhaust,update(time:number,reduced:boolean){root.position.y=-.6+(reduced?0:Math.sin(time*.42)*.025);for(const r of radars)r.rotation.y=reduced?0:time*.8;crane.rotation.y=reduced?.8:.65+.6*Math.sin(time*.13);hook.position.y=reduced?0:.4+.6*Math.sin(time*.26);cable.root.position.y=hook.position.y+2.8;cable.root.scaling.y=(4.5-hook.position.y-2.8)/4;}};
}
