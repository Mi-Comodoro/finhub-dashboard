/**
 * UI Types - Templates
 * Page-level layout components
 */

export interface DashboardTemplateProps {
  readonly isLoading?: boolean
  readonly error?: string
}

export interface DashboardTemplateSlots {
  header: never
  sidebar: never
  main: never
  footer: never
}

export interface OnboardingTemplateProps {
  readonly currentStep: number
  readonly totalSteps: number
  readonly isLoading?: boolean
  readonly error?: string
}

export interface OnboardingTemplateSlots {
  header: never
  content: never
  navigation: never
}

export interface AuthTemplateProps {
  readonly isLoading?: boolean
  readonly error?: string
}

export interface AuthTemplateSlots {
  content: never
  footer: never
}
