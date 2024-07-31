import { defineNuxtPlugin } from '#app'
import { useLogto } from './composables/use-logto'
import { useLogtoState } from './composables/use-logto-state'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { fetchContext } = useLogto()
  const { data } = useLogtoState()

  if (data.value === void 0) await fetchContext()

  const unmount = nuxtApp.vueApp.unmount
  nuxtApp.vueApp.unmount = function () {
    data.value = void 0
    unmount()
  }
})
