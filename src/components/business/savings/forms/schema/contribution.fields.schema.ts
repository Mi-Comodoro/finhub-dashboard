import type { FormSchema } from '@/components/organisms/forms/Form.vue'

export const contributionFieldsSchema = (): FormSchema => ({
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
    note: {
      type: 'textarea',
      label: 'Nota',
      placeholder: 'Agrega una nota (opcional)',
      required: false
    }
  },
  layout: [
    { type: 'row', fields: ['amount'] },
    { type: 'row', fields: ['date'] },
    { type: 'row', fields: ['note'] }
  ]
})
