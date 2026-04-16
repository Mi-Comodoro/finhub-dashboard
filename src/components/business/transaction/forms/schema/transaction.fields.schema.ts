import type { FieldSchema } from '@/components/organisms'

export const transactionFieldsSchema = (
  categoryOptions: Array<{ label: string; value: string; disabled?: boolean }>
): FieldSchema[] => [
  {
    name: 'type',
    label: 'Tipo de Transacción',
    type: 'select',
    placeholder: 'Selecciona el tipo',
    required: true,
    options: [
      { label: 'Ingreso', value: 'income' },
      { label: 'Gasto', value: 'expense' },
      { label: 'Ahorro', value: 'savings' }
    ]
  },
  {
    name: 'amount',
    label: 'Monto',
    type: 'money',
    placeholder: '0.00',
    required: true
  },
  {
    name: 'transactionDate',
    label: 'Fecha de Transacción',
    type: 'date',
    required: true
  },
  {
    name: 'source',
    label: 'Fuente',
    type: 'select',
    placeholder: 'Selecciona la fuente',
    required: true,
    options: [
      { label: 'Manual', value: 'manual' },
      { label: 'Ingreso Planificado', value: 'planned-income' },
      { label: 'Gasto Planificado', value: 'planned-expense' },
      { label: 'Ahorro Distribuido', value: 'distributed-savings' }
    ]
  },
  {
    name: 'categoryId',
    label: 'Categoría',
    type: 'select',
    placeholder: 'Selecciona una categoría (opcional)',
    required: false,
    options: categoryOptions
  },
  {
    name: 'description',
    label: 'Descripción',
    type: 'textarea',
    placeholder: 'Agrega una descripción (opcional)',
    required: false
  }
]
