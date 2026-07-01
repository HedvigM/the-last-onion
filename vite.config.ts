import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    vueJsx(),
    ...(mode === 'development' ? [vueDevTools()] : []),
    VitePWA({
      registerType: 'prompt',
      includeManifestIcons: false,
      manifest: {
        name: 'The Last Onion',
        short_name: 'Onion',
        description: 'Shared grocery lists for households',
        theme_color: '#2d6a4f',
        background_color: '#f7f4ed',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^\/(?!api).*/],
        globPatterns: ['**/*.{js,css,html,ico,png,webmanifest}'],
        globIgnores: [
          '**/icon-source.svg',
          '**/maskable-icon-source.svg',
          '**/pwa-512x512.png',
          '**/maskable-icon.png',
          '**/assets/*View-*.js',
          '**/assets/*View-*.css',
          '**/assets/MarketingShell-*.js',
          '**/assets/MarketingShell-*.css',
          '**/assets/LanguageToggle-*.js',
          '**/assets/LanguageToggle-*.css',
          '**/assets/useCategoryLabel-*.js',
          '**/assets/lists-*.js',
          '**/assets/workbox-window.prod.es5-*.js',
        ],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => {
              const apiOrigin = new URL(process.env.VITE_API_URL ?? 'http://localhost:3001').origin
              if (url.origin !== apiOrigin) return false
              return (
                url.pathname.startsWith('/auth') ||
                url.pathname.includes('/households') ||
                url.pathname.includes('/lists') ||
                url.pathname.includes('/categories') ||
                url.pathname.includes('/usual') ||
                url.pathname.includes('/invites')
              )
            },
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ request, url }) =>
              url.origin === self.location.origin &&
              url.pathname.startsWith('/assets/') &&
              (request.destination === 'script' || request.destination === 'style'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: ({ request, url }) =>
              url.origin === self.location.origin &&
              request.destination === 'image' &&
              /\.(?:png|ico|svg|webp)$/i.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 20, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
}))
