export interface InputProps {
  modelValue?: string | number
  label: string
  name: string
  type?: string
  required?: boolean
  disabled?: boolean
  pattern?: RegExp
  errorMessage?: string
  tag?: string
  placeHolder?: string
  variant?: 'column' | 'row'
  searchIcon?: boolean
  forgotPassword?: boolean
  forgotPasswordText?: string
  showPasswordToggle?: boolean
  passwordIconStyle?: 'outline' | 'filled' | 'rounded'
}

interface Option {
  value: string | number
  label: string
}
export interface SelectProps {
  modelValue?: string | number
  label?: string
  name: string
  options: Option[]
  required?: boolean
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  variant?: 'auth' | 'admin' | 'admin-inline'
  size?: 'default' | 'sm'
}
