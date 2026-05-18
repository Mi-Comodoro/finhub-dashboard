import type { FieldSchema } from '@/components/organisms'

export const collectionFieldsSchema = (): FieldSchema[] => [
  {
    name: 'amount',
    label: 'Monto cobrado',
    type: 'money',
    placeholder: '0.00',
    required: true
  },
  {
    name: 'collectionDate',
    label: 'Fecha de cobro',
    type: 'date',
    required: true
  },
  {
    name: 'notes',
    label: 'Notas (opcional)',
    type: 'textarea',
    placeholder: 'Observaciones del cobro...'
  }
]
