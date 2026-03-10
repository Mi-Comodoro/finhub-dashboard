<!--
  Budget Strategy Card
  Molecule component for displaying budget allocation strategies
-->

<script setup lang="ts">
  /**
   * BudgetStrategyCard Component
   * Displays budget strategy options with visual allocation breakdown
   */

  import { Badge, Label } from '@/components/atoms'

  interface BudgetAllocation {
    needs: number // Gastos Fijos
    wants: number // Gastos Variables u Ocasionales
    savings: number // Ahorro e Inversiones
  }

  interface BudgetStrategyCardProps {
    title: string
    description: string
    allocation: BudgetAllocation
    icon?: string
    recommended?: boolean
    advanced?: boolean
    selected?: boolean
    selectable?: boolean
  }

  interface Emits {
    select: []
    'update:allocation': [allocation: BudgetAllocation]
  }

  const props = withDefaults(defineProps<BudgetStrategyCardProps>(), {
    icon: 'account_balance',
    recommended: false,
    advanced: false,
    selected: false,
    selectable: true
  })

  const emit = defineEmits<Emits>()

  // Local reactive allocation for advanced cards
  const localAllocation = reactive({ ...props.allocation })

  // Computed properties for visual representation
  const allocationPercentages = computed(() => ({
    needs: `${localAllocation.needs}%`,
    wants: `${localAllocation.wants}%`,
    savings: `${localAllocation.savings}%`
  }))

  const allocationInputIds = computed(() => {
    const base = props.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    return {
      needs: `${base}-needs`,
      wants: `${base}-wants`,
      savings: `${base}-savings`
    }
  })

  // Update allocation and emit changes
  const updateAllocation = (field: keyof BudgetAllocation, value: number) => {
    if (props.advanced && value >= 0 && value <= 100) {
      localAllocation[field] = value
      emit('update:allocation', { ...localAllocation })
    }
  }

  // Handle selection
  const handleSelect = () => {
    if (props.selectable) {
      emit('select')
    }
  }

  // Watch for props changes
  watch(
    () => props.allocation,
    newAllocation => {
      Object.assign(localAllocation, newAllocation)
    },
    { deep: true }
  )
</script>

<template>
  <div
    :class="[
      'budget-strategy-card',
      {
        'budget-strategy-card--selected': selected,
        'budget-strategy-card--selectable': selectable
      }
    ]"
    :role="selectable ? 'button' : undefined"
    :tabindex="selectable ? 0 : undefined"
    @click="handleSelect"
    @keydown.enter="handleSelect"
    @keydown.space="handleSelect"
  >
    <!-- Header -->
    <div class="budget-strategy-card__header">
      <!-- Icon -->
      <div class="budget-strategy-card__icon">
        <span class="material-symbols-outlined">
          {{ icon }}
        </span>
      </div>

      <!-- Title and Badge -->
      <div class="budget-strategy-card__title-section">
        <h3 class="budget-strategy-card__title">{{ title }}</h3>
        <Badge v-if="recommended" text="Recomendado" variant="info" size="xs" />
        <Badge v-else-if="advanced" text="Avanzado" variant="info" size="xs" />
      </div>

      <!-- Selection Indicator -->
      <div v-if="selectable" class="budget-strategy-card__selector">
        <div v-if="selected" class="selection-check">
          <span class="material-symbols-outlined">check</span>
        </div>
        <div v-else class="selection-empty"></div>
      </div>
    </div>

    <!-- Description -->
    <div class="budget-strategy-card__description">
      {{ description }}
    </div>

    <!-- Allocation Bar -->
    <div class="budget-strategy-card__allocation">
      <!-- Static Allocation Bar (for non-advanced cards OR unselected advanced cards) -->
      <div v-if="!advanced || !selected" class="allocation-bar">
        <div
          class="allocation-bar__segment allocation-bar__segment--needs"
          :style="{ width: allocationPercentages.needs }"
        >
          <span class="allocation-bar__label">{{ allocationPercentages.needs }}</span>
        </div>
        <div
          class="allocation-bar__segment allocation-bar__segment--wants"
          :style="{ width: allocationPercentages.wants }"
        >
          <span class="allocation-bar__label">{{ allocationPercentages.wants }}</span>
        </div>
        <div
          class="allocation-bar__segment allocation-bar__segment--savings"
          :style="{ width: allocationPercentages.savings }"
        >
          <span class="allocation-bar__label">{{ allocationPercentages.savings }}</span>
        </div>
      </div>

      <!-- Editable Allocation (only for selected advanced cards) -->
      <div v-else-if="advanced && selected" class="allocation-editor">
        <div class="allocation-input-group">
          <Label
            variant="default"
            size="sm"
            color="secondary"
            :html-for="allocationInputIds.needs"
            class-name="allocation-label"
          >
            <span class="allocation-label__color allocation-label__color--needs"></span>
            <span class="allocation-label__text">Gastos Fijos</span>
            <div class="allocation-input-wrapper">
              <input
                :id="allocationInputIds.needs"
                v-model.number="localAllocation.needs"
                type="number"
                min="0"
                max="100"
                class="allocation-input"
                @input="updateAllocation('needs', localAllocation.needs)"
              />
              <span class="allocation-input__suffix">%</span>
            </div>
          </Label>
        </div>

        <div class="allocation-input-group">
          <Label
            variant="default"
            size="sm"
            color="secondary"
            :html-for="allocationInputIds.wants"
            class-name="allocation-label"
          >
            <span class="allocation-label__color allocation-label__color--wants"></span>
            <span class="allocation-label__text">Gastos Variables</span>
            <div class="allocation-input-wrapper">
              <input
                :id="allocationInputIds.wants"
                v-model.number="localAllocation.wants"
                type="number"
                min="0"
                max="100"
                class="allocation-input"
                @input="updateAllocation('wants', localAllocation.wants)"
              />
              <span class="allocation-input__suffix">%</span>
            </div>
          </Label>
        </div>

        <div class="allocation-input-group">
          <Label
            variant="default"
            size="sm"
            color="secondary"
            :html-for="allocationInputIds.savings"
            class-name="allocation-label"
          >
            <span class="allocation-label__color allocation-label__color--savings"></span>
            <span class="allocation-label__text">Ahorro e Inversiones</span>
            <div class="allocation-input-wrapper">
              <input
                :id="allocationInputIds.savings"
                v-model.number="localAllocation.savings"
                type="number"
                min="0"
                max="100"
                class="allocation-input"
                @input="updateAllocation('savings', localAllocation.savings)"
              />
              <span class="allocation-input__suffix">%</span>
            </div>
          </Label>
        </div>

        <!-- Preview Bar -->
        <div class="allocation-bar allocation-bar--preview">
          <div
            class="allocation-bar__segment allocation-bar__segment--needs"
            :style="{ width: allocationPercentages.needs }"
          >
            <span class="allocation-bar__label">{{ allocationPercentages.needs }}</span>
          </div>
          <div
            class="allocation-bar__segment allocation-bar__segment--wants"
            :style="{ width: allocationPercentages.wants }"
          >
            <span class="allocation-bar__label">{{ allocationPercentages.wants }}</span>
          </div>
          <div
            class="allocation-bar__segment allocation-bar__segment--savings"
            :style="{ width: allocationPercentages.savings }"
          >
            <span class="allocation-bar__label">{{ allocationPercentages.savings }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  /* Main Card - Based on RadioButton card styles */
  .budget-strategy-card {
    @apply relative flex cursor-pointer flex-col gap-4 rounded-xl border-2 border-gray-200 bg-gray-50 p-6 transition-all duration-200 hover:border-gray-300;
  }

  .budget-strategy-card--selected {
    @apply border-primary-500 bg-primary-50;
  }

  .budget-strategy-card--selectable:hover {
    @apply border-gray-300;
  }

  .budget-strategy-card--selected:hover {
    @apply border-primary-600;
  }

  /* Header Section */
  .budget-strategy-card__header {
    @apply flex items-start justify-between gap-3;
  }

  .budget-strategy-card__icon {
    @apply flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500;
  }

  .budget-strategy-card--selected .budget-strategy-card__icon {
    @apply bg-primary-500 text-white;
  }

  .budget-strategy-card__title-section {
    @apply flex-1;
  }

  .budget-strategy-card__title {
    @apply text-lg font-semibold text-gray-900;
  }

  .budget-strategy-card--selected .budget-strategy-card__title {
    @apply text-primary-900;
  }

  .budget-strategy-card__selector {
    @apply flex h-6 w-6 items-center justify-center;
  }

  .selection-check {
    @apply flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white;
    font-size: 16px;
  }

  .selection-empty {
    @apply h-6 w-6 rounded-full border-2 border-gray-300;
  }

  .budget-strategy-card--selected .selection-empty {
    @apply border-primary-500;
  }

  /* Description */
  .budget-strategy-card__description {
    @apply text-sm leading-relaxed text-gray-600;
  }

  .budget-strategy-card--selected .budget-strategy-card__description {
    @apply text-primary-700;
  }

  /* Allocation Bar */
  .budget-strategy-card__allocation {
    @apply mt-2;
  }

  .allocation-bar {
    @apply flex h-12 w-full overflow-hidden rounded-lg;
  }

  .allocation-bar__segment {
    @apply flex items-center justify-center text-xs font-semibold text-white;
  }

  .allocation-bar__segment--needs {
    @apply bg-primary-500;
  }

  .allocation-bar__segment--wants {
    @apply bg-success-500;
  }

  .allocation-bar__segment--savings {
    @apply bg-secondary-700;
  }

  .allocation-bar__label {
    @apply font-bold;
  }

  /* Allocation Editor Styles */
  .allocation-editor {
    @apply space-y-4;
  }

  .allocation-input-group {
    @apply space-y-2;
  }

  .allocation-label {
    @apply flex items-center justify-between text-sm font-medium text-gray-700;
  }

  .allocation-label__color {
    @apply mr-2 inline-block h-3 w-3 rounded-full;
  }

  .allocation-label__color--needs {
    @apply bg-primary-500;
  }

  .allocation-label__color--wants {
    @apply bg-success-500;
  }

  .allocation-label__color--savings {
    @apply bg-secondary-700;
  }

  .allocation-label__text {
    @apply flex-1;
  }

  .allocation-input-wrapper {
    @apply relative flex items-center;
  }

  .allocation-input {
    @apply w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500;
  }

  .allocation-input__suffix {
    @apply ml-1 text-xs text-gray-500;
  }

  .allocation-validation {
    @apply mt-3 flex justify-center;
  }

  .total-percentage {
    @apply inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium;
  }

  .total-percentage--valid {
    @apply bg-green-100 text-green-800;
  }

  .total-percentage--invalid {
    @apply bg-red-100 text-red-800;
  }

  .validation-icon {
    @apply font-bold;
  }

  .allocation-bar--preview {
    @apply mt-3 opacity-90;
  }

  /* Conditional Legend for Advanced Cards */
  .budget-strategy-card__legend {
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
    @apply bg-lime-500;
  }

  .legend-item__color--savings {
    @apply bg-slate-700;
  }

  .legend-item__text {
    @apply text-xs font-medium text-gray-600;
  }

  .budget-strategy-card--selected .legend-item__text {
    @apply text-primary-700;
  }
</style>
