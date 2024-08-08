import type { IronSession } from 'iron-session'
import { getIronSession } from 'iron-session'
import type { H3Event } from 'h3'
import { LogtoNodeClient } from '../utils/types'
import type { LogtoRuntimeConfig, LogtoConfig } from '../utils/types'
import NuxtStorage, { type SessionData } from './storage'

/**
 * 封装 logto 客户端
 */
export class LogtoClient {
  navigateUrl?: string
  storage: NuxtStorage
  client: LogtoNodeClient
  constructor(session: IronSession<SessionData>, config: LogtoConfig) {
    this.storage = new NuxtStorage(session)
    this.client = new LogtoNodeClient(config, {
      storage: this.storage,
      navigate: (url) => {
        this.navigateUrl = url
      },
    })
  }
}

export async function createLogtoClient(event: H3Event, config: LogtoRuntimeConfig) {
  const {
    origin,
    cookieSecure,
    cookieName,
    cookieEncryptionKey,
    fetchUserInfo,
    getAccessToken,
    pathnames,
    postCallbackRedirectUri,
    postLogoutRedirectUri,
    ...clientConfig
  } = config
  const session = await getIronSession(event.node.req, event.node.res, {
    cookieName: cookieName ?? `logto:${clientConfig.appId}`,
    password: cookieEncryptionKey,
    cookieOptions: {
      secure: cookieSecure,
      maxAge: 14 * 24 * 60 * 60,
    },
  })
  return new LogtoClient(session, clientConfig)
}
