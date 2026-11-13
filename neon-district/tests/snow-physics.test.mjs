import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../src/scene/polar/snowPhysics.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {SnowPhysics}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const make=(opts={})=>new SnowPhysics({left:-12,back:12,columns:96,rows:96,spacing:.25,surface:()=>1.1,depth:()=>.65,...opts});
const conserve=s=>{const b=s.massBalance();assert.ok(Math.abs(b.error)<Math.max(.00001,b.initial*1e-8),JSON.stringify(b));};
test('contacts compact real mass and transfer it into shoulders without changing total kg',()=>{const s=make(),initial=s.height(0,0);s.contact('tire',0,0,0,0);assert.ok(s.height(0,0)<initial-.04);assert.ok(s.compactionAt(0,0)>0);assert.ok(s.height(.75,0)>initial);conserve(s);});
test('repeat contact on compacted snow has less remaining compression',()=>{const s=make();const h0=s.height(0,0);s.contact('foot',0,0,0,0);const h1=s.height(0,0);s.contact('foot',0,0,0,1);const h2=s.height(0,0);assert.ok(h0-h1>h1-h2);for(let i=0;i<200;i++)s.contact('foot',0,0,0,i);assert.ok(s.height(0,0)>=s.bedAt(0,0));conserve(s);});
test('swept plow removes a continuous lane and grows an actual discharge-side windrow',()=>{const s=make();for(let z=6;z>-5;z-=.15)s.plow({x:0,z,yaw:0,cut:.68,width:5,speed:2,distance:.15});assert.ok(s.height(0,0)<.85);assert.ok(s.height(3.2,0)>1.12);assert.ok(s.particles.length>0);conserve(s);});
test('ballistic clumps return their exact mass when they land, with no capacity leak',()=>{const s=make({particleLimit:6});for(let z=5;z>-5;z-=.2)s.plow({x:0,z,yaw:0,cut:.68,width:5,speed:3,distance:.2});const airborne=s.massBalance().airborne;assert.ok(airborne>0);for(let i=0;i<900;i++)s.step(1/60,0,0);assert.equal(s.particles.length,0);conserve(s);});
test('over-steep snow heaps slump and maintain mass',()=>{const s=make();s.deposit(0,0,130,0);const h=s.height(0,0);for(let i=0;i<150;i++)s.step(1/30,0,0);assert.ok(s.height(0,0)<h-.2);assert.ok(s.height(.75,0)>1.1);conserve(s);});
test('wind transports existing snow and precipitation is an explicit mass input',()=>{const s=make();s.contact('tire',0,0,0,0);for(let i=0;i<180;i++)s.step(1/30,100,0);conserve(s);for(let i=0;i<90;i++)s.step(1/30,40,100);assert.ok(s.massBalance().precipitation>0);conserve(s);});
test('zero displacement and stopped plows do not carve or eject snow',()=>{const s=make();s.plow({x:0,z:0,yaw:0,cut:.4,width:5,speed:0,distance:0});assert.equal(s.height(0,0),1.1);assert.equal(s.particles.length,0);conserve(s);});
test('boundary contacts, extreme input dt and long operation stay finite and never go below bed',()=>{const s=make();for(let i=0;i<100;i++){s.contact('ski',-11.8,11.8-i*.18,i*.05,i);s.plow({x:11.8,z:11-i*.2,yaw:Math.PI/2,cut:.4,width:5,speed:20,distance:.6});s.step(i%2?1:0,100,0);}for(let i=0;i<s.mass.length;i++){assert.ok(Number.isFinite(s.mass[i])&&s.mass[i]>=0);assert.ok(s.surfaceAt(i)>=s.bed[i]-.00001);}conserve(s);});

test('an explicit fresh snow reset restores the starting state and a new conservation budget',()=>{const s=make();s.contact('foot',0,0,0,0);s.deposit(0,0,20);s.plow({x:0,z:0,yaw:0,cut:.4,width:5,speed:3,distance:.2});s.reset();assert.equal(s.height(0,0),1.1);assert.equal(s.particles.length,0);assert.equal(s.active.size,0);assert.equal(s.massBalance().added,0);assert.equal(s.bladeKg,0);conserve(s);});
