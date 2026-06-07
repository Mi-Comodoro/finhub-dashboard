export interface BasicInformationData {
  [key: string]: string | number | boolean | Date | null
  displayName: string
  handle: string
  email: string
  phone: string
  gender: 'male' | 'female' | 'prefer_not_to_say'
}

export interface BasicInformationFormProps {
  modelValue?: BasicInformationData
}

export interface BasicInformationFormEmits {
  'update:modelValue': [value: BasicInformationData]
  valid: [isValid: boolean]
}
