import type { FormSchema } from '~/components/organisms/forms/Form.vue'

const reasonOptions = [
  { label: 'Fondo de Emergencia', value: 'emergency', disabled: false },
  { label: 'Jubilacion o Retiro', value: 'elderly', disabled: false },
  { label: 'Vivienda (Compra/Reforma)', value: 'home', disabled: false },
  { label: 'Educacion', value: 'school', disabled: false },
  { label: 'Viajes y Recreacion', value: 'flight', disabled: false },
  { label: 'Salud y Gastos Medicos', value: 'medical_services', disabled: false },
  { label: 'Pago de Deudas', value: 'payments', disabled: false },
  { label: 'Inversiones', value: 'trending_up', disabled: false },
  { label: 'Compra de Vehiculo', value: 'directions_car', disabled: false },
  { label: 'Otros Gastos Mayores', value: 'shopping_cart', disabled: false }
]

export const reasonTips: Record<
  string,
  { title: string; description: string; variant: 'info' | 'warning' | 'success' }
> = {
  emergency: {
    title: 'Fondo de Emergencia',
    description:
      'Un fondo ideal cubre 3-6 meses de gastos fijos. Asócialo a una cuenta de alta liquidez.',
    variant: 'warning'
  },
  elderly: {
    title: 'Ahorro a Largo Plazo',
    description:
      'Para retiro, piensa en plazos mayores a 5 años. Una cuenta con interés compuesto maximiza tu ahorro.',
    variant: 'warning'
  },
  home: {
    title: 'Vivienda',
    description:
      'Define el monto de la cuota inicial. Un CDT a mediano plazo (1-3 años) es buena opción.',
    variant: 'warning'
  },
  school: {
    title: 'Educación',
    description:
      'Calcula matrícula + materiales + gastos mensuales. El plazo depende de cuándo inician los estudios.',
    variant: 'warning'
  },
  flight: {
    title: 'Viajes',
    description:
      'Define destino y fecha. Ahorro a corto plazo (3-12 meses). Una cuenta básica es suficiente.',
    variant: 'warning'
  },
  medical_services: {
    title: 'Salud',
    description:
      'Para prevención, reserva 1-2 meses de ingreso. Prioriza liquidez sobre rentabilidad.',
    variant: 'warning'
  },
  payments: {
    title: 'Pago de Deudas',
    description:
      'Prioriza las deudas con mayor tasa de interés. Si es recurrente, no necesitas fecha límite.',
    variant: 'warning'
  },
  trending_up: {
    title: 'Inversiones',
    description: 'Define tu capital semilla. Elige una cuenta con buen rendimiento.',
    variant: 'warning'
  },
  directions_car: {
    title: 'Vehículo',
    description: 'Investiga precio + cuota inicial. Un plazo de 6-18 meses es típico.',
    variant: 'warning'
  },
  shopping_cart: {
    title: 'Compras Mayores',
    description: 'Define la prioridad del gasto y el monto aproximado. Plazo flexible.',
    variant: 'warning'
  }
}

export const goalsFieldsSchema = (
  options: { label: string; value: string; disabled: boolean }[]
): FormSchema => ({
  fields: {
    name: {
      type: 'text',
      label: 'Nombre',
      placeholder: 'Ej: Mi primer apto',
      required: true,
      errorMessage: 'El nombre es requerido'
    },
    targetAmount: {
      type: 'money',
      label: 'Monto objetivo',
      placeholder: '15.99',
      required: false,
      pattern: /^\d+(\.\d{1,2})?$/,
      errorMessage: 'Monto inválido',
      prefix: 'COP',
      validate: (value: unknown) => {
        if (!value && value !== 0) return true
        const num = Number(value)
        if (isNaN(num) || num <= 0) return 'El monto debe ser mayor a cero'
        return true
      }
    },
    accountId: {
      type: 'select',
      label: 'Asociar a cuenta',
      placeholder: 'Selecciona una cuenta',
      options,
      required: true
    },
    reason: {
      type: 'select',
      label: 'Motivo de ahorro',
      placeholder: 'Selecciona una categoria',
      options: reasonOptions,
      required: true
    },
    targetDate: {
      type: 'date',
      label: 'Fecha límite',
      placeholder: 'Selecciona la fecha (opcional)',
      required: false,
      validate: (value: unknown) => {
        if (!value) return true
        const selected = new Date(value as string)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (selected <= today) return 'La fecha debe ser futura'
        return true
      }
    }
  },
  layout: [
    { type: 'row', fields: ['name'] },
    { type: 'grid', columns: 2, fields: ['accountId', 'reason'] },
    { type: 'grid', columns: 2, fields: ['targetDate', 'targetAmount'] }
  ]
})
