import { withQuery, joinURL } from 'ufo'
import { decodeJwt } from 'jose'
import type { LogtoRuntimeConfig, LogtoNodeClient, GetAccessTokenParameters, ITokenData, LogtoContext, UserInfoResponse, GetContextParameters } from '../utils/types'
import { LogtoStateKey } from '../utils/constants'
import { useLogtoState } from './use-logto-state'
import { computed, readonly, useNuxtApp, useState } from '#imports'

export function useLogto() {
  const nuxtApp = useNuxtApp()
  const client: LogtoNodeClient | undefined = nuxtApp.ssrContext?.event.context.logtoClient
  const { origin, pathnames } = nuxtApp.$config.public.logto as LogtoRuntimeConfig
  const { data } = useLogtoState()

  const isAuthenticated = computed(() => data.value?.isAuthenticated ?? false)
  const claims = computed(() => data.value?.claims)
  const userInfo = computed(() => data.value?.userInfo)
  const accessToken = computed(() => data.value?.accessToken)
  const resourceTokenMap = useState<Map<string, ITokenData>>(LogtoStateKey.RESOURCE, () => new Map<string, ITokenData>())

  /**
   * Fetch the user context. This is automatically called once when the plugin is loaded.
   *
   * It can be used to refresh the user context.
   */
  async function fetchContext(config: GetContextParameters = {}) {
    try {
      const url = joinURL(origin, pathnames.context)
      data.value = await $fetch<LogtoContext>(withQuery(url, config))
    }
    // eslint-disable-next-line
    catch (err) { }
  }

  async function fetchUserInfo() {
    if (!isAuthenticated.value) return

    try {
      return await $fetch<UserInfoResponse>(joinURL(origin, pathnames.userInfo))
    }
    catch (err) {
      return
    }
  }

  async function fetchAccessToken(config: GetAccessTokenParameters = {}) {
    if (!isAuthenticated.value) return

    try {
      let token = config.resource ? loadCachedToken(config.resource) : null
      if (token) return token

      const url = joinURL(origin, pathnames.accessToken)
      token = await $fetch<string>(withQuery(url, config))
      if (config.resource && token) {
        cacheToken(config.resource, token)
      }
      return token
    }
    catch (err) {
      return
    }
  }

  function signIn(redirectTo?: string) {
    window.location.assign(withQuery(joinURL(origin, pathnames.signIn), { redirectTo }))
  }

  function signUp(redirectTo?: string) {
    window.location.assign(withQuery(joinURL(origin, pathnames.signUp), { redirectTo }))
  }

  function signOut() {
    window.location.assign(joinURL(origin, pathnames.signOut))
  }

  function cacheToken(resource: string, token: string) {
    if (!resourceTokenMap.value.get(resource)) {
      resourceTokenMap.value.set(resource, { token, payload: decodeJwt(token) })
    }
    else {
      resourceTokenMap.value.delete(resource)
      resourceTokenMap.value.set(resource, { token, payload: decodeJwt(token) })
    }
  }

  function loadCachedToken(resource: string) {
    const tokenData = resourceTokenMap.value.get(resource)
    if (tokenData) {
      const remainTime = tokenData.payload.exp ? tokenData.payload.exp - getNow() : 0
      if (remainTime <= 0) return

      let totalTime = 0
      if (tokenData.payload.exp && tokenData.payload.iat) {
        totalTime = tokenData.payload.exp - tokenData.payload.iat
      }
      return remainTime > Math.ceil(totalTime * 0.1) ? tokenData.token : void 0
    }
  }

  function getNow() {
    return Math.ceil(Date.now() / 1000)
  }

  return {
    client,
    isAuthenticated: readonly(isAuthenticated),
    accessToken: readonly(accessToken),
    resourceTokenMap: readonly(resourceTokenMap),
    claims,
    userInfo,
    fetchContext,
    fetchUserInfo,
    fetchAccessToken,
    signIn,
    signUp,
    signOut,
  }
}
