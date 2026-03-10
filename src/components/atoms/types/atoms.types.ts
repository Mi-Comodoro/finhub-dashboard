export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
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
  title?: string // For card variant - main title
  description?: string // For card variant - subtitle/description
  icon?: string // For card variant - material icon name
  badge?: string // For card variant - optional badge text
}

export interface RadioButtonProps {
  modelValue: string | number
  name: string
  options: RadioOption[]
  label?: string
  required?: boolean
  disabled?: boolean
  variant?: 'default' | 'card' // New variant prop
  direction?: 'row' | 'column' // Layout direction
}

export interface BadgeProps {
  text?: string
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'outline'
    | 'solid'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  rounded?: boolean
  interactive?: boolean
}

export interface IconProps {
  /** Name of the Material Symbol icon */
  name: string
  /** Size of the icon - predefined sizes or custom string */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | string
  /** Material icon variant */
  variant?: 'outlined' | 'filled' | 'sharp' | 'rounded'
  /** Additional CSS classes */
  className?: string
  /** Accessibility label */
  ariaLabel?: string
}

export interface IconBadgeProps {
  /** Material Symbol icon name */
  icon: string
  /** Size of the badge container and icon */
  size?: 'sm' | 'md' | 'lg'
  /** Tailwind bg + text classes for the bubble. Falls back to neutral slate. */
  iconClass?: string
}

export type CardTag = 'div' | 'section' | 'article'
export type CardVariant = 'default' | 'elevated'

export interface CardProps {
  as?: CardTag
  variant?: CardVariant
  className?: string
}

export type MetricVariant = 'income' | 'expense' | 'available' | 'neutral'
export type MetricSize = 'sm' | 'md' | 'lg'

export interface MetricCardProps {
  title: string
  value: number | string
  percentage?: number
  percentageText?: string
  icon?: string
  variant?: MetricVariant
  size?: MetricSize
  currency?: boolean
  currencyCode?: import('@/utils/currency').Currency
  /** Override the number of decimal places shown. Defaults to the currency's natural precision (COP=0, USD/EUR=2). */
  decimals?: number
  className?: string
  /** Override the icon bubble background + icon color (Tailwind classes). Falls back to variant default. */
  iconClass?: string
  /** Secondary label rendered below the main value (static text, not tied to percentage). */
  subtitle?: string
}
