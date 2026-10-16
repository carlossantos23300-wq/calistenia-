const CACHE = 'calistenia-app-library-v49';
const ROOT = new URL('./', self.location.href).href;
const ASSETS = ['index.html', 'manifest.json', 'icon.png', 'icon-192.png', 'styles.css?v=49', 'library-core.js?v=49','names-pt.js?v=49', 'library.js?v=49', 'workout-plans.js?v=49','more-plans.js?v=49','content2.js?v=49','tools2.js?v=49','more-foods.js?v=49', 'exercise-data.js?v=49','custom-exercises.js?v=49','exercise-art.js?v=49', 'account-sync.js?v=49', 'feature-core.js?v=49', 'features.js?v=49', 'meals.js', 'personal.js?v=49', 'app-shell.js?v=49','personal-style.js?v=49','training-atlas.js?v=49', 'training-core.js?v=49','extras-core.js?v=49','practical-core.js?v=49','content.js?v=49', 'training-runner.js?v=49', 'daily-tools.js?v=49','pullup-path.js?v=49','plus-core.js?v=49','recipes.js?v=49','more-recipes.js?v=49','state-validator.js?v=49','video-data.js?v=49','execution-media.js?v=49','plus-tools.js?v=49','welcome.js?v=49','extras.js?v=49','motivation.js?v=49','beat.js?v=49','body3d.js?v=49','photos.js?v=49','camera.js?v=49','outdoors.js?v=49','practical.js?v=49','organize.js?v=49','food-data.js?v=49','food-camera.js?v=49','habits.js?v=49','news.js?v=49','everyday.js?v=49'].map(path => new URL(path, ROOT).href);
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
