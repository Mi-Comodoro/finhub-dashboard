import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' })

  const { success } = await $fetch<{ success: boolean }>(
    `${config.public.apiBase}/travel-expenses/${id}/settlements`,
    {
      headers: { authorization: `Bearer ${token}` },
      method: 'POST',
      body,
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )

  return { success }
})
