import { defineEventHandler, getRequestURL } from 'h3'
import type { LogtoRuntimeConfig } from '../utils/types'
import { defaults } from '../utils/constants'
import { LogtoEvent } from '../logto/event'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const logtoConfig = useRuntimeConfig(event).logto as LogtoRuntimeConfig

  const { fetchUserInfo, getAccessToken, pathnames } = logtoConfig

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
  const logto = new LogtoEvent(event)

  switch (url.pathname) {
    case pathnames.signIn:
      return logto.handleSignIn()
    case pathnames.signUp:
      return logto.handleSignIn(void 0, 'signUp')
    case pathnames.signOut:
      return logto.handleSignOut()
    case pathnames.callback:
      return logto.handleSignInCallback()
    case pathnames.context:
      return logto.handleContext({ getAccessToken, fetchUserInfo })
    case pathnames.userInfo:
      return logto.handleUserInfo()
    case pathnames.accessToken:
      return logto.handleAccessToken()
  }

  event.context.logtoClient = await logto.getClient()
})
