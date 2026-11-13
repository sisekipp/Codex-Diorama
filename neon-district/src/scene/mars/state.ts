export type MarsSettings={wind:number;dust:number;daylight:number};
export const DEFAULT_MARS:MarsSettings={wind:38,dust:24,daylight:82};
export const percent=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(100,n)):0;
export function readMars():MarsSettings{try{const data=JSON.parse(localStorage.getItem('ares.atmosphere.v1')??'null');return {wind:typeof data?.wind==='number'?percent(data.wind):DEFAULT_MARS.wind,dust:typeof data?.dust==='number'?percent(data.dust):DEFAULT_MARS.dust,daylight:typeof data?.daylight==='number'?percent(data.daylight):DEFAULT_MARS.daylight};}catch{return {...DEFAULT_MARS};}}
const smooth=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export function launchState(elapsed:number){
  const t=Math.max(0,Number.isFinite(elapsed)?elapsed:0),flight=Math.max(0,t-12);
  const phase=t<8?'countdown':t<12?'ignition':t<19?'liftoff':t<36?'ascent':'complete';
  const height=Math.min(700,.47*flight*flight+.035*flight*flight*flight);
  const throttle=t<8?0:t<12?.18+.82*smooth((t-8)/4):t<34?1:Math.max(0,1-(t-34)/3);
  return {phase,elapsed:t,remaining:Math.max(0,Math.ceil(8-t)),height,throttle,arm:smooth((t-4.5)/3),groundDust:throttle*Math.exp(-height/20),progress:Math.min(1,t/36)};
}
export type LaunchState=ReturnType<typeof launchState>;
export function trailOpacity(age:number,wind:number){return Math.max(0,Math.min(1,1-Math.max(0,age)/(220-percent(wind)*1.65)));}
export function daylightState(value:number){const t=percent(value)/100,elevation=-.12+.95*Math.sin(t*Math.PI),day=Math.max(0,Math.min(1,elevation*3));return {elevation,day,warm:1-Math.min(1,Math.max(0,elevation)*1.35),hour:Math.floor(2+t*20),minute:Math.floor((t*20%1)*60)};}
