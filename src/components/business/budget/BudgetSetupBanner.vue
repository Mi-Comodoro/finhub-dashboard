<script setup lang="ts">
  import Button from '@/components/atoms/button/Button.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'

  import type { BudgetSetupBannerProps } from './types/budget-setup-banner.types'

  withDefaults(defineProps<BudgetSetupBannerProps>(), {
    isActivating: false,
    title: 'Activa tu presupuesto',
    description:
      'El ahorro es la base del plan. Para recibir ingresos y registrar gastos primero debes completar estos pasos.'
  })

  const emit = defineEmits<{
    activate: []
    'go-to-setup': []
  }>()
</script>

<template>
  <section class="budget-setup-banner">
    <div class="budget-setup-banner__header">
      <span class="material-symbols-outlined budget-setup-banner__icon">savings</span>
      <div>
        <Heading level="h3" size="lg" weight="semibold">{{ title }}</Heading>
        <Text size="xs" color="muted">{{ description }}</Text>
      </div>
    </div>

    <ol class="budget-setup-banner__steps">
      <li
        v-for="step in steps"
        :key="step.key"
        class="budget-setup-banner__step"
        :class="{ 'budget-setup-banner__step--done': step.done }"
      >
        <span class="material-symbols-outlined budget-setup-banner__step-icon">
          {{ step.done ? 'check_circle' : 'radio_button_unchecked' }}
        </span>
        <div class="budget-setup-banner__step-text">
          <Text size="sm" weight="semibold">{{ step.label }}</Text>
          <Text size="xs" color="muted">{{ step.detail }}</Text>
        </div>
      </li>
    </ol>

    <div class="budget-setup-banner__actions">
      <Button
        v-if="canActivate"
        variant="primary"
        size="sm"
        icon="rocket_launch"
        :disabled="isActivating"
        @click="emit('activate')"
      >
        {{ isActivating ? 'Activando...' : 'Activar presupuesto' }}
      </Button>
      <Button v-else variant="primary" size="sm" icon="arrow_forward" @click="emit('go-to-setup')">
        Completar configuración
      </Button>
    </div>
  </section>
</template>

<style scoped lang="postcss">
  .budget-setup-banner {
    @apply flex flex-col gap-4 rounded-xl border border-warning-200 bg-warning-50 p-5;
    @apply dark:border-warning-700 dark:bg-neutral-800;
  }

  .budget-setup-banner__header {
    @apply flex items-start gap-3;
  }

  .budget-setup-banner__icon {
    @apply shrink-0 text-warning-600;
  }

  .budget-setup-banner__steps {
    @apply flex flex-col gap-3;
  }

  .budget-setup-banner__step {
    @apply flex items-start gap-3 text-neutral-500;
  }

  .budget-setup-banner__step--done {
    @apply text-success-700;
  }

  .budget-setup-banner__step-icon {
    @apply shrink-0;
  }

  .budget-setup-banner__step-text {
    @apply flex flex-col;
  }

  .budget-setup-banner__actions {
    @apply flex justify-end;
  }
</style>
