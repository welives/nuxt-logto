import { Http } from '~/server/utils/http'

export default defineEventHandler(async (event) => {
  const http = new Http(event)
  return await http.request('/course-pack')
})
