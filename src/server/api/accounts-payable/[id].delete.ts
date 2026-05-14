import { ACCESS_TOKEN } from '~/common/constants'
import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const { success, data } = await $fetch<{
    success: boolean
    data: { id: string }
  }>(`${config.public.apiBase}/accounts-payable/${id}`, {
    headers: { authorization: `Bearer ${token}` },
    method: 'DELETE',
    onResponseError: ({ response }) => {
      validateError(event, response.status)
    }
  })

  return { success, result: data }
})
