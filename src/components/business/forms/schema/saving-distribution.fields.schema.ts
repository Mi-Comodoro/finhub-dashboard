import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const savingDistributionFieldsSchema = (): FormSchema => {
  return {
    fields: {
      name: {
        type: 'text',
        label: 'Nombre de Cuenta',
        placeholder: 'Bancolombia',
        required: true
      },
      percentage: {
        type: 'slider-percentage',
        label: 'Porcentaje',
        placeholder: '9%',
        required: true
      },

      compoundingFrequency: {
        type: 'select',
        label: 'Entrega de intereses',
        options: [
          { label: 'Diaria', value: 'daily' },
          { label: 'Mensual', value: 'monthly' },
          { label: 'Anual', value: 'foannuallyod' }
        ],
        required: true
      }
    },

    layout: [
      {
        type: 'grid',
        columns: 2,
        fields: ['name']
      },
      {
        type: 'row',
        columns: 1,
        fields: ['percentage']
      }
    ]
  }
}
