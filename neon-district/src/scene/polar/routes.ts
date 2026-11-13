/** Arc-length sampled service circuits. Every vehicle returns continuously, with loading stops. */
export const serviceRoutes={
  plow:[[-42,-34],[-12,-42],[14,-35],[17,-17],[32,-3],[43,8],[44,35],[21,51],[-15,50],[-38,43],[-48,28],[-52,3],[-47,-18]],
  cargo:[[-53,-23],[-46,-32],[-32,-35],[-4,-40],[12,-35],[17,-25],[18,-11],[20,-1],[32,-1],[38,4],[39,20],[36,39],[20,47],[-6,46],[-31,42],[-41,29],[-46,8],[-49,-9]],
  mobile:[[-36,-30],[-32,-35],[-6,-42],[15,-34],[20,-10],[34,0],[42,20],[39,45],[24,60],[19,82],[2,91],[-23,91],[-40,77],[-44,53],[-48,32],[-47,8],[-40,-3]],
} satisfies Record<string,number[][]>;
export function createServiceCircuit(points:number[][],speed:number,stops:Record<number,number>={}){
  const samples:{x:number;z:number;distance:number;node:number}[]=[];let length=0;
  for(let n=0;n<points.length;n++)for(let k=0;k<48;k++){
    const t=k/48,a=points[(n+points.length-1)%points.length],b=points[n],c=points[(n+1)%points.length],d=points[(n+2)%points.length];
    const at=(i:number)=>.5*(2*b[i]+(-a[i]+c[i])*t+(2*a[i]-5*b[i]+4*c[i]-d[i])*t*t+(-a[i]+3*b[i]-3*c[i]+d[i])*t*t*t);
    const x=at(0),z=at(1),last=samples.at(-1);if(last)length+=Math.hypot(x-last.x,z-last.z);samples.push({x,z,distance:length,node:n});
  }
  length+=Math.hypot(samples[0].x-samples.at(-1)!.x,samples[0].z-samples.at(-1)!.z);samples.push({...samples[0],distance:length});
  const legs=points.map((_,n)=>{const start=samples[n*48].distance,end=n===points.length-1?length:samples[(n+1)*48].distance;return {start,end,wait:stops[n]??0,travel:(end-start)/speed+2};});
  const duration=legs.reduce((v,l)=>v+l.wait+l.travel,0);
  function atDistance(distance:number){const s=((distance%length)+length)%length;let lo=0,hi=samples.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(samples[mid].distance<=s)lo=mid;else hi=mid;}const a=samples[lo],b=samples[hi],t=(s-a.distance)/(b.distance-a.distance);return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:Math.atan2(-(b.x-a.x),-(b.z-a.z))};}
  return {length,duration,samples,pose(time:number){let t=((time%duration)+duration)%duration;for(const l of legs){if(t<l.wait)return {...atDistance(l.start),distance:l.start,stopped:true};t-=l.wait;if(t<l.travel){const ramp=2,T=l.travel,area=T-ramp,integral=t<ramp?t*t/(2*ramp):t>T-ramp?area-(T-t)**2/(2*ramp):t-ramp/2;const distance=l.start+(l.end-l.start)*integral/area;return {...atDistance(distance),distance,stopped:false};}t-=l.travel;}return {...atDistance(0),distance:0,stopped:true};}};
}

const lanes=Object.values(serviceRoutes).flatMap(points=>points.map((p,i)=>{const q=points[(i+1)%points.length],dx=q[0]-p[0],dz=q[1]-p[1];return {x:p[0],z:p[1],dx,dz,length2:dx*dx+dz*dz};}));
export function serviceLaneDistance(x:number,z:number){let distance2=Infinity;for(const l of lanes){const t=Math.max(0,Math.min(1,((x-l.x)*l.dx+(z-l.z)*l.dz)/l.length2)),dx=x-l.x-l.dx*t,dz=z-l.z-l.dz*t;distance2=Math.min(distance2,dx*dx+dz*dz);}return Math.sqrt(distance2);}

/** Reserve crossing space ahead: the plow has priority, then the cargo carrier. */
export function shouldYieldServiceTraffic(vehicles:{circuit:ReturnType<typeof createServiceCircuit>;clock:number}[],index:number){
  for(let priority=0;priority<index;priority++)for(let lead=0;lead<=4;lead+=.5){const a=vehicles[index].circuit.pose(vehicles[index].clock+lead),b=vehicles[priority].circuit.pose(vehicles[priority].clock+lead);if(Math.hypot(a.x-b.x,a.z-b.z)<(index===2?6.8:8))return true;}
  return false;
}
