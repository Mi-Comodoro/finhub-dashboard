<script setup lang="ts">
  import { OnboardingStepIntro, ProgressBar } from '@/components/molecules'
  import {
    BasicInformationForm,
    BudgetStrategyForm,
    FinancialGoalsForm
  } from '@/components/organisms'
  import { ON_BOARDING_CONFIG } from '~/common/constants'
  import type { OnboardingFormData } from '~/types/ui'

  import type {
    FinancialGoalsData,
    FinancialUsage,
    FinancialUsageInput
  } from '../forms/types/financial-goals-form.types'
  // State
  import type { OnboardingWizardEmits } from './types/onboarding-wizard.types'

  const emit = defineEmits<OnboardingWizardEmits>()
  // Computed properties

  const wizardData = reactive<OnboardingFormData>({
    personalInfo: {
      displayName: '',
      email: '',
      phone: '',
      gender: '' as 'MALE' | 'FEMALE' | 'PREFER_NOT_TO_SAY'
    },
    finances: {
      currency: '' as 'COP' | 'USD',
      usage: '' as 'personal' | 'shared',
      profile: '' as 'EMPLOYEE' | 'FREELANCER' | 'BUSINESS_OWNER',
      budgetFrequency: '' as 'MONTHLY' | 'BIWEEKLY'
    },
    budget: {
      strategy: '' as 'BALANCED' | 'CUSTOM',
      customAllocations: {
        needs: 0,
        wants: 0,
        savings: 0
      }
    }
  })

  const onboardingBasicData = (data: OnboardingFormData['personalInfo']) => {
    wizardData.personalInfo = data
  }

  const onboardingFinancialGoalsData = (data: FinancialGoalsData) => {
    wizardData.finances = {
      ...data,
      currency: data.currency,
      usage: normalizeUsage(data.usage),
      profile: data.profile ?? 'EMPLOYEE',
      budgetFrequency: data.budgetFrequency ?? 'MONTHLY'
    }
  }

  const budgetStrategyData = (data: OnboardingFormData['budget']) => {
    wizardData.budget = data
  }

  // Función para validar si todos los datos están completos
  const isDataComplete = () => {
    return (
      wizardData.personalInfo.displayName.trim() !== '' &&
      wizardData.personalInfo.email.trim() !== '' &&
      wizardData.personalInfo.phone.trim() !== '' &&
      wizardData.finances.currency !== '' &&
      wizardData.finances.usage !== ''
    )
  }

  const budgetStrategy = ref<'BALANCED' | 'CUSTOM' | null>(null)
  const handleChangeStrategy = () => {
    budgetStrategy.value = wizardData.budget.strategy === 'BALANCED' ? 'CUSTOM' : 'BALANCED'
    wizardData.budget.strategy = '' as 'BALANCED' | 'CUSTOM'
  }
  // Método que puede ser llamado externamente para intentar completar el wizard
  const tryComplete = () => {
    // La completación se activa en el step 3 (cuando se tienen todos los datos)
    if (currentStep.value === 3 && isDataComplete()) {
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

  const userStore = useUserStore()
  const nextStep = () => {
    if (currentStep.value < totalSteps.value) {
      currentStep.value++
    }
  }
  const prevStep = () => {
    if (currentStep.value > firstStep.value) {
      currentStep.value--
    }
  }
  const disabledNext = ref(true)
  const validateBasicInformation = (isValid: boolean) => {
    disabledNext.value = !isValid
  }

  const normalizeUsage = (usage?: FinancialUsageInput): FinancialUsage => {
    if (!usage) return 'personal'

    return usage.toLowerCase() === 'shared' ? 'shared' : 'personal'
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
        :title="`Bienvenido, ${userStore.displayName?.trim().length ? userStore.displayName : (userStore.userInfo.name ?? 'Usuario')}!`"
        :description="ON_BOARDING_CONFIG.personalInfo.description"
      />

      <BasicInformationForm
        @update:model-value="onboardingBasicData"
        @valid="validateBasicInformation"
      />
    </div>
    <div v-if="currentStep === 2" class="onboarding-wizard__step">
      <OnboardingStepIntro
        icon="account_balance_wallet"
        :title="ON_BOARDING_CONFIG.financesConfig.title"
        :description="ON_BOARDING_CONFIG.financesConfig.description"
      />

      <FinancialGoalsForm @update:model-value="onboardingFinancialGoalsData" />
    </div>
    <div v-if="currentStep === 3" class="onboarding-wizard__step">
      <OnboardingStepIntro
        icon="account_balance_wallet"
        :title="ON_BOARDING_CONFIG.budgetStrategy.title"
        :description="ON_BOARDING_CONFIG.budgetStrategy.description"
      />

      <div
        v-if="wizardData.budget.strategy"
        class="mb-4 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
      >
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <IconChip icon="security" variant="primary" />

            <div>
              <Heading
                level="h2"
                size="base"
                weight="semibold"
                class-name="account-info-section__title"
              >
                Estrategia Seleccionada
              </Heading>
              <Label
                variant="form"
                size="sm"
                color="muted"
                class-name="account-info-section__field-label"
              >
                {{ wizardData.budget.strategy === 'BALANCED' ? 'Equilibrada' : 'Personalizada' }}
              </Label>
            </div>
          </div>
        </div>
        <Button size="sm" variant="primary" @click="handleChangeStrategy">Cambiar</Button>
      </div>

      <BudgetStrategyForm
        :strategy-selected="wizardData.budget.strategy"
        @update:model-value="budgetStrategyData"
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
    <div class="flex justify-between">
      <Button
        variant="ghost"
        icon="arrow_back"
        size="sm"
        :disabled="currentStep <= 1"
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
