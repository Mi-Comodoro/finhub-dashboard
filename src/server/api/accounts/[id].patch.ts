import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const body = await readBody(event)
  const id = getRouterParam(event, 'id')

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  if (!id) {
    throw createError({ statusCode: 400, message: 'id es requerido' })
  }

  const { success, data } = await $fetch<{
    success: boolean
    data: {
      id: string
      name: string
      description: string
      interestRate: number
      compoundingFrequency: 'daily' | 'monthly' | 'annually'
      isActive: boolean
      userId: string
    }
  }>(`${config.public.apiBase}/account/${id}`, {
    headers: { authorization: `Bearer ${token}` },
    method: 'PATCH',
    body,
    onResponseError: ({ response }) => {
      validateError(event, response.status)
    }
  })

  return { success, result: data }
})
