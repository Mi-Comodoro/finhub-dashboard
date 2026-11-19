import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const body = await readBody(event)

  if (!token) throw createError({ statusCode: 401, message: 'No autenticado' })
  if (!body?.version) throw createError({ statusCode: 400, message: 'version es requerida' })

  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/legal/consent`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { version: String(body.version) },
      onResponseError: ({ response }) => {
        const raw = response._data?.message
        validateError(event, response.status, Array.isArray(raw) ? raw.join(', ') : raw)
      }
    }
  )

  return { success, result: data }
})
