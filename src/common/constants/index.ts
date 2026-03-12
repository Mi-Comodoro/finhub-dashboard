export const ACCESS_TOKEN = 'access-token'
export const ACCOUNT_TYPE = 'account-type'

// Client-accessible user data storage (non-sensitive)
export const USER_DATA = 'user-data'
export const SESSION_STATE = 'session-state'

// Session duration: 24 hours in milliseconds
export const SESSION_DURATION = 24 * 60 * 60 * 1000

export const COOKIE_OPTIONS = {
  httpOnly: true, // Secure - tokens not accessible via JavaScript
  sameSite: 'strict',
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  maxAge: SESSION_DURATION / 1000 // Convert from milliseconds to seconds
} as const

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const ON_BOARDING_CONFIG = {
  stages: ['Información Básica', 'Configuración', 'Estrategia de Presupuesto', 'Completado'],
  personalInfo: {
    description:
      'Empecemos a configurar tu cuenta para ayudarte a empezar a organizar tus finanzas y alcanzar tus metas.'
  },
  financesConfig: {
    title: 'Configuración Financiera',
    description:
      'Configura tus finanzas para obtener recomendaciones personalizadas y una visión clara de tu situación financiera.'
  },
  budgetStrategy: {
    title: 'Estrategia de Presupuesto',
    description:
      'Elige la estrategia que mejor se adapte a tu estilo de vida y objetivos financieros.'
  },
  completion: {
    title: '¡Listo para Empezar!',
    description:
      'Excelente. Tu perfil financiero está listo. Ahora puedes comenzar a gestionar tu presupuesto y alcanzar tus objetivos financieros.'
  }
}
export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Masculino' },
  { value: 'FEMALE', label: 'Femenino' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefiero no decirlo' }
]
