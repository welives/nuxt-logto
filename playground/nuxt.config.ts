import { Buffer } from 'node:buffer'

export default defineNuxtConfig({
  modules: ['../src/module'],
  ssr: true,

  logto: {
    endpoint: process.env.NUXT_LOGTO_ENDPOINT,
    appId: process.env.NUXT_LOGTO_APP_ID,
    appSecret: process.env.NUXT_LOGTO_APP_SECRET,
    cookieEncryptionKey: Buffer.from(process.env.NUXT_LOGTO_COOKIE_ENCRYPTION_KEY!).toString('base64'),
    cookieSecure: process.env.NODE_ENV === 'production',
    origin: `http://${process.env.NUXT_HOST}:${process.env.NUXT_PORT}`,
    resources: ['http://localhost:4000'],
    pathnames: {
      signIn: '/logto/sign-in',
      signUp: '/logto/sign-up',
      signOut: '/logto/sign-out',
      callback: '/logto/callback',
    },
  },

  compatibilityDate: '2024-07-31',
})
