import type { H3Event } from 'h3'
import { sendRedirect, getQuery, getRequestURL } from 'h3'
import { decodeJwt } from 'jose'
import { useConfig } from '../config'
import type { LogtoRuntimeConfig, Nullable, GetAccessTokenParameters, GetContextParameters, InteractionMode, UserInfoResponse, ITokenData } from '../utils/types'
import { createLogtoClient } from './client'

/**
 * logto event handler
 */
export class LogtoEvent {
  constructor(private readonly event: H3Event) {
    this.#logtoConfig = useConfig()
  }

  #logtoConfig: LogtoRuntimeConfig
  #resourceTokenMap = new Map<string, ITokenData>()

  /**
   * get logto raw client
   * @returns
   */
  async getClient() {
    const logto = await createLogtoClient(this.event, this.#logtoConfig)
    return logto.client
  }

  /**
   * handling the sign-in and sign-up route
   * @param {string} redirectUri
   * @param {InteractionMode} interactionMode `signIn`: 登录 `signUp`: 注册
   * @returns
   */
  async handleSignIn(
    redirectUri = new URL(this.#logtoConfig.pathnames.callback, this.#logtoConfig.origin).href,
    interactionMode?: InteractionMode,
  ) {
    const logto = await createLogtoClient(this.event, this.#logtoConfig)
    await logto.client.signIn({ redirectUri, interactionMode })
    const query = getQuery(this.event)
    const redirectTo = typeof query.redirectTo === 'string' ? query.redirectTo : void 0
    if (redirectTo) {
      await logto.storage.setItem('redirectTo', redirectTo)
    }
    else {
      await logto.storage.removeItem('redirectTo')
    }
    if (logto.navigateUrl) {
      return sendRedirect(this.event, logto.navigateUrl)
    }
  }

  /**
   * handling the sign-in callback route
   * @param {string} redirectTo 自定义重定向地址
   * @returns
   */
  async handleSignInCallback(redirectTo?: string) {
    const logto = await createLogtoClient(this.event, this.#logtoConfig)
    const url = getRequestURL(this.event)
    // use redirectTo if it is provided, otherwise use the one saved in storage or the origin
    const storedRedirect = await logto.storage.getItem('redirectTo')
    const redirect = redirectTo ?? new URL(storedRedirect ?? this.#logtoConfig.postCallbackRedirectUri, url).href

    await logto.client.handleSignInCallback(url.href)
    return sendRedirect(this.event, redirect)
  }

  /**
   * handling the sign-out route
   * @param {string} redirectUri 自定义重定向地址
   * @returns
   */
  async handleSignOut(redirectUri?: string) {
    const logto = await createLogtoClient(this.event, this.#logtoConfig)
    const url = getRequestURL(this.event)
    redirectUri = redirectUri ?? new URL(this.#logtoConfig.postLogoutRedirectUri, url).href
    await logto.client.signOut(redirectUri)
    await logto.storage.destroy()
    if (logto.navigateUrl) {
      return sendRedirect(this.event, logto.navigateUrl)
    }
  }

  /**
   * handling the user context route
   * @param {GetContextParameters} config
   * @returns
   */
  async handleContext(config?: GetContextParameters) {
    const logto = await createLogtoClient(this.event, this.#logtoConfig)
    const query = getQuery<GetContextParameters>(this.event)
    if (Object.keys(query).length === 0) {
      return await logto.client.getContext(config)
    }
    else {
      const booleanKeys = ['fetchUserInfo', 'getAccessToken', 'getOrganizationToken']
      const stringKeys = ['organizationId', 'resource']
      const queryConfig: GetContextParameters = {}
      Object.entries(query).forEach(([key, value]) => {
        if (booleanKeys.includes(key) && typeof value === 'string' && value.trim().length > 0) {
          queryConfig[key as keyof GetContextParameters] = JSON.parse(value.toLowerCase())
        }
        if (stringKeys.includes(key) && typeof value === 'string' && value.trim().length > 0) {
          // @ts-expect-error wtf, why typescript error this
          queryConfig[key as keyof GetContextParameters] = value
        }
      })
      return await logto.client.getContext(queryConfig)
    }
  }

  /**
   * handling the userInfo route
   * @returns
   */
  async handleUserInfo(): Promise<Nullable<UserInfoResponse>> {
    const logto = await createLogtoClient(this.event, this.#logtoConfig)
    if (await logto.client.isAuthenticated()) {
      return await logto.client.fetchUserInfo()
    }
    this.event.node.res.statusCode = 401
    return
  }

  /**
   * handling the accessToken route
   * @returns
   */
  async handleAccessToken(): Promise<Nullable<string>> {
    const logto = await createLogtoClient(this.event, this.#logtoConfig)
    let resource: Nullable<string> = void 0
    let organizationId: Nullable<string> = void 0
    if (await logto.client.isAuthenticated()) {
      const query = getQuery<GetAccessTokenParameters>(this.event)
      Object.entries(query).forEach(([key, value]) => {
        if (key === 'resource' && value.trim().length > 0 && this.#logtoConfig.resources && this.#logtoConfig.resources.includes(value)) {
          resource = value
        }
        if (key === 'organizationId' && value.trim().length > 0) {
          organizationId = value
        }
      })
      return await logto.client.getAccessToken(resource, organizationId)
    }
    this.event.node.res.statusCode = 401
    return
  }

  async getAccessTokenServerSide(resource?: string | undefined, organizationId?: string | undefined) {
    const logto = await createLogtoClient(this.event, this.#logtoConfig)
    if (!(await logto.client.isAuthenticated())) return

    try {
      let token = resource ? this.loadCachedToken(resource) : null
      if (token) return token

      if (resource?.trim() && this.#logtoConfig.resources && this.#logtoConfig.resources.includes(resource)) {
        token = await logto.client.getAccessToken(resource, organizationId)
      }
      else {
        token = await logto.client.getAccessToken(void 0, organizationId)
      }

      if (resource && token) {
        this.cacheToken(resource, token)
      }
      return token
    }
    catch (err) {
      return
    }
  }

  private cacheToken(resource: string, token: string) {
    if (!this.#resourceTokenMap.get(resource)) {
      this.#resourceTokenMap.set(resource, { token, payload: decodeJwt(token) })
    }
    else {
      this.#resourceTokenMap.delete(resource)
      this.#resourceTokenMap.set(resource, { token, payload: decodeJwt(token) })
    }
  }

  private loadCachedToken(resource: string) {
    const tokenData = this.#resourceTokenMap.get(resource)
    if (tokenData) {
      const remainTime = tokenData.payload.exp ? tokenData.payload.exp - this.getNow() : 0
      if (remainTime <= 0) return

      let totalTime = 0
      if (tokenData.payload.exp && tokenData.payload.iat) {
        totalTime = tokenData.payload.exp - tokenData.payload.iat
      }
      return remainTime > Math.ceil(totalTime * 0.1) ? tokenData.token : void 0
    }
  }

  private getNow() {
    return Math.ceil(Date.now() / 1000)
  }
}
