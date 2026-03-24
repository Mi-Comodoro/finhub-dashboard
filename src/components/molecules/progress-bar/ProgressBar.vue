<script setup lang="ts">
  /**
   * ProgressBar Component
   * Molecule-level component for displaying progress with optional stages
   */

  interface Props {
    title?: string
    label?: string
    progress?: number // 0-100
    value?: number
    max?: number
    percentage?: number
    currentStep?: number | null // Current step number (1, 2, 3...)
    totalSteps?: number | null // Total number of steps
    stages?: string[] // Array of stage names
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'needs' | 'wants' | 'savings'
    size?: 'sm' | 'md' | 'lg' | 'default'
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    label: '',
    progress: 0,
    value: 0,
    max: 100,
    percentage: undefined,
    currentStep: null,
    totalSteps: null,
    stages: () => [],
    variant: 'primary',
    size: 'md'
  })

  const normalizedSize = computed(() => (props.size === 'default' ? 'md' : props.size))

  const normalizedVariant = computed(() => {
    if (props.variant === 'needs') return 'primary'
    if (props.variant === 'wants') return 'warning'
    if (props.variant === 'savings') return 'success'
    return props.variant
  })

  const displayTitle = computed(() => props.title || props.label || '')

  const normalizedProgress = computed(() => {
    if (typeof props.progress === 'number' && !Number.isNaN(props.progress)) {
      return Math.max(0, Math.min(props.progress, 100))
    }

    if (typeof props.percentage === 'number' && !Number.isNaN(props.percentage)) {
      return Math.max(0, Math.min(props.percentage, 100))
    }

    if (typeof props.value === 'number' && typeof props.max === 'number' && props.max > 0) {
      return Math.max(0, Math.min((props.value / props.max) * 100, 100))
    }

    return 0
  })

  // Computed properties
  const sizeClasses = computed(() => {
    const sizeMap = {
      sm: 'progress-bar--sm',
      md: 'progress-bar--md',
      lg: 'progress-bar--lg'
    }

    return sizeMap[normalizedSize.value]
  })

  const variantClasses = computed(() => {
    const variantMap = {
      primary: 'progress-bar--primary',
      success: 'progress-bar--success',
      warning: 'progress-bar--warning',
      danger: 'progress-bar--danger'
    }

    return variantMap[normalizedVariant.value]
  })

  const currentStageIndex = computed(() => {
    if (!props.stages) return 0
    // Return the current step index (0-based)
    return Math.max(0, Math.min((props.currentStep || 1) - 1, props.stages.length - 1))
  })

  const currentStepName = computed(() => {
    if (!props.stages) return ''
    return props.stages[currentStageIndex.value] || ''
  })
</script>
<template>
  <div class="progress-bar-container" :class="sizeClasses">
    <!-- Header Row: Step Counter and Percentage -->
    <div class="progress-header">
      <div class="flex items-center gap-2">
        <div v-if="currentStep && totalSteps" class="step-counter">
          paso {{ currentStep }} de {{ totalSteps }}
        </div>
        <Heading v-else color="muted" class="font-semibold uppercase">{{ displayTitle }}</Heading>
        <p class="step-name">{{ currentStepName }}</p>
      </div>

      <div class="percentage-label">{{ Math.round(normalizedProgress) }}% Completado</div>
    </div>

    <!-- Progress Bar Track -->
    <div class="progress-bar-track">
      <div
        class="progress-bar-fill"
        :class="variantClasses"
        :style="{ width: `${normalizedProgress}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
  .progress-bar-container {
    @apply relative my-2 w-full;
  }

  /* Header Row */
  .progress-header {
    @apply mb-3 flex items-center justify-between;
  }

  .step-counter {
    @apply text-sm font-semibold uppercase text-neutral-500;
  }

  .percentage-label {
    @apply text-sm font-medium text-neutral-500;
  }

  /* Progress Bar Track */
  .progress-bar-track {
    @apply relative overflow-hidden rounded-full bg-neutral-200;
  }

  /* Main Fill */
  .progress-bar-fill {
    @apply h-full transition-all duration-500 ease-out;
    border-radius: inherit;
  }

  /* Variants */
  .progress-bar--primary {
    @apply bg-primary-500;
  }

  .progress-bar--success {
    @apply bg-green-500;
  }

  .progress-bar--warning {
    @apply bg-yellow-500;
  }

  .progress-bar--danger {
    @apply bg-red-500;
  }

  /* Sizes */
  .progress-bar--sm .progress-bar-track {
    @apply h-2;
  }

  .progress-bar--md .progress-bar-track {
    @apply h-2;
  }

  .progress-bar--lg .progress-bar-track {
    @apply h-2.5;
  }

  /* Step Name */
  .step-name {
    @apply text-sm font-semibold uppercase text-neutral-500;
  }

  /*   .progress-bar--sm .step-name {
    @apply text-sm;
  } */

  /*   .progress-bar--lg .step-name {
    @apply text-lg;
  } */

  /* Responsive */
  @media (max-width: 640px) {
    .step-counter,
    .percentage-label {
      @apply text-xs;
    }

    .step-name {
      @apply text-sm;
    }
  }
</style>
