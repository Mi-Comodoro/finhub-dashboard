import type { FormSchema } from '@/components/organisms/forms/Form.vue'

export const TYPE_LABELS: Record<string, string> = {
  gasto_fijo: 'Gasto Fijo',
  gasto_variable: 'Gasto Variable',
  ahorro: 'Ahorro',
  ingreso: 'Ingreso'
}

export const budgetEditFieldsSchema = (): FormSchema => ({
  fields: {
    name: {
      type: 'text',
      label: 'Nombre del presupuesto',
      placeholder: 'Ej: Presupuesto Abril 2026',
      required: true,
      errorMessage: 'El nombre es requerido'
    },
    strategy: {
      type: 'radio-card',
      label: 'Estrategia de presupuesto',
      required: true,
      size: 'sm',
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
    { type: 'row', fields: ['strategy'] },
    { type: 'grid', columns: 3, fields: ['needsLimit', 'wantsLimit', 'savingsLimit'] }
  ]
})
