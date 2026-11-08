import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
async function moduleAt(name){const source=fs.readFileSync(new URL('../src/scene/'+name+'.ts',import.meta.url),'utf8');const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));}
const {rollingAngle,streetDrive,rotorAngle}=await moduleAt('motionMath');
const {rankLight}=await moduleAt('renderMath');
test('one tire circumference produces one revolution with signed direction',()=>{const radius=.457;assert.ok(Math.abs(rollingAngle(Math.PI*2*radius,radius)-Math.PI*2)<1e-12);assert.equal(rollingAngle(-radius,radius),-1);assert.equal(rollingAngle(0,radius),0);assert.equal(rollingAngle(5,0),0);});
test('passing car wheel travel follows road speed without spinning backward at recycling',()=>{for(const t of [0,20,50,101]){const a=streetDrive(t),b=streetDrive(t+.1);assert.ok(Math.abs((b.distance-a.distance)+.1)<1e-9);assert.ok(Math.abs((b.z-a.z)+.1)<1e-9);}assert.ok(streetDrive(102.01).z>streetDrive(101.99).z);assert.ok(streetDrive(102.01).distance<streetDrive(101.99).distance);});
test('reduced motion stops fan rotation while ordinary fan speeds differ',()=>{assert.equal(rotorAngle(5,18,true),0);assert.equal(rotorAngle(0,18),0);assert.ok(rotorAngle(5,18)>rotorAngle(5,3));});
test('nearby practical lamps outrank distant brighter lamps and invalid candidates are excluded',()=>{assert.ok(rankLight(4,40,20)>rankLight(400,100,30));assert.equal(rankLight(20000,40,10),0);assert.equal(rankLight(5,0,10),0);assert.equal(rankLight(NaN,30,20),0);});
