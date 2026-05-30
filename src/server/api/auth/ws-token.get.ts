import { ACCESS_TOKEN } from '~/common/constants'

export default defineEventHandler(event => {
  const token = getCookie(event, ACCESS_TOKEN)
  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }
  return { token }
})
