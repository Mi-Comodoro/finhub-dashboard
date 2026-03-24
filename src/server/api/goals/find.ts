import type { GoalsResponseApi } from '@/types/api/'
import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  const { success, data } = await $fetch<GoalsResponseApi>(`${config.public.apiBase}/goals/`, {
    headers: { authorization: `Bearer ${token}` },
    onResponseError: ({ response }) => {
      console.error('❌ Error fetching saving  goals list:', response.status, response.statusText)
      validateError(event, response.status)
    }
  })

  return {
    success,
    result: data
  }
})
