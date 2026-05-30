import type { IllustrationType } from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'

export interface EmptyStateProps {
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  illustration?: IllustrationType
}
