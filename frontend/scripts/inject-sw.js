// frontend/scripts/inject-sw.js
const fs = require('fs');
const path = require('path');

const workerSrc = path.resolve(__dirname, '../worker.js');
const swDest = path.resolve(__dirname, '../public/sw.js');

try {
  const workerContent = fs.readFileSync(workerSrc, 'utf8');
  let swContent = fs.readFileSync(swDest, 'utf8');

  // Solo inyectar si la lógica no está ya presente para evitar duplicados
  if (!swContent.includes('import { precacheAndRoute } from \'workbox-precaching\';')) {
    swContent = workerContent + '\n' + swContent;
    fs.writeFileSync(swDest, swContent);
    console.log('✅ Service Worker personalizado inyectado en public/sw.js');
  } else {
    console.log('ℹ️ Service Worker personalizado ya inyectado.');
  }
} catch (error) {
  console.error('❌ Error al inyectar Service Worker personalizado:', error);
  console.log('Asegúrate de que worker.js y public/sw.js existen.');
}