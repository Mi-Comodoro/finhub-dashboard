export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline'
  | 'solid'
  | 'interactive'

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg'

export interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  rounded?: boolean
  text?: string
  className?: string
}
