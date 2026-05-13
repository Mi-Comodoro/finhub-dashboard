import { ACCESS_TOKEN } from '~/common/constants'
import type { CashFlowForecastResponse } from '~/composables/api/useAnalyticsApi'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const { success, data } = await $fetch<{ success: boolean; data: CashFlowForecastResponse }>(
    `${config.public.apiBase}/analytics/cash-flow-forecast`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )

  return { success, result: data }
})
