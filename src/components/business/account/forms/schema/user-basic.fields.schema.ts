import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const userBasicDataFieldsSchema = (): FormSchema => {
  return {
    fields: {
      displayName: {
        type: 'text',
        label: '¿Cómo quieres que te llamemos?',
        placeholder: 'Tu nombre en Mi Comodoro',
        hint: 'Puedes cambiarlo cuando quieras desde tu perfil'
      },
      phone: {
        type: 'phone', // nuevo tipo
        label: 'Teléfono',
        required: true
      },
      gender: {
        type: 'select',
        label: 'Sexo',
        options: [
          { label: 'Masculino', value: 'male' },
          { label: 'Femenino', value: 'female' },
          { label: 'Prefiero no decirlo', value: 'prefer_not_to_say' }
        ]
      }
    },

    layout: [
      {
        type: 'grid',
        columns: 1,
        fields: ['displayName']
      },
      {
        type: 'grid',
        columns: 2,
        fields: ['phone', 'gender']
      }
    ]
  }
}
