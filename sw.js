const CACHE="ldfr-field-v4";
const CORE=["/","/assets/fao-logo.png","/assets/moa-logo.png","/assets/liberia-counties-map.png"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("ldfr-field-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET") return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;
  const fresh=request.mode==="navigate"||url.pathname.startsWith("/dashboard")||url.pathname.startsWith("/api/")||url.pathname.startsWith("/_next/")||["script","style","worker"].includes(request.destination);
  if(fresh){event.respondWith(fetch(request).catch(()=>request.mode==="navigate"?caches.match("/"):Promise.reject(new Error("Network unavailable"))));return;}
  event.respondWith(fetch(request).then(response=>{if(response.ok&&request.destination==="image"){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;}).catch(()=>caches.match(request)));
});
