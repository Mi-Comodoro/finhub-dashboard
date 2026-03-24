export type AlertVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'secondary'

export interface AlertBannerProps {
  variant?: AlertVariant
  icon?: string
  title?: string
}

export interface VariantClasses {
  wrapper: string
  icon: string
  title: string
}
