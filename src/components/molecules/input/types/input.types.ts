export type InputSize = 'sm' | 'md' | 'lg'
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
  readonly?: boolean
  label?: string
  hint?: string
  id?: string
  name?: string
  modelValue?: string | number
  prefix?: string
  currency?: string
  isInsideGroup?: boolean
}

export type SearchInputProps = Omit<
  InputProps,
  | 'searchIcon'
  | 'showPasswordToggle'
  | 'forgotPassword'
  | 'forgotPasswordText'
  | 'passwordIconStyle'
>

export interface PasswordInputProps extends Omit<
  InputProps,
  'searchIcon' | 'showPasswordToggle' | 'forgotPassword' | 'forgotPasswordText'
> {
  iconStyle?: PasswordIconStyle
}
