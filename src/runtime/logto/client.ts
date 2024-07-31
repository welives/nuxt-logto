import type { LogtoConfig, GetContextParameters, InteractionMode } from '@logto/node'
import type { IronSession } from 'iron-session'
import type { H3Event } from 'h3'
import { sendRedirect, getQuery, getRequestURL } from 'h3'
import { useConfig } from '../config'
import { LogtoNodeClient } from '../utils/types'
import type { LogtoRuntimeConfig, Nullable } from '../utils/types'
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
   * 处理登录和注册的路由
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
   * logto 的登录和注册回调
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
   * 退出路由
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
   * 用户上下文信息路由
   * @param config
   * @returns
   */
  async handleContext(config?: GetContextParameters) {
    return await this.#client.getContext(config)
  }

  async handleIdToken(): Promise<Nullable<string>> {
    if (await this.isAuthenticated()) {
      return await this.#client.getIdToken()
    }
    return null
  }

  async handleUserInfo() {
    return await this.#client.fetchUserInfo()
  }

  async isAuthenticated() {
    return await this.#client.isAuthenticated()
  }
}
