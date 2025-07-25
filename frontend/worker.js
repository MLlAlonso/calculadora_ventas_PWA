// frontend/public/worker.js
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Puedes descomentar esto para depuración si necesitas ver los logs de Workbox
// self.workbox.core.setLogLevel(self.workbox.core.LOG_LEVELS.DEBUG);

// next-pwa inyecta la lista de archivos a precachear aquí. No la dupliques manualmente.
precacheAndRoute(self.__WB_MANIFEST || []);

// Regla para la API de cursos (/api/courses) - CacheFirst
registerRoute(
  ({ url }) => url.pathname === '/api/courses' &&
               (url.hostname === 'localhost' || 
                url.hostname === '192.168.120.99' || 
                url.origin === 'https://pages.elhubdeseguridad.com'), // <-- ¡Origen de tu BACKEND en PROD!
  new CacheFirst({
    cacheName: 'courses-api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 días
        maxEntries: 1, 
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Regla para la API de cálculo de precios y otros GETs/POSTs a /api/ - NetworkFirst
// Nota: La ruta '/api/calculate-price' usa POST, y esta regla aplica a GET.
// Para POST, necesitas una regla POST explícita o gestionarlo de forma diferente.
// Sin embargo, si tu lógica offline maneja el cálculo, esta regla de caché no es tan crítica para calculate-price POST.
// Para otros GETs a /api/ (como /api/price-ranges), esta regla es útil.
registerRoute(
  ({ url, request }) => url.pathname.startsWith('/api/') && request.method === 'GET' &&
               (url.hostname === 'localhost' || 
                url.hostname === '192.168.120.99' || 
                url.origin === 'https://pages.elhubdeseguridad.com'), // <-- ¡Origen de tu BACKEND en PROD!
  new NetworkFirst({
    cacheName: 'other-api-get-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24, // 24 horas
        maxEntries: 10,
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// --- Manejo de eventos del Service Worker (generalmente no necesitan cambios) ---
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    console.log('Service Worker: skipWaiting() ejecutado.');
  }
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Service Worker: install event, skipWaiting() ejecutado.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: activate event.');
  event.waitUntil(clients.claim());
});