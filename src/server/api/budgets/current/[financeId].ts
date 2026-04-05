import { ACCESS_TOKEN } from '~/common/constants'
import type { BackendCurrentBudget } from '~/types/api'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const financeId = getRouterParam(event, 'financeId')
  const query = getQuery(event)
  const month = query.month ? Number(query.month) : null
  const year = query.year ? Number(query.year) : null

  if (!financeId) {
    throw createError({ statusCode: 400, message: 'financeId es requerido' })
  }

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const searchParams = new URLSearchParams()

  if (month !== null && !Number.isNaN(month)) {
    searchParams.set('month', String(month))
  }

  if (year !== null && !Number.isNaN(year)) {
    searchParams.set('year', String(year))
  }

  const queryString = searchParams.toString()
  const endpoint = queryString
    ? `${config.public.apiBase}/budgets/current/${financeId}?${queryString}`
    : `${config.public.apiBase}/budgets/current/${financeId}`

  const { success, data } = await $fetch<BackendCurrentBudget>(
    endpoint,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        validateError(event, response.status)
      }
    }
  )

  return {
    success,
    result: {
      id: data.id,
      name: data.name,
      month: data.month,
      year: data.year,
      isShared: data.isShared,
      limits: {
        needs: data.needsLimit,
        wants: data.wantsLimit,
        savings: data.savingsLimit
      },
      ownerId: data.ownerId,
      status: data.status,
      financesId: data.financesId,
      partnerId: data.partnerId,
      strategy: data.strategy,
      frequency: data.frequency
    }
  }
})
