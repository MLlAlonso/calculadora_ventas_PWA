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
/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-e43f5367'], (function (workbox) { 'use strict';

  importScripts("fallback-development.js");
  self.skipWaiting();
  workbox.clientsClaim();
  workbox.registerRoute("/calculapp", new workbox.NetworkFirst({
    "cacheName": "start-url",
    plugins: [{
      cacheWillUpdate: async ({
        request,
        response,
        event,
        state
      }) => {
        if (response && response.type === 'opaqueredirect') {
          return new Response(response.body, {
            status: 200,
            statusText: 'OK',
            headers: response.headers
          });
        }
        return response;
      }
    }, {
      handlerDidError: async ({
        request
      }) => self.fallback(request)
    }]
  }), 'GET');
  workbox.registerRoute(/.*/i, new workbox.NetworkOnly({
    "cacheName": "dev",
    plugins: [{
      handlerDidError: async ({
        request
      }) => self.fallback(request)
    }]
  }), 'GET');

}));
//# sourceMappingURL=sw.js.map
