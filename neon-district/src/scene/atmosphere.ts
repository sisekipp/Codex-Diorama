import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color4 } from '@babylonjs/core/Maths/math.color';
import type { Scene } from '@babylonjs/core/scene';
import { DEFAULT_WEATHER, clampPercent, getWeatherRates } from './weather';

export function createAtmosphere(scene: Scene, reducedMotion: boolean, megacity = false) {
  let rainAmount = DEFAULT_WEATHER.rain, smokeAmount = DEFAULT_WEATHER.smoke, low = false;
  const dropTexture = new DynamicTexture('rain streak', {width:32,height:128}, scene, false);
  const dc = dropTexture.getContext() as CanvasRenderingContext2D;
  dc.clearRect(0,0,32,128); const dg=dc.createLinearGradient(0,0,0,128);
  dg.addColorStop(0,'rgba(190,220,235,0)');dg.addColorStop(.7,'rgba(190,225,240,.85)');dg.addColorStop(1,'rgba(220,240,255,0)');dc.fillStyle=dg;dc.fillRect(12,0,7,128);dropTexture.update();
  const rain=new ParticleSystem('configurable rainfall',8000,scene);
  rain.particleTexture=dropTexture;rain.emitter=new Vector3(0,26,8);rain.minEmitBox=new Vector3(-7,0,-49);rain.maxEmitBox=new Vector3(7,0,55);
  rain.color1=new Color4(.8,.9,1,.9);rain.color2=new Color4(.7,.85,1,.65);rain.colorDead=new Color4(.6,.8,1,0);
  rain.minLifeTime=1.05;rain.maxLifeTime=1.5;rain.minSize=.7;rain.maxSize=1.4;
  rain.minScaleX=.15;rain.maxScaleX=.25;rain.minScaleY=1.2;rain.maxScaleY=2.1;
  rain.direction1=new Vector3(-.08,-1,.015);rain.direction2=new Vector3(-.02,-1,.04);
  rain.gravity=new Vector3(0,-3,0);rain.blendMode=ParticleSystem.BLENDMODE_ADD;rain.updateSpeed=.016;
  if(megacity){rain.emitter=new Vector3(0,140,20);rain.minEmitBox=new Vector3(-85,-75,-150);rain.maxEmitBox=new Vector3(85,100,150);rain.minSize=.65;rain.maxSize=1.25;rain.minScaleX=.055;rain.maxScaleX=.1;rain.minScaleY=.8;rain.maxScaleY=1.5;rain.color1=new Color4(.48,.7,.75,.45);rain.color2=new Color4(.75,.67,.5,.24);rain.minLifeTime=3;rain.maxLifeTime=5;}
  rain.preWarmCycles=70;rain.preWarmStepOffset=1;

  // Straight-alpha noise with a strict opacity cap avoids opaque centers when
  // billboards overlap. The texture has transparent holes and feathered edges.
  const smokeTexture=new DynamicTexture('wispy translucent steam',256,scene,false);
  const sc=smokeTexture.getContext() as CanvasRenderingContext2D;
  const pixels=sc.createImageData(256,256);
  const hash=(x:number,y:number)=>{const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v);};
  const noise=(x:number,y:number)=>{const ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);return (hash(ix,iy)*(1-fx)+hash(ix+1,iy)*fx)*(1-fy)+(hash(ix,iy+1)*(1-fx)+hash(ix+1,iy+1)*fx)*fy;};
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const nx=(x-128)/128,ny=(y-128)/128;
    const edge=Math.pow(Math.max(0,1-nx*nx-ny*ny),2);
    const turbulence=noise(x/43,y/43)*.56+noise(x/19,y/19)*.28+noise(x/8,y/8)*.16;
    const alpha=Math.min(.55,Math.max(0,turbulence-.25)*2.2*edge);
    const i=(y*256+x)*4;pixels.data[i]=220;pixels.data[i+1]=228;pixels.data[i+2]=235;pixels.data[i+3]=Math.round(alpha*255);
  }
  sc.putImageData(pixels,0,0);smokeTexture.update();
  const steam:ParticleSystem[]=[];
  let steamIndex=0;
  for(const [x,z,pink] of (megacity?[[-19,-25,1],[24,15,0],[-30,60,0],[28,95,1]]:[[-5.8,-21,1],[5.7,-8,0],[-5.8,6,0],[5.9,22,1],[-6,39,0]])) {
    const s=new ParticleSystem('illuminated drain steam',140,scene);s.particleTexture=smokeTexture;s.emitter=new Vector3(x,.15,z);
    s.minEmitBox=new Vector3(-.25,0,-.35);s.maxEmitBox=new Vector3(.25,0,.35);
    s.color1=pink?new Color4(.75,.46,.59,.25):new Color4(.48,.72,.76,.25);
    s.color2=new Color4(.63,.7,.8,.18);s.colorDead=new Color4(.45,.6,.7,0);
    s.minLifeTime=2.2;s.maxLifeTime=3.8;s.minSize=.7;s.maxSize=1.25;
    s.addSizeGradient(0,.45);s.addSizeGradient(.3,1.4);s.addSizeGradient(1,4.2);
    s.addColorGradient(0,new Color4(.65,.75,.8,0));
    s.addColorGradient(.18,pink?new Color4(.72,.4,.58,.4):new Color4(.42,.7,.76,.44));
    s.addColorGradient(.6,new Color4(.5,.65,.75,.18));s.addColorGradient(1,new Color4(.4,.55,.65,0));
    s.direction1=new Vector3(-.25,.85,-.05);s.direction2=new Vector3(.16,1.4,.16);s.minEmitPower=.45;s.maxEmitPower=.8;
    s.minAngularSpeed=-.22;s.maxAngularSpeed=.22;s.blendMode=ParticleSystem.BLENDMODE_STANDARD;s.updateSpeed=.013;
    if(megacity){const outlets=[[47,85,-79],[42,84,-59],[-23,89,19],[-30,52,60]];s.emitter=Vector3.FromArray(outlets[steamIndex++]);s.minSize=.65;s.maxSize=1.2;s.minEmitPower=.6;s.maxEmitPower=1.1;}
    s.preWarmCycles=90;s.preWarmStepOffset=1;steam.push(s);
  }
  const splashTexture=new DynamicTexture('rain impact',64,scene,false),xc=splashTexture.getContext() as CanvasRenderingContext2D;
  xc.clearRect(0,0,64,64);xc.strokeStyle='rgba(180,225,245,.8)';xc.lineWidth=2;xc.beginPath();xc.ellipse(32,32,23,8,0,0,Math.PI*2);xc.stroke();splashTexture.update();
  const splashes=new ParticleSystem('road rain impacts',400,scene);splashes.particleTexture=splashTexture;splashes.emitter=new Vector3(0,.11,8);splashes.minEmitBox=new Vector3(-6,0,-35);splashes.maxEmitBox=new Vector3(6,0,45);
  splashes.minLifeTime=.08;splashes.maxLifeTime=.2;splashes.minSize=.12;splashes.maxSize=.35;splashes.minEmitPower=.04;splashes.maxEmitPower=.1;splashes.direction1=new Vector3(0,1,0);splashes.direction2=new Vector3(0,1,0);
  splashes.color1=new Color4(.5,.8,.9,.65);splashes.color2=new Color4(.8,.65,.8,.4);splashes.colorDead=new Color4(.5,.7,.8,0);splashes.blendMode=ParticleSystem.BLENDMODE_ADD;
  const apply=()=>{
    const rates=getWeatherRates(rainAmount,smokeAmount,low,reducedMotion);
    rain.emitRate=rates.rain;rain.minEmitPower=rates.rainSpeed;rain.maxEmitPower=rates.rainSpeed+4;
    splashes.emitRate=rates.splashes;
    for(const [system,rate] of [[rain,rates.rain],[splashes,rates.splashes],...steam.map(s=>[s,rates.smoke] as const)] as const){
      system.emitRate=rate;if(rate>0&&(!system.isStarted()||system.isStopping()))system.start();else if(rate===0){system.stop();system.reset();}
    }
  };
  apply();
  return {setRain(value:number){rainAmount=clampPercent(value);apply();},setSmoke(value:number){smokeAmount=clampPercent(value);apply();},setLow(value:boolean){low=value;apply();},diagnostics(){return {rainPercent:rainAmount,smokePercent:smokeAmount,...getWeatherRates(rainAmount,smokeAmount,low,reducedMotion)};}};
}
