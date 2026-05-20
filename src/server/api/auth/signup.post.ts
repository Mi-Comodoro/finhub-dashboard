import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const { success, data } = await $fetch<{ success: boolean; data: unknown }>(
    `${config.public.apiBase}/auth/signup`,
    {
      method: 'POST',
      body,
      onResponseError: ({ response }) => validateError(event, response.status)
    }
  )

  return { success, result: data }
})
