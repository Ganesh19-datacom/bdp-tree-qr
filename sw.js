const CACHE = 'bdp-offline-content-v1';
const SHELL = ['./','./index.html','./styles.css','./data.js','./app.js','./manifest.webmanifest'];
self.addEventListener('install', event => { event.waitUntil((async()=>{const c=await caches.open(CACHE); await c.addAll(SHELL); await self.skipWaiting();})()); });
self.addEventListener('activate', event => { event.waitUntil((async()=>{const keys=await caches.keys(); await Promise.all(keys.filter(k=>k.startsWith('bdp-')&&k!==CACHE).map(k=>caches.delete(k))); await self.clients.claim();})()); });
self.addEventListener('fetch', event => {
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin===self.location.origin){
    event.respondWith((async()=>{const cache=await caches.open(CACHE); const hit=await cache.match(req,{ignoreSearch:true}); if(hit) return hit;
      try { const fresh=await fetch(req); if(fresh.ok) cache.put(req,fresh.clone()); return fresh; }
      catch(e){ if(req.mode==='navigate'){const fallback=await cache.match('./index.html'); if(fallback) return fallback;} throw e; }
    })());
  } else if(req.destination==='image') {
    event.respondWith((async()=>{const cache=await caches.open(CACHE); const hit=await cache.match(req); if(hit) return hit; try{return await fetch(req);}catch(e){return new Response('',{status:504,statusText:'Image unavailable offline'});}})());
  }
});