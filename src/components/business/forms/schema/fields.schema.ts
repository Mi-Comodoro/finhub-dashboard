import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const expensedPlannedFieldsSchema = (
  options: { label: string; value: string; disabled: boolean }[]
): FormSchema => {
  return {
    fields: {
      name: {
        type: 'text',
        label: 'Nombre del gasto',
        placeholder: 'Ej. Suscripción a Netflix',
        required: true
      },
      expectedAmount: {
        type: 'money',
        label: 'Monto',
        placeholder: '15.99',
        required: true,
        pattern: /^\d+(\.\d{1,2})?$/,
        errorMessage: 'Monto inválido',
        prefix: 'COP'
      },
      categoryId: {
        type: 'select',
        label: 'Categoría',
        placeholder: 'Selecciona una categoría',
        options: options,
        required: true
      },

      billsId: {
        type: 'select',
        label: 'Gastos Recurrentes (Opcional)',
        options: [
          { label: 'Entretenimiento', value: 'entertainment' },
          { label: 'Transporte', value: 'transportation' },
          { label: 'Comida', value: 'food' },
          { label: 'Salud', value: 'health' },
          { label: 'Otros', value: 'other' }
        ]
      },
      dueDate: {
        type: 'date',
        label: 'Fecha de gasto',
        placeholder: 'Selecciona la fecha del gasto',
        required: true
      },
      isEssential: {
        type: 'switch',
        label: 'Es un gasto Esencial?'
      },
      notes: {
        type: 'textarea',
        label: 'Notas',
        placeholder: 'Detalles sobre este gasto...'
      }
    },

    layout: [
      {
        type: 'grid',
        columns: 2,
        fields: ['categoryId', 'name']
      },
      {
        type: 'grid',
        columns: 2,
        fields: ['expectedAmount', 'dueDate']
      },
      {
        type: 'grid',
        columns: 2,
        fields: ['billsId', 'isEssential']
      },
      {
        type: 'row',
        fields: ['notes']
      }
    ]
  }
}
