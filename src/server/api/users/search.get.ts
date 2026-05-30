import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const { q } = getQuery(event) as { q: string }

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const { success, data } = await $fetch<{
    success: boolean
    data: Array<{
      id: string
      handle: string
      userProfile: { displayName: string; photo?: string }
    }>
  }>(`${config.public.apiBase}/users/search`, {
    query: { q },
    headers: { authorization: `Bearer ${token}` },
    onResponseError: ({ response }) => {
      validateError(event, response.status)
    }
  })

  return {
    success,
    result: data.map(u => ({
      id: u.id,
      handle: u.handle,
      displayName: u.userProfile?.displayName ?? u.handle,
      photo: u.userProfile?.photo
    }))
  }
})
