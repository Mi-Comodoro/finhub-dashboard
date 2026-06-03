<script setup lang="ts">
  import { computed, onMounted, reactive, ref, toRaw, watch } from 'vue'

  import OnboardingStepIntro from '@/components/molecules/onboarding-step-intro/OnboardingStepIntro.vue'
  import ProgressBar from '@/components/molecules/progress-bar/ProgressBar.vue'
  import BudgetStrategyForm from '@/components/organisms/forms/BudgetStrategyForm.vue'
  import FinancialGoalsForm from '@/components/organisms/forms/FinancialGoalsForm.vue'
  import { ON_BOARDING_CONFIG } from '~/common/constants'
  import { useUserStore } from '~/stores/user.store'
  import type { OnboardingFormData } from '~/types/ui'

  import type { UsageValue } from '../forms/types/budget-strategy-form.types'
  import type { FinancesData } from '../forms/types/financial-goals-form.types'
  // State
  import type { OnboardingWizardEmits } from './types/onboarding-wizard.types'
  // TODO: when a plan-selection step is added to this wizard, consume useOnboardingPlan here:
  //   const { getPlan } = useOnboardingPlan()
  //   const selectedPlan = getPlan()
  //   Use `selectedPlan` to pre-select the plan card in the new step.

  const ONBOARDING_KEY = 'mi_comodoro_onboarding_draft'

  const props = withDefaults(defineProps<{ skipPersonalInfo?: boolean }>(), {
    skipPersonalInfo: false
  })

  const emit = defineEmits<OnboardingWizardEmits>()

  function suggestHandle(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/^[^a-z]+/, '')
      .slice(0, 20)
  }

  const userStore = useUserStore()
  // Computed properties

  const wizardData = reactive<OnboardingFormData>({
    personalInfo: {
      displayName: '',
      handle: '',
      email: '',
      phone: '',
      gender: 'prefer_not_to_say' as 'male' | 'female' | 'prefer_not_to_say'
    },
    finances: {
      currency: '' as 'COP' | 'USD',
      profile: '' as 'employee' | 'freelancer' | 'business_owner'
    },
    budget: {
      strategy: '' as 'BALANCED' | 'CUSTOM',
      usage: 'personal' as UsageValue,
      customAllocations: {
        needs: 0,
        wants: 0,
        savings: 0
      }
    },
    incomes: {
      incomes: [
        {
          amount: 0,
          source: '',
          isAdditional: false,
          frequency: 'monthly' as 'monthly' | 'biweekly',
          paymentsDates: null
        },
        {
          amount: 0,
          source: '',
          isAdditional: false,
          frequency: 'monthly' as 'monthly' | 'biweekly',
          paymentsDates: null
        }
      ],
      isAnotherIncomesSource: false
    }
  })

  if (props.skipPersonalInfo) {
    const displayName = userStore.displayName ?? userStore.name ?? ''
    wizardData.personalInfo = {
      displayName,
      handle: userStore.handle ?? suggestHandle(displayName),
      email: userStore.email ?? '',
      phone: userStore.phone ?? '',
      gender: (userStore.gender ?? 'prefer_not_to_say') as 'male' | 'female' | 'prefer_not_to_say'
    }
  }

  /* ---------------------------------------------
   * PERSISTENCIA EN SESSIONSTORAGE
   * --------------------------------------------- */
  function parseDraft(data: Partial<OnboardingFormData>): Partial<OnboardingFormData> {
    // Recorrer incomes y convertir paymentsDates string → Date
    if (data?.incomes?.incomes) {
      data.incomes.incomes = data.incomes.incomes.map(income => ({
        ...income,
        paymentsDates: income.paymentsDates
          ? Array.isArray(income.paymentsDates)
            ? ((income.paymentsDates as unknown as (string | null)[]).map(d =>
                d ? new Date(d) : null
              ) as [Date | null, Date | null])
            : new Date(income.paymentsDates as unknown as string)
          : null
      }))
    }
    return data
  }

  const onboardingBasicData = (data: OnboardingFormData['personalInfo']) => {
    wizardData.personalInfo = data
  }

  const onboardingFinancialGoalsData = (data: FinancesData) => {
    wizardData.finances = {
      ...data,
      currency: data.currency,
      profile: data.profile ?? 'employee'
    }
  }

  const budgetStrategyData = (data: OnboardingFormData['budget']) => {
    wizardData.budget = {
      ...data,
      usage: data.usage
    }
  }

  const incomesData = (data: OnboardingFormData['incomes']) => {
    wizardData.incomes = data
  }

  const isDataComplete = () => {
    const hasPersonalInfo =
      wizardData.personalInfo.phone.trim() !== '' &&
      wizardData.personalInfo.handle.trim().length >= 3 &&
      /^[a-z][a-z0-9_]*$/.test(wizardData.personalInfo.handle)

    const hasFinances =
      wizardData.finances.currency.trim() !== '' && wizardData.finances.profile.trim() !== ''

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
      (wizardData.incomes.incomes[0]?.amount ?? 0) > 0 &&
      (wizardData.incomes.incomes[0]?.source ?? '').trim() !== ''

    return hasPersonalInfo && hasFinances && hasBudget && hasValidIncomes
  }

  // Método que puede ser llamado externamente para intentar completar el wizard
  const tryComplete = () => {
    if (currentStep.value === totalSteps.value && isDataComplete()) {
      sessionStorage.removeItem(ONBOARDING_KEY)
      emit('completed', { ...wizardData })
    }
  }

  defineExpose({ tryComplete })
  const currentStep = ref(props.skipPersonalInfo ? 2 : 1)
  const firstStep = ref(props.skipPersonalInfo ? 2 : 1)
  const totalSteps = ref(ON_BOARDING_CONFIG.stages.length)
  const stepProgress = computed(() => (currentStep.value / totalSteps.value) * 100)

  const nextStep = () => {
    if (currentStep.value < totalSteps.value) {
      currentStep.value++
      if (currentStep.value === totalSteps.value) {
        // En el último paso, verificamos si los datos están completos para habilitar el botón de finalizar
        disabledNext.value = !isDataComplete()
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

  /* ---------------------------------------------
   * COMPUTED — Total de ingresos
   * --------------------------------------------- */
  const totalOnboardingIncome = computed(() => {
    const incomes = wizardData.incomes.incomes
    return incomes.reduce((sum, inc) => {
      if (inc.amount > 0) return sum + inc.amount
      return sum
    }, 0)
  })

  /* ---------------------------------------------
   * LIFECYCLE HOOKS — Persistencia
   * --------------------------------------------- */
  onMounted(() => {
    try {
      const saved = sessionStorage.getItem(ONBOARDING_KEY)
      if (saved) {
        const { wizardData: savedData, step } = JSON.parse(saved)

        // Restaurar cada campo individualmente para mantener reactividad
        const parsed = parseDraft(savedData)
        Object.assign(wizardData, parsed)
        currentStep.value = props.skipPersonalInfo ? Math.max(step ?? 2, 2) : (step ?? 1)
      }
    } catch {
      sessionStorage.removeItem(ONBOARDING_KEY)
    }

    // Re-prefill personalInfo if skipPersonalInfo (sessionStorage could overwrite it)
    if (props.skipPersonalInfo) {
      const displayName = userStore.displayName ?? userStore.name ?? ''
      wizardData.personalInfo = {
        displayName,
        handle: userStore.handle ?? suggestHandle(displayName),
        email: userStore.email ?? '',
        phone: userStore.phone ?? '',
        gender: (userStore.gender ?? 'prefer_not_to_say') as 'male' | 'female' | 'prefer_not_to_say'
      }
    }
  })

  // Guardar en sessionStorage cada vez que cambian los datos
  watch(
    [() => ({ ...wizardData }), currentStep],
    () => {
      try {
        sessionStorage.setItem(
          ONBOARDING_KEY,
          JSON.stringify({ wizardData: toRaw(wizardData), step: currentStep.value })
        )
      } catch {
        // sessionStorage lleno o bloqueado — ignorar silenciosamente
      }
    },
    { deep: true }
  )
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
        :title="ON_BOARDING_CONFIG.incomes.title"
        :description="ON_BOARDING_CONFIG.incomes.description"
      />

      <IncomesForm @update:model-value="incomesData" @valid="enableNextButton" />
    </div>

    <div v-if="currentStep === 4" class="onboarding-wizard__step">
      <OnboardingStepIntro
        icon="account_balance_wallet"
        :title="ON_BOARDING_CONFIG.budgetStrategy.title"
        :description="ON_BOARDING_CONFIG.budgetStrategy.description"
      />

      <BudgetStrategyForm
        :strategy-selected="wizardData.budget.strategy"
        :total-income="totalOnboardingIncome"
        @update:model-value="budgetStrategyData"
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
