import { Buffer } from 'node:buffer'

// http://localhost:4000/api
const __API_URL__ = new URL(process.env.NUXT_API_PREFIX!, process.env.NUXT_BASE_API).href

export default defineNuxtConfig({
  modules: ['../src/module'],
  ssr: true,
  nitro: {
    devProxy: {
      '/api': {
        target: __API_URL__,
        changeOrigin: true,
        prependPath: true,
      },
    },
  },

  logto: {
    endpoint: process.env.NUXT_LOGTO_ENDPOINT,
    appId: process.env.NUXT_LOGTO_APP_ID,
    appSecret: process.env.NUXT_LOGTO_APP_SECRET,
    cookieEncryptionKey: Buffer.from(process.env.NUXT_LOGTO_COOKIE_ENCRYPTION_KEY!).toString('base64'),
    cookieSecure: process.env.NODE_ENV === 'production',
    origin: `http://${process.env.NUXT_HOST}:${process.env.NUXT_PORT}`,
    resources: [__API_URL__],
    pathnames: {
      signIn: '/logto/sign-in',
      signUp: '/logto/sign-up',
      signOut: '/logto/sign-out',
      callback: '/logto/callback',
    },
  },
  runtimeConfig: {
    __API_URL__,
  },
  vite: {
    define: {
      // 自定义全局变量
      __API_URL__: JSON.stringify(__API_URL__),
    },
  },

  compatibilityDate: '2024-07-31',
})
