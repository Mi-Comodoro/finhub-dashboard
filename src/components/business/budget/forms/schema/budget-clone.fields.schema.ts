import type { FormSchema } from '@/components/organisms/forms/Form.vue'

export const budgetCloneFieldsSchema = (
  monthOptions: { label: string; value: number }[],
  yearOptions: { label: string; value: number }[]
): FormSchema => ({
  fields: {
    month: {
      type: 'select',
      label: 'Mes destino',
      required: true,
      options: monthOptions,
      alertVariant: 'info',
      alertMessage: 'Se copiará la configuración del presupuesto seleccionado al nuevo mes.'
    },
    year: {
      type: 'select',
      label: 'Año destino',
      required: true,
      options: yearOptions
    }
  },
  layout: [{ type: 'grid', columns: 2, fields: ['month', 'year'] }]
})
