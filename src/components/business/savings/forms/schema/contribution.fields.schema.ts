import type { FormSchema } from '@/components/organisms/forms/Form.vue'

export const contributionFieldsSchema = (
  accountOptions: Array<{ label: string; value: string; disabled?: boolean }>
): FormSchema => ({
  fields: {
    contributionType: {
      type: 'radio-card',
      label: 'Tipo de aporte',
      required: true,
      options: [
        {
          label: 'Transferencia interna',
          value: 'internal',
          description: 'Desde una de mis cuentas de ahorro'
        },
        {
          label: 'Depósito externo',
          value: 'external',
          description: 'Efectivo o transferencia externa'
        }
      ]
    },
    accountId: {
      type: 'select',
      label: 'Cuenta origen',
      required: false,
      placeholder: 'Selecciona una cuenta',
      options: accountOptions,
      visibleWhen: form => form.contributionType === 'internal'
    },
    amount: {
      type: 'money',
      label: 'Monto del aporte',
      placeholder: '0.00',
      required: true
    },
    date: {
      type: 'date',
      label: 'Fecha',
      required: true
    },
    notes: {
      type: 'textarea',
      label: 'Notas',
      placeholder: 'Agrega una nota (opcional)',
      required: false
    }
  }
})
