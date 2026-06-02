export interface SignupFormData {
  name: string
  displayName: string
  handle: string
  email: string
  phone: string
  password: string
  gender: 'male' | 'female' | 'prefer_not_to_say'
  dialCode: string
}

export interface SignupFormProps {
  onBackToLogin?: () => void
}

export interface SignupFormEmits {
  'back-to-login': []
}
