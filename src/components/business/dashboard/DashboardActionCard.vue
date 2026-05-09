<script setup lang="ts">
  import { computed } from 'vue'

  import { Button } from '@/components/atoms'
  import { formatCompactCurrency } from '@/utils/currency'

  import type {
    DashboardActionCardEmits,
    DashboardActionCardProps
  } from './types/dashboard-action-card.types'

  const props = withDefaults(defineProps<DashboardActionCardProps>(), {
    freeAmount: 0,
    currencyCode: 'COP'
  })

  const emit = defineEmits<DashboardActionCardEmits>()

  type CardState = 'planned' | 'active-free' | 'closed-free' | 'committed'

  const cardState = computed((): CardState => {
    if (props.budgetStatus === 'PLANNED') return 'planned'
    const free = props.freeAmount ?? 0
    if (props.budgetStatus === 'ACTIVE' && free > 0) return 'active-free'
    if (props.budgetStatus === 'CLOSED' && free > 0) return 'closed-free'
    return 'committed'
  })

  const formattedAmount = computed(() =>
    formatCompactCurrency(props.freeAmount ?? 0, props.currencyCode as 'COP' | 'USD' | 'EUR')
  )

  const stateClass = computed(() => ({
    'action-card--planned': cardState.value === 'planned',
    'action-card--active-free': cardState.value === 'active-free',
    'action-card--closed-free': cardState.value === 'closed-free',
    'action-card--committed': cardState.value === 'committed'
  }))
</script>

<template>
  <div class="action-card" :class="stateClass">
    <template v-if="cardState === 'planned'">
      <div class="action-card__label">Acción sugerida</div>
      <p class="action-card__message">Define cómo vas a usar tu ahorro este mes</p>
      <div class="action-card__actions">
        <Button size="sm" @click="emit('define-goals')">Definir Metas</Button>
      </div>
    </template>

    <template v-else-if="cardState === 'active-free'">
      <div class="action-card__label">Tienes saldo libre</div>
      <p class="action-card__message">
        <strong>{{ formattedAmount }}</strong>
        sin comprometer — ¿qué haces con ellos?
      </p>
      <div class="action-card__actions">
        <Button size="sm" variant="secondary" @click="emit('add-to-goal')">Abonar</Button>
        <Button size="sm" variant="ghost" @click="emit('plan-expenses')">Planificar</Button>
      </div>
    </template>

    <template v-else-if="cardState === 'closed-free'">
      <div class="action-card__label">Presupuesto cerrado</div>
      <p class="action-card__message">
        Quedaron
        <strong>{{ formattedAmount }}</strong>
        libres — ¿qué haces con el saldo?
      </p>
      <div class="action-card__actions">
        <Button size="sm" variant="ghost" @click="emit('carry-forward')">Pasar al siguiente</Button>
        <Button size="sm" variant="secondary" @click="emit('add-to-goal')">Abonar a meta</Button>
      </div>
    </template>

    <template v-else>
      <div class="action-card__label">Todo comprometido</div>
      <p class="action-card__message">Tu presupuesto está completamente planificado.</p>
    </template>
  </div>
</template>

<style scoped lang="postcss">
  .action-card {
    @apply flex flex-col justify-between gap-3 rounded-md border p-4;
  }

  .action-card--planned {
    @apply border-primary-200 bg-primary-50;
  }

  .action-card--active-free {
    @apply border-secondary-200 bg-secondary-50;
  }

  .action-card--closed-free {
    @apply border-warning-200 bg-warning-50;
  }

  .action-card--committed {
    @apply border-success-200 bg-success-50;
  }

  .action-card__label {
    @apply text-xs font-semibold uppercase tracking-wide text-neutral-500;
  }

  .action-card__message {
    @apply text-xs leading-snug text-neutral-700;
  }

  .action-card__actions {
    @apply flex flex-wrap items-center gap-2;
  }
</style>
