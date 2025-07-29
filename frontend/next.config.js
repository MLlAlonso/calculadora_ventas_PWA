const webpack = require('webpack');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/_offline',
  },

  runtimeCaching: [
    {
      urlPattern: ({ url }) => url.origin === process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL_ONLY_DOMAIN,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-data-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 5 * 60,
        },
      },
    },
    {
      urlPattern: ({ url }) => url.origin === process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL_ONLY_DOMAIN,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-data-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 5 * 60,
        },
      },
    },
    {
      urlPattern: /^(http|https):\/\/.*\/_next\/image\?url=.*$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-images-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: new RegExp(`^${process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL}\/(courses|price-ranges)$`, 'i'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-get-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
  ],
});

const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_API_BASE_URL: process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || 'http://localhost:3001/api',
    NEXT_PUBLIC_BACKEND_API_BASE_URL_ONLY_DOMAIN: process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL_ONLY_DOMAIN || 'http://localhost:3001',
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.SERVICE_WORKER_BACKEND_URL': JSON.stringify(process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL_ONLY_DOMAIN),
        })
      );
    }
    return config;
  },
};

module.exports = withPWA(nextConfig);