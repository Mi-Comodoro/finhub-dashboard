<script lang="ts" setup>
  import type { BudgetAllocation, StackedProgressBarProps } from './types/stacked.types'

  const props = defineProps<StackedProgressBarProps>()
  const emit = defineEmits(['update:allocation'] as const)
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
  const totalAllocation = computed(() => {
    return localAllocation.needs + localAllocation.wants + localAllocation.savings
  })
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
      <span>
        <Text v-if="totalAllocation > 100" size="xs" variant="paragraph" color="error">
          El total no puede superar el 100%
        </Text>
      </span>
      <div>
        <div class="allocation-input-group">
          <Label
            variant="default"
            size="sm"
            color="secondary"
            :html-for="allocationInputIds.needs"
            class-name="allocation-label"
          >
            <span class="flex items-center">
              <span class="allocation-label__color allocation-label__color--needs"></span>
              <Text size="xs" variant="paragraph">Gastos Fijos</Text>
            </span>
          </Label>
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
        </div>

        <div class="allocation-input-group">
          <Label
            variant="default"
            size="sm"
            color="secondary"
            :html-for="allocationInputIds.wants"
            class-name="allocation-label"
          >
            <span class="flex items-center">
              <span class="allocation-label__color allocation-label__color--wants"></span>
              <Text size="xs" variant="paragraph">Gastos Variables</Text>
            </span>
          </Label>
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
        </div>

        <div class="allocation-input-group">
          <Label
            variant="default"
            size="sm"
            color="secondary"
            :html-for="allocationInputIds.savings"
            class-name="allocation-label"
          >
            <span class="flex items-center">
              <span class="allocation-label__color allocation-label__color--savings"></span>
              <Text size="xs" variant="paragraph">Ahorro e Inversiones</Text>
            </span>
          </Label>
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
        </div>
      </div>
    </div>
  </div>
</template>
<style scope lang="postcss">
  .allocation-bar {
    @apply mt-1 flex h-8 w-full overflow-hidden rounded-lg;
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
    @apply flex-1 bg-secondary-700;
  }
  .allocation-bar__label {
    @apply font-bold;
  }
  .allocation-editor {
    @apply space-y-4;
  }
  .allocation-input-group {
    @apply flex justify-between space-y-2;
  }
  .allocation-label {
    @apply flex items-center justify-between text-sm font-medium text-neutral-700;
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
    @apply w-16 rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500;
  }
  .allocation-input__suffix {
    @apply ml-1 text-xs text-neutral-500;
  }
  .allocation-bar--preview {
    @apply mt-3 opacity-90;
  }
</style>
