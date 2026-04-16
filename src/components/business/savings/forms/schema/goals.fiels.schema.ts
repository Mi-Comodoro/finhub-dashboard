import type { FormSchema } from '~/components/organisms/forms/Form.vue'
const reasonOptions = [
  { label: 'Fondo de Emergencia', value: 'emergency', disabled: false },
  { label: 'Jubilación o Retiro', value: 'elderly', disabled: false },
  { label: 'Vivienda (Compra/Reforma)', value: 'home', disabled: false },
  { label: 'Educación', value: 'school', disabled: false },
  { label: 'Viajes y Recreación', value: 'flight', disabled: false },
  { label: 'Salud y Gastos Médicos', value: 'medical_services', disabled: false },
  { label: 'Pago de Deudas', value: 'payments', disabled: false },
  { label: 'Inversiones', value: 'trending_up', disabled: false },
  { label: 'Compra de Vehículo', value: 'directions_car', disabled: false },
  { label: 'Otros Gastos Mayores', value: 'shopping_cart', disabled: false }
]
export const goalsFieldsSchema = (
  options: { label: string; value: string; disabled: boolean }[]
): FormSchema => {
  return {
    fields: {
      name: {
        type: 'text',
        label: 'Proposito',
        placeholder: 'Fondo de Emergencia',
        required: true
      },
      targetAmount: {
        type: 'money',
        label: 'Meta',
        placeholder: '15.99',
        required: true,
        pattern: /^\d+(\.\d{1,2})?$/,
        errorMessage: 'Monto inválido',
        prefix: 'COP'
      },
      accountId: {
        type: 'select',
        label: 'Asosiar a la cuentas',
        placeholder: 'Selecciona una categoría',
        options: options,
        required: true
      },
      reason: {
        type: 'select',
        label: 'Motivo',
        placeholder: 'Selecciona una categoría',
        options: reasonOptions,
        required: true
      },
      targetDate: {
        type: 'date',
        label: 'Fecha de de cumplimiento',
        placeholder: 'Selecciona la fecha del gasto',
        required: true
      }
    },

    layout: [
      {
        type: 'grid',
        columns: 2,
        fields: ['name', 'accountId', 'reason', 'targetDate', 'targetAmount']
      }
    ]
  }
}
