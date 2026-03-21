export interface Option {
  value: string | number
  label: string
  disabled?: boolean
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
  initialOption?: Option
}
