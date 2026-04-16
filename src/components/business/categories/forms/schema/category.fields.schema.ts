import type { FieldSchema } from '@/components/organisms'

export const categoryFieldsSchema = (): FieldSchema[] => [
  {
    name: 'name',
    label: 'Nombre de la Categoría',
    type: 'text',
    placeholder: 'Ej: Alimentación, Transporte',
    required: true
  },
  {
    name: 'type',
    label: 'Tipo de Categoría',
    type: 'radio-card',
    required: true,
    options: [
      {
        label: 'Necesidad',
        value: 'need',
        description: 'Gastos fijos esenciales'
      },
      {
        label: 'Gusto',
        value: 'want',
        description: 'Gastos variables opcionales'
      },
      {
        label: 'Ahorro',
        value: 'saving',
        description: 'Metas y reservas'
      }
    ]
  }
]
