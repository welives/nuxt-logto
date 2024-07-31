import NuxtLogto from '../../../src/module'

export default defineNuxtConfig({
  ssr: true,
  // @ts-expect-error test module no need check
  modules: [NuxtLogto],
})
