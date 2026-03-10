export const apiError = {
  unauthorized(errorMessage = 'No autorizado') {
    throw createError({ statusCode: 401, message: errorMessage })
  },
  forbidden(errorMessage = 'Prohibido') {
    throw createError({ statusCode: 403, message: errorMessage })
  },
  notFound(errorMessage = 'No encontrado') {
    throw createError({ statusCode: 404, message: errorMessage })
  },
  badRequest(errorMessage = 'Petición inválida') {
    throw createError({ statusCode: 400, message: errorMessage })
  },
  internal(errorMessage = 'Error interno') {
    throw createError({ statusCode: 500, message: errorMessage })
  }
}
