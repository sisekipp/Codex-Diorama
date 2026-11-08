import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Check, ChevronDown, CloudRain, Expand, Focus, Info, Layers3, LoaderCircle, Minus, Mouse, Pause, Play, Plus, RotateCcw, Settings2, Sparkles, View, X } from 'lucide-react';
import type { Preset, SceneController, SceneKind } from './scene/createScene';
import WeatherControls from './WeatherControls';
import { readWeather } from './scene/weather';

type InstallPrompt=Event & {prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
const districtViews=[{id:'street' as const,name:'Straßenschlucht',detail:'Mittendrin',icon:View},{id:'roofs' as const,name:'Über den Dächern',detail:'Neue Perspektiven',icon:Layers3},{id:'panorama' as const,name:'Panorama',detail:'Das große Ganze',icon:Focus},{id:'details' as const,name:'Werkstatt',detail:'Modelle aus der Nähe',icon:Focus}];
export default function App(){
  const canvas=useRef<HTMLCanvasElement>(null);const controller=useRef<SceneController|null>(null);
  const [sceneKind,setSceneKind]=useState<SceneKind>(()=>new URLSearchParams(location.search).get('scene')==='megacity'?'megacity':'district');
  const engineQueue=useRef<Promise<void>>(Promise.resolve());
  const views=sceneKind==='megacity'?[{id:'street' as const,name:'Lufthafen',detail:'An der Landebucht',icon:View},{id:'roofs' as const,name:'Hochbahnhof',detail:'Port 09 im Zentrum',icon:Layers3},{id:'panorama' as const,name:'Megastadt',detail:'Die ganze Dimension',icon:Focus},{id:'details' as const,name:'Andockplatz',detail:'Flugtaxi im Detail',icon:Focus}]:districtViews;
  const mega=sceneKind==='megacity';
  const [ready,setReady]=useState(false);const [error,setError]=useState('');
  const [weather,setWeather]=useState(readWeather);
  const [reducedMotion]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [orbit,setOrbit]=useState(false);const [quality,setQuality]=useState<'high'|'low'>(()=>window.innerWidth<700?'low':'high');
  const [preset,setPreset]=useState<Preset>('street');const [panel,setPanel]=useState<'settings'|'info'|null>(null);
  const [install,setInstall]=useState<InstallPrompt|null>(null);const [fps,setFps]=useState(0);const [notice,setNotice]=useState('');const [immersive,setImmersive]=useState(false);
  useEffect(()=>{
    let cancelled=false;let instance:SceneController|null=null;
    setReady(false);setError('');setFps(0);
    const setup=engineQueue.current.then(async()=>{
      if(cancelled)return;
      const {createDistrict}=await import('./scene/createScene');
      if(cancelled)return;
      const c=await createDistrict(canvas.current!,()=>setOrbit(false),sceneKind);
      if(cancelled){c.dispose();return;}
      instance=c;controller.current=c;c.setQuality(quality);setReady(true);
    }).catch(e=>{if(!cancelled){console.error(e);setError('Die 3D-Szene konnte nicht gestartet werden. Aktiviere die Grafikbeschleunigung in deinem Browser und lade die Seite erneut.');}});
    engineQueue.current=setup;
    return()=>{cancelled=true;instance?.dispose();controller.current=null;};
    // Graphics settings update through the controller; only a city change rebuilds the engine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[sceneKind]);
  useEffect(()=>{
    try{localStorage.setItem('yoru.weather.v1',JSON.stringify(weather));}catch{/* Private browsing may disable persistence. */}
    if(!ready)return;
    controller.current?.setRain(weather.rain);controller.current?.setSmoke(weather.smoke);controller.current?.setWetness(weather.wetness);
  },[weather,ready]);
  useEffect(()=>{const timer=window.setInterval(()=>setFps(Math.round(controller.current?.diagnostics().fps??0)),2000);return()=>window.clearInterval(timer);},[]);
  useEffect(()=>{const handle=(event:Event)=>{event.preventDefault();setInstall(event as InstallPrompt);};const installed=()=>{setInstall(null);setNotice('Yoru ist installiert.');};window.addEventListener('beforeinstallprompt',handle);window.addEventListener('appinstalled',installed);return()=>{window.removeEventListener('beforeinstallprompt',handle);window.removeEventListener('appinstalled',installed);};},[]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement)return;if(e.key==='Escape'){setPanel(null);setImmersive(false);}if(e.key==='+'||e.key==='=')controller.current?.zoom(-1);if(e.key==='-')controller.current?.zoom(1);if(e.key==='0'){controller.current?.reset();setPreset('street');}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
  useEffect(()=>{
    if(panel!=='info')return;
    const previous=document.activeElement as HTMLElement|null;
    const trap=(event:KeyboardEvent)=>{
      if(event.key!=='Tab')return;
      const elements=Array.from(document.querySelectorAll<HTMLButtonElement>('.info-panel button'));
      const first=elements[0],last=elements[elements.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    window.addEventListener('keydown',trap);
    return()=>{window.removeEventListener('keydown',trap);previous?.focus();};
  },[panel]);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),3500);return()=>clearTimeout(timer);},[notice]);
  useEffect(()=>{document.title=mega?'NOX — Die Stadt über der Stadt':'YORU — Nach Einbruch der Zukunft';},[mega]);
  const changeScene=(kind:SceneKind)=>{setSceneKind(kind);setPreset('street');setOrbit(false);setPanel(null);const url=new URL(location.href);url.searchParams.set('scene',kind);history.replaceState(null,'',url);};
  const changeView=(id:Preset)=>{setPreset(id);controller.current?.preset(id);setOrbit(false);};

  const toggleOrbit=()=>{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setNotice('Kamerafahrt ist bei reduzierter Bewegung deaktiviert.');return;}controller.current?.setOrbit(!orbit);setOrbit(!orbit);};
  const fullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else setImmersive(v=>!v);}catch{setImmersive(v=>!v);}};
  const capture=()=>{if(!canvas.current)return;try{const link=document.createElement('a');link.download=mega?'nox-megacity.png':'yoru-night-district.png';link.href=canvas.current.toDataURL('image/png');link.click();setNotice('Deine Ansicht wurde gespeichert.');}catch{setNotice('Das Bild konnte nicht gespeichert werden.');}};
  return <main className={`explorer ${immersive?'immersive':''} ${preset==='details'?'closeup':''}`}>
    <canvas ref={canvas} className="scene-canvas" aria-label="Interaktive 3D-Stadtszene. Ziehen zum Drehen, Mausrad zum Zoomen. Alternativ die Kameratasten verwenden." tabIndex={0} />
    <div className="vignette" aria-hidden="true"/>
    <header className="topbar ui">
      <a className="brand" href="/" aria-label="Yoru Startansicht"><span className="brand-symbol" aria-hidden="true">夜</span><span>YORU<span className="brand-dot">.</span></span><span className="brand-rule"/><span className="brand-caption">AFTER HOURS<br/>CITY EXPLORER</span></a>
      <div className="scene-picker"><label htmlFor="scene-picker" className="sr-only">Szene auswählen</label><select id="scene-picker" value={sceneKind} onChange={event=>changeScene(event.target.value as SceneKind)}><option value="district">Yoru · Nachtviertel</option><option value="megacity">Nox · Megastadt</option></select><ChevronDown size={14}/></div>
      <div className="top-actions">{install&&<button className="install-button" onClick={async()=>{await install.prompt();const choice=await install.userChoice;if(choice.outcome==='accepted')setInstall(null);}}>App installieren <ArrowDownToLine size={14}/></button>}<button className="icon-button fullscreen" title="Vollbild umschalten" aria-label="Vollbild umschalten" onClick={fullscreen}><Expand size={18}/></button><button className="info-button" aria-label="Informationen zur Szene" onClick={()=>setPanel(panel==='info'?null:'info')}><Info size={19}/></button></div>
    </header>
    <section className="location-hud ui" aria-label="Szenenbeschreibung"><div className="live-label"><span className="status-dot"/> EINE STADT. TAUSEND GESCHICHTEN.</div><h1>{mega?<><span>Über dem</span><span><em>Abgrund.</em></span></>:<><span>Nach Einbruch</span><span>der <em>Zukunft.</em></span></>}</h1><p>{mega?<>Ein Hafen zwischen den Ebenen.<br/>Ankommen. Umsteigen. Weiterfliegen.</>:<>Verlier dich zwischen Neon und Nacht.<br/>Deine Perspektive. Dein Moment.</>}</p><div className="location-coordinates"><span>{mega?'夜空':'夜露区'}</span><span>{mega?'NOX / PORT 09':'YORU DISTRICT'} <span className="coordinate-divider">/</span> {mega?'OBERE EBENE':'SEKTOR 07'}</span></div></section>
    <aside className="world-status ui" aria-label="Atmosphäre der fiktiven Szene"><span className="world-time">23<span>:</span>47</span><span className="world-status-rule"/><CloudRain size={18}/><span>{reducedMotion?'BEWEGUNG PAUSIERT':weather.rain===0?'REGENPAUSE':weather.rain<30?'NIESELREGEN':weather.rain<70?'REGEN':'STARKREGEN'}<small>16° C · YORU LOCAL</small></span></aside>
    <div className="scene-edge-label ui" aria-hidden="true">35° 41′ N &nbsp; 139° 41′ E <span/> LIVE RENDER</div>
    {!ready&&!error&&<div className="loading-overlay" role="status"><div className="loading-brand">夜</div><LoaderCircle className="spin" size={22}/><h2>Die Nacht erwacht.</h2><p>Dein Stadtviertel wird aufgebaut …</p></div>}
    {error&&<div className="loading-overlay error-overlay" role="alert"><Info size={26}/><h2>Ein Moment im Dunkeln.</h2><p>{error}</p><button className="primary-button" onClick={()=>location.reload()}>Erneut versuchen</button></div>}
    <div className="camera-toolbar ui" aria-label="Kamerasteuerung"><button className="icon-button" aria-label="Hineinzoomen" title="Hineinzoomen (+)" disabled={!ready} onClick={()=>controller.current?.zoom(-1)}><Plus size={19}/></button><span/><button className="icon-button" aria-label="Herauszoomen" title="Herauszoomen (-)" disabled={!ready} onClick={()=>controller.current?.zoom(1)}><Minus size={19}/></button><span/><button className="icon-button" aria-label="Startansicht" title="Startansicht (0)" disabled={!ready} onClick={()=>changeView('street')}><RotateCcw size={17}/></button></div>
    <footer className="bottom-ui ui">
      <div className="explore-hint"><Mouse size={19}/><div><span>Ziehen zum Erkunden</span><small>Scrollen zum Zoomen</small></div></div>
      <div className="view-selector" role="group" aria-label="Kameraansichten">{views.map(v=><button className={`view-button ${preset===v.id?'is-active':''}`} key={v.id} disabled={!ready} aria-pressed={preset===v.id} onClick={()=>changeView(v.id)}><span className={`view-art ${v.id}`} aria-hidden="true"><i/><i/><i/><i/><i/><v.icon size={17}/></span><span className="view-label">{v.name}<small>{v.detail}</small></span>{preset===v.id&&<span className="view-active-dot"/>}</button>)}</div>
      <div className="scene-actions"><button className={`action-button orbit ${orbit?'is-on':''}`} disabled={!ready} aria-pressed={orbit} onClick={toggleOrbit}>{orbit?<Pause size={16}/>:<Play size={16}/>}<span>Kamerafahrt</span></button><button className={`icon-button settings-button ${panel==='settings'?'is-on':''}`} aria-label="Szeneneinstellungen" aria-expanded={panel==='settings'} onClick={()=>setPanel(panel==='settings'?null:'settings')}><Settings2 size={18}/></button></div>
    </footer>
    <div className="statusbar ui"><span><span className="status-dot"/>{ready?'SZENE BEREIT':'SZENE LÄDT'}<span className="status-separator">/</span> ECHTZEIT 3D</span><span className="status-right">{fps>0&&`${fps} FPS`}<span className="status-separator">/</span>{quality==='high'?'HOHE QUALITÄT':'SPARSAME QUALITÄT'}<span className="tiny-diamond"/></span></div>
    {panel==='settings'&&<aside className="settings-panel panel" aria-label="Szeneneinstellungen"><div className="panel-heading"><span><Settings2 size={16}/> Deine Atmosphäre</span><button className="icon-button" aria-label="Einstellungen schließen" onClick={()=>setPanel(null)}><X size={17}/></button></div><WeatherControls settings={weather} onChange={setWeather} disabled={!ready} reducedMotion={reducedMotion}/><div className="quality-setting"><label htmlFor="quality"><Sparkles size={17}/> Grafikqualität</label><div className="select-wrap"><select id="quality" value={quality} onChange={e=>{const q=e.target.value as 'high'|'low';setQuality(q);controller.current?.setQuality(q);}}><option value="high">Hoch — alle Lichteffekte</option><option value="low">Sparsam — weniger Effekte</option></select><ChevronDown size={15}/></div></div><button className="capture-button" disabled={!ready} onClick={capture}><ArrowDownToLine size={16}/> Ansicht als Bild speichern<ArrowUpRight size={15}/></button></aside>}
    {panel==='info'&&<div className="modal-backdrop" onClick={()=>setPanel(null)}><section className="info-panel panel" role="dialog" aria-modal="true" aria-labelledby="info-title" onClick={e=>e.stopPropagation()}><button autoFocus className="icon-button close-modal" aria-label="Informationen schließen" onClick={()=>setPanel(null)}><X size={20}/></button><span className="eyebrow">WILLKOMMEN IN {mega?'OBERE EBENE':'SEKTOR 07'}</span><h2 id="info-title">Eine Nacht.<br/>Unendlich viele Blickwinkel.</h2><p>{mega?'Port 09 ist der Verkehrsknoten von Nox: Hochbahnen halten zwischen einem massiven Wohnblock und einem schlanken Konzernturm. Vom Aerocab-Terminal blickst du tief in die alte Industriestadt. Flugkorridore verbinden die verschiedenen Ebenen.':'Yoru ist ein frei erfundenes Cyberpunk-Viertel. Zwischen kleinen Nachtläden, leuchtenden Reklamen und den Türmen einer rastlosen Stadt wartet deine nächste Perspektive.'}</p><div className="info-facts"><span><View size={20}/> Frei erkunden<small>Maus, Touch oder Kameratasten</small></span><span><Layers3 size={20}/> Echte 3D-Szene<small>Eigene Architektur und Objekte</small></span></div><p className="credits">Architektur, Fahrzeuge und Schilder wurden für diese Szenen erstellt. Die Hafentexturen und die Beleuchtungsumgebung stammen von Poly Haven (CC0). Keine Assets aus Cyberpunk 2077. Die Uhrzeit und Wetterangaben gehören zur fiktiven Welt.</p><p className="credits">Bedienung: Ziehen zum Drehen, Mausrad oder Zwei-Finger-Geste zum Zoomen. Tastatur: + / − für Zoom, 0 für die Startansicht. Installation über das Browsermenü, sofern unterstützt.</p><button className="primary-button" onClick={()=>setPanel(null)}>Die Nacht erkunden <ArrowUpRight size={17}/></button></section></div>}
    {notice&&<div className="toast" role="status"><Check size={16}/>{notice}</div>}
    {immersive&&<button className="exit-immersive icon-button" aria-label="Oberfläche einblenden" onClick={()=>setImmersive(false)}><X size={20}/></button>}
  </main>;
}
