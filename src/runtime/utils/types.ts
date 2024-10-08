import type { LogtoConfig } from '@logto/node'
import type { JWTPayload } from 'jose'

export { default as LogtoNodeClient } from '@logto/node'
export type { LogtoConfig, LogtoContext, UserInfoResponse, GetContextParameters, InteractionMode, PersistKey, Storage } from '@logto/node'
export type Nullable<T> = T | null | undefined

type DeepPartial<T> =
  T extends Record<string, unknown>
    ? {
        [P in keyof T]?: DeepPartial<T[P]>
      }
    : T

type LogtoModuleOptions = {
  origin: string
  /**
   * The name to use when storing the Logto cookie.
   *
   * @see {@link CookieConfig.cookieKey} for the default value.
   */
  cookieName?: string
  cookieSecure: boolean
  /**
   * If Logto should fetch from the [userinfo endpoint](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)
   * in the server side for the `event.context.logtoUser` property (used by `useLogtoUser` composable).
   *
   * This is useful when you need to fetch additional claims like `custom_data`.
   */
  fetchUserInfo: boolean
  getAccessToken: boolean
  /**
   * The URI to redirect to after a successful sign-in callback.
   *
   * This is NOT the redirect URI used in Logto's configuration. This is the URI that the user will be
   * redirected to after the sign-in callback is handled by the server.
   *
   * @default '/'
   */
  postCallbackRedirectUri: string
  /**
   * The URI to redirect to after a successful sign-out.
   *
   * This is the post sign-out redirect URI used in Logto's configuration.
   *
   * @default '/'
   */
  postLogoutRedirectUri: string
  /**
   * Pathnames for the sign-in, sign-out, and callback URIs. They will be handled by the Logto
   * event handler.
   */
  pathnames: {
    /**
     * The URI for initiating the sign-in process.
     *
     * @default '/sign-in'
     */
    signIn: string
    /**
     * The URI for initiating the sign-up process.
     *
     * @default '/sign-up'
     */
    signUp: string
    /**
     * The URI for initiating the sign-out process.
     *
     * @default '/sign-out'
     */
    signOut: string
    /**
     * The URI for handling the sign-in callback.
     *
     * @default '/callback'
     */
    callback: string
    /**
     * The URI for handling the user context.
     *
     * @default '/logto/context'
     */
    context: string
    /**
     * The URI for handling the user info.
     *
     * @default '/logto/user-info'
     */
    userInfo: string
    /**
     * The URI for handling the access_token.
     *
     * @default '/logto/access-token'
     */
    accessToken: string
  }
}

/** The full runtime configuration for the Logto module. */
export type LogtoRuntimeConfig = LogtoModuleOptions & {
  /**
   * The secret used to encrypt the Logto cookie. It should be a random string.
   */
  cookieEncryptionKey: string
} & Omit<LogtoConfig, 'appSecret'> &
Required<Pick<LogtoConfig, 'appSecret'>>

export type LogtoRuntimeConfigInput = DeepPartial<LogtoRuntimeConfig>

export type GetAccessTokenParameters = {
  resource?: string
  organizationId?: string
}

export interface ITokenData {
  token: string
  payload: JWTPayload
}
