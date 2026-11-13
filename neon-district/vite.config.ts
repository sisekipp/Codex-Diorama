import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  plugins: [react(), VitePWA({registerType:'prompt', includeAssets:['icons/*.png','icons/*.svg','models/polar/credits.json'], manifest:{name:'Yoru — Cyberpunk District',short_name:'Yoru',description:'Ein Stadtviertel zwischen Neon und Nacht.',lang:'de',theme_color:'#080e17',background_color:'#080e17',display:'standalone',start_url:'/',icons:[{src:'/icons/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icons/icon-512.png',sizes:'512x512',type:'image/png'},{src:'/icons/maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]},workbox:{globPatterns:['**/*.{js,css,html,png,jpg,hdr,svg,woff2,glb}'],maximumFileSizeToCacheInBytes:6000000,cleanupOutdatedCaches:true}})],
  build:{rollupOptions:{output:{manualChunks:{react:['react','react-dom'],babylon:['@babylonjs/core']}}}}
});
