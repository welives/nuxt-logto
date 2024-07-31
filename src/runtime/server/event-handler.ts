import { defineEventHandler, getRequestURL } from 'h3'
import { getIronSession } from 'iron-session'
import type { LogtoRuntimeConfig } from '../utils/types'
import { defaults } from '../utils/constants'
import { LogtoClient } from '../logto/client'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const logtoConfig = useRuntimeConfig(event).logto as LogtoRuntimeConfig

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
  } = logtoConfig

  const defaultValueKeys = Object.entries(defaults)
    // @ts-expect-error The type of `key` can only be string
    .filter(([key, value]) => logtoConfig[key] === value)
    .map(([key]) => key)

  if (defaultValueKeys.length > 0) {
    console.warn(
      `The following Logto configuration keys have default values: ${defaultValueKeys.join(
        ', ',
      )}. Please replace them with your own values.`,
    )
  }

  const url = getRequestURL(event)
  const session = await getIronSession(event.node.req, event.node.res, {
    cookieName: cookieName ?? `logto:${clientConfig.appId}`,
    password: cookieEncryptionKey,
    cookieOptions: {
      secure: cookieSecure,
      maxAge: 14 * 24 * 60 * 60,
    },
  })
  const logto = new LogtoClient(session, clientConfig)

  switch (url.pathname) {
    case pathnames.signIn:
      return logto.handleSignIn(event)
    case pathnames.signUp:
      return logto.handleSignIn(event, 'signUp')
    case pathnames.signOut:
      return logto.handleSignOut(event)
    case pathnames.callback:
      return logto.handleSignInCallback(event)
    case pathnames.context:
      return logto.handleContext(event, { getAccessToken, fetchUserInfo })
    case pathnames.userInfo:
      return logto.handleUserInfo(event)
    case pathnames.accessToken:
      return logto.handleAccessToken(event)
  }

  event.context.logtoClient = logto.client
})
