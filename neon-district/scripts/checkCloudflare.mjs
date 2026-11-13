import { readdir, stat, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const directory=fileURLToPath(new URL('../dist/',import.meta.url));
const required=['index.html','sw.js','manifest.webmanifest','_headers','models/polar/hercules-articulated.glb','decoders/meshopt_decoder.js'];
for(const file of required)await access(path.join(directory,file));
async function inventory(folder){
  const result=[];
  for(const entry of await readdir(folder,{withFileTypes:true})){
    const absolute=path.join(folder,entry.name);
    if(entry.isDirectory())result.push(...await inventory(absolute));
    else if(entry.isFile())result.push({file:path.relative(directory,absolute),bytes:(await stat(absolute)).size});
  }
  return result;
}
const files=await inventory(directory);
const oversized=files.filter(file=>file.bytes>25*1024*1024);
if(oversized.length)throw new Error('Cloudflare erlaubt maximal 25 MiB pro Datei: '+oversized.map(file=>file.file).join(', '));
if(files.length>20000)throw new Error('Der Build überschreitet 20.000 Dateien.');
const largest=files.reduce((a,b)=>a.bytes>b.bytes?a:b);
console.log(`Cloudflare: ${files.length} Dateien, größte Datei ${largest.file} (${(largest.bytes/1024/1024).toFixed(2)} MiB).`);
console.log('Startseite, PWA, Cache-Regeln, Flugzeug und Modelldecoder sind im Build vorhanden.');
