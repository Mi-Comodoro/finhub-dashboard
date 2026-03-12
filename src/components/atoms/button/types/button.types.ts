export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type IconPosition = 'left' | 'right'

export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset'
  variant?: ButtonVariant
  size?: ButtonSize
  iconPosition?: IconPosition
  disabled?: boolean
  loading?: boolean
  iconOnly?: boolean
  icon?: string
  fullWidth?: boolean
}
