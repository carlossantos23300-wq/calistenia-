const CACHE = 'calistenia-app-library-v40';
const ROOT = new URL('./', self.location.href).href;
const ASSETS = ['index.html', 'manifest.json', 'icon.png', 'icon-192.png', 'styles.css?v=40', 'library-core.js?v=40', 'library.js?v=40', 'workout-plans.js?v=40', 'exercise-data.js?v=40','custom-exercises.js?v=40','exercise-art.js?v=40', 'account-sync.js?v=40', 'feature-core.js?v=40', 'features.js?v=40', 'meals.js', 'personal.js?v=40', 'app-shell.js?v=40','personal-style.js?v=40','training-atlas.js?v=40', 'training-core.js?v=40','extras-core.js?v=40', 'training-runner.js?v=40', 'daily-tools.js?v=40','pullup-path.js?v=40','plus-core.js?v=40','recipes.js?v=40','state-validator.js?v=40','video-data.js?v=40','execution-media.js?v=40','plus-tools.js?v=40','welcome.js?v=40','extras.js?v=40','motivation.js?v=40','beat.js?v=40','body3d.js?v=40','photos.js?v=40','camera.js?v=40','outdoors.js?v=40'].map(path => new URL(path, ROOT).href);
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
