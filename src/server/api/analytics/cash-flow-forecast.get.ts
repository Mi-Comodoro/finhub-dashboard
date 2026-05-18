import { ACCESS_TOKEN } from '~/common/constants'
import type { CashFlowForecastResponse } from '~/composables/api/useAnalyticsApi'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const { month, year } = getQuery(event)

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const params = new URLSearchParams()
  if (month) params.set('month', String(month))
  if (year) params.set('year', String(year))
  const qs = params.size ? `?${params.toString()}` : ''

  const { success, data } = await $fetch<{ success: boolean; data: CashFlowForecastResponse }>(
    `${config.public.apiBase}/analytics/cash-flow-forecast${qs}`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )

  return { success, result: data }
})
