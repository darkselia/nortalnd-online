import { fileURLToPath } from 'node:url';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
  ],

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }],
    },
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  runtimeConfig: {
    backendOrigin: '',
  },

  routeRules: {
    '/': { prerender: true },
    '/api/**': { cache: false },
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    alias: {

      // Keep the Node transport: Nitro's default alias otherwise rewrites this subpath.
      'node-fetch-native/node': fileURLToPath(import.meta.resolve('node-fetch-native/node')),
    },
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'always-multiline',
        braceStyle: '1tbs',
      },
    },
  },
});
