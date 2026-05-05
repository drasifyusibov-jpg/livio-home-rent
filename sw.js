const CACHE = 'darvin-v1';

// Файлы для кэширования (офлайн режим)
const ASSETS = [
  './index.html',
  './manifest.json'
];

// Установка — кэшируем основные файлы
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Активация — удаляем старые кэши
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Запросы — сначала сеть, при ошибке кэш (для офлайн работы)
self.addEventListener('fetch', e => {
  // Пропускаем запросы к Supabase и шрифтам (только через сеть)
  if (
    e.request.url.includes('supabase.co') ||
    e.request.url.includes('googleapis.com') ||
    e.request.url.includes('jsdelivr.net')
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Обновляем кэш свежей версией
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
