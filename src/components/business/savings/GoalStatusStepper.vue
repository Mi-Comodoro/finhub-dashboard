<script setup lang="ts">
  import type { GoalStatus } from '@/utils/goals.utils'

  const props = defineProps<{ status: GoalStatus }>()

  const MAIN_STEPS = [
    {
      key: 'SCHEDULED' as GoalStatus,
      label: 'Programada',
      description: 'Meta creada. Completa tu primer aporte para activarla.',
      icon: 'flag'
    },
    {
      key: 'IN_PROGRESS' as GoalStatus,
      label: 'Activa',
      description: 'Generando intereses diarios automáticamente.',
      icon: 'trending_up'
    },
    {
      key: 'COMPLETED' as GoalStatus,
      label: 'Completada',
      description: '¡Meta alcanzada!',
      icon: 'check_circle'
    }
  ]

  const ORDER: GoalStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']

  const isPaused = computed(() => props.status === 'PAUSED')

  function stepState(stepKey: GoalStatus): 'done' | 'active' | 'paused' | 'pending' {
    if (isPaused.value && stepKey === 'IN_PROGRESS') return 'paused'
    const stepIdx = ORDER.indexOf(stepKey)
    const activeStatus = isPaused.value ? 'IN_PROGRESS' : props.status
    const currentIdx = ORDER.indexOf(activeStatus)
    if (stepIdx < currentIdx) return 'done'
    if (stepIdx === currentIdx) return 'active'
    return 'pending'
  }

  function isLastDone(stepKey: GoalStatus): boolean {
    return stepKey !== 'COMPLETED' && stepState(stepKey) === 'done'
  }
</script>

<template>
  <div class="goal-stepper">
    <div v-if="isPaused" class="goal-stepper__paused-banner">
      <span class="material-symbols-outlined goal-stepper__paused-icon">pause_circle</span>
      <span class="goal-stepper__paused-text">
        Meta pausada. Reanúdala para seguir acumulando intereses.
      </span>
    </div>

    <div class="goal-stepper__track">
      <div
        v-for="step in MAIN_STEPS"
        :key="step.key"
        :class="['goal-stepper__step', `goal-stepper__step--${stepState(step.key)}`]"
      >
        <!-- Icono del paso -->
        <div class="goal-stepper__icon-wrapper">
          <span class="material-symbols-outlined goal-stepper__icon">
            {{
              stepState(step.key) === 'done'
                ? 'check'
                : stepState(step.key) === 'paused'
                  ? 'pause'
                  : step.icon
            }}
          </span>
        </div>

        <!-- Línea conectora -->
        <div
          v-if="step.key !== 'COMPLETED'"
          :class="[
            'goal-stepper__connector',
            isLastDone(step.key) && 'goal-stepper__connector--done'
          ]"
        />

        <!-- Texto -->
        <div class="goal-stepper__text">
          <span class="goal-stepper__label">{{ step.label }}</span>
          <span class="goal-stepper__description">{{ step.description }}</span>
          <span
            v-if="step.key === 'IN_PROGRESS' && stepState(step.key) === 'active'"
            class="goal-stepper__interest-badge"
          >
            <span class="material-symbols-outlined goal-stepper__interest-icon">bolt</span>
            Intereses activos
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .goal-stepper {
    @apply flex flex-col gap-3;
  }

  /* Banner pausada */
  .goal-stepper__paused-banner {
    @apply flex items-center gap-2 rounded-lg border border-secondary-200 bg-secondary-50 px-3 py-2;
    @apply dark:border-secondary-800 dark:bg-secondary-900/20;
  }

  .goal-stepper__paused-icon {
    @apply shrink-0 text-base text-secondary-600 dark:text-secondary-400;
  }

  .goal-stepper__paused-text {
    @apply text-xs font-medium text-secondary-700 dark:text-secondary-300;
  }

  /* Track principal */
  .goal-stepper__track {
    @apply flex items-start gap-0;
  }

  /* Paso genérico */
  .goal-stepper__step {
    @apply relative flex flex-1 flex-col items-center gap-2;
  }

  /* Icono */
  .goal-stepper__icon-wrapper {
    @apply relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors;
  }

  .goal-stepper__step--done .goal-stepper__icon-wrapper {
    @apply border-primary-500 bg-primary-500 text-white;
  }

  .goal-stepper__step--active .goal-stepper__icon-wrapper {
    @apply border-warning-500 bg-warning-50 text-warning-600;
    @apply dark:bg-warning-900/20 dark:text-warning-400;
  }

  .goal-stepper__step--paused .goal-stepper__icon-wrapper {
    @apply border-secondary-400 bg-secondary-50 text-secondary-500;
    @apply dark:bg-secondary-900/20 dark:text-secondary-400;
  }

  .goal-stepper__step--pending .goal-stepper__icon-wrapper {
    @apply border-neutral-300 bg-white text-neutral-400;
    @apply dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-500;
  }

  .goal-stepper__icon {
    @apply text-sm font-bold;
  }

  /* Línea conectora */
  .goal-stepper__connector {
    @apply absolute left-[calc(50%+1.125rem)] top-[1.0625rem] h-0.5 w-[calc(100%-2.25rem)] bg-neutral-200;
    @apply dark:bg-neutral-700;
  }

  .goal-stepper__connector--done {
    @apply bg-primary-400;
  }

  /* Texto */
  .goal-stepper__text {
    @apply flex flex-col items-center gap-0.5 text-center;
  }

  .goal-stepper__label {
    @apply text-xs font-semibold;
  }

  .goal-stepper__step--done .goal-stepper__label {
    @apply text-primary-600 dark:text-primary-400;
  }

  .goal-stepper__step--active .goal-stepper__label {
    @apply text-warning-700 dark:text-warning-400;
  }

  .goal-stepper__step--paused .goal-stepper__label {
    @apply text-secondary-600 dark:text-secondary-400;
  }

  .goal-stepper__step--pending .goal-stepper__label {
    @apply text-neutral-400 dark:text-neutral-500;
  }

  .goal-stepper__description {
    @apply hidden text-[10px] leading-snug text-neutral-500 dark:text-neutral-400 sm:block;
  }

  .goal-stepper__step--pending .goal-stepper__description {
    @apply text-neutral-400 dark:text-neutral-600;
  }

  /* Badge intereses activos */
  .goal-stepper__interest-badge {
    @apply mt-0.5 flex items-center gap-0.5 rounded-full bg-warning-100 px-1.5 py-0.5 text-[10px] font-semibold text-warning-700;
    @apply dark:bg-warning-900/30 dark:text-warning-400;
  }

  .goal-stepper__interest-icon {
    @apply text-xs;
  }
</style>
