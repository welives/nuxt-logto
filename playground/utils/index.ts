export async function getToken() {
  const { fetchAccessToken } = useLogto()
  const token = await fetchAccessToken({ resource: __API_URL__ })
  return computed(() => token)
}
