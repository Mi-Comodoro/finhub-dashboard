import type { FormSchema } from '@/components/organisms/forms/Form.vue'

export interface SelectOption {
  label: string
  value: string
}

export const contributionFieldsSchema = (accountOptions: SelectOption[] = []): FormSchema => ({
  fields: {
    amount: {
      type: 'money',
      label: 'Monto del aporte',
      placeholder: '0.00',
      required: true
    },
    date: {
      type: 'date',
      label: 'Fecha',
      required: true
    },
    contributionType: {
      type: 'radio-card',
      label: 'Origen del dinero',
      required: true,
      size: 'sm',
      options: [
        {
          label: 'Cuenta propia',
          value: 'internal',
          description: 'Sale de tu presupuesto',
          icon: 'swap_horiz'
        },
        {
          label: 'Ingreso no esperado',
          value: 'external',
          description: 'Dinero de fuera',
          icon: 'account_balance'
        }
      ]
    },
    accountId: {
      type: 'select',
      label: 'Cuenta origen',
      placeholder: 'Selecciona una cuenta',
      options: accountOptions,
      required: form => form['contributionType'] === 'internal',
      visibleWhen: form => form['contributionType'] === 'internal'
    },
    note: {
      type: 'textarea',
      label: 'Nota',
      placeholder: 'Nota opcional (ej. aporte de noviembre)',
      required: false
    }
  },
  layout: [
    { type: 'row', fields: ['amount'] },
    { type: 'row', fields: ['date'] },
    { type: 'row', fields: ['contributionType'] },
    { type: 'row', fields: ['accountId'] },
    { type: 'row', fields: ['note'] }
  ]
})
