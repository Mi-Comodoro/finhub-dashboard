import type { FormSchema } from '@/components/organisms/forms/Form.vue'

export const budgetFieldsSchema = (
  monthOptions: { label: string; value: number }[],
  yearOptions: { label: string; value: number }[]
): FormSchema => ({
  fields: {
    name: {
      type: 'text',
      label: 'Nombre del presupuesto',
      placeholder: 'Ej: Presupuesto Abril 2026',
      required: true,
      errorMessage: 'El nombre es requerido'
    },
    month: {
      type: 'select',
      label: 'Mes',
      required: true,
      options: monthOptions,
      errorMessage: 'Seleccioná un mes'
    },
    year: {
      type: 'select',
      label: 'Año',
      required: true,
      options: yearOptions,
      errorMessage: 'Seleccioná un año'
    },
    strategy: {
      type: 'radio-card',
      label: 'Estrategia de presupuesto',
      required: true,
      options: [
        {
          label: '50/30/20',
          value: 'BALANCED',
          description: 'Método de Elizabeth Warren: 50% necesidades, 30% gustos, 20% ahorro'
        },
        {
          label: 'Personalizada',
          value: 'CUSTOM',
          description: 'Definí tus propios porcentajes para cada categoría'
        }
      ]
    },
    needsLimit: {
      type: 'slider-percentage',
      label: 'Necesidades (%)',
      required: true,
      visibleWhen: form => form.strategy === 'CUSTOM'
    },
    wantsLimit: {
      type: 'slider-percentage',
      label: 'Gustos (%)',
      required: true,
      visibleWhen: form => form.strategy === 'CUSTOM'
    },
    savingsLimit: {
      type: 'slider-percentage',
      label: 'Ahorro (%)',
      required: true,
      visibleWhen: form => form.strategy === 'CUSTOM'
    }
  },
  layout: [
    { type: 'row', fields: ['name'] },
    { type: 'grid', columns: 2, fields: ['month', 'year'] },
    { type: 'row', fields: ['strategy'] },
    { type: 'grid', columns: 1, fields: ['needsLimit', 'wantsLimit', 'savingsLimit'] }
  ]
})
