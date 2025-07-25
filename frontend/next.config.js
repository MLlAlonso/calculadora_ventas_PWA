// calculadora_ventas_pwa/frontend/next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: false,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // <--- Importante: Deshabilitar PWA en desarrollo
  fallbacks: {
    document: '/_offline',
  },
  // Si usas un worker.js personalizado, descomenta esto
  // customWorkerSrc: 'worker.js', 
  buildExcludes: [/middleware-manifest\.json$/, /_buildManifest\.js$/, /_ssgManifest\.js$/],
  // No coloques runtimeCaching aquí para desarrollo, se activa en producción
});

const nextConfig = {
  // Para desarrollo en localhost, NO necesitas basePath
  // Si la aplicación se va a desplegar en un subdirectorio en producción,
  // aquí DEBERÁS configurar basePath a '/calculapp' SOLO PARA PRODUCCIÓN.
  // Puedes usar una variable de entorno, por ejemplo:
  // basePath: process.env.NEXT_PUBLIC_BASE_PATH || '', 
  // Por ahora, para localhost, asegúrate de que no haya un basePath que añada /calculapp

  env: {
    NEXT_PUBLIC_BACKEND_API_BASE_URL: 'http://localhost:3001',
  },
  // Asegúrate de que no haya assetPrefix si estás usando basePath (para producción)
};

module.exports = withPWA(nextConfig);