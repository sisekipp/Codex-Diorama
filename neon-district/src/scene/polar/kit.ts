import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { modelAssembly } from '../modelAssembly';
import type { PolarMaterials } from './materials';
export const v=(x:number,y:number,z:number)=>new Vector3(x,y,z);
export function lamp(scene:Scene,name:string,parent:TransformNode,x:number,y:number,z:number,color='#ffd29b',power=90,range=16,direction=[0,-1,0],angle=2.2){const node=new TransformNode(name,scene);node.parent=parent;node.position.set(x,y,z);node.metadata={lamps:[{color,power,range,kind:'spot',direction,angle}]};return node;}
export function icicles(a:ReturnType<typeof modelAssembly>,m:PolarMaterials,x:number,y:number,z:number,count:number,span:number){for(let i=0;i<count;i++){const h=.15+.45*(.5+.5*Math.sin(i*7.13+x));const mesh=a.cylinder('hanging translucent icicle',x-span/2+i*span/Math.max(1,count-1),y-h/2,z,.085,h,m.ice);mesh.scaling.x=.55;}}
export function railing(a:ReturnType<typeof modelAssembly>,m:PolarMaterials,p:Vector3,q:Vector3){a.beam('handrail',p.add(v(0,1,0)),q.add(v(0,1,0)),.055,m.steel);a.beam('mid rail',p.add(v(0,.5,0)),q.add(v(0,.5,0)),.035,m.steel);const n=Math.ceil(Vector3.Distance(p,q)/1.6);for(let i=0;i<=n;i++){const r=Vector3.Lerp(p,q,i/n);a.beam('stanchion',r,r.add(v(0,1.05,0)),.06,m.steel);}}
