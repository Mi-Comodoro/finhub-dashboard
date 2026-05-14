import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const { success, data } = await $fetch<{
    success: boolean
    data: unknown
  }>(`${config.public.apiBase}/accounts-payable/${id}/payments`, {
    headers: { authorization: `Bearer ${token}` },
    method: 'POST',
    body,
    onResponseError: ({ response }) => {
      validateError(event, response.status)
    }
  })

  return { success, result: data }
})
