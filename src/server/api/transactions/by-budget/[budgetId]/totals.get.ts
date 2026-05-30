import { ACCESS_TOKEN } from '~/common/constants'
import type { Transaction } from '~/types/api/'

import { validateError } from '../../../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const budgetId = getRouterParam(event, 'budgetId')

  if (!budgetId) throw createError({ statusCode: 400, message: 'budgetId es requerido' })
  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const { type, categoryId, dateFrom, dateTo } = getQuery(event)

  const params = new URLSearchParams()
  if (type) params.set('type', String(type))
  if (categoryId) params.set('categoryId', String(categoryId))
  if (dateFrom) params.set('dateFrom', String(dateFrom))
  if (dateTo) params.set('dateTo', String(dateTo))
  params.set('page', '1')
  params.set('limit', '9999')

  const url = `${config.public.apiBase}/transactions/budget/${budgetId}?${params.toString()}`

  const { data } = await $fetch<{
    success: boolean
    data: { transactions: Transaction[] }
  }>(url, {
    headers: { authorization: `Bearer ${token}` },
    onResponseError: ({ response }) => validateError(event, response.status)
  })

  const transactions = data?.transactions ?? []

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((a, t) => a + Number(t.amount ?? 0), 0)
  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((a, t) => a + Number(t.amount ?? 0), 0)
  const savings = transactions
    .filter(t => t.type === 'savings' || t.type === 'interest')
    .reduce((a, t) => a + Number(t.amount ?? 0), 0)

  return {
    success: true,
    result: {
      income,
      expense,
      savings,
      countIncome: transactions.filter(t => t.type === 'income').length,
      countExpense: transactions.filter(t => t.type === 'expense').length,
      countSavings: transactions.filter(t => t.type === 'savings' || t.type === 'interest').length
    }
  }
})
