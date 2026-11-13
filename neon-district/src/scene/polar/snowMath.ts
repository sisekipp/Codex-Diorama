/** Local ski cross section: compressed central trough and displaced shoulder ridges. */
export function skiDisplacement(cross:number,along:number){const falloff=Math.max(0,1-Math.abs(along)/1.05);if(!falloff)return 0;if(Math.abs(cross)<.63)return -.13*falloff;if(Math.abs(cross)<1.35)return Math.max(0,.12*(1-Math.abs(Math.abs(cross)-.95)/.4)*falloff);return 0;}
export type SnowImprint='foot'|'tire'|'ski';
/** Compaction trough and positive, displaced powder shoulders (metres). */
export function snowDisplacement(kind:SnowImprint,cross:number,along:number){
  if(kind==='ski')return skiDisplacement(cross,along);
  const width=kind==='foot'?.22:.39,halfLength=kind==='foot'?.34:.62;
  const longitudinal=Math.max(0,1-(along/halfLength)**2);if(!longitudinal)return 0;
  const d=Math.abs(cross),depth=kind==='foot'?.1:.17;
  if(d<width)return -depth*Math.sqrt(1-(d/width)**2)*longitudinal;
  const shoulder=kind==='foot'?.24:.38,t=(d-width)/shoulder;
  return t<1?(kind==='foot'?.045:.095)*Math.sin(Math.PI*t)*longitudinal:0;
}
