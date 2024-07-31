import type { IronSession } from 'iron-session'
import type { H3Event } from 'h3'
import { sendRedirect, getQuery, getRequestURL } from 'h3'
import { useConfig } from '../config'
import { LogtoNodeClient } from '../utils/types'
import type { LogtoRuntimeConfig, Nullable, GetAccessTokenParameters, LogtoConfig, GetContextParameters, InteractionMode, UserInfoResponse } from '../utils/types'
import NuxtStorage, { type SessionData } from './storage'

/**
 * 封装 logto 的客户端
 */
export class LogtoClient {
  #logtoConfig: LogtoRuntimeConfig
  #storage: NuxtStorage
  #navigateUrl?: string
  #client: LogtoNodeClient
  constructor(session: IronSession<SessionData>, Config: LogtoConfig) {
    this.#logtoConfig = useConfig()
    this.#storage = new NuxtStorage(session)
    this.#client = new LogtoNodeClient(Config, {
      storage: this.#storage,
      navigate: (url) => {
        this.#navigateUrl = url
      },
    })
  }

  get client() {
    return this.#client
  }

  /**
   * handling the sign-in and sign-up route
   * @param {H3Event} event
   * @param {InteractionMode} interactionMode `signIn`: 登录 `signUp`: 注册
   * @returns
   */
  async handleSignIn(event: H3Event, interactionMode?: InteractionMode) {
    const url = getRequestURL(event)
    const redirectUri = new URL(this.#logtoConfig.pathnames.callback, url).href
    await this.#client.signIn({ redirectUri, interactionMode })
    const query = getQuery(event)
    const redirectTo = typeof query.redirectTo === 'string' ? query.redirectTo : void 0
    if (redirectTo) {
      await this.#storage.setItem('redirectTo', redirectTo)
    }
    else {
      await this.#storage.removeItem('redirectTo')
    }
    if (this.#navigateUrl) {
      return sendRedirect(event, this.#navigateUrl)
    }
  }

  /**
   * handling the sign-in callback route
   * @param {H3Event} event
   * @param {string} redirectTo 自定义重定向地址
   * @returns
   */
  async handleSignInCallback(event: H3Event, redirectTo?: string) {
    const url = getRequestURL(event)
    // use redirectTo if it is provided, otherwise use the one saved in storage or the origin
    const storedRedirect = await this.#storage.getItem('redirectTo')
    const redirect = redirectTo ?? new URL(storedRedirect ?? this.#logtoConfig.postCallbackRedirectUri, url).href

    await this.#client.handleSignInCallback(url.href)
    return sendRedirect(event, redirect)
  }

  /**
   * handling the sign-out route
   * @param {H3Event} event
   * @param {string} redirectUri 自定义重定向地址
   * @returns
   */
  async handleSignOut(event: H3Event, redirectUri?: string) {
    const url = getRequestURL(event)
    redirectUri = redirectUri ?? new URL(this.#logtoConfig.postLogoutRedirectUri, url).href
    await this.#client.signOut(redirectUri)
    await this.#storage.destroy()
    if (this.#navigateUrl) {
      return sendRedirect(event, this.#navigateUrl)
    }
  }

  /**
   * handling the user context route
   * @param {H3Event} event
   * @param {GetContextParameters} config
   * @returns
   */
  async handleContext(event: H3Event, config?: GetContextParameters) {
    const query = getQuery<GetContextParameters>(event)
    if (Object.keys(query).length === 0) {
      return await this.#client.getContext(config)
    }
    else {
      const allowKeys = ['fetchUserInfo', 'getAccessToken', 'organizationId', 'resource', 'getOrganizationToken']
      const queryConfig: GetContextParameters = {}
      Object.entries(query).forEach(([key, value]) => {
        if (allowKeys.includes(key) && typeof value === 'string' && value.trim().length > 0) {
          queryConfig[key as keyof GetContextParameters] = JSON.parse(value.toLowerCase())
        }
      })
      return await this.#client.getContext(queryConfig)
    }
  }

  /**
   * handling the userInfo route
   * @param {H3Event} event
   * @returns
   */
  async handleUserInfo(event: H3Event): Promise<Nullable<UserInfoResponse>> {
    if (await this.isAuthenticated()) {
      return await this.#client.fetchUserInfo()
    }
    event.node.res.statusCode = 401
    return
  }

  /**
   * handling the accessToken route
   * @param {H3Event} event
   * @returns
   */
  async handleAccessToken(event: H3Event): Promise<Nullable<string>> {
    let resource: Nullable<string> = void 0
    let organizationId: Nullable<string> = void 0
    if (await this.isAuthenticated()) {
      const query = getQuery<GetAccessTokenParameters>(event)
      Object.entries(query).forEach(([key, value]) => {
        if (key === 'resource' && value.trim().length > 0 && this.#logtoConfig.resources && this.#logtoConfig.resources.includes(value)) {
          resource = value
        }
        if (key === 'organizationId' && value.trim().length > 0) {
          organizationId = value
        }
      })
      return await this.#client.getAccessToken(resource, organizationId)
    }
    event.node.res.statusCode = 401
    return
  }

  async isAuthenticated() {
    return await this.#client.isAuthenticated()
  }
}
