// server/api/expenses.get.ts

import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

type ExpenseStatus = 'PLANNED' | 'PAID' | 'CANCELED' | 'SKIPPED'

interface ExpensesResponse {
  success: boolean
  data: {
    data: {
      id: string
      budgetId: string
      bucket: string
      category: string
      name: string
      expectedAmount: number
      dueDate: Date
      status: ExpenseStatus
      isEssential: boolean
      notes?: string
      billsId?: string | null
      createdAt: Date
      updatedAt: Date
    }[]
    meta: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const query = getQuery(event)

  const { success, data } = await $fetch<ExpensesResponse>(`${config.public.apiBase}/expense`, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`
    },
    query,
    onResponseError: ({ response }) => {
      validateError(event, response.status)
    }
  })

  return { success, result: data }
})
