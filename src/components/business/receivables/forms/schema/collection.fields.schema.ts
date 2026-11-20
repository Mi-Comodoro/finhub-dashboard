import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const collectionFieldsSchema = (
  categoryOptions: { label: string; value: string; disabled?: boolean }[]
): FormSchema => ({
  fields: {
    amount: {
      type: 'money',
      label: 'Monto cobrado',
      placeholder: '0.00',
      required: true,
      prefix: 'COP'
    },
    collectionDate: {
      type: 'date',
      label: 'Fecha de cobro',
      required: true
    },
    categoryId: {
      type: 'select',
      label: 'Categoría del ingreso (opcional)',
      required: false,
      options: categoryOptions
    },
    notes: {
      type: 'textarea',
      label: 'Notas (opcional)',
      placeholder: 'Observaciones del cobro...',
      required: false
    }
  },
  layout: [
    { type: 'grid', columns: 2, fields: ['amount', 'collectionDate'] },
    { type: 'row', fields: ['categoryId'] },
    { type: 'row', fields: ['notes'] }
  ]
})
