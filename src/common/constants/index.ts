export const ACCESS_TOKEN = `access-token`
export const REFRESH_TOKEN = `refresh-token`
export const ACCOUNT_TYPE = `account-type`
export const TOKEN_EXPIRES_AT = `token-expires-at`

// Client-accessible user data storage (non-sensitive)
export const USER_DATA = `user-data`
export const SESSION_STATE = `session-state`

// Access token: 15 minutes
export const ACCESS_TOKEN_DURATION = 15 * 60

// Refresh token: 7 days
export const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60

// Session duration: 24 hours in milliseconds (kept for backward compat)
export const SESSION_DURATION = 24 * 60 * 60 * 1000

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: `strict`,
  path: `/`,
  secure: process.env.NODE_ENV === `production`,
  maxAge: ACCESS_TOKEN_DURATION
} as const

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: `strict`,
  path: `/api/auth/refresh`,
  secure: process.env.NODE_ENV === `production`,
  maxAge: REFRESH_TOKEN_DURATION
} as const

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const ON_BOARDING_CONFIG = {
  stages: [`Bienvenida`, `Configuración`, `Ingresos`, `Estrategia de Presupuesto`, `Completar`],
  personalInfo: {
    title: `Empieza a tomar control de tu dinero`,
    description: `Esta aplicación te ayudará a organizar tus finanzas, crear disciplina y entender mejor en qué usas tu dinero.
No se conecta a bancos ni accede a tus cuentas. Tú decides qué información registrar.`,
    banner: `Tu información es privada. Esta aplicación funciona como un registro personal de tus finanzas, diseñado para ayudarte a construir hábitos financieros saludables.`
  },
  financesConfig: {
    title: `Configuremos cómo manejas tu dinero`,
    description: `Cada persona recibe y administra su dinero de forma diferente.
Con esta información adaptaremos el presupuesto a tu realidad.`
  },
  budgetStrategy: {
    title: `Elige cómo quieres organizar tu dinero`,
    description: `Un presupuesto es simplemente un plan para tu dinero.
Selecciona el método que prefieres usar para organizar tus gastos.`,
    banner: `Si es tu primera vez usando un presupuesto, te recomendamos empezar con un presupuesto personal.
Esto te ayudará a entender mejor tus hábitos de gasto antes de compartir la administración con otra persona.

Podrás cambiarlo a presupuesto compartido en cualquier momento.`
  },

  incomes: {
    title: `¿Cuánto dinero recibes regularmente?`,
    description: `Esto nos ayudará a crear un presupuesto realista basado en tus ingresos.`,
    banner: `Si tus ingresos varían, puedes ingresar un promedio mensual o actualizar esta información más adelante.`
  },
  completion: {
    title: `¡Listo para Empezar!`,
    description: `Excelente. Tu perfil financiero está listo. Ahora puedes comenzar a gestionar tu presupuesto y alcanzar tus objetivos financieros.`
  }
}
export const GENDER_OPTIONS = [
  { value: `male`, label: `Masculino` },
  { value: `female`, label: `Femenino` },
  { value: `prefer_not_to_say`, label: `Prefiero no decirlo` }
]

export const DIAL_CODE_OPTIONS = [
  { value: `+57`, label: `+57 (Colombia)` },
  { value: `+1`, label: `+1 (Estados Unidos)` },
  { value: `+52`, label: `+52 (México)` },
  { value: `+54`, label: `+54 (Argentina)` },
  { value: `+56`, label: `+56 (Chile)` },
  { value: `+51`, label: `+51 (Perú)` },
  { value: `+58`, label: `+58 (Venezuela)` },
  { value: `+593`, label: `+593 (Ecuador)` },
  { value: `+507`, label: `+507 (Panamá)` },
  { value: `+506`, label: `+506 (Costa Rica)` },
  { value: `+503`, label: `+503 (El Salvador)` },
  { value: `+502`, label: `+502 (Guatemala)` },
  { value: `+504`, label: `+504 (Honduras)` },
  { value: `+505`, label: `+505 (Nicaragua)` }
]

export const FINANCIAL_PROFILE_OPTIONS = [
  { value: `employee`, label: `Empleado` },
  { value: `freelancer`, label: `Freelancer` },
  { value: `business_owner`, label: `Dueño de negocio` }
]

export const SOURCE_INCOMES_OPTIONS = [
  { value: `salary`, label: `Salario` },
  { value: `business`, label: `Negocio` },
  { value: `freelance`, label: `Freelance` },
  { value: `investments`, label: `Inversiones` },
  { value: `services`, label: `Servicios` },
  { value: `other`, label: `Otro` }
]
