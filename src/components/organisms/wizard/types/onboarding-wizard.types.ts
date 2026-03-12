import type { OnboardingFormData } from '~/types/ui'

export interface OnboardingWizardEmits {
  completed: [data: OnboardingFormData]
  nextStep: []
}
