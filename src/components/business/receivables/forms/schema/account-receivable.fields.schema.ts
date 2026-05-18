import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const accountReceivableFieldsSchema = (): FormSchema => ({
  fields: {
    name: {
      type: 'text',
      label: 'Nombre del cobro',
      placeholder: 'Ej: Préstamo a Juan, Factura cliente',
      required: true
    },
    debtor: {
      type: 'text',
      label: 'Deudor (opcional)',
      placeholder: 'Nombre de quien debe'
    },
    originalAmount: {
      type: 'money',
      label: 'Monto original',
      required: true,
      validate: (v: unknown) => (Number(v) > 0 ? true : 'El monto debe ser mayor a cero')
    },
    dueDate: {
      type: 'date',
      label: 'Fecha esperada (opcional)'
    },
    notes: {
      type: 'textarea',
      label: 'Notas (opcional)',
      placeholder: 'Detalles adicionales...'
    }
  },
  layout: [
    { type: 'row', fields: ['name'] },
    { type: 'row', fields: ['debtor'] },
    { type: 'grid', columns: 2, fields: ['originalAmount', 'dueDate'] },
    { type: 'row', fields: ['notes'] }
  ]
})
