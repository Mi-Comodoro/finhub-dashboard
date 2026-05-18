import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')
  const userId = getRouterParam(event, 'userId')

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' })
  if (!userId) throw createError({ statusCode: 400, message: 'userId requerido' })

  const { success } = await $fetch<{ success: boolean }>(
    `${config.public.apiBase}/groups/${id}/members/${userId}`,
    {
      headers: { authorization: `Bearer ${token}` },
      method: 'DELETE',
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )

  return { success }
})
