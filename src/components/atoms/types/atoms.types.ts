/**
 * UI GLOBAL TYPES - ARCHIVO CENTRALIZADO
 */

// 1. Tipos Compartidos (Tokens de diseño)
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | (string & {})
export type ComponentIntent =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
export type LayoutDirection = 'row' | 'column'

interface BaseUIProps {
  className?: string
  disabled?: boolean
  required?: boolean
}

// 2. Iconos
export interface IconProps extends BaseUIProps {
  name: string
  size?: ComponentSize | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  variant?: 'outlined' | 'filled' | 'sharp' | 'rounded'
  ariaLabel?: string
}

export interface IconBadgeProps extends Pick<IconProps, 'className'> {
  icon: string
  size?: Extract<ComponentSize, 'sm' | 'md' | 'lg'>
  iconClass?: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral'
}

// 3. Botones y Etiquetas

export interface LabelProps extends BaseUIProps {
  forId: string
  text: string
  variant?: LayoutDirection
}

// 4. Feedback y Datos

// 5. Entradas (Radio/Select)
export interface RadioOption<T = string | boolean | number> {
  label: string
  value: T
  title?: string
  description?: string
  icon?: string
  badge?: string
}

export interface RadioButtonProps extends BaseUIProps {
  modelValue: string | number | boolean | null | undefined
  name: string
  options: RadioOption[]
  label?: string
  variant?: 'default' | 'card'
  direction?: LayoutDirection
}

// 6. Contenedores y Visualización
export interface CardProps extends BaseUIProps {
  as?: 'div' | 'section' | 'article'
  variant?: 'default' | 'elevated' | 'outline' | 'primary'
}

export interface MetricCardProps extends BaseUIProps {
  title: string
  value?: number | string
  subtitle?: string
  variant?: 'income' | 'expense' | 'available' | 'neutral' | 'undefined'
  size?: Extract<ComponentSize, 'sm' | 'md' | 'lg'>
  icon?: string
  iconClass?: string
  percentage?: number
  percentageText?: string
  currency?: boolean
  currencyCode?: string
  decimals?: number
  hiddenValue?: boolean
}
