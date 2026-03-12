export interface BasicInformationData {
  displayName: string
  email: string
  phone: string
  gender: 'MALE' | 'FEMALE' | 'PREFER_NOT_TO_SAY' | ''
}

export interface BasicInformationFormProps {
  modelValue?: BasicInformationData
}

export interface BasicInformationFormEmits {
  'update:modelValue': [value: BasicInformationData]
  valid: [isValid: boolean]
}
