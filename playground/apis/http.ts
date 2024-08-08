import type { FetchResponse } from 'ofetch'

interface ResponseStructure<T = any> {
  code: number
  message: string
  success: boolean
  data?: T
  url?: string
  [key: string]: any
}

export default new class Http {
  private request: typeof $fetch

  constructor() {
    this.request = this.init()
  }

  private init() {
    const request = $fetch.create({
      // baseURL: __API_URL__,
      // 请求拦截
      onRequest: async ({ options }) => {
        const token = await getToken()
        options.headers = new Headers(options.headers)
        if (unref(token)) {
          options.headers.set('Authorization', `Bearer ${unref(token)}`)
        }
        options.params = paramsSerializer(options.params)
        options.query = options.query || {}
      },
      // 响应拦截
      onResponse({ response }) {
        if (response.headers.get('content-disposition') && response.status === 200) return response

        if (response._data.success !== true) {
          handleError(response)
          return Promise.reject(response._data)
        }

        // 覆盖 _data, 因为底层一直都是返回的 _data 这一层数据
        response._data = response._data.data
        return response._data
      },
    })
    return request
  }

  get<T>(url: string, params?: any) {
    return this.request<T>(url, { method: 'GET', params })
  }

  post<T>(url: string, body?: any) {
    return this.request<T>(url, { method: 'POST', body })
  }

  put<T>(url: string, body?: any) {
    return this.request<T>(url, { method: 'PUT', body })
  }

  patch<T>(url: string, body?: any) {
    return this.request<T>(url, { method: 'PATCH', body })
  }

  delete<T>(url: string, body?: any) {
    return this.request<T>(url, { method: 'DELETE', body })
  }
}()

function paramsSerializer(params?: Record<string, any>) {
  if (!params) return
  const query = deepClone(params)
  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && typeof value === 'object' && Array.isArray(value)) {
      query[`${key}[]`] = toRaw(value).map(v => JSON.stringify(v))
      delete query[key]
    }
  })
  return query
}

function handleError<T>(response: FetchResponse<ResponseStructure<T>> & FetchResponse<ResponseType>) {
  if (!response._data) {
    err('Request Timeout, Server No Response')
    return
  }

  const handleMap: { [key: number]: () => void } = {
    404: () => err('Resource Not Found'),
    500: () => err('Server Error'),
    403: () => err('Cannot Access'),
    401: () => {
      err('Your token was expired, Please Re-Sign-in')
    },
  }
  handleMap[response.status] ? handleMap[response.status]() : err('Unknown Error')

  function err(text: string) {
    console.error(response?._data?.message ?? text)
  }
}

function deepClone<T = any>(source: T, cache = new WeakMap()): T {
  if (typeof source !== 'object' || source === null) return source
  if (cache.has(source)) return cache.get(source)
  const target = Array.isArray(source) ? [] : {}
  Reflect.ownKeys(source).forEach((key) => {
    const val = source[key]
    if (typeof val === 'object' && val !== null) target[key] = deepClone(val, cache)
    else target[key] = val
  })
  return target as T
}
