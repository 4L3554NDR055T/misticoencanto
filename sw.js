// ===== SERVICE WORKER — Místico Encanto =====
// Atualizar CACHE_VERSION ao fazer deploy de novas versões
const CACHE_VERSION   = 'v3';
const CACHE_STATIC    = `mistico-encanto-static-${CACHE_VERSION}`;
const CACHE_API       = `mistico-encanto-api-${CACHE_VERSION}`;
const API_CACHE_TTL   = 5 * 60 * 1000; // 5 minutos para cache de API

const STATIC_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/search-improvements.css',
  '/script.js',
  '/admin.js',
  '/config.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// ===== INSTALAÇÃO =====
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      // addAll com catch individual para não falhar se um recurso offline
      return Promise.allSettled(STATIC_URLS.map(url => cache.add(url)));
    }).then(() => self.skipWaiting()) // Ativa imediatamente
  );
});

// ===== ATIVAÇÃO — limpa caches antigos =====
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_STATIC && k !== CACHE_API)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim()) // Assume controle de todas as abas abertas
  );
});

// ===== FETCH — estratégias por tipo de recurso =====
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignorar requisições de analytics/hotjar/etc.
  if (/analytics|hotjar|googletagmanager|fbevents/.test(url.hostname)) return;

  // Estratégia para API: Network First com fallback de cache
  if (url.pathname.startsWith('/api/produtos')) {
    event.respondWith(networkFirstWithCache(event.request, CACHE_API));
    return;
  }

  // Ignorar outras rotas de API (POST/PUT/DELETE) — não fazer cache
  if (url.pathname.startsWith('/api/')) return;

  // Estratégia para assets estáticos: Cache First
  event.respondWith(cacheFirst(event.request));
});

// Cache First: retorna do cache, senão vai à rede e salva
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(CACHE_STATIC).then(c => c.put(request, clone));
    }
    return response;
  } catch {
    return offlineFallback(request);
  }
}

// Network First: tenta rede, salva no cache, usa cache se offline
async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(cacheName).then(async c => {
        // Adiciona timestamp para controle de TTL
        const headers  = new Headers(response.headers);
        headers.set('x-sw-cached-at', Date.now().toString());
        const withTime = new Response(clone.body, { status: clone.status, headers });
        await c.put(request, withTime);
      });
    }
    return response;
  } catch {
    // Offline — retorna do cache se disponível e não expirado
    const cached = await caches.match(request);
    if (cached) {
      const cachedAt = cached.headers.get('x-sw-cached-at');
      if (cachedAt && Date.now() - parseInt(cachedAt) < API_CACHE_TTL) {
        return cached;
      }
    }
    // Retorna lista vazia como fallback seguro
    return new Response(JSON.stringify({ produtos: [], pagination: { total: 0, page: 1, pages: 0 } }), {
      status:  200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Fallback para recursos offline
function offlineFallback(request) {
  const accept = request.headers.get('accept') || '';

  if (accept.includes('text/html')) {
    return caches.match('/index.html');
  }

  if (accept.includes('image')) {
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#2d0718"/>
        <text x="100" y="110" text-anchor="middle" fill="#d4af37" font-family="Arial" font-size="14">Imagem offline</text>
       </svg>`,
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }

  return new Response('Recurso indisponível offline.', {
    status:  503,
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
  });
}

// ===== MENSAGENS DO CLIENTE =====
self.addEventListener('message', event => {
  // Suporte a atualização manual
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // Limpar cache de API manualmente (admin pode chamar ao salvar produtos)
  if (event.data?.type === 'CLEAR_API_CACHE') {
    caches.delete(CACHE_API).then(() =>
      event.source?.postMessage({ type: 'API_CACHE_CLEARED' })
    );
  }
});
