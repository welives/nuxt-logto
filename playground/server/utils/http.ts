import type { H3Event } from 'h3'
import type { FetchResponse } from 'ofetch'
import { LogtoEvent } from '#logto'

interface ResponseStructure<T = any> {
  code: number
  message: string
  success: boolean
  data?: T
  url?: string
  [key: string]: any
}

export class Http {
  request: typeof $fetch
  private logto: LogtoEvent
  private __API_URL__: string

  constructor(private readonly event: H3Event) {
    this.logto = new LogtoEvent(this.event)
    const config = useRuntimeConfig()
    this.__API_URL__ = config.__API_URL__
    this.request = this.init()
  }

  private init() {
    const request = $fetch.create({
      baseURL: this.__API_URL__,
      method: this.event.method,
      // 请求拦截
      onRequest: async ({ options }) => {
        options.headers = new Headers(this.event.headers)
        const token = await this.logto.getAccessTokenServerSide(this.__API_URL__)
        if (token) {
          options.headers.set('Authorization', `Bearer ${token}`)
        }
        options.query = getQuery(this.event)
        if (this.event.method !== 'GET') {
          options.body = await readRawBody(this.event)
        }
      },
      // 响应拦截
      onResponse: ({ response }) => {
        if (response.headers.get('content-disposition') && response.status === 200) return response

        if (response._data.success !== true) {
          handleError(response)
          return Promise.reject({ ...response._data, status: response.status })
        }

        return response._data
      },
    })
    return request
  }
}

function handleError<T>(response: FetchResponse<ResponseStructure<T>> & FetchResponse<ResponseType>) {
  if (!response._data) {
    err('请求超时，服务器无响应！')
    return
  }

  const handleMap: { [key: number]: () => void } = {
    404: () => err('服务器资源不存在'),
    500: () => err('服务器内部错误'),
    403: () => err('没有权限访问该资源'),
    401: () => {
      err('登录状态已过期，请重新登录')
    },
  }
  handleMap[response.status] ? handleMap[response.status]() : err('未知错误！')

  function err(text: string) {
    // TODO you can log here
    console.error(response?._data?.message ?? text)
  }
}
