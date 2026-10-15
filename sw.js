const CACHE = 'calistenia-app-library-v45';
const ROOT = new URL('./', self.location.href).href;
const ASSETS = ['index.html', 'manifest.json', 'icon.png', 'icon-192.png', 'styles.css?v=45', 'library-core.js?v=45', 'library.js?v=45', 'workout-plans.js?v=45', 'exercise-data.js?v=45','custom-exercises.js?v=45','exercise-art.js?v=45', 'account-sync.js?v=45', 'feature-core.js?v=45', 'features.js?v=45', 'meals.js', 'personal.js?v=45', 'app-shell.js?v=45','personal-style.js?v=45','training-atlas.js?v=45', 'training-core.js?v=45','extras-core.js?v=45','practical-core.js?v=45', 'training-runner.js?v=45', 'daily-tools.js?v=45','pullup-path.js?v=45','plus-core.js?v=45','recipes.js?v=45','state-validator.js?v=45','video-data.js?v=45','execution-media.js?v=45','plus-tools.js?v=45','welcome.js?v=45','extras.js?v=45','motivation.js?v=45','beat.js?v=45','body3d.js?v=45','photos.js?v=45','camera.js?v=45','outdoors.js?v=45','practical.js?v=45','organize.js?v=45','news.js?v=45','everyday.js?v=45'].map(path => new URL(path, ROOT).href);
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
  if(url.href.startsWith('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/')||url.href.startsWith(ROOT+'media/')){event.respondWith(caches.open('calistenia-offline-images').then(async cache=>(await cache.match(request))||fetch(request)));return}if (!url.href.startsWith(ROOT)) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(new URL('index.html', ROOT).href)));
    return;
  }
  if (ASSETS.includes(url.href)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});

self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING'){self.skipWaiting();return}if(event.data?.type!=='CACHE_WORKOUT_IMAGES'||!Array.isArray(event.data.urls))return;event.waitUntil((async()=>{const cache=await caches.open('calistenia-offline-images');let saved=0;for(const url of [...new Set(event.data.urls)].slice(0,120)){if(typeof url!=='string'||!(url.startsWith('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/')||url.startsWith(ROOT+'media/')))continue;try{const r=await fetch(url,url.startsWith(ROOT)?{}:{mode:'cors'});if(r.ok){await cache.put(url,r);saved++}}catch{}}event.ports[0]?.postMessage({saved})})())});
