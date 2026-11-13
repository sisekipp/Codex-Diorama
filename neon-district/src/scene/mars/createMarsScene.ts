import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import { HDRCubeTexture } from '@babylonjs/core/Materials/Textures/hdrCubeTexture';
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { SceneController } from '../createScene';
import { marsMaterials } from './materials';
import { createMarsTerrain } from './terrain';
import { createMarsBase } from './base';
import { createMarsTracks } from './tracks';
import { createMarsActors } from './actors';
import { createMarsLaunch } from './launch';
import { createMarsEffects } from './effects';
import { DEFAULT_MARS, daylightState, launchState, percent, type MarsSettings } from './state';
import { createPracticalLighting } from '../practicalLights';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';

export async function createMarsScene(canvas:HTMLCanvasElement,onManual:()=>void):Promise<SceneController>{
  const engine=new Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true,powerPreference:'high-performance'},true);const scene=new Scene(engine);scene.skipPointerMovePicking=true;scene.clearColor=new Color4(.2,.12,.09,1);scene.fogMode=Scene.FOGMODE_EXP2;
  const portrait=window.innerWidth<760,presets={street:{alpha:-1.18,beta:1.08,radius:portrait?205:143,target:new Vector3(-4,5,9)},roofs:{alpha:-1.0,beta:1.27,radius:portrait?83:61,target:new Vector3(42,11,28)},panorama:{alpha:-1.02,beta:.9,radius:portrait?295:238,target:new Vector3(2,6,34)},details:{alpha:-1.75,beta:1.2,radius:portrait?35:23,target:new Vector3(1,1.2,-24)}};
  const home=presets.street,camera=new ArcRotateCamera('ARES explorer',home.alpha,home.beta,home.radius,home.target.clone(),scene);camera.attachControl(canvas,true);camera.minZ=.1;camera.maxZ=1800;camera.lowerRadiusLimit=5;camera.upperRadiusLimit=420;camera.lowerBetaLimit=.32;camera.upperBetaLimit=1.48;camera.wheelDeltaPercentage=.012;camera.pinchDeltaPercentage=.009;camera.panningSensibility=0;camera.angularSensibilityX=900;camera.angularSensibilityY=1100;
  const fill=new HemisphericLight('ARES sky fill',Vector3.Up(),scene);fill.renderPriority=100;fill.intensity=.4;fill.groundColor=new Color3(.2,.1,.065);
  const sun=new DirectionalLight('ARES low evening sun',new Vector3(.7,-.4,.5),scene);sun.position.set(-95,140,-90);sun.renderPriority=90;sun.shadowMinZ=1;sun.shadowMaxZ=440;
  scene.environmentTexture=new HDRCubeTexture('/materials/harbor-light.hdr',scene,64,false,true,false,true);scene.environmentIntensity=.35;
  const m=marsMaterials(scene),terrain=createMarsTerrain(scene,m),tracks=createMarsTracks(scene),base=createMarsBase(scene,m),actors=createMarsActors(scene,m,tracks),launch=createMarsLaunch(scene,m);
  const background=MeshBuilder.CreateGround('ARES distant sand horizon',{width:2400,height:2400},scene);background.position.y=-7;background.material=terrain.ground.material;background.isPickable=false;
  const sky=MeshBuilder.CreateSphere('ARES atmospheric sky',{diameter:2100,segments:24,sideOrientation:Mesh.BACKSIDE},scene);sky.isPickable=false;sky.infiniteDistance=true;
  const skyMaterial=new ShaderMaterial('ARES sunset scattering',scene,{vertexSource:'precision highp float;attribute vec3 position;uniform mat4 worldViewProjection;varying vec3 vDirection;void main(){vDirection=normalize(position);gl_Position=worldViewProjection*vec4(position,1.0);}',fragmentSource:'precision highp float;varying vec3 vDirection;uniform float day;uniform float warm;void main(){float h=clamp(vDirection.y,0.0,1.0);vec3 horizon=mix(vec3(.035,.025,.035),mix(vec3(.64,.47,.33),vec3(.67,.39,.22),warm),day);vec3 zenith=mix(vec3(.008,.015,.03),vec3(.26,.27,.29),day);vec3 color=mix(horizon,zenith,pow(h,.45));float star=fract(sin(dot(floor(vDirection.xz*1300.0),vec2(127.1,311.7)))*43758.5);color+=step(.999,star)*(1.0-day)*step(.1,h)*.35;gl_FragColor=vec4(color,1.0);}'},{attributes:['position'],uniforms:['worldViewProjection','day','warm']});skyMaterial.backFaceCulling=false;skyMaterial.disableDepthWrite=true;sky.material=skyMaterial;
  const sunDisc=MeshBuilder.CreateSphere('ARES distant sun',{diameter:10,segments:16},scene);sunDisc.material=m.lamp;sunDisc.isPickable=false;
  const moon=MeshBuilder.CreateIcoSphere('ARES distant moon',{radius:3.8,subdivisions:2},scene);moon.position.set(-180,155,350);moon.material=m.stone;moon.isPickable=false;
  const shadows=new ShadowGenerator(1536,sun);shadows.usePoissonSampling=true;shadows.bias=.001;shadows.normalBias=.07;shadows.setDarkness(.35);
  for(const mesh of scene.meshes){if(!mesh.isVisible||mesh===terrain.ground||mesh===sky||mesh===background||mesh===moon||mesh===sunDisc||mesh.material===m.glass||mesh.material instanceof ShaderMaterial)continue;if(mesh.parent===launch.vehicle||mesh.name==='ARES detailed wind-carved sand'||mesh.name.includes('distant')||mesh.name.includes('geological'))continue;if(mesh.name==='ARES scattered rock'&&(mesh.scaling.x<.8||mesh.position.length()>90))continue;shadows.addShadowCaster(mesh,false);if(mesh.getClassName()!=='InstancedMesh')mesh.receiveShadows=true;}
  const effects=createMarsEffects(scene,camera,launch),practical=createPracticalLighting(scene),glow=new GlowLayer('ARES engine and habitat glow',scene,{mainTextureRatio:.4,blurKernelSize:32});glow.intensity=.38;
  let settings:MarsSettings={...DEFAULT_MARS},time=0,launchStart=0,orbit=false,followLaunch=false,target:typeof home|null=null,low=portrait;
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const atmosphere=()=>{const light=daylightState(settings.daylight);sun.direction.set(.7,-Math.max(.035,light.elevation),.5);sun.direction.normalize();sun.intensity=light.elevation<=0?.015:1.4+light.day*1.1;sun.diffuse=Color3.FromHexString(light.warm>.45?'#ffc486':'#fff0cf').toLinearSpace();fill.intensity=.17+light.day*.27;fill.diffuse=Color3.FromHexString('#c6b19e').toLinearSpace();scene.fogColor=Color3.FromHexString(light.day>.2?'#ad7955':'#29212a').toLinearSpace();scene.fogDensity=.0014+settings.dust*.000043;skyMaterial.setFloat('day',light.day);skyMaterial.setFloat('warm',light.warm);sunDisc.position.copyFrom(sun.direction.scale(-800));sunDisc.setEnabled(light.elevation>0);return light;};
  const quality=(value:'high'|'low')=>{low=value==='low';engine.setHardwareScalingLevel(low?Math.max(1.6,window.devicePixelRatio):Math.max(1,window.devicePixelRatio/1.5));practical.setLow(low);actors.setLow(low);effects.setLow(low);glow.isEnabled=!low;const map=shadows.getShadowMap();if(map)map.refreshRate=low?2:1;engine.resize();};
  quality(low?'low':'high');atmosphere();actors.update(0,true);base.update(0,true);launch.update(launchState(0),true);effects.update(0,launchState(0),settings,true);tracks.update(0,settings.wind,daylightState(settings.daylight).day);
  const stop=()=>{target=null;followLaunch=false;orbit=false;onManual();};canvas.addEventListener('pointerdown',stop);canvas.addEventListener('wheel',stop,{passive:true});const resize=()=>engine.resize();window.addEventListener('resize',resize);
  const render=()=>{const dt=Math.min(engine.getDeltaTime()/1000,.05);if(!media.matches)time+=dt;if(orbit&&!media.matches)camera.alpha+=dt*.035;const state=launchState(media.matches?0:time-launchStart);if(followLaunch){target={...presets.roofs,radius:presets.roofs.radius+Math.min(state.height*.14,90),target:new Vector3(42,launch.padY+state.height+10,28)};}if(target){const factor=1-Math.exp(-dt*4);camera.alpha+=(target.alpha-camera.alpha)*factor;camera.beta+=(target.beta-camera.beta)*factor;camera.radius+=(target.radius-camera.radius)*factor;camera.target=Vector3.Lerp(camera.target,target.target,factor);if(Math.abs(camera.radius-target.radius)<.02&&Math.abs(camera.alpha-target.alpha)<.001)target=null;}
    actors.update(time,media.matches);base.update(time,media.matches);launch.update(state,media.matches);effects.update(time,state,settings,media.matches);tracks.update(time,settings.wind,daylightState(settings.daylight).day);practical.update();scene.render();};
  const visibility=()=>{if(document.hidden)engine.stopRenderLoop(render);else engine.runRenderLoop(render);};document.addEventListener('visibilitychange',visibility);
  const cleanup=()=>{window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('pointerdown',stop);canvas.removeEventListener('wheel',stop);engine.stopRenderLoop(render);scene.dispose();engine.dispose();};
  const warmup=()=>scene.render();engine.runRenderLoop(warmup);try{await scene.whenReadyAsync();}catch(error){cleanup();throw error;}finally{engine.stopRenderLoop(warmup);}engine.runRenderLoop(render);
  return {zoom(direction){target=null;followLaunch=false;camera.radius=Math.max(5,Math.min(420,camera.radius+direction*Math.max(.8,Math.min(16,camera.radius*.15))));},reset(){followLaunch=false;target=home;orbit=false;onManual();},preset(name){followLaunch=name==='roofs';target=presets[name];orbit=false;onManual();},setOrbit(value){followLaunch=false;orbit=value;target=null;},setQuality:quality,setRain(){},setSmoke(){},setWetness(){},setMars(value){settings={wind:percent(value.wind),dust:percent(value.dust),daylight:percent(value.daylight)};atmosphere();},restartLaunch(){launchStart=time;effects.restart();},diagnostics(){return {alpha:camera.alpha,beta:camera.beta,radius:camera.radius,meshes:scene.meshes.length,fps:engine.getFps(),rain:0,smoke:settings.dust,wetness:0,orbit,...actors.counts,...tracks.diagnostics(),launch:launchState(media.matches?0:time-launchStart)};},dispose:cleanup};
}
