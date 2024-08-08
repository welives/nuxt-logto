import http from './http'

/** 课程包详情 */
export async function fetchCoursePack(coursePackId: string) {
  return http.get(`/api/course-pack/${coursePackId}`)
}
