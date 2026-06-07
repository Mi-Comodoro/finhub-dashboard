import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const expensedPlannedFieldsSchema = (
  options: { label: string; value: string; disabled: boolean }[],
  customBucketOptions?: { label: string; value: string | null }[]
): FormSchema => {
  const hasCustomBuckets = !!customBucketOptions?.length

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
      },
      ...(hasCustomBuckets
        ? {
            customBucketId: {
              type: 'select' as const,
              label: 'Categoría personalizada',
              placeholder: 'Sin categoría especial',
              options: [
                { label: '— Sin categoría especial', value: '' },
                ...(customBucketOptions ?? []).map(o => ({ label: o.label, value: o.value ?? '' }))
              ]
            }
          }
        : {})
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
      ...(hasCustomBuckets
        ? [
            {
              type: 'grid' as const,
              columns: 2,
              fields: ['billsId', 'customBucketId']
            },
            {
              type: 'row' as const,
              fields: ['isEssential']
            }
          ]
        : [
            {
              type: 'grid' as const,
              columns: 2,
              fields: ['billsId', 'isEssential']
            }
          ]),
      {
        type: 'row',
        fields: ['notes']
      }
    ]
  }
}
