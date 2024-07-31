import type { LogtoRuntimeConfigInput } from './types'

/** The default Logto runtime configuration values that should be replaced with your own values. */
export const defaults = Object.freeze({
  endpoint: '<replace-with-logto-endpoint>',
  appId: '<replace-with-logto-app-id>',
  appSecret: '<replace-with-logto-app-secret>',
  cookieEncryptionKey: '<replace-with-random-string>',
} as const satisfies LogtoRuntimeConfigInput)
