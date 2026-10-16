const CACHE = 'calistenia-app-library-v46';
const ROOT = new URL('./', self.location.href).href;
const ASSETS = ['index.html', 'manifest.json', 'icon.png', 'icon-192.png', 'styles.css?v=46', 'library-core.js?v=46', 'library.js?v=46', 'workout-plans.js?v=46', 'exercise-data.js?v=46','custom-exercises.js?v=46','exercise-art.js?v=46', 'account-sync.js?v=46', 'feature-core.js?v=46', 'features.js?v=46', 'meals.js', 'personal.js?v=46', 'app-shell.js?v=46','personal-style.js?v=46','training-atlas.js?v=46', 'training-core.js?v=46','extras-core.js?v=46','practical-core.js?v=46', 'training-runner.js?v=46', 'daily-tools.js?v=46','pullup-path.js?v=46','plus-core.js?v=46','recipes.js?v=46','state-validator.js?v=46','video-data.js?v=46','execution-media.js?v=46','plus-tools.js?v=46','welcome.js?v=46','extras.js?v=46','motivation.js?v=46','beat.js?v=46','body3d.js?v=46','photos.js?v=46','camera.js?v=46','outdoors.js?v=46','practical.js?v=46','organize.js?v=46','food-data.js?v=46','food-camera.js?v=46','news.js?v=46','everyday.js?v=46'].map(path => new URL(path, ROOT).href);
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
