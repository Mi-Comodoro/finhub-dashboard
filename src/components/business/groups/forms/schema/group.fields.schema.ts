import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const groupFieldsSchema = (mode: 'create' | 'edit' = 'create'): FormSchema => ({
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
    },
    ...(mode === 'edit'
      ? {
          goal: {
            type: 'money' as const,
            label: 'Meta monetaria (opcional)',
            placeholder: '0',
            prefix: 'COP'
          }
        }
      : {})
  },
  layout: [
    { type: 'row', fields: ['name'] },
    { type: 'row', fields: ['type'] },
    { type: 'row', fields: ['maxMembers'] },
    ...(mode === 'edit' ? [{ type: 'row' as const, fields: ['goal'] }] : [])
  ]
})
