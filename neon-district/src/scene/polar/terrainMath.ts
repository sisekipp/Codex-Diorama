import { serviceLaneDistance } from './routes';
const smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
export const shoreX=(z:number)=>-64+5*Math.sin(z*.034)+2*Math.sin(z*.11);
export function snowHeight(x:number,z:number){
  const coast=shoreX(z),land=smooth((x-coast+2)/9);
  let h=.8+1.15*Math.sin(x*.025+z*.018)+.6*Math.sin(z*.067-x*.023)+.19*Math.sin(x*.42+z*.085)+.04*Math.sin(x*2.3+z*.6);
  const base=1-smooth((Math.hypot(x/44,(z-2)/45)-.82)/.35);h=h*(1-base)+(1.1+.07*Math.sin(x*.23)*Math.sin((z-5)*.28))*base;
  // Deposited powder has broad wind scallops, not gravel-sized noise. Accumulation fades into cleared foundations.
  const powder=.55+.23*Math.sin(x*.16+z*.055)+.12*Math.sin(x*.07-z*.19);
  h+=powder*(1-base);
  // Wind piles a continuous skirt against buildings; its soft edges merge into the ground.
  for(const [cx,cz,rx,rz,amount] of [[-13,16,10,3,1.05],[14,20,8,3,.8],[-20,-9,6,2,.65],[-8,37,12,4,1.2],[19,4,4,3,.6],[29,65,5,11,.85]])h+=amount*(1-Math.exp(-((x/8)**2+((z-5)/5)**2)))*Math.exp(-1*(((x-cx)/rx)**2+((z-cz)/rz)**2));
  const roadDistance=serviceLaneDistance(x,z),cleared=1-smooth((roadDistance-2.8)/2);
  h=h*(1-cleared)+1.1*cleared;
  h+=.38*Math.exp(-1*((roadDistance-5.4)/1.3)**2)*(1-base)*(1-smooth((roadDistance-7)/2));
  const runway=(1-smooth((Math.abs(x-64)-11)/6))*(1-smooth((Math.abs(z-30)-126)/18));h=h*(1-runway)+1.1*runway;
  const apron=1-smooth((Math.hypot((x-39)/23,(z+40)/25)-.7)/.5);h=h*(1-apron)+1.1*apron;
  // Continuous plowed berms and an eroded shoreline cornice, rather than repeated blobs.
  const runEnds=1-smooth((Math.abs(z-30)-120)/18);
  const taxiOpening=x<64?1-smooth((z+55)/10)*(1-smooth((z+2)/10)):1;
  h+=1.1*Math.exp(-1*((Math.abs(x-64)-14)/1.7)**2)*runEnds*taxiOpening;
  const lane=1-smooth((Math.abs(x+9)-39)/9);h+=.7*Math.exp(-1*((z+27-Math.sin(x*.08)*2)/1.3)**2)*lane;
  h+=.65*Math.exp(-1*((x-coast-2.5)/2.1)**2);
  return -4*(1-land)+Math.max(.35,h)*land;
}
/** Continuous low coastal valley. 52 m clear center + 20 m shoulders accommodate the 36 m wingspan. */
export function approachValley(x:number){const distance=Math.abs(x-64);return 1-smooth((distance-26)/20);}
export function glacierHeight(x:number){const i=(x+65)/4.7;return 1.5+(22+4*Math.sin(i*.5)+2*Math.sin(i*1.7)-1.5)*(1-approachValley(x));}
export function mountainHeight(x:number,z:number){const peaks=[[-410,390,115,95],[-245,420,160,100],[-70,370,110,85],[90,470,180,120],[290,390,140,110],[470,470,160,100]];let h=0;for(const [px,pz,height,radius]of peaks)h=Math.max(h,height*Math.exp(-1*((x-px)**2/(radius*radius)+(z-pz)**2/(radius*radius*.8))));const rough=1+.09*Math.sin(x*.065+z*.037)+.045*Math.sin(x*.17-z*.11);return Math.max(-3,(h*rough)*(1-approachValley(x))-3);}
