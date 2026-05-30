import { ACCESS_TOKEN } from '~/common/constants'
import type { TravelExpense } from '~/types/travel-expense.types'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const body = await readBody(event)

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const { success, data } = await $fetch<{ success: boolean; data: TravelExpense }>(
    `${config.public.apiBase}/travel-expenses`,
    {
      headers: { authorization: `Bearer ${token}` },
      method: 'POST',
      body,
      onResponseError: ({ response }) => {
        const msg = (response._data as { message?: string })?.message
        validateError(event, response.status, msg)
      }
    }
  )

  return { success, result: data }
})
