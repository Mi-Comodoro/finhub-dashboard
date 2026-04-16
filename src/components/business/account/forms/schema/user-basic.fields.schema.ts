import type { FormSchema } from '~/components/organisms/forms/Form.vue'

export const userBasicDataFieldsSchema = (): FormSchema => {
  return {
    fields: {
      displayName: {
        type: 'text',
        label: '¿Como quieres que te llamemos?',
        placeholder: 'Jhon',
        required: true
      },
      phone: {
        type: 'text',
        label: 'Telefono',
        placeholder: '+571234567891',
        required: true,
        pattern: /^\+[0-9]{7,15}$/,
        errorMessage: 'Ingresa un número válido (ej: +57911...) sin espacios ni letras.'
      }
    },

    layout: [
      {
        type: 'grid',
        columns: 1,
        fields: ['displayName', 'phone']
      }
    ]
  }
}
