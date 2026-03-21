import { ACCESS_TOKEN } from '~/common/constants'
import type { BackendBudgetList } from '~/types/api'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const financeId = getRouterParam(event, 'financeId')
  const { year } = getQuery(event)

  if (!financeId) {
    throw createError({ statusCode: 400, message: 'financeId es requerido' })
  }

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const parsedYear = year ? Number(year) : undefined

  if (parsedYear !== undefined && (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100)) {
    throw createError({ statusCode: 400, message: 'El parámetro year debe ser un año válido' })
  }

  const { success, data } = await $fetch<BackendBudgetList>(
    `${config.public.apiBase}/budgets/${financeId}`,
    {
      query: parsedYear !== undefined ? { year: parsedYear } : {},
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        console.error('❌ Error fetching budgets list:', response.status, response.statusText)
        validateError(event, response.status)
      }
    }
  )

  return {
    success,
    result: data.map(item => ({
      id: item.id,
      name: item.name,
      month: item.month,
      year: item.year,
      isShared: item.isShared,
      status: item.status,
      limits: {
        needs: item.needsLimit,
        wants: item.wantsLimit,
        savings: item.savingsLimit
      },
      financesId: item.financesId,
      ownerId: item.ownerId,
      partnerId: item.partnerId,
      strategy: item.strategy,
      frequency: item.frequency
    }))
  }
})
