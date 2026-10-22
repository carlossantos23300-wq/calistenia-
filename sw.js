const CACHE = 'calistenia-app-library-v51';
const ROOT = new URL('./', self.location.href).href;
const ASSETS = ['index.html', 'manifest.json', 'icon.png', 'icon-192.png', 'styles.css?v=51', 'library-core.js?v=51','names-pt.js?v=51', 'library.js?v=51', 'workout-plans.js?v=51','more-plans.js?v=51','content2.js?v=51','tools2.js?v=51','more-foods.js?v=51', 'exercise-data.js?v=51','custom-exercises.js?v=51','exercise-art.js?v=51', 'account-sync.js?v=51', 'feature-core.js?v=51', 'features.js?v=51', 'meals.js', 'personal.js?v=51', 'app-shell.js?v=51','personal-style.js?v=51','training-atlas.js?v=51', 'training-core.js?v=51','extras-core.js?v=51','practical-core.js?v=51','content.js?v=51', 'training-runner.js?v=51', 'daily-tools.js?v=51','pullup-path.js?v=51','plus-core.js?v=51','recipes.js?v=51','more-recipes.js?v=51','state-validator.js?v=51','video-data.js?v=51','execution-media.js?v=51','plus-tools.js?v=51','welcome.js?v=51','extras.js?v=51','motivation.js?v=51','beat.js?v=51','body3d.js?v=51','photos.js?v=51','camera.js?v=51','outdoors.js?v=51','practical.js?v=51','organize.js?v=51','food-data.js?v=51','food-camera.js?v=51','habits.js?v=51','news.js?v=51','everyday.js?v=51'].map(path => new URL(path, ROOT).href);
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
