export type InputSize = 'sm' | 'default'
export type InputVariant = 'row' | 'column'
export type InputTag = 'input' | 'textarea'
export type PasswordIconStyle = 'outline' | 'filled' | 'rounded'

export interface InputProps {
  type?: string
  tag?: InputTag
  required?: boolean
  disabled?: boolean
  pattern?: RegExp | (() => RegExp)
  error?: string | boolean
  errorMessage?: string
  placeHolder?: string
  placeholder?: string
  variant?: InputVariant
  searchIcon?: boolean
  forgotPassword?: boolean
  forgotPasswordText?: string
  showPasswordToggle?: boolean
  passwordIconStyle?: PasswordIconStyle
  readonly?: boolean
  label?: string
  id?: string
  name?: string
  modelValue?: string
}
