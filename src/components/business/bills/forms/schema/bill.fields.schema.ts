import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const billFieldsSchema = (
  categoryOptions: { label: string; value: string; disabled: boolean }[]
): FormSchema => ({
  fields: {
    name: {
      type: 'text',
      label: 'Nombre de la factura',
      placeholder: 'Ej. Netflix, Arriendo',
      required: true
    },
    categoryId: {
      type: 'select',
      label: 'Categoría',
      placeholder: 'Selecciona una categoría',
      options: categoryOptions,
      required: true
    },
    expectedAmount: {
      type: 'money',
      label: 'Monto esperado',
      placeholder: '0',
      required: true,
      prefix: 'COP'
    },
    billingDay: {
      type: 'number',
      label: 'Día de cobro',
      placeholder: '1-31',
      required: true,
      validate: (value: unknown) => {
        const n = Number(value)
        if (!Number.isInteger(n) || n < 1 || n > 31) return 'Debe ser un día entre 1 y 31'
        return true
      }
    },
    frequency: {
      type: 'select',
      label: 'Frecuencia',
      options: [
        { label: 'Mensual', value: 'monthly' },
        { label: 'Anual', value: 'yearly' }
      ],
      required: true
    }
  },
  layout: [
    { type: 'row', fields: ['name'] },
    { type: 'grid', columns: 2, fields: ['categoryId', 'expectedAmount'] },
    { type: 'grid', columns: 2, fields: ['billingDay', 'frequency'] }
  ]
})
