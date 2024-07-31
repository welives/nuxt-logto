# Nuxt Logto

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
[![Logto][logto-src]][logto-href]

Logto auth module for Nuxt 3.

## Quick Setup

1. Add `@welives/nuxt-logto` dependency to your project

```bash
# Using pnpm
pnpm add @welives/nuxt-logto

# Using yarn
yarn add @welives/nuxt-logto

# Using npm
npm install @welives/nuxt-logto
```

2. Add `@welives/nuxt-logto` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ['@welives/nuxt-logto'],
})
```

3. Configure it:

```js
export default defineNuxtConfig({
  modules: ['@welives/nuxt-logto'],
  logto: {
    appId: '<your-application-id>',
    appSecret: '<your-app-secret-copied-from-console>',
    endpoint: '<your-logto-endpoint>', // E.g. http://localhost:3001
    origin: '<your-nextjs-app-origin>', // E.g. http://localhost:3000
    cookieEncryptionKey: 'complex_password_at_least_32_characters_long',
    cookieSecure: process.env.NODE_ENV === 'production',
    resources: ['<your-resource-id>'], // optionally add a resource
  },
})
```

4. Use the composable

```vue
<script setup lang="ts">
const { signIn, signOut } = useLogto()
</script>

<template>
  <div>
    <button @click="() => signIn()">Login</button>
    <button @click="() => signOut()">Logout</button>
  </div>
</template>
```

That's it! You can now use Nuxt Logto in your Nuxt app ✨

## Custom the api routes

```js
export default defineNuxtConfig({
  modules: ['@welives/nuxt-logto'],
  logto: {
    // ...
    // append your api route
    pathnames: {
      signIn: '/logto/sign-in', // default /sign-in
      signUp: '/logto/sign-up', // default /sign-up
      signOut: '/logto/sign-out', // default /sign-out
      callback: '/logto/callback', // default /callback
    },
  },
})
```

## Get sample

A sample project can be found at [playground](./playground/).

The minimal configuration to run the playground is (use `.env` file for example):

```env
NUXT_LOGTO_ENDPOINT=<your-logto-endpoint>
NUXT_LOGTO_APP_ID=<your-logto-app-id>
NUXT_LOGTO_APP_SECRET=<your-logto-app-secret>
NUXT_LOGTO_COOKIE_ENCRYPTION_KEY=<random-string>
```

## Development

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm run dev:prepare

# Develop with the playground
pnpm run dev

# Build the playground
pnpm run dev:build

# Run ESLint
pnpm run lint

# Run Vitest
pnpm run test
pnpm run test:watch

# Release new version
npm run release
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@welives/nuxt-logto/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@welives/nuxt-logto
[npm-downloads-src]: https://img.shields.io/npm/dm/@welives/nuxt-logto.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@welives/nuxt-logto
[license-src]: https://img.shields.io/npm/l/@welives/nuxt-logto.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: ./LICENSE
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
[logto-src]: https://img.shields.io/badge/website-logto.io-8262F8.svg
[logto-href]: https://logto.io
