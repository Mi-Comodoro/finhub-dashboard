<script setup lang="ts">
  /**
   * Onboarding Page
   * Main entry point for user onboarding flow, guiding through setup steps
   * Follows clean architecture - UI layer calling through composable to services
   */

  import { OnboardingWizard } from '@/components/organisms'
  import type { OnboardingFormData } from '~/types/ui'

  interface OnboardingWizardExposed {
    tryComplete: () => void
  }

  // Define page metadata - use onboarding layout and onboarding middleware
  definePageMeta({
    layout: 'onboarding',
    middleware: 'onboarding'
  })

  const { completeOnboarding, updateOnboardingStep, isLoading } = useOnBoarding()

  // Referencia al wizard para poder llamar sus métodos
  const wizardRef = ref<OnboardingWizardExposed | null>(null)

  // Reactive state to sync with wizard
  const currentStep = ref(1) // Inicia en 1 para que el progreso sea 25%
  const totalSteps = ref(4) // 4 steps total: 1->2->3->4
  const stepProgress = computed(() => (currentStep.value / totalSteps.value) * 100)

  // Event handlers
  const handleOnboardingCompleted = async (wizardData: OnboardingFormData) => {
    try {
      await completeOnboarding(wizardData)

      // Después de completar exitosamente, avanzar al step final
      handleStepChanged(4)
    } catch (err) {
      console.error('❌ Failed to complete onboarding:', err)
    }
  }

  const handleStepChanged = (step: number) => {
    currentStep.value = step

    // Update store with current step - convert number to domain step name
    const stepNames: Array<'personal-info' | 'finances-config' | 'budget-strategy' | 'completed'> =
      ['personal-info', 'finances-config', 'budget-strategy', 'completed']
    // Step 1: personal-info, Step 2: finances-config, Step 3: budget-strategy, Step 4: completed

    if (step <= stepNames.length) {
      const stepName = stepNames[step - 1]
      updateOnboardingStep(stepName!)
    }
  }

  const isLastStep = computed(() => {
    return currentStep.value >= 3 // Step 3 y 4 requieren lógica especial
  })

  const handleNext = () => {
    if (currentStep.value < 4) {
      // Permitir hasta el step 4
      const nextStep = currentStep.value + 1
      handleStepChanged(nextStep)
    }
  }

  const handlePrevious = () => {
    if (currentStep.value > 1) {
      // Puede volver hasta el step 1
      const previousStep = currentStep.value - 1
      handleStepChanged(previousStep)
    }
  }

  // Handler específico para el último paso
  const handleLastStepClick = () => {
    // Step 3: Activar completación del wizard (que emitirá @completed)
    wizardRef.value?.tryComplete()
    // El evento @completed se encargará de procesar y avanzar al step 4
  }
</script>

<template>
  <div
    class="flex h-2/3 w-[800px] max-w-[800px] flex-col items-center rounded-xl border bg-white p-8 shadow-lg"
  >
    <OnboardingWizard
      ref="wizardRef"
      :current-step="currentStep"
      :total-steps="totalSteps"
      :stages="['Información Básica', 'Configuración', 'Estrategia de Presupuesto', 'Completado']"
      :step-progress="stepProgress"
      @completed="handleOnboardingCompleted"
    />
    <div class="mt-4 flex w-full items-center justify-between">
      <Button
        variant="outline"
        icon-position="left"
        icon="arrow_back"
        :disabled="currentStep <= 1 || isLoading"
        @click="handlePrevious"
      >
        {{ currentStep <= 1 ? 'Primer Paso' : 'Anterior' }}
      </Button>

      <Button
        variant="primary"
        :disabled="isLoading"
        :loading="isLoading"
        icon-position="right"
        :icon="!isLastStep ? 'arrow_forward' : 'check'"
        @click="
          () => {
            if (currentStep === 4) {
              navigateTo('/dashboard')
            } else if (currentStep === 3) {
              handleLastStepClick()
            } else {
              handleNext()
            }
          }
        "
      >
        {{
          currentStep === 4
            ? 'Ir al Dashboard'
            : isLastStep
              ? 'Completar Configuración'
              : 'Siguiente'
        }}
      </Button>
    </div>
  </div>
</template>
