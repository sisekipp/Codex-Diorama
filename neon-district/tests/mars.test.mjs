import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
async function load(name){const source=fs.readFileSync(new URL('../src/scene/mars/'+name+'.ts',import.meta.url),'utf8');const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));}
const {launchState,trailOpacity,daylightState}=await load('state'),{terrainHeight}=await load('terrainMath');
test('rocket remains on pad during countdown and ignition; arms retract before liftoff',()=>{for(const t of [0,4,7.9,8,11.9])assert.equal(launchState(t).height,0);assert.equal(launchState(8).arm,1);assert.ok(launchState(12.1).height>0);});
test('launch has ordered phases and a reproducible restart',()=>{assert.deepEqual([0,8,12,19,36].map(t=>launchState(t).phase),['countdown','ignition','liftoff','ascent','complete']);assert.equal(launchState(0).remaining,8);assert.equal(launchState(0).throttle,0);assert.equal(launchState(NaN).elapsed,0);});
test('ascent height is continuous and rises while pad dust falls with altitude',()=>{let height=0;for(let t=12;t<37;t+=.1){const state=launchState(t);assert.ok(state.height>=height);height=state.height;}assert.ok(launchState(16).groundDust>launchState(28).groundDust);assert.equal(launchState(40).throttle,0);});
test('moving tracks persist then weather faster in stronger wind',()=>{assert.equal(trailOpacity(0,80),1);assert.ok(trailOpacity(40,10)>trailOpacity(40,90));assert.equal(trailOpacity(300,0),0);assert.equal(trailOpacity(-1,20),1);});
test('terrain has genuine relief and flat structural anchor zones',()=>{assert.equal(terrainHeight(-17,10),.6);assert.equal(terrainHeight(42,28),1);const h=Array.from({length:50},(_,i)=>terrainHeight(i*4-100,76));assert.ok(Math.max(...h)-Math.min(...h)>6);for(const x of [-70,-11,0,35,90])assert.ok(Math.abs(terrainHeight(x+.001,62)-terrainHeight(x,62))<.02);});
test('daytime lighting is brighter than night and dusk is warmer than noon',()=>{assert.ok(daylightState(50).day>daylightState(0).day);assert.ok(daylightState(85).warm>daylightState(50).warm);});
