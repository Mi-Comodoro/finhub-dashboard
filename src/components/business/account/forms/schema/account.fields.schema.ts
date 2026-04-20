import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const accountFieldsSchema = (): FormSchema => {
  return {
    fields: {
      name: {
        type: 'text',
        label: 'Nombre de Cuenta',
        placeholder: 'Bancolombia',
        required: true
      },
      interestRate: {
        type: 'number',
        label: 'Tasa de interes %EA',
        placeholder: '9%',
        required: true
      },

      compoundingFrequency: {
        type: 'select',
        label: 'Entrega de intereses',
        options: [
          { label: 'Diaria', value: 'daily' },
          { label: 'Mensual', value: 'monthly' },
          { label: 'Anual', value: 'annually' }
        ],
        required: true
      },

      isActive: {
        type: 'switch',
        label: 'Marcar como disponible'
      },
      description: {
        type: 'textarea',
        label: 'Descripcion',
        placeholder: 'Detalles sobre el destino que le daras a la cuenta...'
      }
    },

    layout: [
      {
        type: 'grid',
        columns: 2,
        fields: ['name', 'interestRate']
      },
      {
        type: 'grid',
        columns: 2,
        fields: ['compoundingFrequency', 'isActive']
      },
      {
        type: 'row',
        columns: 1,
        fields: ['description']
      }
    ]
  }
}
