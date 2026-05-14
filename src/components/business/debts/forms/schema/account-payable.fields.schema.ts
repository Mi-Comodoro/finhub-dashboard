import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const accountPayableFieldsSchema = (): FormSchema => ({
  fields: {
    name: {
      type: 'text',
      label: 'Nombre de la deuda',
      placeholder: 'Ej. Crédito vehículo',
      required: true
    },
    type: {
      type: 'radio-card',
      label: 'Tipo',
      required: true,
      options: [
        { label: 'Préstamo', value: 'loan', icon: 'account_balance' },
        { label: 'Tarjeta', value: 'credit_card', icon: 'credit_card' },
        { label: 'Cuotas', value: 'installment', icon: 'receipt_long' },
        { label: 'Otro', value: 'other', icon: 'more_horiz' }
      ]
    },
    originalAmount: {
      type: 'money',
      label: 'Monto original',
      required: true
    },
    minimumPayment: {
      type: 'money',
      label: 'Pago mínimo mensual (opcional)'
    },
    interestRate: {
      type: 'number',
      label: 'Tasa de interés % EA (opcional)',
      placeholder: 'Ej. 12.5',
      prefix: '%EA'
    },
    nextPaymentDate: {
      type: 'date',
      label: 'Próxima fecha de pago (opcional)'
    },
    notes: {
      type: 'textarea',
      label: 'Notas',
      placeholder: 'Detalles adicionales sobre esta deuda...'
    }
  },
  layout: [
    { type: 'row', fields: ['name'] },
    { type: 'row', fields: ['type'] },
    { type: 'grid', columns: 2, fields: ['originalAmount', 'minimumPayment'] },
    { type: 'grid', columns: 2, fields: ['interestRate', 'nextPaymentDate'] },
    { type: 'row', fields: ['notes'] }
  ]
})

export const paymentFieldsSchema = (): FormSchema => ({
  fields: {
    amount: {
      type: 'money',
      label: 'Monto del pago',
      required: true
    },
    paymentDate: {
      type: 'date',
      label: 'Fecha del pago',
      required: true
    },
    notes: {
      type: 'textarea',
      label: 'Notas (opcional)',
      placeholder: 'Referencia de pago, comprobante...'
    }
  },
  layout: [
    { type: 'grid', columns: 2, fields: ['amount', 'paymentDate'] },
    { type: 'row', fields: ['notes'] }
  ]
})
