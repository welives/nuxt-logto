import type { LogtoRuntimeConfig } from './utils/types'
import { defaults } from './utils/constants'
import { useRuntimeConfig } from '#imports'

export function useConfig() {
  const config = useRuntimeConfig().logto as LogtoRuntimeConfig
  const publicConfig = useRuntimeConfig().public.logto as object

  const defaultValueKeys = Object.entries(defaults)
    // @ts-expect-error The type of `key` can only be string
    .filter(([key, value]) => config[key] === value)
    .map(([key]) => key)

  if (defaultValueKeys.length > 0) {
    console.warn(
      `The following Logto configuration keys have default values: ${defaultValueKeys.join(', ')}. Please replace them with your own values.`,
    )
  }

  let resources = config.resources
  if (resources && typeof resources === 'string') {
    try {
      resources = JSON.parse(resources)
    }
    catch (e) {
      console.warn('Failed to parse resources string')
    }
  }

  let scopes = config.scopes
  if (scopes && typeof scopes === 'string') {
    try {
      scopes = JSON.parse(scopes)
    }
    catch (e) {
      console.warn('Failed to parse scopes string')
    }
  }

  return { ...config, ...publicConfig, scopes, resources } satisfies LogtoRuntimeConfig
}
