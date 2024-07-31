import { defineNuxtModule, addServerHandler, addImports, createResolver, addPlugin, addTemplate } from '@nuxt/kit'
import { defu } from 'defu'
import type { LogtoRuntimeConfig, LogtoRuntimeConfigInput } from './runtime/utils/types'
import { Pathnames } from './runtime/utils/constants'

export * from './runtime/utils/types'
export * from './runtime/utils/constants'

export default defineNuxtModule<LogtoRuntimeConfigInput>({
  meta: {
    // npm 包名
    name: '@welives/nuxt-logto',
    // nuxt.config中的模块选项的键
    configKey: 'logto',
  },
  // options 的值对应的是 nuxt.config 中 logto 键的值
  setup(options, nuxt) {
    // Init Runtime Config
    nuxt.options.runtimeConfig.logto = nuxt.options.runtimeConfig.logto || {}
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {}
    nuxt.options.runtimeConfig.public.logto = nuxt.options.runtimeConfig.public.logto || {}

    const defaultPathnames: LogtoRuntimeConfig['pathnames'] = {
      signIn: Pathnames.SIGN_IN,
      signUp: Pathnames.SIGN_UP,
      signOut: Pathnames.SIGN_OUT,
      callback: Pathnames.CALLBACK,
      context: Pathnames.CONTEXT,
      userInfo: Pathnames.USER_INFO,
      accessToken: Pathnames.ACCESS_TOKEN,
    }

    const runtimeConfig = defu<LogtoRuntimeConfig, LogtoRuntimeConfigInput[]>(
      nuxt.options.runtimeConfig.logto,
      options,
      {
        cookieSecure: true,
        fetchUserInfo: false,
        getAccessToken: false,
        postCallbackRedirectUri: '/',
        postLogoutRedirectUri: '/',
        pathnames: defaultPathnames,
      },
    ) satisfies LogtoRuntimeConfig

    nuxt.options.runtimeConfig.logto = runtimeConfig

    nuxt.options.runtimeConfig.public.logto = defu(
      nuxt.options.runtimeConfig.public.logto,
      {
        appId: runtimeConfig.appId,
        origin: runtimeConfig.origin,
        pathnames: runtimeConfig.pathnames,
      },
      { pathnames: defaultPathnames },
    )

    const { resolve } = createResolver(import.meta.url)

    // 在初始化 Nitro 之前调用，允许自定义 Nitro 的配置
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}

      nitroConfig.externals = defu(typeof nitroConfig.externals === 'object' ? nitroConfig.externals : {}, {
        inline: [resolve('./runtime')],
      })

      nitroConfig.alias['#logto'] = resolve('./runtime')
    })

    // 注入虚拟文件
    const template = addTemplate({
      filename: 'types/logto.d.ts',
      getContents: () =>
        [
          `declare module '#logto' {`,
          ` const LogtoClient: typeof import('${resolve('./runtime/logto/client')}').LogtoClient`,
          '}',
        ].join('\n'),
    })

    // 注入类型
    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: template.dst })
    })

    // 注入服务器路由
    addServerHandler({ handler: resolve('./runtime/server/event-handler') })

    // 注入hooks
    addImports([{ name: 'useLogto', from: resolve('./runtime/composables/use-logto') }])

    // 注入插件
    addPlugin(resolve('./runtime/plugin'))
  },
})
