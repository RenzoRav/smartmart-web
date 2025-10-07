import Aura from '@primeuix/themes/aura'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  pages: true,
  ssr: false,

  runtimeConfig: {
    public: {
      api: '/api',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
    },
  },

  routeRules: { '/': { redirect: '/login', ssr: false } },
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
