import { ACCESS_TOKEN } from '~/common/constants'
import type { Transaction, TransactionPagination } from '~/types/api/'

import { validateError } from '../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const budgetId = getRouterParam(event, 'budgetId')

  if (!budgetId) throw createError({ statusCode: 400, message: 'budgetId es requerido' })
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  // Leer todos los query params de una
  const { type, categoryId, dateFrom, dateTo, page = '1', limit = '20' } = getQuery(event)

  // Construir params solo con los que tienen valor
  const params = new URLSearchParams()
  if (type) params.set('type', String(type))
  if (categoryId) params.set('categoryId', String(categoryId))
  if (dateFrom) params.set('dateFrom', String(dateFrom))
  if (dateTo) params.set('dateTo', String(dateTo))
  params.set('page', String(page))
  params.set('limit', String(limit))

  const query = params.toString()
  const url = `${config.public.apiBase}/transactions/budget/${budgetId}?${query}`

  const { success, data } = await $fetch<{
    success: boolean
    data: { transactions: Transaction[]; pagination: TransactionPagination }
  }>(url, {
    headers: { authorization: `Bearer ${token}` },
    onResponseError: ({ response }) => validateError(event, response.status)
  })

  return { success, result: data }
})
