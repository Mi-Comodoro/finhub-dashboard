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
      handle: {
        type: 'text',
        label: 'Tu nombre de usuario',
        placeholder: 'tu_usuario',
        prefix: '@',
        hint: 'Con este @usuario otros podrán encontrarte y etiquetarte en grupos',
        validate: (value: unknown) => {
          const v = String(value ?? '')
          if (!v) return true
          if (v.length < 3) return 'Mínimo 3 caracteres'
          if (!/^[a-z][a-z0-9_]{2,19}$/.test(v))
            return 'Solo letras minúsculas, números y _ (empieza con letra)'
          return true
        }
      },
      phone: {
        type: 'phone',
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
        fields: ['handle', 'phone']
      },
      {
        type: 'grid',
        columns: 1,
        fields: ['gender']
      }
    ]
  }
}
