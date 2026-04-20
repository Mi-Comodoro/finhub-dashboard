import type { AccountRateHistory } from '@/types/api'
import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID de cuenta requerido' })
  }

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const { success, data } = await $fetch<{
    success: boolean
    data: AccountRateHistory[]
  }>(`${config.public.apiBase}/account/${id}/rate-history`, {
    headers: { authorization: `Bearer ${token}` },
    onResponseError: ({ response }) => {
      console.error('❌ Error fetching rate history:', response.status, response.statusText)
      validateError(event, response.status)
    }
  })

  return {
    success,
    result: data
  }
})
