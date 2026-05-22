import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const body = await readBody(event)

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })

  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/transactions`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body,
      onResponseError: ({ response }) => {
        if (response.status === 400 || response.status === 422) {
          const raw = response._data
          const msg = Array.isArray(raw?.message)
            ? raw.message.join(', ')
            : (raw?.message ?? 'Datos inválidos')
          throw createError({ statusCode: response.status, message: msg })
        }
        validateError(event, response.status)
      }
    }
  )

  return { success, result: data }
})
