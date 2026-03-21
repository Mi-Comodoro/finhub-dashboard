<!--
  Strategy Form
  Organism component for selecting budget strategy during onboarding
-->

<script setup lang="ts">
  import { ON_BOARDING_CONFIG } from '~/common/constants'
  import { AlertBanner } from '~/components/atoms'

  import type {
    BudgetStrategyFormProps,
    CanonicalStrategy,
    StrategyFormData
  } from './types/budget-strategy-form.types'

  const props = withDefaults(defineProps<BudgetStrategyFormProps>(), {
    modelValue: () => ({
      strategy: null,
      usage: null,
      customAllocations: {
        needs: 50,
        wants: 30,
        savings: 20
      }
    })
  })

  const emit = defineEmits(['update:modelValue', 'valid'])

  /*
---------------------------------------
STATE
---------------------------------------
*/

  const formModel = ref<StrategyFormData>({
    strategy: props.modelValue?.strategy,
    usage: props.modelValue?.usage ?? null,
    customAllocations: {
      needs: 50,
      wants: 30,
      savings: 20
    }
  })

  const customAllocations = ref({
    needs: 50,
    wants: 30,
    savings: 20
  })

  const selectedBudgetStrategy = ref<'BALANCED' | 'CUSTOM' | null>(formModel.value.strategy)

  const errors = ref<Record<string, string>>({})
  const isValid = ref(false)

  /*
---------------------------------------
COMPUTED
---------------------------------------
*/

  /*
---------------------------------------
VALIDATION
---------------------------------------
*/

  const totalPercentage = ref(0)
  const validateTotalPercentage = (total: number) => {
    totalPercentage.value = total
  }

  const validateForm = () => {
    errors.value = {}

    if (!formModel.value.strategy) {
      errors.value.strategy = 'Debes seleccionar una estrategia de presupuesto'
    }

    const hasErrors = Object.keys(errors.value).length > 0
    const hasValidStrategy = !!formModel.value.strategy
    const total = totalPercentage.value
    isValid.value = !hasErrors && hasValidStrategy && total <= 100

    emit('valid', isValid.value)
  }

  /*
---------------------------------------
STRATEGY ACTIONS
---------------------------------------
*/

  const selectStrategy = (strategy: CanonicalStrategy) => {
    formModel.value.strategy = strategy
    selectedBudgetStrategy.value = strategy

    if (strategy === 'CUSTOM') {
      formModel.value.customAllocations = { ...customAllocations.value }
    } else {
      formModel.value.customAllocations = {
        needs: 50,
        wants: 30,
        savings: 20
      }
    }

    validateForm()
  }

  const handleBudgetStrategySelect = (strategy: 'BALANCED' | 'CUSTOM') => {
    const canonical: CanonicalStrategy = strategy === 'CUSTOM' ? 'CUSTOM' : 'BALANCED'
    selectStrategy(canonical)
  }

  const handleAllocationUpdate = (allocation: {
    needs: number
    wants: number
    savings: number
  }) => {
    customAllocations.value = { ...allocation }

    if (formModel.value.strategy === 'CUSTOM') {
      formModel.value.customAllocations = { ...allocation }
    }

    validateForm()
  }

  const handleChangeStrategy = () => {
    const next = formModel.value.strategy === 'BALANCED' ? 'CUSTOM' : 'BALANCED'
    selectStrategy(next)
  }

  /*
---------------------------------------
WATCHERS
---------------------------------------
*/

  watch(
    formModel,
    newValue => {
      emit('update:modelValue', {
        strategy: newValue.strategy,
        usage: newValue.usage,
        customAllocations: { ...newValue.customAllocations }
      })
    },
    { deep: true }
  )

  watch(
    () => props.modelValue,
    newValue => {
      if (!newValue) return

      formModel.value.strategy = newValue.strategy
      formModel.value.usage = newValue.usage ?? null
    }
  )

  /*
---------------------------------------
MOUNT
---------------------------------------
*/

  onMounted(() => {
    validateForm()
  })

  /*
---------------------------------------
OPTIONS
---------------------------------------
*/

  const OPTIONS = [
    {
      label: 'Personal',
      value: 'personal',
      title: 'Personal',
      description: 'Solo para mí',
      icon: 'person'
    },
    {
      label: 'Compartido',
      value: 'shared',
      title: 'Compartido',
      description: 'Pareja o familia',
      icon: 'group'
    }
  ]
</script>
<template>
  <form class="strategy-form space-y-6" @submit.prevent>
    <div class="w-full flex-col items-center px-4 py-2">
      <AlertBanner :title="ON_BOARDING_CONFIG.budgetStrategy.banner" variant="info" />
      <Label variant="section" size="sm" class-name="form-field__label ">
        ¿Cómo quieres manejar tu presupuesto?
      </Label>

      <RadioButton
        v-model="formModel.usage"
        name="budgetType"
        variant="card"
        class="flex-1 items-center justify-center"
        direction="row"
        :options="OPTIONS"
      />
    </div>

    <div class="strategy-form__selection">
      <BudgetStrategyGroup direction="column" gap="md" class="">
        <BudgetStrategyCard
          v-if="!selectedBudgetStrategy || selectedBudgetStrategy === 'BALANCED'"
          title="Equilibrada"
          description="Regla clásica 50/30/20. Equilibra tus obligaciones con tu disfrute personal y futuro."
          :allocation="{ needs: 50, wants: 30, savings: 20 }"
          icon="balance"
          :recommended="true"
          :selected="selectedBudgetStrategy === 'BALANCED'"
          @select="handleBudgetStrategySelect('BALANCED')"
        />

        <BudgetStrategyCard
          v-if="!selectedBudgetStrategy || selectedBudgetStrategy === 'CUSTOM'"
          title="Personalizada"
          description="Crea tu propia estrategia de presupuesto ajustada a tus necesidades y objetivos."
          :allocation="customAllocations"
          icon="tune"
          :advanced="true"
          :selected="selectedBudgetStrategy === 'CUSTOM'"
          @select="handleBudgetStrategySelect('CUSTOM')"
          @update:allocation="handleAllocationUpdate"
          @total="validateTotalPercentage"
        />
      </BudgetStrategyGroup>
    </div>
    <CardSummary
      v-if="selectedBudgetStrategy"
      title="Estrategia Seleccionada"
      :sub-title="selectedBudgetStrategy === 'BALANCED' ? 'Equilibrada' : 'Personalizada'"
      action="Cambiar"
      @action="handleChangeStrategy"
    />
  </form>
</template>

<style scoped lang="postcss">
  .strategy-form {
    @apply mx-auto h-96 min-h-96 w-full max-w-2xl space-x-2 space-y-6 overflow-y-auto;
  }
  .strategy-form__legend {
    @apply rounded-lg border border-neutral-200 bg-neutral-50 p-4;
  }
  .strategy-form__title {
    @apply mb-3 text-sm font-semibold text-neutral-700;
  }
  .strategy-form__items {
    @apply flex justify-between;
  }
  .strategy-form__selection {
    @apply box-content space-y-6;
  }
  .legend-item {
    @apply flex items-center gap-2;
  }
  .legend-item__color {
    @apply h-3 w-3 rounded-full;
  }
  .legend-item__color--needs {
    @apply bg-primary-500;
  }
  .legend-item__color--wants {
    @apply bg-success-500;
  }
  .legend-item__color--savings {
    @apply bg-secondary-700;
  }
  .legend-item__text {
    @apply text-xs font-medium text-neutral-600;
  }
  .error-message {
    @apply rounded-md bg-red-50 p-3 text-sm font-medium text-red-700;
  }

  .form-field__label {
    @apply px-2;
  }
</style>
