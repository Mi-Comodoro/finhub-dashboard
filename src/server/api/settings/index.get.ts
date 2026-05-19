import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  return await $fetch(`${config.public.apiBase}/settings`, {
    headers: { authorization: `Bearer ${token}` },
    onResponseError: ({ response }) => validateError(event, response.status)
  })
})
