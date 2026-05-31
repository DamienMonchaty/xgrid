// https://nuxt.com/docs/api/configuration/nuxt-config
const isGhPages = process.env.DEPLOY_TARGET === 'gh-pages'

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    baseURL: isGhPages ? '/xgrid/' : '/',
    buildAssetsDir: '/_nuxt/',
  },

  // Static SPA for GitHub Pages: pre-render only the entry; the SPA router
  // takes over for the rest (a 404.html fallback handles deep links).
  nitro: {
    experimental: { websocket: true },
    prerender: {
      crawlLinks: false,
      routes: ['/'],
    },
  },

  components: [
    { path: '~/components', pathPrefix: false }
  ],
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@compodium/nuxt',
  ],

  css: ['~/assets/css/main.css'],
  
  // Configuration des auto-imports
  imports: {
    dirs: [
      'stores/**',
      'composables/**',
      'utils/**',
      'types/**'
    ]
  },
  
  // Configuration TypeScript
  typescript: {
    typeCheck: false // Désactivé temporairement pour éviter les erreurs de dépendances
  },
  
  // Variables d'environnement
  runtimeConfig: {
    public: {
      apiBase: process.env.NODE_ENV === 'production' ? '/api' : '/api',
      dev: process.env.NODE_ENV === 'development'
    }
  },
  
  // Configuration de la gestion d'erreurs
  experimental: {
    // Gestion automatique des erreurs de chunks (rechargement en cas d'erreur)
    emitRouteChunkError: 'automatic'
  }
})