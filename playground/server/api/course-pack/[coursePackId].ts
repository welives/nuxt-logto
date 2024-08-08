import { Http } from '~/server/utils/http'

export default defineEventHandler(async (event) => {
  const coursePackId = event.context.params?.coursePackId
  if (!coursePackId) {
    event.node.res.statusCode = 400
    event.node.res.end('missing coursePackId')
    return
  }
  // if use nitro devProxy, this http will be not work
  const http = new Http(event)
  try {
    return await http.request(`/course-pack/${coursePackId}`)
  }
  catch (error: any) {
    event.node.res.statusCode = error.status ?? 400
    return error ?? null
  }
})
