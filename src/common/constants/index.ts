export const ACCESS_TOKEN = `access-token`
export const ACCOUNT_TYPE = `account-type`
export const TOKEN_EXPIRES_AT = `token-expires-at`

// Client-accessible user data storage (non-sensitive)
export const USER_DATA = `user-data`
export const SESSION_STATE = `session-state`

// Session duration: 24 hours in milliseconds
export const SESSION_DURATION = 24 * 60 * 60 * 1000

export const COOKIE_OPTIONS = {
  httpOnly: true, // Secure - tokens not accessible via JavaScript
  sameSite: `strict`,
  path: `/`,
  secure: process.env.NODE_ENV === `production`,
  maxAge: SESSION_DURATION / 1000 // Convert from milliseconds to seconds
} as const

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const ON_BOARDING_CONFIG = {
  stages: [`Bienvenida`, `Configuración`, `Estrategia de Presupuesto`, `Ingresos`, `Completar`],
  personalInfo: {
    title: `Empieza a tomar control de tu dinero`,
    description: `Esta aplicación te ayudará a organizar tus finanzas, crear disciplina y entender mejor en qué usas tu dinero.
No se conecta a bancos ni accede a tus cuentas. Tú decides qué información registrar.`,
    banner: `Tu información es privada.
Esta aplicación funciona como un registro personal de tus finanzas, diseñado para ayudarte a construir hábitos financieros saludables.`
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

export const SOURCE_INCOMES_OPTIONS = [
  { value: `salary`, label: `Salario` },
  { value: `business`, label: `Negocio` },
  { value: `freelance`, label: `Freelance` },
  { value: `investments`, label: `Inversiones` },
  { value: `services`, label: `Servicios` },
  { value: `other`, label: `Otro` }
]
