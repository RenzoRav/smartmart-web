import Aura from '@primeuix/themes/aura'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  pages: true,
  ssr: false,

  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/smartmart-web/' : '/'
  },

  nitro: { preset: 'github-pages' },

  runtimeConfig: {
    public: {
      api: '/api',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
    },
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/styles/main.css', 'primeicons/primeicons.css'],
  build: { transpile: ['primevue'] },
  vite: { plugins: [tailwindcss()] },
  modules: ['@primevue/nuxt-module', '@nuxt/ui'],
  primevue: {
    autoImport: true,
    options: {
      ripple: true,
      inputVariant: 'filled',
      theme: { preset: Aura, options: { darkModeSelector: 'class' } },
    },
  },
})
