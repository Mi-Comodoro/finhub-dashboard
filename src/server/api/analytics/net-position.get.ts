import type { NetPositionResponse } from '@/types/analytics.types'
import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const { success, data } = await $fetch<{ success: boolean; data: NetPositionResponse }>(
    `${config.public.apiBase}/analytics/net-position`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )

  return { success, result: data }
})
