import { Wind, Sun, Cloud } from 'lucide-react';
import type { MarsSettings } from './scene/mars/state';
import { daylightState } from './scene/mars/state';
type Props={settings:MarsSettings;onChange:(settings:MarsSettings)=>void;disabled:boolean;reducedMotion:boolean};
export default function MarsControls({settings,onChange,disabled,reducedMotion}:Props){
  const light=daylightState(settings.daylight),clock=`${String(light.hour).padStart(2,'0')}:${String(light.minute).padStart(2,'0')}`;
  const controls=[{key:'wind' as const,label:'Windstärke',icon:Wind,hint:'Stärkerer Wind trägt Sand und lässt ältere Spuren verblassen.',value:settings.wind+' %'},{key:'dust' as const,label:'Staub in der Luft',icon:Cloud,hint:'Von klarer Fernsicht bis zum staubigen Horizont.',value:settings.dust+' %'},{key:'daylight' as const,label:'Tageszeit',icon:Sun,hint:light.elevation<=0?'Nacht auf dem Mars':settings.daylight>65?'Abendlicht und lange Schatten':settings.daylight<35?'Morgen auf dem Mars':'Helle Marslandschaft',value:clock}];
  return <div className="weather-controls">{controls.map(({key,label,icon:Icon,hint,value})=><div className="weather-control" key={key}><div className="weather-label"><label htmlFor={'mars-'+key}><Icon size={16}/>{label}</label><output htmlFor={'mars-'+key}>{value}</output></div><input id={'mars-'+key} type="range" min="0" max="100" step="1" value={settings[key]} disabled={disabled} onChange={e=>onChange({...settings,[key]:Number(e.target.value)})} aria-valuetext={value+' — '+hint} style={{'--range-progress':`${settings[key]}%`} as React.CSSProperties}/><small>{hint}</small></div>)}{reducedMotion&&<p className="motion-note">Reduzierte Bewegung aktiv: Fahrzeuge, Astronauten, Staub und Raketenstart sind pausiert. Das Licht bleibt einstellbar.</p>}</div>;
}
