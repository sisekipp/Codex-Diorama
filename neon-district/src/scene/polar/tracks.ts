import type { Scene } from '@babylonjs/core/scene';
import type { SnowSurface } from './snowDeformation';
/** Contacts feed the material solver. No flat coloured decal quads on top of the snow. */
export function createPolarTracks(_scene:Scene,surface:SnowSurface){
  const counts={footprints:0,tireMarks:0,skiMarks:0};
  return {height:surface.height,referenceHeight:surface.referenceHeight,plow:surface.plow,stamp(kind:'foot'|'tire'|'ski',x:number,z:number,yaw:number,time:number){surface.stamp(kind,x,z,yaw,time);const key=kind==='foot'?'footprints':kind==='ski'?'skiMarks':'tireMarks';counts[key]++;},update(_time:number,_wind:number,_day:number){},diagnostics(){return {...counts};}};
}
export type PolarTracks=ReturnType<typeof createPolarTracks>;
