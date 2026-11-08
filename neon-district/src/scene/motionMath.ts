/** Signed travel in local Z, matching a wheel axle along local +X. */
export function rollingAngle(distance:number,radius:number){
  return Number.isFinite(distance)&&Number.isFinite(radius)&&radius>0?distance/radius:0;
}
export function streetDrive(time:number){return {z:55-((time+18)%120),distance:-(time+18)};}
/** A stopped fan remains static; flight lift fans rotate continuously. */
export function rotorAngle(time:number,speed:number,reduced=false){return reduced?0:time*speed;}
