import { type LogtoContext } from '@logto/node'
import type { LogtoRuntimeConfigInput } from '../utils/types'
import { useState, useRuntimeConfig } from '#imports'

export function useLogtoState() {
  const { appId } = useRuntimeConfig().public.logto as LogtoRuntimeConfigInput
  const data = useState<LogtoContext | undefined>(`logto:${appId}:data`, () => void 0)

  return { data }
}
