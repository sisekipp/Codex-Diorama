export const AIRCRAFT_SKIS=[[0,-12.34],[-1.82,-1.35],[1.82,-1.35]] as const;
export type PolarSettings={snow:number;wind:number;drift:number;daylight:number};
export const DEFAULT_POLAR:PolarSettings={snow:38,wind:32,drift:28,daylight:78};
export const percent=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(100,n)):0;
export function readPolar():PolarSettings{try{const s=JSON.parse(localStorage.getItem('boreal.atmosphere.v1')??'null');return s?Object.fromEntries(Object.entries(DEFAULT_POLAR).map(([k,v])=>[k,percent(typeof s[k]==='number'?s[k]:v)])) as PolarSettings:{...DEFAULT_POLAR};}catch{return {...DEFAULT_POLAR};}}
const smooth=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
export function arrivalState(elapsed:number){
  const t=Math.max(0,Number.isFinite(elapsed)?elapsed:0);let x=64,z=80,height=0,yaw=0,speed=0;
  if(t<14){const u=t/14;z=80+(14*190/12)*(1-u);height=42*(1-u)**1.5;speed=190/12;}
  else if(t<26){const u=(t-14)/12;z=80-95*(1-(1-u)**2);speed=190/12*(1-u);}
  else if(t<39){const u=smooth((t-26)/13),v=1-u;x=v*v*v*64+3*v*v*u*64+3*v*u*u*38+u*u*u*38;z=v*v*v*-15+3*v*v*u*-40+3*v*u*u*-15+u*u*u*-40;const dx=-156*u*v,dz=-75*v*v+150*v*u-75*u*u;yaw=Math.atan2(-dx,-dz);speed=6*Math.sin(Math.PI*(t-26)/13);}
  else {x=38;z=-40;}
  const phase=t<14?'approach':t<26?'rollout':t<39?'taxi':t<45?'unloading':'complete';
  return {elapsed:t,x,z,height,yaw,speed,phase,ramp:smooth((t-39)/6),propeller:t<39?1:1-smooth((t-39)/9),powder:t>=13&&t<39?Math.min(1,speed/12):0,progress:Math.min(1,t/45)};
}
export type ArrivalState=ReturnType<typeof arrivalState>;
export function polarDaylight(value:number){const t=percent(value)/100,elevation=Math.sin(t*Math.PI)*.65-.14,day=Math.max(0,Math.min(1,elevation*2.7));return {elevation,day,night:1-day,hour:Math.floor(t*24)%24,minute:Math.floor(t*24*60)%60};}
export const trackOpacity=(age:number,wind:number)=>Math.max(0,Math.min(1,1-age/(260-percent(wind)*1.7)));
