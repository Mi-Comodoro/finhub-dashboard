<script setup lang="ts">
  import { Heading, Text } from '@/components/atoms'
  import { OnboardingStepIntro, ProgressBar } from '@/components/molecules'
  import {
    BasicInformationForm,
    BudgetStrategyForm,
    FinancialGoalsForm
  } from '@/components/organisms'
  import type { OnboardingFormData } from '~/types/ui'

  // State
  const props = defineProps<{
    currentStep: number
    totalSteps: number
    stepProgress: number
    stages: string[]
  }>()
  const emit = defineEmits<{
    completed: [data: OnboardingFormData]
  }>()
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

  const onboardingFinancialGoalsData = (data: Pick<OnboardingFormData, 'finances'>['finances']) => {
    wizardData.finances = data
  }

  const budgetStrategyData = (data: OnboardingFormData['budget']) => {
    wizardData.budget = data

    // Ya no completar automáticamente - solo actualizar los datos
    // La completación ahora se maneja manualmente desde el botón
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

  // Método que puede ser llamado externamente para intentar completar el wizard
  const tryComplete = () => {
    // La completación se activa en el step 3 (cuando se tienen todos los datos)
    if (props.currentStep === 3 && isDataComplete()) {
      emit('completed', { ...wizardData })
    }
  }

  // Exponer método para uso externo
  defineExpose({
    tryComplete
  })
</script>
<template>
  <div class="w-full">
    <ProgressBar
      :current-step="currentStep"
      :total-steps="totalSteps"
      :stages="stages"
      :progress="stepProgress"
      variant="primary"
      size="lg"
    />

    <!-- Step 1: Información Básica -->
    <div v-if="currentStep === 1" class="w-full space-y-6">
      <OnboardingStepIntro
        icon="person"
        title="Información Personal"
        description="Confirma tus datos personales para crear tu cuenta segura en FinHub."
      />

      <BasicInformationForm @update:model-value="onboardingBasicData" />
    </div>

    <!-- Step 2: Configuración Financiera -->
    <div v-if="currentStep === 2" class="w-full space-y-6">
      <div class="mt-8">
        <Heading level="h1" size="3xl" weight="extrabold">Configura tu Perfil Financiero</Heading>
        <Text size="sm" color="muted" class="mt-1 max-w-lg">
          Personaliza tu experiencia para tener mejores resultados
        </Text>
      </div>

      <FinancialGoalsForm @update:model-value="onboardingFinancialGoalsData" />
    </div>

    <!-- Step 3: Estrategia de Presupuesto -->
    <div v-if="currentStep === 3" class="w-full space-y-6">
      <OnboardingStepIntro
        icon="account_balance_wallet"
        title="Estrategia de Presupuesto"
        description="Elige la estrategia que mejor se adapte a tu estilo de vida y objetivos financieros."
      />

      <BudgetStrategyForm @update:model-value="budgetStrategyData" />
    </div>

    <!-- Step 4: Completado -->
    <div v-if="currentStep === 4" class="w-full space-y-6">
      <OnboardingStepIntro
        icon="check_circle"
        title="¡Configuración Completada!"
        description="Excelente. Tu perfil financiero está listo. Ahora puedes comenzar a gestionar tu presupuesto y alcanzar tus objetivos financieros."
        :highlighted-title="true"
      />
    </div>
  </div>
</template>
