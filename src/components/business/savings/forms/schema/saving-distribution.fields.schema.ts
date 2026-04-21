import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const savingDistributionFieldsSchema = (
  options: { label: string; value: string; disabled: boolean }[],
  maxPercentage: number = 100
): FormSchema => {
  return {
    fields: {
      goalId: {
        type: 'select',
        label: 'Meta',
        options,
        required: true
      },
      percentage: {
        type: 'slider-percentage',
        label: 'Porcentaje',
        placeholder: '9%',
        required: true,
        max: maxPercentage
      }
    },

    layout: [
      {
        type: 'grid',
        columns: 2,
        fields: ['goalId']
      },
      {
        type: 'row',
        columns: 1,
        fields: ['percentage']
      }
    ]
  }
}
