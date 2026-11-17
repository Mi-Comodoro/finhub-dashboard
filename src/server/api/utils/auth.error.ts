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

// Backend messages are in English: translate the ones a user can act on
const BACKEND_MESSAGES_ES: Record<string, string> = {
  'Budget is not active':
    'Tu presupuesto aún no está activo. Completa tus metas de ahorro y la distribución del ahorro para activarlo.',
  'Invalid income amount': 'El monto del ingreso no es válido.',
  'Amount must be greater than 0': 'El monto debe ser mayor a 0.',
  'Source is required': 'El origen del ingreso es obligatorio.',
  'Budget not found': 'No encontramos el presupuesto.',
  'Planned Income not found': 'No encontramos el ingreso planificado.'
}

export const translateBackendMessage = (message?: string | null): string | undefined => {
  if (!message) return undefined
  if (BACKEND_MESSAGES_ES[message]) return BACKEND_MESSAGES_ES[message]
  if (/should not be empty|must be a UUID|must be a number|must be a string/i.test(message)) {
    return 'Faltan datos obligatorios o son inválidos. Revisa el formulario e inténtalo de nuevo.'
  }
  return message
}

export const validateError = (event: H3Event, status: number, rawMessage?: string): never => {
  const backendMessage = translateBackendMessage(rawMessage)
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
