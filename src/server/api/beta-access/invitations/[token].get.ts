// Public: validates an invitation link and returns the invited email (no session needed)
export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getRouterParam(event, 'token')

  if (!token) {
    throw createError({ statusCode: 400, message: 'Invitación requerida' })
  }

  const { success, data } = await $fetch<{ success: boolean; data: { email: string } }>(
    `${config.public.apiBase}/beta-access/invitations/${encodeURIComponent(token)}`,
    {
      onResponseError: ({ response }) => {
        if (response.status === 429) {
          throw createError({ statusCode: 429, message: 'Demasiados intentos. Espera un minuto.' })
        }
        if (response.status === 404) {
          throw createError({
            statusCode: 404,
            message: 'La invitación no es válida o ya venció.'
          })
        }
        throw createError({
          statusCode: 503,
          message: 'No pudimos comprobar tu invitación. Inténtalo en unos minutos.'
        })
      }
    }
  )

  return { success, result: data }
})
