import type { H3Event } from 'h3'

import { ACCESS_TOKEN, ACCOUNT_TYPE, TOKEN_EXPIRES_AT } from '~/common/constants'

import { apiError } from './api-error'

export const loginError = (status: number): never => {
  switch (status) {
    case 400:
      throw apiError.badRequest('Solicitud invalida para autenticacion con Google')
    case 401:
      throw apiError.unauthorized('No fue posible validar la autenticacion con Google')
    case 403:
      throw apiError.forbidden('Credenciales deshabilitadas, contacte al Administrador')

    case 404:
      throw apiError.notFound('Credenciales inválidas')

    default:
      throw apiError.internal('Error al autenticar usuario')
  }
}

export const logoutError = (event: H3Event, status: number): never => {
  if (status === 401) {
    deleteCookie(event, ACCESS_TOKEN)
    deleteCookie(event, ACCOUNT_TYPE)
    deleteCookie(event, TOKEN_EXPIRES_AT)
    throw apiError.unauthorized('La sesión ha expirado')
  }

  switch (status) {
    case 401:
      throw apiError.forbidden('La session expiro antes de intentar cerrar session')

    default:
      throw apiError.internal('Error al cerrar session')
  }
}

export const validateError = (event: H3Event, status: number, backendMessage?: string): never => {
  if (status === 401) {
    deleteCookie(event, ACCESS_TOKEN)
    deleteCookie(event, ACCOUNT_TYPE)
    deleteCookie(event, TOKEN_EXPIRES_AT)
    throw apiError.unauthorized('La sesión ha expirado')
  }

  switch (status) {
    case 400:
      throw apiError.badRequest(backendMessage ?? 'Solicitud inválida')
    case 422:
      throw apiError.badRequest(backendMessage ?? 'Datos inválidos')
    case 403:
      throw apiError.forbidden(backendMessage ?? 'No tienes permisos para esto')
    case 404:
      throw apiError.notFound(backendMessage ?? 'Recurso no encontrado')
    default:
      throw apiError.internal(backendMessage ?? 'Error inesperado en el servidor')
  }
}
