/** Camera proximity selects real lamps, not the order they were created in the scene. */
export function rankLight(distanceSquared:number,power:number,range:number){
  if(!Number.isFinite(distanceSquared)||distanceSquared<0||power<=0||range<=0)return 0;
  if(distanceSquared>Math.pow(range+85,2))return 0;
  return Math.sqrt(power)/(8+distanceSquared);
}
