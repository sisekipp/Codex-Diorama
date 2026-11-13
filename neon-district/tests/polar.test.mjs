import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';
function moduleUrl(name){const source=fs.readFileSync(new URL('../src/scene/polar/'+name+'.ts',import.meta.url),'utf8');let js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;js=js.replace(/from ['"]\.\/([\w]+)['"]/g,(_,dependency)=>`from '${moduleUrl(dependency)}'`);return 'data:text/javascript;base64,'+Buffer.from(js).toString('base64');}
async function load(name){return import(moduleUrl(name));}
const {arrivalState,trackOpacity,polarDaylight,percent}=await load('state'),{snowHeight,shoreX}=await load('terrainMath');
test('transport touches down before rollout and only opens ramp after taxi',()=>{assert.ok(arrivalState(13).height>0);assert.equal(arrivalState(14).height,0);for(const t of [0,14,26,38.9])assert.equal(arrivalState(t).ramp,0);assert.equal(arrivalState(45).ramp,1);assert.equal(arrivalState(49).speed,0);assert.equal(arrivalState(49).propeller,0);});
test('arrival position and height are continuous across touchdown, taxi and parking',()=>{for(const t of [14,26,39,45]){const a=arrivalState(t-.0001),b=arrivalState(t+.0001);assert.ok(Math.hypot(a.x-b.x,a.z-b.z,a.height-b.height)<.01);}assert.deepEqual([0,14,26,39,45].map(t=>arrivalState(t).phase),['approach','rollout','taxi','unloading','complete']);assert.equal(arrivalState(NaN).elapsed,0);});
test('rollout decelerates, does not reverse and stays on snow runway',()=>{let z=80,speed=20;for(let t=14;t<=26;t+=.1){const a=arrivalState(t);assert.equal(a.x,64);assert.ok(a.z<=z+.00001);assert.ok(a.speed<=speed);z=a.z;speed=a.speed;}});
test('runway and module anchors are flat, coastal bay lies below water',()=>{for(const z of [-90,0,100])assert.equal(snowHeight(64,z),1.1);assert.equal(snowHeight(0,5),1.1);assert.ok(snowHeight(-100,0)<-1);for(const z of [-100,0,100])assert.ok(snowHeight(shoreX(z)-5,z)<-1);assert.ok(Math.abs(snowHeight(90.001,72)-snowHeight(90,72))<.01);});
test('wind fills older snow tracks faster and lighting spans night and day',()=>{assert.ok(trackOpacity(80,0)>trackOpacity(80,100));assert.equal(trackOpacity(400,0),0);assert.equal(trackOpacity(-1,100),1);assert.ok(polarDaylight(50).day>polarDaylight(0).day);assert.equal(percent(NaN),0);assert.equal(percent(150),100);});

const {skiDisplacement}=await load('snowMath');
test('ski motion compresses central snow and pushes raised shoulders on both sides',()=>{assert.equal(skiDisplacement(0,0),-.13);assert.ok(skiDisplacement(.95,0)>0);assert.equal(skiDisplacement(.95,0),skiDisplacement(-.95,0));assert.equal(skiDisplacement(2,0),0);assert.equal(skiDisplacement(0,2),0);assert.ok(Math.abs(skiDisplacement(0,.9))<Math.abs(skiDisplacement(0,0)));});

const {mountainHeight,glacierHeight}=await load('terrainMath');
test('the entire transport envelope clears mountain range and glacier throughout approach',()=>{for(let t=0;t<=14;t+=.025){const s=arrivalState(t);for(const [x,z,bottom]of [[0,-12.34,.05],[-1.82,-1.35,.05],[1.82,-1.35,.05],[-18.3,2,4.2],[18.3,2,4.2],[0,-15.5,1.8],[0,15.5,2.1]]){const wx=s.x+x,wz=s.z+z,glacier=wz>148&&wz<201?glacierHeight(wx)+8*(1-(Math.abs(wx-64)<=26?1:0)):-4;const mountain=wz>95?mountainHeight(wx,wz):-4;const surface=Math.max(snowHeight(wx,wz),glacier,mountain);assert.ok(1.1+s.height+bottom>surface-.001,`terrain collision at t=${t}, x=${wx}, z=${wz}`);}}});

const {createServiceCircuit,serviceRoutes}=await load('routes');
test('service routes cover the base and remain continuous across their loop and loading stops',()=>{
  for(const points of Object.values(serviceRoutes)){const route=createServiceCircuit(points,3,{0:5,5:4});assert.ok(route.length>300);assert.deepEqual(route.pose(0),route.pose(route.duration));assert.equal(route.pose(2).stopped,true);assert.equal(route.pose(2).distance,0);let last=route.pose(0);for(let t=.1;t<route.duration+1;t+=.1){const p=route.pose(t);assert.ok(Math.hypot(p.x-last.x,p.z-last.z)<.31,'no teleport or excess speed');last=p;}}
});
test('all moving vehicles clear buildings and the parked aircraft with a two metre margin',()=>{
  const obstacles=[[-28.5,-11.5,-22,-10],[-17.5,-2.5,3.5,12.5],[2.5,15.5,7.5,16.5],[-16.5,.5,24,32],[19.5,30.5,25.5,28.5],[22,28,13,17],[21,55,-55,-25]];
  for(const [name,points]of Object.entries(serviceRoutes))for(const p of createServiceCircuit(points,3).samples)for(const [x1,x2,z1,z2]of obstacles)assert.ok(!(p.x>x1-2&&p.x<x2+2&&p.z>z1-2&&p.z<z2+2),name+' intersects obstacle');
});
const {snowDisplacement}=await load('snowMath');
test('boots and crawler tracks displace real snow into raised shoulders',()=>{for(const kind of ['foot','tire']){assert.ok(snowDisplacement(kind,0,0)<-.09);assert.ok(snowDisplacement(kind,kind==='foot'?.33:.57,0)>0);assert.equal(snowDisplacement(kind,2,2),0);}assert.ok(snowDisplacement('tire',0,0)<snowDisplacement('foot',0,0));});

const {shouldYieldServiceTraffic}=await load('routes');
test('traffic yields before a predicted crossing while the plow keeps priority',()=>{const circuit=createServiceCircuit(serviceRoutes.plow,2),vehicles=[{circuit,clock:0},{circuit,clock:1}];assert.equal(shouldYieldServiceTraffic(vehicles,0),false);assert.equal(shouldYieldServiceTraffic(vehicles,1),true);vehicles[1].clock=circuit.duration/2;assert.equal(shouldYieldServiceTraffic(vehicles,1),false);});
