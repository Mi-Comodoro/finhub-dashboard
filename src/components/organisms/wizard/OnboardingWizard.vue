<script setup lang="ts">
  import { OnboardingStepIntro, ProgressBar } from '@/components/molecules'
  import { BudgetStrategyForm, FinancialGoalsForm } from '@/components/organisms'
  import { ON_BOARDING_CONFIG } from '~/common/constants'
  import type { OnboardingFormData } from '~/types/ui'

  import type { UsageValue } from '../forms/types/budget-strategy-form.types'
  import type { FinancesData } from '../forms/types/financial-goals-form.types'
  // State
  import type { OnboardingWizardEmits } from './types/onboarding-wizard.types'

  const emit = defineEmits<OnboardingWizardEmits>()
  // Computed properties

  const wizardData = reactive<OnboardingFormData>({
    personalInfo: {
      displayName: '',
      email: '',
      phone: '',
      gender: 'prefer_not_to_say' as 'male' | 'female' | 'prefer_not_to_say'
    },
    finances: {
      currency: '' as 'COP' | 'USD',
      profile: '' as 'employee' | 'freelancer' | 'business_owner',
      budgetFrequency: '' as 'monthly' | 'biweekly',
      monthPayment: null,
      biweeklyPayments: [null, null]
    },
    budget: {
      strategy: '' as 'BALANCED' | 'CUSTOM',
      usage: '' as UsageValue,
      customAllocations: {
        needs: 0,
        wants: 0,
        savings: 0
      }
    },
    incomes: {
      incomes: [
        { amount: 0, source: '', isAdditional: false },
        { amount: 0, source: '', isAdditional: false }
      ],
      frequency: '' as 'monthly' | 'biweekly',
      paymentsDates: null
    }
  })

  const onboardingBasicData = (data: OnboardingFormData['personalInfo']) => {
    wizardData.personalInfo = data
  }

  const onboardingFinancialGoalsData = (data: FinancesData) => {
    wizardData.finances = {
      ...data,
      currency: data.currency,
      profile: data.profile ?? 'employee',
      budgetFrequency: data.budgetFrequency ?? 'monthly',
      monthPayment: data.monthPayment ?? null,
      biweeklyPayments: data.biweeklyPayments ?? [null, null]
    }
  }

  const budgetStrategyData = (data: OnboardingFormData['budget']) => {
    const total = Object.values(data.customAllocations).reduce((sum, value) => sum + value, 0)
    if (total <= 100) {
      wizardData.budget = {
        ...data,
        usage: data.usage
      }
    } else {
      // Optionally, you could emit an error event or show a warning here
      console.warn('Total allocation cannot exceed 100%')
      disabledNext.value = true
    }
  }

  const incomesData = (data: OnboardingFormData['incomes']) => {
    wizardData.incomes = data
  }

  // Función para validar si todos los datos están completos
  const isDataComplete = () => {
    const hasPersonalInfo =
      wizardData.personalInfo.displayName.trim() !== '' &&
      wizardData.personalInfo.phone.trim() !== ''

    const hasFinances =
      wizardData.finances.currency.trim() !== '' &&
      wizardData.finances.profile.trim() !== '' &&
      wizardData.finances.budgetFrequency.trim() !== ''

    const hasBudget =
      wizardData.budget.usage &&
      wizardData.budget.usage.trim() !== '' &&
      ((wizardData.budget.strategy === 'CUSTOM' &&
        Object.values(wizardData.budget.customAllocations).reduce(
          (sum, value) => sum + value,
          0
        ) === 100) ||
        wizardData.budget.strategy === 'BALANCED')

    const hasValidIncomes =
      wizardData.incomes.incomes.length > 0 &&
      wizardData.incomes.incomes.every(income => {
        return income.source.trim() !== '' && income.amount > 0
      })
    // Aquí podrías agregar validación extra de cada ingreso si lo necesitas

    return hasPersonalInfo && hasFinances && hasBudget && hasValidIncomes
  }

  // Método que puede ser llamado externamente para intentar completar el wizard
  const tryComplete = () => {
    // La completación se activa en el último step (cuando se tienen todos los datos)
    if (currentStep.value === totalSteps.value && isDataComplete()) {
      emit('completed', { ...wizardData })
    }
  }

  // Exponer método para uso externo
  defineExpose({
    tryComplete
  })
  const currentStep = ref(1)
  const firstStep = ref(1)
  const totalSteps = ref(ON_BOARDING_CONFIG.stages.length)
  const stepProgress = computed(() => (currentStep.value / totalSteps.value) * 100)

  const nextStep = () => {
    if (currentStep.value < totalSteps.value) {
      currentStep.value++
      if (currentStep.value === totalSteps.value) {
        // En el último paso, verificamos si los datos están completos para habilitar el botón de finalizar
        disabledNext.value = !isDataComplete()
      } else {
        // Para pasos intermedios, deshabilitamos el botón hasta que se valide el nuevo paso
        disabledNext.value = true
      }
    }
  }
  const prevStep = () => {
    if (currentStep.value > firstStep.value) {
      currentStep.value--
    }
  }
  const disabledNext = ref(true)
  const enableNextButton = (isValid: boolean) => {
    disabledNext.value = !isValid
  }
</script>
<template>
  <div class="onboarding-wizard">
    <ProgressBar
      :current-step="currentStep"
      :total-steps="totalSteps"
      :stages="ON_BOARDING_CONFIG.stages"
      :progress="stepProgress"
      variant="primary"
      size="lg"
    />
    <div v-if="currentStep === 1" class="onboarding-wizard__step">
      <OnboardingStepIntro
        icon="person"
        :title="ON_BOARDING_CONFIG.personalInfo.title"
        :description="ON_BOARDING_CONFIG.personalInfo.description"
      />

      <BasicFormData @update:model-value="onboardingBasicData" @valid="enableNextButton" />
    </div>
    <div v-if="currentStep === 2" class="onboarding-wizard__step">
      <OnboardingStepIntro
        icon="account_balance_wallet"
        :title="ON_BOARDING_CONFIG.financesConfig.title"
        :description="ON_BOARDING_CONFIG.financesConfig.description"
      />

      <FinancialGoalsForm
        @valid="enableNextButton"
        @update:model-value="onboardingFinancialGoalsData"
      />
    </div>
    <div v-if="currentStep === 3" class="onboarding-wizard__step">
      <OnboardingStepIntro
        icon="account_balance_wallet"
        :title="ON_BOARDING_CONFIG.budgetStrategy.title"
        :description="ON_BOARDING_CONFIG.budgetStrategy.description"
      />

      <BudgetStrategyForm
        :strategy-selected="wizardData.budget.strategy"
        @update:model-value="budgetStrategyData"
        @valid="enableNextButton"
      />
    </div>

    <div v-if="currentStep === 4" class="onboarding-wizard__step">
      <OnboardingStepIntro
        :title="ON_BOARDING_CONFIG.incomes.title"
        :description="ON_BOARDING_CONFIG.incomes.description"
      />

      <IncomesForm
        :budget-frequency="wizardData.finances.budgetFrequency"
        @update:model-value="incomesData"
        @valid="enableNextButton"
      />
    </div>
    <div v-if="currentStep === totalSteps" class="onboarding-wizard__step">
      <OnboardingStepIntro
        icon="check_circle"
        :title="ON_BOARDING_CONFIG.completion.title"
        :description="ON_BOARDING_CONFIG.completion.description"
        :highlighted-title="true"
      />
    </div>
    <div class="mt-4 flex items-center justify-between">
      <Button
        variant="ghost"
        icon="arrow_back"
        size="sm"
        :disabled="currentStep <= firstStep"
        @click="prevStep"
      >
        {{ currentStep <= firstStep ? 'Primer Paso' : 'Anterior' }}
      </Button>

      <Button
        variant="primary"
        :icon="currentStep === totalSteps ? 'check' : 'arrow_forward'"
        icon-position="right"
        size="sm"
        :disabled="disabledNext"
        @click="
          () => {
            if (currentStep === totalSteps) {
              tryComplete()
            } else {
              nextStep()
            }
          }
        "
      >
        {{
          currentStep === totalSteps
            ? 'Finalizar'
            : currentStep === totalSteps - 1
              ? 'Completar Configuración'
              : 'Siguiente'
        }}
      </Button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .onboarding-wizard {
    @apply w-full;
  }
  .onboarding-wizard__step {
    @apply box-content flex w-full flex-col flex-wrap gap-1 text-wrap;
  }
</style>
