import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

// Right of access: all the personal data the person has in Mi Comodoro
export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/privacy/export`,
    {
      headers: { authorization: `Bearer ${token}` },
      onResponseError: ({ response }) => {
        const raw = response._data?.message
        validateError(event, response.status, Array.isArray(raw) ? raw.join(', ') : raw)
      }
    }
  )

  return { success, result: data }
})
