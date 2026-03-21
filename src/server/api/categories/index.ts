import { ACCESS_TOKEN } from '~/common/constants'
import type { CategoriesApiResponse } from '~/types/api/'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }
  const baseUrl = config.public.apiBase
  const { success, data } = await $fetch<CategoriesApiResponse>(`${baseUrl}/categories`, {
    headers: { authorization: `Bearer ${token}` },
    onResponseError: ({ response }) => {
      validateError(event, response.status)
    }
  })

  return { success, result: data }
})
