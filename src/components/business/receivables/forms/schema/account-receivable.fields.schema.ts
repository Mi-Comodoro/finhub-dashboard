import type { FieldSchema } from '@/components/organisms'

export const accountReceivableFieldsSchema = (): FieldSchema[] => [
  {
    name: 'name',
    label: 'Nombre del cobro',
    type: 'text',
    placeholder: 'Ej: Préstamo a Juan, Factura cliente',
    required: true
  },
  {
    name: 'debtor',
    label: 'Deudor (opcional)',
    type: 'text',
    placeholder: 'Nombre de quien debe'
  },
  {
    name: 'originalAmount',
    label: 'Monto original',
    type: 'money',
    placeholder: '0.00',
    required: true
  },
  {
    name: 'dueDate',
    label: 'Fecha esperada (opcional)',
    type: 'date'
  },
  {
    name: 'notes',
    label: 'Notas (opcional)',
    type: 'textarea',
    placeholder: 'Detalles adicionales...'
  }
]
