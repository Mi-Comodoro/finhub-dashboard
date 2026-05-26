import type { FieldSchema } from '@/components/organisms/forms/Form.vue'

export const incomeFieldsSchema = (): FieldSchema[] => [
  {
    name: 'source',
    label: 'Fuente de Ingreso',
    type: 'text',
    placeholder: 'Ej: Salario, Freelance, Negocio',
    required: true
  },
  {
    name: 'amount',
    label: 'Monto',
    type: 'money',
    placeholder: '0.00',
    required: true
  },
  {
    name: 'date',
    label: 'Fecha Esperada',
    type: 'date',
    required: true
  }
]
