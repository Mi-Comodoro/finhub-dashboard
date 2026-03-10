export interface InputProps {
  modelValue?: string | number
  id?: string
  label?: string
  name: string
  type?: string
  required?: boolean
  disabled?: boolean
  pattern?: RegExp
  error?: string | boolean
  errorMessage?: string
  tag?: string
  placeholder?: string
  /** @deprecated Use placeholder instead */
  placeHolder?: string
  variant?: 'column' | 'row'
  searchIcon?: boolean
  forgotPassword?: boolean
  forgotPasswordText?: string
  showPasswordToggle?: boolean
  passwordIconStyle?: 'outline' | 'filled' | 'rounded'
  readonly?: boolean
}

export interface Option {
  value: string | number
  label: string
}
export interface SelectProps {
  modelValue?: string | number
  label?: string
  name: string
  options: Option[]
  required?: boolean
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  variant?: 'auth' | 'admin' | 'admin-inline'
  size?: 'default' | 'sm'
  initialOption?: Option
}

// Añade esto a tus tipos existentes
export interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  percentage: number
  stepLabel?: string
  barColor?: string
  size?: 'sm' | 'default'
  variant?: 'admin' | 'admin-inline' | 'default'
  showLabels?: boolean
  showPercentage?: boolean
}

export interface BudgetAllocation {
  needs: number // Gastos Fijos (%)
  wants: number // Gastos Variables u Ocasionales (%)
  savings: number // Ahorro e Inversiones (%)
}

export interface BudgetStrategyCardProps {
  title: string
  description: string
  allocation: BudgetAllocation
  icon?: string
  recommended?: boolean
  advanced?: boolean
  selected?: boolean
  selectable?: boolean
}

export interface BudgetStrategyGroupProps {
  direction?: 'row' | 'column'
  gap?: 'sm' | 'md' | 'lg'
}

export interface BudgetStrategyCardEmits {
  select: []
  'update:allocation': [allocation: BudgetAllocation]
}

export type EditableInfoCardVariant = 'default' | 'compact'

export interface EditableInfoCardProps {
  title: string
  icon: string
  iconContainerClass?: string
  variant?: EditableInfoCardVariant
  isEditing?: boolean
  showEditButton?: boolean
  editButtonText?: string
}

export interface ComingSoonCardProps {
  icon: string
  title?: string
  description?: string
}

export interface AccountInfo {
  accountType: string
  status: string
  expirationDate: string
  progress: number
  progressText: string
  isPromo?: boolean
}

export interface AccountInfoSectionProps {
  accountInfo?: AccountInfo
  showManageButton?: boolean
}

export interface OnboardingStepIntroProps {
  icon: string
  title: string
  description: string
  highlightedTitle?: boolean
}

export interface SectionCardProps {
  /** Heading text rendered inside the card header. Omit to suppress the header entirely. */
  title?: string
  /** HTML element to render as the card root. Defaults to 'div'. */
  as?: 'div' | 'section' | 'article'
}
