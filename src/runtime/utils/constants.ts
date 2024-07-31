import type { LogtoRuntimeConfigInput } from './types'

export enum LogtoStateKey {
  RESOURCE = 'logto:resource:token',
}

export enum Pathnames {
  SIGN_IN = '/sign-in',
  SIGN_UP = '/sign-up',
  SIGN_OUT = '/sign-out',
  CALLBACK = '/callback',
  CONTEXT = '/logto/context',
  USER_INFO = '/logto/user-info',
  ACCESS_TOKEN = '/logto/access-token',
}

/** The default Logto runtime configuration values that should be replaced with your own values. */
export const defaults = Object.freeze({
  endpoint: '<replace-with-logto-endpoint>',
  appId: '<replace-with-logto-app-id>',
  appSecret: '<replace-with-logto-app-secret>',
  cookieEncryptionKey: '<replace-with-random-string>',
} as const satisfies LogtoRuntimeConfigInput)
