import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer';
import { HDRCubeTexture } from '@babylonjs/core/Materials/Textures/hdrCubeTexture';
import { MirrorTexture } from '@babylonjs/core/Materials/Textures/mirrorTexture';
import { Plane } from '@babylonjs/core/Maths/math.plane';
import { createMaterials } from './materials';
import { buildCity } from './city';
import { buildMegacity } from './megacity';
import { createAtmosphere } from './atmosphere';
import { populateStreet } from './streetLife';
import { refineEnvironment } from './environmentRefinement';
import { upgradeSceneSurfaces } from './surfaceMaps';
import { createPracticalLighting } from './practicalLights';
import { createWetStreet } from './wetStreet';
import { clampPercent, DEFAULT_WEATHER } from './weather';
import '@babylonjs/core/Engines/Extensions/engine.dynamicTexture';
import '@babylonjs/core/Collisions/collisionCoordinator';
import '@babylonjs/core/Rendering/edgesRenderer';
import '@babylonjs/core/Rendering/boundingBoxRenderer';
import '@babylonjs/core/Materials/Textures/Loaders/envTextureLoader';

export type SceneKind='district'|'megacity'|'mars'|'polar';
export type Preset='street'|'roofs'|'panorama'|'details';
import type { PolarSettings, ArrivalState } from './polar/state';
import type { MarsSettings, LaunchState } from './mars/state';
export type SceneController={resetSnow?:()=>void;setPolar?:(settings:PolarSettings)=>void;restartArrival?:()=>void;setMars?:(settings:MarsSettings)=>void;restartLaunch?:()=>void;zoom:(direction:number)=>void;reset:()=>void;preset:(name:Preset)=>void;setRain:(value:number)=>void;setSmoke:(value:number)=>void;setWetness:(value:number)=>void;setOrbit:(on:boolean)=>void;setQuality:(quality:'high'|'low')=>void;diagnostics:()=>{alpha:number;beta:number;radius:number;meshes:number;fps:number;rain:number;smoke:number;wetness:number;orbit:boolean;cars:number;motorcycles:number;astronauts?:number;footprints?:number;tireMarks?:number;launch?:LaunchState;arrival?:ArrivalState};dispose:()=>void};
const districtPresets={details:{alpha:-1.5,beta:1.26,radius:15,target:new Vector3(7.5,1.5,-18)},street:{alpha:-1.64,beta:1.47,radius:44,target:new Vector3(0,4,5)},roofs:{alpha:-.85,beta:.73,radius:66,target:new Vector3(0,17,15)},panorama:{alpha:-1.2,beta:1.04,radius:100,target:new Vector3(0,21,22)}};
export async function createDistrict(canvas:HTMLCanvasElement,onManual:()=>void,kind:SceneKind='district'):Promise<SceneController>{
  if(kind==='polar'){const {createPolarScene}=await import('./polar/createPolarScene');return createPolarScene(canvas,onManual);}
  if(kind==='mars'){const {createMarsScene}=await import('./mars/createMarsScene');return createMarsScene(canvas,onManual);}
  const mega=kind==='megacity';
  const presets=mega?{details:{alpha:-2.0,beta:1.08,radius:13.5,target:new Vector3(29.5,85,-71.8)},street:{alpha:-1.3,beta:1.4,radius:110,target:new Vector3(16,89,-19)},roofs:{alpha:-1.52,beta:1.4,radius:91,target:new Vector3(-4,92,10)},panorama:{alpha:-1.08,beta:.97,radius:355,target:new Vector3(0,125,30)}}:{...districtPresets};
  if(window.innerWidth<760){presets.details=mega?{...presets.details,radius:20}:{...presets.details,alpha:-1.8,radius:19.5,target:new Vector3(5.2,1.2,-18.3)};}
  const minRadius=mega?7:4,maxRadius=mega?520:120;
  const engine=new Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true,powerPreference:'high-performance'},true);
  engine.setHardwareScalingLevel(Math.max(1,window.devicePixelRatio/1.5));
  const scene=new Scene(engine);scene.skipPointerMovePicking=true;scene.collisionsEnabled=true;scene.clearColor=new Color4(.027,.045,.075,1);scene.ambientColor=new Color3(.16,.2,.3);scene.fogMode=Scene.FOGMODE_EXP2;scene.fogColor=new Color3(.045,.08,.12);scene.fogDensity=mega?.0028:.009;
  const home=presets.street;const camera=new ArcRotateCamera('explorer',home.alpha,home.beta,home.radius,home.target.clone(),scene);
  camera.attachControl(canvas,true);camera.checkCollisions=true;camera.collisionRadius=new Vector3(.7,.7,.7);camera.lowerRadiusLimit=minRadius;camera.upperRadiusLimit=maxRadius;camera.lowerBetaLimit=.38;camera.upperBetaLimit=1.51;camera.minZ=.3;camera.maxZ=mega?1500:350;camera.wheelDeltaPercentage=.012;camera.pinchDeltaPercentage=.008;camera.panningSensibility=0;camera.angularSensibilityX=900;camera.angularSensibilityY=1100;
  const hemi=new HemisphericLight('night ambient',new Vector3(0,1,0),scene);hemi.intensity=.38;hemi.diffuse=new Color3(.45,.65,.83);hemi.groundColor=new Color3(.1,.14,.24);
  const moon=new DirectionalLight('moonlight',new Vector3(.5,-1,.3),scene);moon.intensity=.55;moon.diffuse=new Color3(.37,.6,.85);
  if(!mega){const environment=new HDRCubeTexture('/materials/harbor-light.hdr',scene,64,false,true,false,true);environment.rotationY=2.1;scene.environmentTexture=environment;scene.environmentIntensity=.3;}
  const materials=createMaterials(scene);
  const city=mega?buildMegacity(scene,materials):buildCity(scene,materials);
  let life:{update:(time:number,reducedMotion:boolean)=>void;counts:{cars:number;motorcycles:number}};
  try{life='update' in city?city:populateStreet(scene,materials,city.car,city.reflectors);}catch(error){scene.dispose();engine.dispose();throw error;}
  if(!mega){
    moon.position.set(-8,24,-25);moon.shadowMinZ=1;moon.shadowMaxZ=100;
    const shadows=new ShadowGenerator(1024,moon);shadows.usePoissonSampling=true;shadows.bias=.001;shadows.normalBias=.025;shadows.setDarkness(.45);
    for(const mesh of scene.meshes){if(mesh.material?.name==='closeup smoked cockpit glazing')continue;let owner=mesh.parent;while(owner){if(/parked electric coupe|parked scarlet coupe|slow passing electric coupe|parked street motorcycle|second parked motorcycle|KISEKI open workshop/.test(owner.name)){shadows.addShadowCaster(mesh,false);break;}owner=owner.parent;}}
    city.road.receiveShadows=true;
  }
  const refinement=refineEnvironment(scene,mega);
  const surfaces=upgradeSceneSurfaces(scene),practical=createPracticalLighting(scene);practical.setLow(window.innerWidth<700);
  const rotatingVents=scene.meshes.filter(mesh=>mesh.name==='fan blade').map(mesh=>{mesh.unfreezeWorldMatrix();return {mesh,base:mesh.rotation.y};});
  const glow=new GlowLayer('neon bloom',scene,{mainTextureRatio:.45,blurKernelSize:40});glow.intensity=mega?.38:.55;
  const mirror=new MirrorTexture('wet street reflections',512,scene,true);mirror.mirrorPlane=new Plane(0,-1,0,.035);mirror.renderList=[...city.reflectors,...scene.meshes.filter(mesh=>mesh.isVisible&&(/closeup (headlight|rear|status) lenses/.test(mesh.material?.name??'')||mesh.name==='reverse sign face'))];mirror.level=.85;mirror.blurKernel=12;mirror.clearColor=new Color4(0,0,0,1);mirror.renderParticles=false;
  materials.wetPuddle.reflectionTexture=mirror;materials.asphalt.specularColor=new Color3(.5,.6,.7);materials.asphalt.specularPower=90;
  // Replace the old rectangular neon patches with one continuous, distorted water film.
  scene.meshes.filter(mesh=>mesh.name==='neon puddle').forEach(mesh=>mesh.setEnabled(false));
  const wetStreet=createWetStreet(scene,mirror);
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');const atmosphere=createAtmosphere(scene,media.matches,mega);
  let orbit=false,raining=DEFAULT_WEATHER.rain,smoke=DEFAULT_WEATHER.smoke,time=0,target:typeof home|null=null;
  const setWetness=(value:number)=>{const amount=clampPercent(value);wetStreet.setWetness(amount);surfaces.setWetness(amount);if('setWetness' in city)city.setWetness(amount);materials.wetPuddle.alpha=amount/100*.3;materials.asphalt.specularPower=18+amount;materials.asphalt.specularColor=new Color3(.12+amount*.005,.15+amount*.005,.17+amount*.005);};setWetness(DEFAULT_WEATHER.wetness);
  const stop=()=>{orbit=false;target=null;onManual();};canvas.addEventListener('pointerdown',stop);canvas.addEventListener('wheel',stop,{passive:true});
  const resize=()=>engine.resize();window.addEventListener('resize',resize);
  let wasRunning=true;
  const render=()=>{
    const dt=Math.min(engine.getDeltaTime()/1000,.05);if(!media.matches)time+=dt;
    if(orbit&&!media.matches)camera.alpha+=dt*.045;
    if(target){const factor=1-Math.exp(-dt*4);camera.alpha+=(target.alpha-camera.alpha)*factor;camera.beta+=(target.beta-camera.beta)*factor;camera.radius+=(target.radius-camera.radius)*factor;camera.target=Vector3.Lerp(camera.target,target.target,factor);if(Math.abs(camera.radius-target.radius)<.02&&Math.abs(camera.alpha-target.alpha)<.001)target=null;}
    life.update(time,media.matches);refinement.update(time,media.matches);rotatingVents.forEach(({mesh,base})=>{mesh.rotation.y=base+time*.8;});practical.update();wetStreet.setLights(practical.filmLights());wetStreet.update(time,media.matches?0:raining);scene.render();
  };
  const visibility=()=>{if(document.hidden){engine.stopRenderLoop(render);wasRunning=false;}else if(!wasRunning){engine.runRenderLoop(render);wasRunning=true;}};document.addEventListener('visibilitychange',visibility);
  try{await scene.whenReadyAsync();}catch(error){window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('pointerdown',stop);canvas.removeEventListener('wheel',stop);scene.dispose();engine.dispose();throw error;}
  engine.runRenderLoop(render);
  return {
    zoom(direction){target=null;camera.inertialRadiusOffset=0;camera.radius=Math.min(maxRadius,Math.max(minRadius,camera.radius+direction*Math.max(.8,Math.min(mega?12:5,camera.radius*.16))));},reset(){orbit=false;camera.checkCollisions=true;target=home;onManual();},preset(name){orbit=false;camera.checkCollisions=name!=='details';target=presets[name];onManual();},
    setRain(value){raining=clampPercent(value);atmosphere.setRain(raining);},setSmoke(value){smoke=clampPercent(value);atmosphere.setSmoke(smoke);},setWetness,
    setOrbit(on){orbit=on;target=null;},setQuality(quality){const low=quality==='low';engine.setHardwareScalingLevel(low?Math.max(1.7,window.devicePixelRatio):Math.max(1,window.devicePixelRatio/1.5));glow.isEnabled=!low;mirror.refreshRate=low?2:1;atmosphere.setLow(low);practical.setLow(low);if('setQuality' in city)city.setQuality(low);engine.resize();},
    diagnostics(){return {alpha:camera.alpha,beta:camera.beta,radius:camera.radius,meshes:scene.meshes.length,fps:engine.getFps(),rain:raining,smoke,wetness:wetStreet.getWetness(),orbit,...life.counts};},
    dispose(){window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('pointerdown',stop);canvas.removeEventListener('wheel',stop);engine.stopRenderLoop(render);scene.dispose();engine.dispose();}
  };
}
