<!--
  Strategy Form
  Organism component for selecting budget strategy during onboarding
-->

<script setup lang="ts">
  /**
   * StrategyForm Component
   * Configures budget strategy during onboarding
   */

  type CanonicalStrategy = 'BALANCED' | 'CUSTOM'
  type StrategyValue = CanonicalStrategy | 'balanced' | 'custom'

  const normalizeStrategy = (strategy?: StrategyValue): CanonicalStrategy => {
    const normalized = (strategy || '').toUpperCase()

    if (normalized === 'CUSTOM') return 'CUSTOM'

    return 'BALANCED'
  }

  const toStrategyKey = (strategy: CanonicalStrategy): 'balanced' | 'custom' => {
    return strategy === 'CUSTOM' ? 'custom' : 'balanced'
  }

  interface StrategyFormInput {
    strategy: StrategyValue
    customAllocations: {
      needs: number
      wants: number
      savings: number
    }
  }

  interface StrategyFormData {
    strategy: CanonicalStrategy
    customAllocations: {
      needs: number
      wants: number
      savings: number
    }
  }

  interface Props {
    modelValue?: StrategyFormInput
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: () => ({
      strategy: 'BALANCED' as CanonicalStrategy,
      customAllocations: {
        needs: 50,
        wants: 30,
        savings: 20
      }
      // Default to balanced strategy
    })
  })

  const emit = defineEmits<{
    'update:modelValue': [value: StrategyFormData]
    valid: [isValid: boolean]
  }>()

  // Form model
  const formModel = ref<StrategyFormData>({
    ...props.modelValue,
    strategy: normalizeStrategy(props.modelValue?.strategy)
  })

  const customAllocations = ref({
    needs: 50,
    wants: 30,
    savings: 20
  })

  // Validation state
  const errors = ref<Record<string, string>>({})
  const isValid = ref(false)

  const totalPercentage = computed(() => {
    return (
      customAllocations.value.needs +
      customAllocations.value.wants +
      customAllocations.value.savings
    )
  })

  // Methods
  const selectStrategy = (strategy: CanonicalStrategy) => {
    formModel.value.strategy = strategy
    selectedBudgetStrategy.value = toStrategyKey(strategy)

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

  const updateCustomAllocations = () => {
    if (formModel.value.strategy === 'CUSTOM') {
      formModel.value.customAllocations = { ...customAllocations.value }
    }
    validateForm()
  }

  const validateForm = () => {
    errors.value = {}

    // Validate strategy
    if (!formModel.value.strategy) {
      errors.value.strategy = 'Debes seleccionar una estrategia de presupuesto'
    }

    // Validate custom allocations
    if (formModel.value.strategy === 'CUSTOM') {
      if (totalPercentage.value !== 100) {
        errors.value.strategy = 'Los porcentajes deben sumar exactamente 100%'
      }

      if (
        customAllocations.value.needs < 0 ||
        customAllocations.value.wants < 0 ||
        customAllocations.value.savings < 0
      ) {
        errors.value.strategy = 'Los porcentajes no pueden ser negativos'
      }
    }

    // Check if form is valid
    const hasErrors = Object.keys(errors.value).length > 0
    const hasValidStrategy = !!formModel.value.strategy

    isValid.value = !hasErrors && hasValidStrategy
    emit('valid', isValid.value)
  }

  // Watch for changes and emit
  const selectedBudgetStrategy = ref<'balanced' | 'custom'>(
    toStrategyKey(normalizeStrategy(formModel.value.strategy))
  )

  watch(
    () => props.modelValue,
    newValue => {
      if (!newValue) return

      const normalizedStrategy = normalizeStrategy(newValue.strategy)

      formModel.value = {
        ...newValue,
        strategy: normalizedStrategy
      }

      customAllocations.value = {
        ...newValue.customAllocations
      }

      selectedBudgetStrategy.value = toStrategyKey(normalizedStrategy)
    },
    { deep: true }
  )

  watch(
    formModel,
    newValue => {
      emit('update:modelValue', { ...newValue })
    },
    { deep: true }
  )

  // Emit initial default values when component mounts
  onMounted(() => {
    emit('update:modelValue', { ...formModel.value })
    validateForm()
  })

  // Initialize custom allocations if strategy is custom
  watch(
    () => formModel.value.strategy,
    newStrategy => {
      selectedBudgetStrategy.value = toStrategyKey(newStrategy)

      if (newStrategy === 'CUSTOM' && !formModel.value.customAllocations) {
        formModel.value.customAllocations = { ...customAllocations.value }
      }
    },
    { immediate: true }
  )
  // Budget strategy selection
  const handleBudgetStrategySelect = (strategy: 'balanced' | 'custom') => {
    selectedBudgetStrategy.value = strategy
    selectStrategy(normalizeStrategy(strategy))
  }

  // Handle custom allocation updates from advanced cards
  const handleAllocationUpdate = (allocation: {
    needs: number
    wants: number
    savings: number
  }) => {
    customAllocations.value = { ...allocation }
    if (formModel.value.strategy === 'CUSTOM') {
      updateCustomAllocations()
    }
  }
</script>
<template>
  <form class="strategy-form space-y-6" @submit.prevent>
    <!-- Legend Section -->
    <div class="strategy-legend">
      <h4 class="strategy-legend__title">Distribución del Presupuesto</h4>
      <div class="strategy-legend__items">
        <div class="legend-item">
          <div class="legend-item__color legend-item__color--needs"></div>
          <span class="legend-item__text">Gastos Fijos</span>
        </div>
        <div class="legend-item">
          <div class="legend-item__color legend-item__color--wants"></div>
          <span class="legend-item__text">Gastos Variables</span>
        </div>
        <div class="legend-item">
          <div class="legend-item__color legend-item__color--savings"></div>
          <span class="legend-item__text">Ahorro e Inversiones</span>
        </div>
      </div>
    </div>

    <!-- Strategy Selection -->
    <div class="space-y-6">
      <BudgetStrategyGroup direction="column" gap="md">
        <BudgetStrategyCard
          title="Equilibrada"
          description="Regla clásica 50/30/20. Equilibra tus obligaciones con tu disfrute personal y futuro."
          :allocation="{ needs: 50, wants: 30, savings: 20 }"
          icon="balance"
          :recommended="true"
          :selected="selectedBudgetStrategy === 'balanced'"
          @select="handleBudgetStrategySelect('balanced')"
        />
        <!-- Validation Error -->
        <div v-if="errors.strategy" class="error-message">
          {{ errors.strategy }}
        </div>
        <BudgetStrategyCard
          title="Personalizada"
          description="Crea tu propia estrategia de presupuesto ajustada a tus necesidades y objetivos."
          :allocation="customAllocations"
          icon="tune"
          :advanced="true"
          :selected="selectedBudgetStrategy === 'custom'"
          @select="handleBudgetStrategySelect('custom')"
          @update:allocation="handleAllocationUpdate"
        />
      </BudgetStrategyGroup>
    </div>
  </form>
</template>
<style scoped>
  /* Strategy Form Styles */
  .strategy-form {
    @apply w-full;
  }

  /* Legend Section */
  .strategy-legend {
    @apply rounded-lg border border-gray-200 bg-gray-50 p-4;
  }

  .strategy-legend__title {
    @apply mb-3 text-sm font-semibold text-gray-700;
  }

  .strategy-legend__items {
    @apply flex justify-between;
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
    @apply text-xs font-medium text-gray-600;
  }

  /* Error Message */
  .error-message {
    @apply rounded-md bg-red-50 p-3 text-sm font-medium text-red-700;
  }
</style>
