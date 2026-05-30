<script setup lang="ts">
  import { computed } from 'vue'

  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import type { GoalsData } from '@/types/api'
  import { getProgressPercentage } from '@/utils/goal-formatters'

  const MAX_VISIBLE = 8

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

  const allActive = computed(() => (props.goals ?? []).filter(g => g.isActive))
  const visibleGoals = computed(() => allActive.value.slice(0, MAX_VISIBLE))
  const totalGoals = computed(() => allActive.value.length)
  const hasMore = computed(() => totalGoals.value > MAX_VISIBLE)

  function getProgress(goal: GoalsData): number {
    return getProgressPercentage(goal.totalSaved ?? 0, goal.targetAmount ?? null)
  }

  function getProgressColor(pct: number): string {
    if (pct >= 80) return 'goals-card__goal-pct--done'
    if (pct >= 40) return 'goals-card__goal-pct--mid'
    return 'goals-card__goal-pct--start'
  }
</script>

<template>
  <div v-if="totalGoals > 0" class="goals-card">
    <div class="goals-card__header">
      <CardInfo
        :sub-title="`${totalGoals} meta${totalGoals !== 1 ? 's' : ''} en progreso`"
        title="Metas activas"
        icon="savings"
        icon-variant="warning"
        icon-size="md"
        title-size="sm"
        weight="semibold"
        level="h3"
        sub-title-size="xs"
        sub-title-color="muted"
      />
    </div>

    <div class="goals-card__grid">
      <div v-for="goal in visibleGoals" :key="goal.id" class="goals-card__goal-card">
        <span class="goals-card__goal-pct" :class="getProgressColor(getProgress(goal))">
          {{ getProgress(goal) }}%
        </span>
        <p class="goals-card__goal-name">{{ goal.name }}</p>
      </div>

      <button class="goals-card__view-all" @click="emit('view-all')">
        <span class="material-symbols-outlined goals-card__view-all-icon">arrow_forward</span>
        <span class="goals-card__view-all-label">
          {{ hasMore ? `Ver todas (${totalGoals})` : 'Ver detalle' }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .goals-card {
    @apply flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .goals-card__header {
    @apply flex items-center justify-between;
  }

  .goals-card__grid {
    @apply grid gap-1.5;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }

  .goals-card__goal-card {
    @apply flex flex-col gap-0.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2;
    @apply dark:border-neutral-700 dark:bg-neutral-700/50;
  }

  .goals-card__goal-pct {
    @apply text-base font-extrabold leading-tight;
  }

  .goals-card__goal-pct--start {
    @apply text-warning-400;
  }

  .goals-card__goal-pct--mid {
    @apply text-warning-600;
  }

  .goals-card__goal-pct--done {
    @apply text-success-600;
  }

  .goals-card__goal-name {
    @apply truncate text-xs text-slate-400;
  }

  .goals-card__view-all {
    @apply flex flex-col gap-0.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 text-left transition-colors hover:border-primary-200 hover:bg-primary-50;
    @apply dark:border-neutral-700 dark:bg-neutral-700/50 dark:hover:border-primary-700 dark:hover:bg-primary-900/20;
  }

  .goals-card__view-all-icon {
    @apply text-base font-extrabold leading-tight text-slate-400 transition-colors group-hover:text-primary-500;
  }

  .goals-card__view-all-label {
    @apply truncate text-xs text-slate-400;
  }
</style>
