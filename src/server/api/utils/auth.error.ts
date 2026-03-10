import type { H3Event } from 'h3'

import { ACCESS_TOKEN, ACCOUNT_TYPE } from '~/common/constants'

import { apiError } from './api-error'

export const loginError = (status: number): never => {
  switch (status) {
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
    throw apiError.unauthorized('La sesión ha expirado')
  }
  switch (status) {
    case 401:
      throw apiError.forbidden('La session expiro antes de intentar cerrar session')

    default:
      throw apiError.internal('Error al cerrar session')
  }
}

export const validateError = (event: H3Event, status: number): never => {
  if (status === 401) {
    deleteCookie(event, ACCESS_TOKEN)
    deleteCookie(event, ACCOUNT_TYPE)
    throw apiError.unauthorized('La sesión ha expirado')
  }
  switch (status) {
    case 401:
      throw apiError.forbidden('La session expiro antes de intentar validar session')

    default:
      throw apiError.internal('Error al validar session')
  }
}
