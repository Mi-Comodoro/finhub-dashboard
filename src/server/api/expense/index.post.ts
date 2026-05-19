import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const body = await readBody(event)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const { success, data } = await $fetch<{
    success: boolean
    data: {
      id?: string
      budgetId: string
      categoryId: string
      name: string
      expectedAmount: number
      dueDate: Date
      status: string
      isEssential: boolean
      notes?: string
      billsId?: string | null
      createdAt?: Date
      updatedAt?: Date
    }
  }>(`${config.public.apiBase}/expense/plan`, {
    headers: { authorization: `Bearer ${token}` },
    method: 'POST',
    body,
    onResponseError: ({ response }) => {
      console.error(JSON.stringify(response))
      validateError(event, response.status)
    }
  })

  return { success, result: data }
})
