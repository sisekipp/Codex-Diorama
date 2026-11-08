import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import type { Scene } from '@babylonjs/core/scene';
import type { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Materials } from './materials';

type DetailTools={box:(name:string,x:number,y:number,z:number,w:number,h:number,d:number,material:StandardMaterial)=>InstancedMesh;sign:(text:string,x:number,y:number,z:number,w:number,h:number,color:string,rotation?:number,sub?:string)=>Mesh};

/** Detail primitives share source geometry and materials with the city. */
export function addStreetDetails(scene:Scene,m:Materials,{box,sign}:DetailTools){
  const cache=new Map<string,Mesh>();let seed=7021;
  const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const cylinder=(name:string,x:number,y:number,z:number,diameter:number,height:number,material:StandardMaterial)=>{
    let source=cache.get(material.name);
    if(!source){source=MeshBuilder.CreateCylinder('detail source '+material.name,{diameter:1,height:1,tessellation:12},scene);source.material=material;source.isVisible=false;cache.set(material.name,source);}
    const instance=source.createInstance(name);instance.position.set(x,y,z);instance.scaling.set(diameter,height,diameter);instance.isPickable=false;instance.freezeWorldMatrix();return instance;
  };
  const bar=(name:string,a:Vector3,b:Vector3,width:number,material=m.rust)=>{
    const delta=b.subtract(a),center=a.add(b).scale(.5);const piece=box(name,center.x,center.y,center.z,width,width,delta.length(),material);
    piece.unfreezeWorldMatrix();piece.rotation.x=-Math.atan2(delta.y,Math.hypot(delta.x,delta.z));piece.rotation.y=Math.atan2(delta.x,delta.z);piece.freezeWorldMatrix();return piece;
  };
  // Open fire-escape decks, stair treads, balusters and wall brackets.
  for(const [x,z,floors] of [[-14,-22.3,3],[12,-20.3,4],[-12.5,1.7,4],[12.5,15.7,4]] as const){
    for(let floor=0;floor<floors;floor++){
      const y=6+floor*3.3;
      for(let k=0;k<11;k++)box('escape open deck',x-1.7+k*.34,y,z-.6,.2,.09,1.15,m.rust);
      for(const dx of [-1.85,1.85]){
        box('escape edge beam',x+dx,y-.08,z-.6,.12,.22,1.4,m.rust);
        bar('escape wall brace',new Vector3(x+dx,y-.9,z),new Vector3(x+dx,y-.1,z-1.15),.08);
        box('escape anchor plate',x+dx,y-.75,z+.03,.25,.4,.08,m.trim);
      }
      for(let k=0;k<10;k++)box('escape railing picket',x-1.8+k*.4,y+.55,z-1.22,.045,1.05,.045,m.rust);
      box('escape top rail',x,y+1.08,z-1.22,3.8,.065,.065,m.trim);
      if(floor<floors-1){
        const direction=floor%2?1:-1;
        for(let step=0;step<11;step++)box('escape stair tread',x+direction*(-1.4+step*.28),y+.3+step*.3,z-.52,.35,.065,.75,m.rust);
        bar('escape stair stringer',new Vector3(x-direction*1.6,y,z-.96),new Vector3(x+direction*1.6,y+3.3,z-.96),.09);
        bar('escape sloped handrail',new Vector3(x-direction*1.6,y+.9,z-.96),new Vector3(x+direction*1.6,y+4.2,z-.96),.055,m.trim);
      }
    }
    for(const dx of [-.33,.33])box('ground access ladder',x+dx,2.65,z-.7,.06,4.4,.06,m.rust);
    for(let y=.7;y<4.9;y+=.34)box('ladder rung',x,y,z-.7,.72,.045,.045,m.trim);
  }
  // Service panels, conduit saddles and heavy vent flanges on the side facades.
  for(const side of [-1,1])for(let block=0;block<5;block++){
    const x=side*(7.65+(side>0?(block%3)*.6:(block%2)*.5)),z=-17+block*12;
    for(let level=0;level<3;level++){
      const y=5.9+level*6.6;
      box('maintenance backing plate',x,y,z+1.5,.09,1.45,1.35,m.rust);
      box('maintenance inset door',x-side*.065,y,z+1.5,.04,1.19,1.12,m.metal);
      box('panel handle',x-side*.13,y-.2,z+1.08,.065,.24,.04,m.trim);
      box('panel warning stripe',x-side*.1,y+.37,z+1.5,.025,.12,.6,m.yellow);
      for(const dy of [-.55,.55])for(const dz of [-.48,.48])box('panel bolt',x-side*.09,y+dy,z+1.5+dz,.04,.06,.06,m.trim);
      for(let clip=0;clip<5;clip++)box('pipe saddle',x-side*.07,y-1.2+clip*.5,z-.22,.2,.055,.5,m.trim);
      box('vent flange',x-side*.12,y+2,z-1,.22,1.05,1.1,m.rust);
      for(let slat=0;slat<8;slat++)box('vent louver',x-side*.25,y+1.6+slat*.11,z-1,.16,.045,.92,m.trim);
    }
    const panel=box('dented replacement facade panel',x-side*.08,3.85,z+2.4,.05,1.2,1.7,block%2?m.rust:m.painted);panel.unfreezeWorldMatrix();panel.rotation.x=.035*(block%2?1:-1);panel.freezeWorldMatrix();
    for(let k=0;k<8;k++)box('conduit tray rung',x-side*.18,4.5,z-4+k*1.2,.4,.05,.045,m.metal);
    for(let k=0;k<3;k++)box('horizontal conduit',x-side*(.12+k*.09),4.56,z,.035,.035,9.5,m.rust);
  }
  // Restaurant frontage: layered display, serving hatch, real shelves and counter seating.
  const sx=-10.6,sz=-22.4;
  box('noodle shop interior',sx,1.65,sz,5.1,2.7,.16,m.black);
  box('shop backlit wall',sx,1.8,sz-.1,4.5,2.25,.06,m.shopWarm);
  for(let x=sx-2.65;x<=sx+2.7;x+=.24)box('restaurant timber screen',x,1.7,sz-.22,.085,2.9,.12,m.wood);
  box('serving hatch dark back',sx,1.65,sz-.32,3.6,1.85,.05,m.black);
  for(const y of [1.2,1.85,2.5]){
    box('restaurant shelf',sx,y,sz-.65,3.45,.065,.62,m.wood);
    for(let k=0;k<8;k++){
      cylinder('soup bowl or ingredient jar',sx-1.4+k*.4,y+.1,sz-.67,.2,.16,k%3?m.ceramic:m.rust);
      if(y>2)box('ingredient jar label',sx-1.4+k*.4,y+.1,sz-.79,.1,.08,.02,m.paper);
    }
  }
  box('restaurant counter',sx,.85,sz-.95,4.9,.2,1.05,m.wood);
  box('counter stainless edge',sx,.97,sz-1.48,4.95,.04,.07,m.trim);
  for(let k=0;k<5;k++){
    const x=sx-1.85+k*.9;cylinder('counter stool seat',x,.67,sz-1.95,.48,.12,m.painted);
    for(const dx of [-.14,.14])for(const dz of [-.14,.14])box('stool leg',x+dx,.39,sz-1.95+dz,.045,.52,.045,m.rust);
    cylinder('counter bowl',x,1.02,sz-.94,.3,.13,m.ceramic);
    bar('chopsticks',new Vector3(x-.13,1.11,sz-1),new Vector3(x+.14,1.12,sz-.87),.012,m.wood);
  }
  sign('本日のおすすめ',sx,3.06,sz-.26,3.4,.52,'#ffce8b',0,'RAMEN · GYOZA · RICE');
  for(const x of [sx-2.95,sx+2.95]){box('menu frame',x,1.45,sz-.36,.6,1.8,.12,m.wood);box('menu board',x,1.45,sz-.44,.49,1.65,.02,m.menu);}
  for(let k=0;k<6;k++)box('fabric noren',sx-2.1+k*.83,2.64,sz-.58,.7,.44,.025,k%2?m.painted:m.wood);
  // Street-facing service cart stays visible when the camera zooms into the district.
  box('market cart base',-7.05,.62,-8.5,1.3,.85,4,m.painted);
  box('market cart worktop',-6.95,1.1,-8.5,1.6,.1,4.2,m.trim);
  for(const z of [-10.4,-6.6]){
    box('market cart canopy post',-7.55,1.8,z,.065,1.9,.065,m.rust);
    box('market cart canopy post',-6.4,1.8,z,.065,1.9,.065,m.rust);
  }
  box('market cart canopy',-7,2.78,-8.5,1.9,.12,4.5,m.painted);
  box('market canopy warm strip',-6.08,2.71,-8.5,.04,.055,4.2,m.shopWarm);
  for(let k=0;k<5;k++){
    const z=-10+k*.74;
    cylinder('market bowl',-6.65,1.23,z,.26,.14,m.ceramic);
    cylinder('market stool',-5.92,.66,z,.4,.11,m.wood);
    for(const dz of [-.12,.12])box('market stool leg',-5.92,.42,z+dz,.07,.4,.045,m.rust);
    box('market curtain',-6.08,2.46,z,.025,.42,.63,k%2?m.wood:m.painted);
  }
  box('food cart end menu',-6.99,1.75,-10.58,1.15,.85,.025,m.menu);
  cylinder('market stock pot',-7.1,1.36,-7,.49,.4,m.trim);
  cylinder('stock pot lid',-7.1,1.59,-7,.54,.045,m.trim);
  // A repair bay with a partially closed shutter, spare parts and diagnostic screen.
  const wx=11.9,wz=-20.43;
  box('repair bay back',wx,1.65,wz,5.8,3,.12,m.black);
  for(let y=2.1;y<3.2;y+=.13)box('roller shutter slat',wx,y,wz-.1,5.6,.1,.12,m.rust);
  box('shutter bottom bar',wx,2.05,wz-.13,5.7,.12,.17,m.trim);
  for(let y=.6;y<1.9;y+=.55){box('parts shelf',wx,y,wz-.52,4.8,.06,.7,m.metal);for(let k=0;k<7;k++){box('spare part case',wx-2+k*.65,y+.17,wz-.5,.4,.28,.35,k%3?m.painted:m.rust);box('spare part label',wx-2+k*.65,y+.17,wz-.69,.18,.075,.01,m.paper);}}
  box('diagnostic stand',wx-2.9,.85,wz-.9,.7,1.2,.5,m.metal);box('diagnostic screen',wx-2.9,1.65,wz-1.05,.65,.43,.05,m.screen);
  sign('KISEKI / 修理',wx,3.65,wz-.12,5.4,.8,'#7ff7dd',0,'CYBERNETICS · REPAIR · MODS');
  for(const side of [-1,1])for(let i=0;i<9;i++){
    const x=side*(7.58+(i%2)*.05),z=-19+i*5.8;
    box('street poster backing',x,1.6,z,.035,1.05,.75,m.paper);box('street poster print',x-side*.025,1.6,z,.01,.96,.67,m.poster);
    for(let k=0;k<3;k++)box('torn sticker',x-side*.045,.9+k*.19,z+.47,.012,.11,.22,k%2?m.yellow:m.paper);
  }
  for(const [x,z] of [[-6.8,-23],[6.7,-14],[-6.6,3],[6.8,16]] as const){
    box('pavement A board frame',x,.9,z,.85,1.4,.14,m.rust);box('pavement A board print',x,.9,z-.085,.72,1.23,.02,m.menu);
    for(const dx of [-.35,.35])bar('A board leg',new Vector3(x+dx,.25,z-.35),new Vector3(x+dx,1.5,z),.05,m.wood);
  }
  // Delivery crates and irregular refuse bags around the shops.
  for(let group=0;group<11;group++){
    const side=group%2?1:-1,x=side*(7.3+random()*.45),z=-24+group*6.9;
    for(let k=0;k<(group<5?3:2);k++){
      const xx=x+side*(k%2)*.55,zz=z+Math.floor(k/2)*.65,yy=.48+Math.floor(k/2)*.62;
      box('delivery crate',xx,yy,zz,.65,.6,.65,group%3?m.wood:m.painted);
      for(const dy of [-.22,.22])box('crate timber brace',xx,yy+dy,zz-.34,.68,.07,.045,m.rust);
      for(const dx of [-.23,.23])box('crate corner brace',xx+dx,yy,zz-.35,.06,.57,.035,m.rust);
      box('shipping label',xx,yy+.02,zz-.372,.22,.17,.01,m.paper);
    }
    if(group%2===0){
      let source=cache.get('refuse bag');if(!source){source=MeshBuilder.CreateSphere('refuse source',{diameter:1,segments:6},scene);source.material=m.bag;source.isVisible=false;cache.set('refuse bag',source);}
      for(let k=0;k<2;k++){const bag=source.createInstance('tied refuse bag');bag.position.set(x-side*.4,.48,z+.8+k*.6);bag.scaling.set(.65,.75,.58);bag.rotation.set(.1,k*.7,.15);bag.isPickable=false;bag.freezeWorldMatrix();cylinder('refuse bag knot',bag.position.x,.88,bag.position.z,.13,.17,m.bag);}
    }
  }
  for(let shape=0;shape<3;shape++){
    const source=MeshBuilder.CreateDisc('irregular puddle outline '+shape,{radius:1,tessellation:24,updatable:true},scene);
    const positions=source.getVerticesData('position')!;
    for(let i=3;i<positions.length;i+=3){const radius=.7+random()*.3;positions[i]*=radius;positions[i+1]*=radius;}
    source.updateVerticesData('position',positions);source.material=m.wetPuddle;source.isVisible=false;
    for(let i=0;i<7;i++){const patch=source.createInstance('irregular reflective puddle');patch.position.set(-5.4+random()*10.8,.054,-26+random()*68);patch.rotation.set(Math.PI/2,random()*Math.PI,0);patch.scaling.set(.35+random()*.7,.65+random()*1.7,1);patch.isPickable=false;patch.freezeWorldMatrix();}
  }
  for(const side of [-1,1])for(let z=-25;z<40;z+=8){
    box('storm drain surround',side*6.5,.043,z,.72,.045,1.3,m.rust);box('storm drain recess',side*6.5,.068,z,.59,.02,1.15,m.black);
    for(let k=0;k<8;k++)box('storm drain bar',side*6.5,.084,z-.5+k*.14,.6,.025,.045,m.trim);
  }
  for(let k=0;k<32;k++){
    const paper=box('windblown litter',-5.5+random()*11,.07,-26+random()*66,.1+random()*.2,.008,.17+random()*.17,k%4?m.paper:m.poster);paper.unfreezeWorldMatrix();paper.rotation.y=random()*Math.PI;paper.rotation.z=(random()-.5)*.15;paper.freezeWorldMatrix();
  }
  for(let k=0;k<4;k++){
    const x=-3.9+k*.7,z=7+k*.25;box('cone base',x,.1,z,.5,.12,.5,m.bag);
    let source=cache.get('traffic cone');if(!source){source=MeshBuilder.CreateCylinder('cone source',{diameterTop:.06,diameterBottom:.32,height:.65,tessellation:12},scene);source.material=m.orange;source.isVisible=false;cache.set('traffic cone',source);}
    const cone=source.createInstance('traffic cone');cone.position.set(x,.47,z);cone.freezeWorldMatrix();cylinder('cone reflector',x,.47,z,.22,.11,m.paper);
  }
  for(const x of [-4.2,-1.5]){box('barricade foot',x,.18,9,.7,.15,.8,m.metal);box('barricade upright',x,.7,9,.08,1,.08,m.rust);}
  box('hazard barricade',-2.85,.85,9,3,.45,.12,m.hazard);
  for(const x of [-4.1,-1.6])cylinder('barricade beacon',x,1.3,9,.18,.2,m.amber);
}
