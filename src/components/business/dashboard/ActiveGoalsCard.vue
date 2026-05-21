<script setup lang="ts">
  import { computed } from 'vue'

  import { Button, Heading, Text } from '@/components/atoms'
  import type { GoalsData } from '@/types/api'
  import { formatCurrency } from '@/utils/currency'
  import { getProgressPercentage } from '@/utils/goal-formatters'

  interface Props {
    goals?: GoalsData[]
    currencyCode?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    goals: undefined,
    currencyCode: 'COP'
  })

  const emit = defineEmits<{
    (e: 'create-goal' | 'view-all'): void
  }>()

  const activeGoals = computed(() => (props.goals ?? []).filter(g => g.isActive).slice(0, 3))

  const totalGoals = computed(() => (props.goals ?? []).filter(g => g.isActive).length)

  function getProgress(goal: GoalsData): number {
    return getProgressPercentage(goal.totalSaved ?? 0, goal.targetAmount ?? null)
  }
</script>

<template>
  <div class="goals-card">
    <div class="goals-card__header">
      <Heading level="h3" size="sm" weight="semibold">Metas activas</Heading>
      <Button v-if="totalGoals > 3" size="sm" variant="ghost" @click="emit('view-all')">
        Ver todas ({{ totalGoals }})
      </Button>
    </div>

    <div v-if="activeGoals.length > 0" class="goals-card__list">
      <div v-for="goal in activeGoals" :key="goal.id" class="goals-card__goal">
        <div class="goals-card__goal-header">
          <span class="goals-card__goal-name">{{ goal.name }}</span>
          <span class="goals-card__goal-pct">{{ getProgress(goal) }}%</span>
        </div>
        <div class="goals-card__progress-track">
          <div class="goals-card__progress-fill" :style="{ width: `${getProgress(goal)}%` }" />
        </div>
        <p class="goals-card__goal-amounts">
          <span v-if="goal.targetAmount">
            Meta: {{ formatCurrency(goal.targetAmount, currencyCode) }}
          </span>
          <span v-else>Sin monto objetivo definido</span>
        </p>
      </div>
    </div>

    <div v-else class="goals-card__empty">
      <Text size="sm" color="muted">No tienes metas activas aún</Text>
      <Button size="sm" variant="primary" @click="emit('create-goal')">Crear primera meta</Button>
    </div>

    <div v-if="activeGoals.length > 0" class="goals-card__footer">
      <Button size="sm" variant="ghost" @click="emit('view-all')">Ver detalle de metas</Button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .goals-card {
    @apply flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4;
  }

  .goals-card__header {
    @apply flex items-center justify-between;
  }

  .goals-card__list {
    @apply flex flex-col gap-3;
  }

  .goals-card__goal {
    @apply flex flex-col gap-1.5;
  }

  .goals-card__goal-header {
    @apply flex items-center justify-between gap-2;
  }

  .goals-card__goal-name {
    @apply min-w-0 flex-1 truncate text-sm font-medium text-neutral-700;
  }

  .goals-card__goal-pct {
    @apply shrink-0 text-sm font-semibold text-primary-600;
  }

  .goals-card__progress-track {
    @apply h-1.5 w-full overflow-hidden rounded-full bg-neutral-100;
  }

  .goals-card__progress-fill {
    @apply h-full rounded-full bg-primary-500 transition-all duration-700;
  }

  .goals-card__goal-amounts {
    @apply text-xs text-slate-500;
  }

  .goals-card__empty {
    @apply flex flex-col items-center gap-3 py-4 text-center;
  }

  .goals-card__footer {
    @apply pt-1;
  }
</style>
