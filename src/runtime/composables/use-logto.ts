import { withQuery, joinURL } from 'ufo'
import type { LogtoContext, UserInfoResponse } from '@logto/node'
import { computed, useNuxtApp } from '#imports'
import { useLogtoState } from './use-logto-state'
import { LogtoNodeClient, Pathnames } from '../utils/types'
import type { LogtoRuntimeConfig } from '../utils/types'

export function useLogto() {
  const nuxtApp = useNuxtApp()
  const client: LogtoNodeClient | undefined = nuxtApp.ssrContext?.event.context.logtoClient
  const { origin, pathnames } = nuxtApp.$config.public.logto as LogtoRuntimeConfig
  const { data } = useLogtoState()

  const isAuthenticated = computed(() => data.value?.isAuthenticated ?? false)
  const claims = computed(() => data.value?.claims)
  const userInfo = computed(() => data.value?.userInfo)
  const accessToken = computed(() => data.value?.accessToken)

  /**
   * Fetch the user context. This is automatically called once when the plugin is loaded.
   *
   * It can be used to refresh the user context.
   */
  async function fetchContext() {
    joinURL(origin, Pathnames.CONTEXT)
    const url = joinURL(origin, Pathnames.CONTEXT)
    data.value = await $fetch<LogtoContext>(url)
  }

  async function fetchUserInfo() {
    const url = joinURL(origin, Pathnames.USER_INFO)
    return await $fetch<UserInfoResponse>(url)
  }

  async function fetchIdToken() {
    const url = joinURL(origin, Pathnames.ID_TOKEN)
    return await $fetch<string>(url)
  }

  function signIn(redirectTo?: string) {
    window.location.assign(getSignInUrl(redirectTo))
  }

  function getSignInUrl(redirectTo?: string) {
    return withQuery(joinURL(origin, pathnames.signIn ?? Pathnames.SIGN_IN), { redirectTo })
  }

  function signUp(redirectTo?: string) {
    window.location.assign(getSignUpUrl(redirectTo))
  }

  function getSignUpUrl(redirectTo?: string) {
    return withQuery(joinURL(origin, pathnames.signUp ?? Pathnames.SIGN_UP), { redirectTo })
  }

  function signOut() {
    window.location.assign(joinURL(origin, pathnames.signOut ?? Pathnames.SIGN_OUT))
  }

  return {
    client,
    isAuthenticated,
    claims,
    userInfo,
    accessToken,
    fetchContext,
    fetchUserInfo,
    fetchIdToken,
    signIn,
    signUp,
    signOut,
  }
}
export default useLogto
