import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) throw createError({ statusCode: 400, message: 'id es requerido' })
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/goals/${id}/contributions`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body,
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )
  return { success, result: data }
})
