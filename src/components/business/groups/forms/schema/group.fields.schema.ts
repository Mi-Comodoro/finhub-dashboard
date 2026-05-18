import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const groupFieldsSchema = (): FormSchema => ({
  fields: {
    name: {
      type: 'text',
      label: 'Nombre del grupo',
      placeholder: 'Ej. Gastos del hogar',
      required: true,
      errorMessage: 'El nombre es requerido'
    },
    type: {
      type: 'radio-card',
      label: 'Tipo de grupo',
      size: 'sm',
      required: true,
      options: [
        { label: 'Compartido', value: 'SHARED', icon: 'group' },
        { label: 'Familiar', value: 'FAMILIAR', icon: 'family_restroom' },
        { label: 'Viaje', value: 'TRAVEL', icon: 'flight_takeoff' }
      ]
    },
    maxMembers: {
      type: 'number',
      label: 'Máximo de miembros',
      placeholder: '5'
    }
  },
  layout: [
    { type: 'row', fields: ['name'] },
    { type: 'row', fields: ['type'] },
    { type: 'row', fields: ['maxMembers'] }
  ]
})
