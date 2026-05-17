import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const transactionFieldsSchema = (
  categoryOptions: Array<{ label: string; value: string; disabled?: boolean }>
): FormSchema => ({
  fields: {
    type: {
      type: 'select',
      label: 'Tipo de Transacción',
      placeholder: 'Selecciona el tipo',
      required: true,
      options: [
        { label: 'Ingreso', value: 'income' },
        { label: 'Gasto', value: 'expense' },
        { label: 'Ahorro', value: 'savings' }
      ]
    },
    amount: {
      type: 'money',
      label: 'Monto',
      placeholder: '0.00',
      required: true
    },
    transactionDate: {
      type: 'date',
      label: 'Fecha de Transacción',
      required: true
    },
    source: {
      type: 'select',
      label: 'Fuente',
      placeholder: 'Selecciona la fuente',
      required: true,
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Ingreso Planificado', value: 'planned-income' },
        { label: 'Gasto Planificado', value: 'planned-expense' },
        { label: 'Ahorro Distribuido', value: 'distributed-savings' }
      ]
    },
    categoryId: {
      type: 'select',
      label: 'Categoría',
      placeholder: 'Selecciona una categoría (opcional)',
      required: false,
      options: categoryOptions
    },
    description: {
      type: 'textarea',
      label: 'Descripción',
      placeholder: 'Agrega una descripción (opcional)',
      required: false
    }
  },
  layout: [
    { type: 'grid', columns: 2, fields: ['type', 'source'] },
    { type: 'grid', columns: 2, fields: ['amount', 'transactionDate'] },
    { type: 'row', fields: ['categoryId'] },
    { type: 'row', fields: ['description'] }
  ]
})
