const fade=(t:number)=>t*t*(3-2*t);
const hash=(x:number,z:number)=>{const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);};
function noise(x:number,z:number){const ix=Math.floor(x),iz=Math.floor(z),fx=fade(x-ix),fz=fade(z-iz);return (hash(ix,iz)*(1-fx)+hash(ix+1,iz)*fx)*(1-fz)+(hash(ix,iz+1)*(1-fx)+hash(ix+1,iz+1)*fx)*fz;}
export function terrainHeight(x:number,z:number){
  let h=(noise(x*.035,z*.035)-.5)*4+(noise(x*.12,z*.12)-.5)*.7+Math.sin(x*.31+Math.sin(z*.09)*2)*.16;
  h+=.07*Math.sin(x*2.8+z*.6)+.025*Math.sin(x*5.2-z*.9);
  const crater=Math.hypot((x-57)*.95,z-76);h+=Math.exp(-Math.pow((crater-31)/5,2))*7-Math.exp(-Math.pow(crater/23,4))*5;
  for(const [cx,cz,rx,rz,level]of [[-17,10,31,27,.6],[-24,-6,19,16,.6],[42,28,20,19,1],[61,-4,12,12,1],[-46,-13,17,16,.6]]){
    const distance=Math.hypot((x-cx)/rx,(z-cz)/rz),weight=1-fade(Math.max(0,Math.min(1,(distance-.75)/.4)));h=h*(1-weight)+level*weight;
  }
  return h;
}
export const TERRAIN_SIZE=420;
