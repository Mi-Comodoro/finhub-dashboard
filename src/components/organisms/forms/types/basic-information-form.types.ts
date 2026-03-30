export interface BasicInformationData {
  [key: string]: string | number | boolean | Date | null
  displayName: string
  email: string
  phone: string
}

export interface BasicInformationFormProps {
  modelValue?: BasicInformationData
}

export interface BasicInformationFormEmits {
  'update:modelValue': [value: BasicInformationData]
  valid: [isValid: boolean]
}
