import { type LogtoContext } from '@logto/node'
import { useState, useRuntimeConfig } from '#imports'
import type { LogtoRuntimeConfigInput } from '../utils/types'

export function useLogtoState() {
  const { appId } = useRuntimeConfig().public.logto as LogtoRuntimeConfigInput
  const data = useState<LogtoContext | undefined>(`logto:${appId}:data`, () => void 0)

  return { data }
}
