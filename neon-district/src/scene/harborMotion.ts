export function getTrainState(time:number,direction:number,offset=0){
  const clock=((time+offset)%86+86)%86;
  const travel=clock<26?-210*Math.pow(1-clock/26,2):clock<39?0:240*Math.pow((clock-39)/47,1.7);
  const boarding=clock>=26&&clock<39;
  const open=boarding?Math.max(0,Math.min(1,(clock-26)*2,(39-clock)*2)):0;
  return {z:direction*travel+(direction>0?24:0),doorOffset:open*.8,boarding};
}
