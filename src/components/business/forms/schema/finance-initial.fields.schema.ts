// finance-initial-fields.schema.ts
import type { FormSchema } from '~/components/organisms/forms/Form.vue'

const currencyOptions = [
  { label: 'Pesos Colombianos (COP)', value: 'COP' as Currency },
  { label: 'Dólares Americanos (USD)', value: 'USD' as Currency }
]

const frequencyOptions = [
  {
    label: 'Mensual',
    value: 'monthly',
    title: 'Mensual',
    description: 'Una vez al mes',
    badge: 'Recomendado',
    icon: 'calendar_month'
  },
  {
    label: 'Quincenal',
    value: 'biweekly',
    title: 'Quincenal',
    description: '2 veces al mes',
    icon: 'payments'
  }
]

export const financeInitialFieldsSchema = (): FormSchema => {
  return {
    fields: {
      currency: {
        type: 'select',
        label: 'Selecciona tu moneda',
        placeholder: 'Selecciona tu moneda',
        options: currencyOptions,
        required: true
      },
      budgetFrequency: {
        type: 'radio-card',
        label: '¿Con qué frecuencia quieres configurar tu presupuesto?',
        options: frequencyOptions,
        required: true
      }
    },
    layout: [
      {
        type: 'grid',
        columns: 1,
        fields: ['currency']
      },
      {
        type: 'grid',
        columns: 1,
        fields: ['budgetFrequency']
      }
    ]
  }
}
