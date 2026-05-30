import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const groupExpenseFieldsSchema = (
  memberOptions: { label: string; value: string; disabled: boolean }[]
): FormSchema => ({
  fields: {
    description: {
      type: 'text',
      label: 'Descripción',
      placeholder: 'Ej. Vuelo a Bogotá',
      required: true,
      errorMessage: 'La descripción es requerida'
    },
    amount: {
      type: 'money',
      label: 'Monto',
      placeholder: '0.00',
      required: true,
      prefix: 'COP',
      validate: (value: unknown) => {
        const num = Number(value)
        if (!value || isNaN(num) || num <= 0) return 'El monto debe ser mayor a cero'
        return true
      }
    },
    dueDate: {
      type: 'date',
      label: 'Fecha estimada',
      placeholder: 'Selecciona la fecha',
      required: true,
      validate: (value: unknown) => {
        if (!value) return 'La fecha es requerida'
        const selected = new Date(value as string)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (selected < today) return 'La fecha no puede ser en el pasado'
        return true
      }
    },
    responsibleUserId: {
      type: 'select',
      label: 'Responsable',
      placeholder: 'Selecciona un miembro',
      options: memberOptions,
      required: true,
      errorMessage: 'El responsable es requerido'
    }
  },
  layout: [
    { type: 'row', fields: ['description'] },
    { type: 'grid', columns: 2, fields: ['amount', 'dueDate'] },
    { type: 'row', fields: ['responsibleUserId'] }
  ]
})
