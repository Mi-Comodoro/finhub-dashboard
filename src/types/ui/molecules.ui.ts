/**
 * UI Types - Molecules
 * Combined atomic components with specific functionality
 */

export interface SelectOption {
  readonly label: string
  readonly value: string | number
  readonly disabled?: boolean
}

export interface SelectProps {
  readonly modelValue?: string | number
  readonly options: readonly SelectOption[]
  readonly placeholder?: string
  readonly disabled?: boolean
  readonly error?: string
  readonly label?: string
  readonly required?: boolean
}

export interface SelectEmits {
  'update:modelValue': [value: string | number]
}

export interface ProgressBarProps {
  readonly progress: number // 0-100
  readonly variant?: 'primary' | 'success' | 'warning' | 'danger'
  readonly size?: 'sm' | 'md' | 'lg'
  readonly showLabel?: boolean
  readonly label?: string
}

export interface StepperItemProps {
  readonly step: number
  readonly title: string
  readonly description?: string
  readonly isActive?: boolean
  readonly isCompleted?: boolean
  readonly isClickable?: boolean
}

export interface StepperItemEmits {
  'step:click': [step: number]
}

export interface InputGroupProps {
  readonly label?: string
  readonly error?: string
  readonly helperText?: string
  readonly required?: boolean
}

export interface FormFieldProps {
  readonly label?: string
  readonly error?: string
  readonly helperText?: string
  readonly required?: boolean
  readonly fieldId: string
}
