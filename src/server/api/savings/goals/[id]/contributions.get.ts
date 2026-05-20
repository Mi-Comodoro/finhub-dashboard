import { ACCESS_TOKEN } from '~/common/constants'
import type { Transaction } from '~/types/api'

import { validateError } from '../../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, message: 'id requerido' })
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const { success, data } = await $fetch<{ success: boolean; data: Transaction[] }>(
    `${config.public.apiBase}/goals/${id}/contributions`,
    {
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )
  return { success, result: data }
})
