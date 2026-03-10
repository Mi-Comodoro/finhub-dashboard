/* eslint-disable no-unused-vars */
/**
 * UI Types - Common
 * Shared UI types across all atomic design levels
 */

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost'
export type ThemeColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'light'
  | 'dark'

export interface LoadingState {
  readonly isLoading: boolean
  readonly loadingText?: string
}

export interface ErrorState {
  readonly hasError: boolean
  readonly errorMessage?: string
  readonly errorCode?: string
}

export interface ValidationState {
  readonly isValid: boolean
  readonly errors: readonly string[]
}

// Common props that many components share
export interface BaseUIProps {
  readonly class?: string
  readonly testId?: string
  readonly ariaLabel?: string
}

// Animation and transition types
export type TransitionName =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom'

// Responsive breakpoint types
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// Layout alignment types
export type JustifyContent = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
export type AlignItems = 'start' | 'end' | 'center' | 'baseline' | 'stretch'

// Form validation types
export interface FieldValidation {
  readonly required?: boolean
  readonly minLength?: number
  readonly maxLength?: number
  readonly pattern?: RegExp
  readonly custom?: (value: unknown) => string | null
}
