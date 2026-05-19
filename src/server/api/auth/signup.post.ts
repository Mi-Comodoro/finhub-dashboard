import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const response = await $fetch(`${config.public.apiBase}/auth/signup`, {
    method: 'POST',
    body,
    onResponseError: ({ response }) => validateError(event, response.status)
  })

  return response
})
