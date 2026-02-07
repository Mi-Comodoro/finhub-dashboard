export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  loading?: boolean
  iconOnly?: boolean
  fullWidth?: boolean
}

export interface LabelProps {
  forId: string
  text: string
  required?: boolean
  variant?: 'column' | 'row'
}

export interface RadioOption<T = string> {
  label: string
  value: T
}

export interface RadioButtonProps {
  modelValue: string | number
  name: string
  options: RadioOption[]
  label?: string
  required?: boolean
  disabled?: boolean
}
