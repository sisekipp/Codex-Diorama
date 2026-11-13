/** Conservative granular layer + ballistic clumps. Units: metres, seconds, kilograms.
 * A reduced 2.5D material model, not a volumetric MPM continuum. No rendering dependencies. */
export type SnowContact='foot'|'tire'|'ski';
export type SnowClump={x:number;y:number;z:number;vx:number;vy:number;vz:number;mass:number;packing:number;radius:number;age:number;spin:number};
export type BladeContact={x:number;z:number;yaw:number;cut:number;width:number;speed:number;distance:number};
export type SnowOptions={left:number;back:number;columns:number;rows:number;spacing:number;surface:(x:number,z:number)=>number;depth:(x:number,z:number)=>number;particleLimit?:number};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const density=(packing:number)=>120+330*packing;
export class SnowPhysics{
  readonly bed:Float64Array;
  readonly mass:Float64Array;
  readonly packing:Float32Array;
  readonly disturbed:Float32Array;
  readonly changed=new Set<number>();
  readonly active=new Set<number>();
  readonly particles:SnowClump[]=[];
  readonly stride:number;
  readonly area:number;
  particleLimit:number;
  private initial=0;
  private initialMass:Float64Array;
  private added=0;
  private precipitation=0;
  private weatherClock=0;
  private seed=1729;
  private idle:Uint16Array;
  displacedKg=0;
  bladeKg=0;
  constructor(readonly options:SnowOptions){
    this.stride=options.columns+1;this.area=options.spacing**2;this.particleLimit=options.particleLimit??900;
    const count=this.stride*(options.rows+1);this.bed=new Float64Array(count);this.mass=new Float64Array(count);this.packing=new Float32Array(count);this.disturbed=new Float32Array(count);this.idle=new Uint16Array(count);
    for(let r=0;r<=options.rows;r++)for(let c=0;c<=options.columns;c++){const i=r*this.stride+c,x=options.left+c*options.spacing,z=options.back-r*options.spacing,h=options.surface(x,z),depth=Math.max(0,options.depth(x,z));this.bed[i]=h-depth;this.mass[i]=depth*120*this.area;this.initial+=this.mass[i];}
    this.initialMass=this.mass.slice();
  }
  reset(){this.mass.set(this.initialMass);this.packing.fill(0);this.disturbed.fill(0);this.idle.fill(0);this.particles.length=0;this.active.clear();this.changed.clear();for(let i=0;i<this.mass.length;i++)this.changed.add(i);this.added=0;this.precipitation=0;this.weatherClock=0;this.seed=1729;this.displacedKg=0;this.bladeKg=0;}
  private random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
  private index(c:number,r:number){return clamp(r,0,this.options.rows)*this.stride+clamp(c,0,this.options.columns);}
  private inside(x:number,z:number){const o=this.options;return x>=o.left&&x<=o.left+o.columns*o.spacing&&z<=o.back&&z>=o.back-o.rows*o.spacing;}
  private nearest(x:number,z:number){const o=this.options;return this.index(Math.round((x-o.left)/o.spacing),Math.round((o.back-z)/o.spacing));}

  private touch(i:number){this.changed.add(i);this.active.add(i);this.idle[i]=0;}
  surfaceAt(i:number){return this.bed[i]+this.mass[i]/(density(this.packing[i])*this.area);}
  private sample(x:number,z:number,field:(i:number)=>number){const o=this.options,c=clamp((x-o.left)/o.spacing,0,o.columns),r=clamp((o.back-z)/o.spacing,0,o.rows),ci=Math.floor(c),ri=Math.floor(r),u=c-ci,v=r-ri;return field(this.index(ci,ri))*(1-u)*(1-v)+field(this.index(ci+1,ri))*u*(1-v)+field(this.index(ci,ri+1))*(1-u)*v+field(this.index(ci+1,ri+1))*u*v;}
  height(x:number,z:number){return this.sample(x,z,i=>this.surfaceAt(i));}
  bedAt(x:number,z:number){return this.sample(x,z,i=>this.bed[i]);}
  compactionAt(x:number,z:number){return this.sample(x,z,i=>this.packing[i]);}
  private add(i:number,kg:number,packing:number,activate=true){if(kg<=0)return;const old=this.mass[i],total=old+kg;this.packing[i]=(old*this.packing[i]+kg*packing)/total;this.mass[i]=total;if(activate){this.disturbed[i]=1;this.touch(i);}else this.changed.add(i);}
  private depositInternal(x:number,z:number,kg:number,packing:number){
    const o=this.options,c=clamp((x-o.left)/o.spacing,0,o.columns-.000001),r=clamp((o.back-z)/o.spacing,0,o.rows-.000001),ci=Math.floor(c),ri=Math.floor(r),u=c-ci,v=r-ri;
    this.add(this.index(ci,ri),kg*(1-u)*(1-v),packing);this.add(this.index(ci+1,ri),kg*u*(1-v),packing);this.add(this.index(ci,ri+1),kg*(1-u)*v,packing);this.add(this.index(ci+1,ri+1),kg*u*v,packing);
  }
  /** External deposit is accounted separately; internal transfers never change the budget. */
  deposit(x:number,z:number,kg:number,packing=0){if(!Number.isFinite(kg)||kg<=0)return;this.added+=kg;this.depositInternal(x,z,kg,packing);}
  private eject(x:number,z:number,kg:number,packing:number,vx:number,vz:number,speed:number){
    let remaining=kg;
    while(remaining>1e-8&&this.particles.length<this.particleLimit){const mass=Math.min(remaining,.25+this.random()*.8),radius=Math.cbrt(3*mass/(4*Math.PI*density(packing)));this.particles.push({x,y:this.height(x,z)+radius+.08,z,vx:vx*(.65+this.random()*.5),vy:.8+speed*.25+this.random()*1.6,vz:vz*(.65+this.random()*.5),mass,packing,radius,age:0,spin:this.random()*6.28});remaining-=mass;}
    if(remaining>0)this.depositInternal(x,z,remaining,packing);
  }
  contact(kind:SnowContact,x:number,z:number,yaw:number,_time:number){
    if(!this.inside(x,z))return;const o=this.options,width=kind==='foot'?.22:kind==='ski'?.58:.36,length=kind==='foot'?.34:kind==='ski'?.65:.64,reach=Math.ceil((Math.hypot(width,length)+o.spacing)/o.spacing),center=this.nearest(x,z),col=center%this.stride,row=Math.floor(center/this.stride),cos=Math.cos(yaw),sin=Math.sin(yaw),limit=kind==='foot'?.24:kind==='ski'?.13:.29;
    const removed:{x:number;z:number;kg:number;p:number;side:number}[]=[];
    for(let r=Math.max(0,row-reach);r<=Math.min(o.rows,row+reach);r++)for(let c=Math.max(0,col-reach);c<=Math.min(o.columns,col+reach);c++){
      const i=this.index(c,r),wx=o.left+c*o.spacing,wz=o.back-r*o.spacing,dx=wx-x,dz=wz-z,cross=dx*cos-dz*sin,along=dx*sin+dz*cos,q=(cross/width)**2+(along/length)**2;if(q>=1||this.mass[i]<.00001)continue;
      const weight=Math.sqrt(1-q),old=this.packing[i],target=Math.max(old,limit*weight),change=(target-old)*.72;if(change<.00001)continue;
      this.packing[i]=old+change;this.disturbed[i]=1;const moved=this.mass[i]*change*(kind==='ski'?.22:.5);this.mass[i]-=moved;this.displacedKg+=moved;this.touch(i);removed.push({x:wx,z:wz,kg:moved,p:old,side:cross<0?-1:1});
    }
    // Move the measured material to contact shoulders, rather than drawing a fixed ridge.
    for(const p of removed){const side=width+(kind==='foot'?.20:.34);this.depositInternal(x+cos*p.side*side,z-sin*p.side*side,p.kg,p.p*.5);}
  }
  plow(blade:BladeContact){
    if(!Number.isFinite(blade.distance)||blade.distance<=0||blade.speed<.02||!this.inside(blade.x,blade.z))return;
    const o=this.options,cos=Math.cos(blade.yaw),sin=Math.sin(blade.yaw),forwardX=-sin,forwardZ=-cos,rx=cos,rz=-sin,half=blade.width/2,reach=Math.ceil((half+blade.distance+o.spacing)/o.spacing),center=this.nearest(blade.x,blade.z),col=center%this.stride,row=Math.floor(center/this.stride),removed:{cross:number;kg:number;packing:number}[]=[];
    for(let r=Math.max(0,row-reach);r<=Math.min(o.rows,row+reach);r++)for(let c=Math.max(0,col-reach);c<=Math.min(o.columns,col+reach);c++){
      const i=this.index(c,r),dx=o.left+c*o.spacing-blade.x,dz=o.back-r*o.spacing-blade.z,cross=dx*cos-dz*sin,along=dx*forwardX+dz*forwardZ;
      if(Math.abs(cross)>half||along<-.18||along>Math.max(.32,blade.distance+.12)||this.mass[i]<=0)continue;
      const allowed=Math.max(0,blade.cut-this.bed[i])*density(this.packing[i])*this.area,kg=Math.max(0,this.mass[i]-allowed);if(kg<.000001)continue;
      this.mass[i]-=kg;this.disturbed[i]=1;this.touch(i);this.bladeKg+=kg;this.displacedKg+=kg;removed.push({cross,kg,packing:this.packing[i]});
    }
    for(const p of removed){
      const sideShare=.55,air=.075,advance=.65+Math.max(0,p.cross)*.07;
      // An angled moldboard rolls a bow wave and discharges a growing bank to the right.
      this.depositInternal(blade.x+rx*p.cross+forwardX*advance,blade.z+rz*p.cross+forwardZ*advance,p.kg*(1-sideShare-air),Math.min(.38,p.packing+.06));
      const offset=half+.58+this.random()*.55,along=(this.random()-.5)*1.1;
      const x=blade.x+rx*offset+forwardX*along,z=blade.z+rz*offset+forwardZ*along;
      this.depositInternal(x,z,p.kg*sideShare,Math.min(.4,p.packing+.04));
      this.eject(x,z,p.kg*air,p.packing,rx*(1.8+blade.speed*.25)+forwardX*.5,rz*(1.8+blade.speed*.25)+forwardZ*.5,blade.speed);
    }
  }
  step(delta:number,wind:number,snowfall:number){
    if(!Number.isFinite(delta)||delta<=0)return;const dt=Math.min(delta,1/15),o=this.options,windStrength=clamp(wind,0,100)/100;
    for(let k=this.particles.length-1;k>=0;k--){const p=this.particles[k];p.age+=dt;p.vy-=9.81*dt;p.vx+=(windStrength*.9-p.vx*.22)*dt;p.vz-=p.vz*.22*dt;p.x=clamp(p.x+p.vx*dt,o.left,o.left+o.columns*o.spacing);p.z=clamp(p.z+p.vz*dt,o.back-o.rows*o.spacing,o.back);p.y+=p.vy*dt;const surface=this.height(p.x,p.z);
      if((p.y-p.radius<=surface&&p.vy<=0)||p.age>5){this.depositInternal(p.x,p.z,p.mass,p.packing);this.particles[k]=this.particles[this.particles.length-1];this.particles.pop();}
    }
    const work=[...this.active];
    for(const i of work){const c=i%this.stride,r=Math.floor(i/this.stride);if(this.mass[i]<.00001){this.active.delete(i);continue;}let recipient=-1,excess=0;
      const h=this.surfaceAt(i),threshold=Math.tan((32+this.packing[i]*16)*Math.PI/180)*o.spacing+.035*this.packing[i];
      for(const j of [c>0?i-1:-1,c<o.columns?i+1:-1,r>0?i-this.stride:-1,r<o.rows?i+this.stride:-1])if(j>=0){const difference=h-this.surfaceAt(j)-threshold;if(difference>excess){recipient=j;excess=difference;}}
      if(recipient>=0&&excess>.001){const kg=Math.min(this.mass[i]*.24,excess*this.area/(1/density(this.packing[i])+1/density(this.packing[recipient]))*Math.min(1,dt*14));this.mass[i]-=kg;this.add(recipient,kg,this.packing[i]*.97);this.touch(i);}else if(++this.idle[i]>50)this.active.delete(i);
      if(windStrength>.25&&c<o.columns&&this.packing[i]<.4){const kg=this.mass[i]*dt*.003*windStrength*(1-this.packing[i]);this.mass[i]-=kg;this.add(i+1,kg,this.packing[i]*.8,false);this.changed.add(i);}
      if(this.disturbed[i]>.001){this.disturbed[i]*=Math.exp(-dt*.008*windStrength);this.changed.add(i);}
    }
    this.weatherClock+=dt;if(this.weatherClock>=2){const elapsed=this.weatherClock;this.weatherClock=0;if(snowfall>0){const kg=clamp(snowfall,0,100)/100*.00015*elapsed*120*this.area;for(let i=0;i<this.mass.length;i++){if(this.bed[i]<-.5)continue;const old=this.mass[i];this.packing[i]=this.packing[i]*old/(old+kg);this.mass[i]+=kg;this.precipitation+=kg;this.changed.add(i);}}}
  }
  massBalance(){let ground=0,airborne=0;for(const m of this.mass)ground+=m;for(const p of this.particles)airborne+=p.mass;return {initial:this.initial,added:this.added,precipitation:this.precipitation,ground,airborne,error:ground+airborne-this.initial-this.added-this.precipitation};}
}
