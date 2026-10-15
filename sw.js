const CACHE = 'calistenia-app-library-v42';
const ROOT = new URL('./', self.location.href).href;
const ASSETS = ['index.html', 'manifest.json', 'icon.png', 'icon-192.png', 'styles.css?v=42', 'library-core.js?v=42', 'library.js?v=42', 'workout-plans.js?v=42', 'exercise-data.js?v=42','custom-exercises.js?v=42','exercise-art.js?v=42', 'account-sync.js?v=42', 'feature-core.js?v=42', 'features.js?v=42', 'meals.js', 'personal.js?v=42', 'app-shell.js?v=42','personal-style.js?v=42','training-atlas.js?v=42', 'training-core.js?v=42','extras-core.js?v=42','practical-core.js?v=42', 'training-runner.js?v=42', 'daily-tools.js?v=42','pullup-path.js?v=42','plus-core.js?v=42','recipes.js?v=42','state-validator.js?v=42','video-data.js?v=42','execution-media.js?v=42','plus-tools.js?v=42','welcome.js?v=42','extras.js?v=42','motivation.js?v=42','beat.js?v=42','body3d.js?v=42','photos.js?v=42','camera.js?v=42','outdoors.js?v=42'].map(path => new URL(path, ROOT).href);
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

self.addEventListener('message',event=>{if(event.data?.type!=='CACHE_WORKOUT_IMAGES'||!Array.isArray(event.data.urls))return;event.waitUntil((async()=>{const cache=await caches.open('calistenia-offline-images');let saved=0;for(const url of [...new Set(event.data.urls)].slice(0,120)){if(typeof url!=='string'||!(url.startsWith('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/')||url.startsWith(ROOT+'media/')))continue;try{const r=await fetch(url,url.startsWith(ROOT)?{}:{mode:'cors'});if(r.ok){await cache.put(url,r);saved++}}catch{}}event.ports[0]?.postMessage({saved})})())});
