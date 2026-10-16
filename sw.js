const CACHE = 'calistenia-app-library-v47';
const ROOT = new URL('./', self.location.href).href;
const ASSETS = ['index.html', 'manifest.json', 'icon.png', 'icon-192.png', 'styles.css?v=47', 'library-core.js?v=47', 'library.js?v=47', 'workout-plans.js?v=47','more-plans.js?v=47', 'exercise-data.js?v=47','custom-exercises.js?v=47','exercise-art.js?v=47', 'account-sync.js?v=47', 'feature-core.js?v=47', 'features.js?v=47', 'meals.js', 'personal.js?v=47', 'app-shell.js?v=47','personal-style.js?v=47','training-atlas.js?v=47', 'training-core.js?v=47','extras-core.js?v=47','practical-core.js?v=47','content.js?v=47', 'training-runner.js?v=47', 'daily-tools.js?v=47','pullup-path.js?v=47','plus-core.js?v=47','recipes.js?v=47','more-recipes.js?v=47','state-validator.js?v=47','video-data.js?v=47','execution-media.js?v=47','plus-tools.js?v=47','welcome.js?v=47','extras.js?v=47','motivation.js?v=47','beat.js?v=47','body3d.js?v=47','photos.js?v=47','camera.js?v=47','outdoors.js?v=47','practical.js?v=47','organize.js?v=47','food-data.js?v=47','food-camera.js?v=47','news.js?v=47','everyday.js?v=47'].map(path => new URL(path, ROOT).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('calistenia-app-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if(url.href.startsWith(ROOT+'models/')||url.href.startsWith('https://storage.googleapis.com/mediapipe-models/')){event.respondWith(caches.open('calistenia-models').then(async cache=>{const hit=await cache.match(request);if(hit)return hit;const r=await fetch(request);if(r.ok)cache.put(request,r.clone());return r}));return}if(url.href.startsWith('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/')||url.href.startsWith(ROOT+'media/')){event.respondWith(caches.open('calistenia-offline-images').then(async cache=>(await cache.match(request))||fetch(request)));return}if (!url.href.startsWith(ROOT)) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(new URL('index.html', ROOT).href)));
    return;
  }
  if (ASSETS.includes(url.href)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});

self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING'){self.skipWaiting();return}if(event.data?.type!=='CACHE_WORKOUT_IMAGES'||!Array.isArray(event.data.urls))return;event.waitUntil((async()=>{const cache=await caches.open('calistenia-offline-images');let saved=0;for(const url of [...new Set(event.data.urls)].slice(0,120)){if(typeof url!=='string'||!(url.startsWith('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/')||url.startsWith(ROOT+'media/')))continue;try{const r=await fetch(url,url.startsWith(ROOT)?{}:{mode:'cors'});if(r.ok){await cache.put(url,r);saved++}}catch{}}event.ports[0]?.postMessage({saved})})())});
