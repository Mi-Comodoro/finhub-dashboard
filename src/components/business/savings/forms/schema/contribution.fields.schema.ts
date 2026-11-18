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
    accountId: {
      type: 'select',
      label: 'Cuenta origen',
      placeholder: 'Selecciona una cuenta',
      options: accountOptions,
      required: true
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
    { type: 'row', fields: ['accountId'] },
    { type: 'row', fields: ['note'] }
  ]
})
