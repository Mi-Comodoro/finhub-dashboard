export interface BasicInformationData {
  displayName: string
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
