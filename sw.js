const CACHE = 'calistenia-app-library-v38';
const ROOT = new URL('./', self.location.href).href;
const ASSETS = ['index.html', 'manifest.json', 'icon.png', 'icon-192.png', 'styles.css?v=38', 'library-core.js?v=38', 'library.js?v=38', 'workout-plans.js?v=38', 'exercise-data.js?v=38','custom-exercises.js?v=38','exercise-art.js?v=38', 'account-sync.js?v=38', 'feature-core.js?v=38', 'features.js?v=38', 'meals.js', 'personal.js?v=38', 'app-shell.js?v=38','personal-style.js?v=38','training-atlas.js?v=38', 'training-core.js?v=38','extras-core.js?v=38', 'training-runner.js?v=38', 'daily-tools.js?v=38','pullup-path.js?v=38','plus-core.js?v=38','recipes.js?v=38','state-validator.js?v=38','video-data.js?v=38','execution-media.js?v=38','plus-tools.js?v=38','welcome.js?v=38','extras.js?v=38','motivation.js?v=38'].map(path => new URL(path, ROOT).href);
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
  if(url.href.startsWith('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/')){event.respondWith(caches.open('calistenia-offline-images').then(async cache=>(await cache.match(request))||fetch(request)));return}if (!url.href.startsWith(ROOT)) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(new URL('index.html', ROOT).href)));
    return;
  }
  if (ASSETS.includes(url.href)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});

self.addEventListener('message',event=>{if(event.data?.type!=='CACHE_WORKOUT_IMAGES'||!Array.isArray(event.data.urls))return;event.waitUntil((async()=>{const cache=await caches.open('calistenia-offline-images');let saved=0;for(const url of [...new Set(event.data.urls)].slice(0,120)){if(typeof url!=='string'||!url.startsWith('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'))continue;try{const r=await fetch(url,{mode:'cors'});if(r.ok){await cache.put(url,r);saved++}}catch{}}event.ports[0]?.postMessage({saved})})())});
