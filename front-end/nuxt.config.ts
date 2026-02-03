// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // server: {
  //   host: true
  // },
  devServer: {
    port: 8888
  },
  // Valores padrão aqui; NUXT_* no .env sobrescrevem em runtime (dev e produção).
  runtimeConfig: {
    apiSecret: '', // sobrescrito por NUXT_API_SECRET
    public: {
      apiBase: '' // sobrescrito por NUXT_PUBLIC_API_BASE
    }
  },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: ['~/assets/css/main.css']
})
