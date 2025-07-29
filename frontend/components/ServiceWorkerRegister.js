// frontend/components/ServiceWorkerRegister.js
'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      console.log('Intentando registrar Service Worker...');
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(registration => {
          console.log('✅ Service Worker registrado con éxito:', registration);
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            console.log('Service Worker esperando, forzando activación...');
          }
          if (registration.active) {
            console.log('Service Worker ya está activo.');
          }
        })
        .catch(error => {
          console.error('❌ Fallo el registro del Service Worker:', error);
        });
    } else {
      console.log('Tu navegador no soporta Service Workers.');
    }
  }, []);

  return null;
}