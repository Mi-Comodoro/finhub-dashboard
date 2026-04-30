import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const categoryFieldsSchema = (): FormSchema => {
  return {
    fields: {
      name: {
        type: 'text',
        label: 'Nombre de la Categoría',
        placeholder: 'Ej: Alimentación, Transporte',
        required: true
      },
      type: {
        type: 'radio-card',
        label: 'Tipo de Categoría',
        required: true,
        options: [
          {
            label: 'Necesidad',
            value: 'need',
            description: 'Gastos fijos esenciales'
          },
          {
            label: 'Gusto',
            value: 'want',
            description: 'Gastos variables opcionales'
          },
          {
            label: 'Ahorro',
            value: 'saving',
            description: 'Metas y reservas'
          }
        ]
      }
    },
    layout: [
      {
        type: 'row',
        fields: ['name']
      },
      {
        type: 'row',
        fields: ['type']
      }
    ]
  }
}
