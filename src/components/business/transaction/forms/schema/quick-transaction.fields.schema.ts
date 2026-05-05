import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export const quickTransactionFieldsSchema = (
  goalOptions: SelectOption[],
  accountOptions: SelectOption[]
): FormSchema => ({
  fields: {
    type: {
      type: 'radio-card',
      label: 'Tipo de Registro',
      required: true,
      options: [
        { label: 'Ingreso', value: 'income', description: 'Dinero recibido', icon: 'payments' },
        { label: 'Gasto', value: 'expense', description: 'Dinero gastado', icon: 'receipt_long' },
        { label: 'Ahorro', value: 'saving', description: 'Aporte a una meta', icon: 'savings' }
      ]
    },
    amount: {
      type: 'money',
      label: 'Monto',
      required: true,
      prefix: 'COP'
    },
    date: {
      type: 'date',
      label: 'Fecha',
      required: true
    },
    description: {
      type: 'textarea',
      label: 'Descripción',
      placeholder: 'Notas adicionales (opcional)',
      required: false
    },
    goalId: {
      type: 'select',
      label: 'Meta de ahorro',
      placeholder: 'Selecciona una meta',
      options: goalOptions,
      required: form => form['type'] === 'saving',
      visibleWhen: form => form['type'] === 'saving'
    },
    contributionType: {
      type: 'radio-card',
      label: 'Tipo de aporte',
      required: false,
      options: [
        {
          label: 'Depósito externo',
          value: 'external',
          description: 'Desde fuera',
          icon: 'account_balance'
        },
        {
          label: 'Transferencia',
          value: 'internal',
          description: 'Cuenta propia',
          icon: 'swap_horiz'
        }
      ],
      visibleWhen: form => form['type'] === 'saving'
    },
    accountId: {
      type: 'select',
      label: 'Cuenta origen',
      placeholder: 'Selecciona una cuenta',
      options: accountOptions,
      required: false,
      visibleWhen: form => form['type'] === 'saving' && form['contributionType'] === 'internal'
    }
  },
  layout: [
    {
      type: 'row',
      fields: ['type']
    },
    {
      type: 'grid',
      columns: 2,
      fields: ['amount', 'date']
    },
    {
      type: 'row',
      fields: ['description']
    },
    {
      type: 'row',
      fields: ['goalId']
    },
    {
      type: 'row',
      fields: ['contributionType']
    },
    {
      type: 'row',
      fields: ['accountId']
    }
  ]
})
