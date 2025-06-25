// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  css: ['~/assets/styles/main.css'],

  modules: ['@nuxt/ui', '@nuxtjs/tailwindcss', '@pinia/nuxt', '@vueuse/nuxt', 'shadcn-nuxt', 'nuxt-charts'],

  app: {
    head: {
      title: 'PikPak 引荐计划 Pro',
      viewport: 'width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover',
      htmlAttrs: {
        lang: 'zh-CN'
      },
      link: [],
      meta: [],
      script: []
    }
  },

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
      allowedHosts: ['pikpak-referral.onekuma.cn']
    },
    plugins: [
    ]
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  }
});