import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

/** Let the visitor finish exploring before activating a fully downloaded release. */
export default function PwaUpdate(){
  const [available,setAvailable]=useState(false);
  const [busy,setBusy]=useState(false);
  const [failed,setFailed]=useState(false);
  const activate=useRef<(reloadPage?:boolean)=>Promise<void>>(async()=>{});
  useEffect(()=>{
    let active=true,registration:ServiceWorkerRegistration|undefined,lastCheck=0;
    const check=()=>{
      if(!registration||!navigator.onLine||document.hidden||Date.now()-lastCheck<60_000)return;
      lastCheck=Date.now();
      void registration.update().catch(()=>{/* Keep the current offline-ready release. */});
    };
    activate.current=registerSW({
      immediate:true,
      onNeedRefresh(){if(active){setAvailable(true);setFailed(false);}},
      onRegisteredSW(_url,value){if(active){registration=value;check();}},
    });
    const timer=window.setInterval(check,5*60_000);
    document.addEventListener('visibilitychange',check);
    window.addEventListener('online',check);
    return ()=>{active=false;window.clearInterval(timer);document.removeEventListener('visibilitychange',check);window.removeEventListener('online',check);};
  },[]);
  async function update(){
    setBusy(true);setFailed(false);
    try{await activate.current(true);}catch{setFailed(true);}
    finally{setBusy(false);}
  }
  if(!available)return null;
  return <aside className="pwa-update" aria-label="App-Aktualisierung">
    <div role="status"><strong>Neue Version verfügbar</strong><p>{failed?'Die Aktualisierung hat nicht geklappt. Bitte versuche es erneut.':'Die Aktualisierung startet die Szene neu.'}</p></div>
    <div className="pwa-update-actions"><button disabled={busy} onClick={()=>void update()}>{busy?'Wird aktualisiert …':'Aktualisieren'}</button><button disabled={busy} onClick={()=>setAvailable(false)}>Später</button></div>
  </aside>;
}
