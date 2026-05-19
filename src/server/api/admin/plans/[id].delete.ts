import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })
  const id = getRouterParam(event, 'id')
  await $fetch(`${config.public.apiBase}/admin/plans/${id}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}` },
    onResponseError: ({ response }) => {
      validateError(event, response.status)
    }
  })
  return { success: true, result: { id } }
})
