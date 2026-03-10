/**
 * UI Types - Atoms
 * Smallest UI components with their props and events
 */

export interface ButtonProps {
  readonly variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  readonly size?: 'sm' | 'md' | 'lg'
  readonly disabled?: boolean
  readonly loading?: boolean
  readonly fullWidth?: boolean
  readonly type?: 'button' | 'submit' | 'reset'
  readonly icon?: string
  readonly iconPosition?: 'left' | 'right'
  readonly iconOnly?: boolean
}

export interface ButtonEmits {
  click: []
}

export interface InputProps {
  readonly modelValue?: string | number
  readonly type?: 'text' | 'email' | 'password' | 'number' | 'tel'
  readonly placeholder?: string
  readonly disabled?: boolean
  readonly readonly?: boolean
  readonly error?: string
  readonly label?: string
  readonly required?: boolean
  readonly autocomplete?: string
}

export interface InputEmits {
  'update:modelValue': [value: string | number]
  blur: []
  focus: []
}

export interface LabelProps {
  readonly for?: string
  readonly required?: boolean
  readonly size?: 'sm' | 'md' | 'lg'
}

export interface IconProps {
  readonly name: string
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  readonly color?: string
}

export interface StepDotProps {
  readonly step: number
  readonly isActive?: boolean
  readonly isCompleted?: boolean
  readonly isClickable?: boolean
}

export interface StepDotEmits {
  click: [step: number]
}

export interface RadioButtonProps {
  readonly modelValue?: string | number
  readonly value: string | number
  readonly name: string
  readonly disabled?: boolean
  readonly label?: string
}

export interface RadioButtonEmits {
  'update:modelValue': [value: string | number]
}
