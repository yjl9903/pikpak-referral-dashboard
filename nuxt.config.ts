// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/tailwindcss'],
  css: ['~/assets/styles/main.css'],

  nitro: {
    prerender: {
      autoSubfolderIndex: false
    },
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: 'pikpak-referral'
      }
    }
  },

  vite: {
    server: {
      allowedHosts: [
        'pikpak-referral.onekuma.cn'
      ]
    }
  }
})