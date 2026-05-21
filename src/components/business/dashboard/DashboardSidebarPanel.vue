<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'

  import { Text } from '@/components/atoms'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import SidebarPage from '@/components/templates/SidebarPage.vue'
  import type { GoalsData } from '@/types/api'
  import { getProgressPercentage } from '@/utils/goal-formatters'

  interface HealthScore {
    totalScore?: number
    level?: string
    cashFlowScore?: number
    savingsScore?: number
    expenseScore?: number
    debtScore?: number
  }

  interface Bill {
    id?: string
    name: string
    daysUntilDue: number
    isEssential?: boolean
    type?: string
  }

  interface Props {
    healthScore?: HealthScore | null
    goals?: GoalsData[]
    bills?: Bill[]
    loading?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    healthScore: null,
    goals: () => [],
    bills: () => [],
    loading: false
  })

  const router = useRouter()

  const activeGoals = computed(() => (props.goals ?? []).filter(g => g.isActive).slice(0, 5))
  const urgentBills = computed(() => (props.bills ?? []).slice(0, 3))

  const score = computed(() => props.healthScore?.totalScore ?? 0)

  const scoreClass = computed(() => {
    if (score.value >= 70) return 'dashboard-sidebar__score--healthy'
    if (score.value >= 40) return 'dashboard-sidebar__score--regular'
    return 'dashboard-sidebar__score--critical'
  })

  const scoreLevelLabel = computed(() => {
    if (score.value >= 70) return 'Saludable'
    if (score.value >= 40) return 'Regular'
    return 'Crítico'
  })

  const pillars = computed(() => [
    { label: 'Flujo de caja', value: props.healthScore?.cashFlowScore ?? 0, max: 30, color: 'primary' },
    { label: 'Ahorro', value: props.healthScore?.savingsScore ?? 0, max: 35, color: 'warning' },
    { label: 'Gastos', value: props.healthScore?.expenseScore ?? 0, max: 30, color: 'danger' },
    { label: 'Deudas', value: props.healthScore?.debtScore ?? 0, max: 5, color: 'secondary' }
  ])

  function getPillarBarClass(color: string): string {
    const map: Record<string, string> = {
      primary: 'dashboard-sidebar__pillar-fill--primary',
      warning: 'dashboard-sidebar__pillar-fill--warning',
      danger: 'dashboard-sidebar__pillar-fill--danger',
      secondary: 'dashboard-sidebar__pillar-fill--secondary'
    }
    return map[color] ?? ''
  }

  function getGoalProgress(goal: GoalsData): number {
    return getProgressPercentage(goal.totalSaved ?? 0, goal.targetAmount ?? null)
  }

  function getGoalPctClass(pct: number): string {
    if (pct >= 80) return 'dashboard-sidebar__goal-pct--done'
    if (pct >= 40) return 'dashboard-sidebar__goal-pct--mid'
    return 'dashboard-sidebar__goal-pct--start'
  }

  function getDotClass(days: number, isEssential: boolean): string {
    if (days <= 0) return 'dashboard-sidebar__dot--overdue'
    if (days <= 3 && isEssential) return 'dashboard-sidebar__dot--critical'
    if (days <= 3 || (days <= 7 && isEssential)) return 'dashboard-sidebar__dot--soon'
    if (days <= 7) return 'dashboard-sidebar__dot--ok'
    return 'dashboard-sidebar__dot--low'
  }

  function getDaysLabel(days: number): string {
    if (days < 0) return `Vencido`
    if (days === 0) return 'Hoy'
    return `${days}d`
  }

  function getDaysClass(days: number, isEssential: boolean): string {
    if (days <= 0) return 'dashboard-sidebar__bill-days--urgent'
    if (days <= 3 && isEssential) return 'dashboard-sidebar__bill-days--urgent'
    if (days <= 7) return 'dashboard-sidebar__bill-days--soon'
    return 'dashboard-sidebar__bill-days--ok'
  }
</script>

<template>
  <SidebarPage>
    <!-- Skeleton -->
    <template v-if="loading">
      <div v-for="i in 3" :key="i" class="dashboard-sidebar__skeleton-section">
        <div class="dashboard-sidebar__skeleton-header" />
        <div class="dashboard-sidebar__skeleton-rows">
          <div v-for="j in 4" :key="j" class="dashboard-sidebar__skeleton-row" />
        </div>
      </div>
    </template>

    <template v-else>
      <!-- Sección 1: Salud financiera -->
      <div v-if="healthScore" class="dashboard-sidebar__section">
        <CardInfo
          title="Salud financiera"
          sub-title="Score del período actual"
          title-size="base"
          weight="extrabold"
          level="h3"
          color="black"
          sub-title-size="xs"
          sub-title-color="muted"
          icon="favorite"
          icon-variant="danger"
          icon-size="md"
        />

        <div class="dashboard-sidebar__score-row">
          <span class="dashboard-sidebar__score-number" :class="scoreClass">
            {{ score }}
          </span>
          <div class="dashboard-sidebar__score-meta">
            <span class="dashboard-sidebar__score-label" :class="scoreClass">{{ scoreLevelLabel }}</span>
            <Text size="xs" color="muted">de 100 pts</Text>
          </div>
        </div>

        <div class="dashboard-sidebar__pillars">
          <div v-for="pillar in pillars" :key="pillar.label" class="dashboard-sidebar__pillar">
            <div class="dashboard-sidebar__pillar-header">
              <Text size="xs" color="muted">{{ pillar.label }}</Text>
              <Text size="xs" weight="medium">{{ pillar.value }}/{{ pillar.max }}</Text>
            </div>
            <div class="dashboard-sidebar__pillar-bar">
              <div
                class="dashboard-sidebar__pillar-fill"
                :class="getPillarBarClass(pillar.color)"
                :style="{ width: `${Math.min((pillar.value / pillar.max) * 100, 100)}%` }"
              />
            </div>
          </div>
        </div>

        <button class="dashboard-sidebar__link" @click="router.push('/dashboard/analytics')">
          <span>Ver análisis completo</span>
          <span class="material-symbols-outlined dashboard-sidebar__link-icon">arrow_forward</span>
        </button>
      </div>

      <!-- Sección 2: Metas activas -->
      <div v-if="activeGoals.length > 0" class="dashboard-sidebar__section">
        <CardInfo
          title="Metas activas"
          :sub-title="`${activeGoals.length} en progreso`"
          title-size="base"
          weight="extrabold"
          level="h3"
          color="black"
          sub-title-size="xs"
          sub-title-color="muted"
          icon="savings"
          icon-variant="warning"
          icon-size="md"
        />

        <div class="dashboard-sidebar__goals">
          <div v-for="goal in activeGoals" :key="goal.id" class="dashboard-sidebar__goal-row">
            <p class="dashboard-sidebar__goal-name">{{ goal.name }}</p>
            <span
              class="dashboard-sidebar__goal-pct"
              :class="getGoalPctClass(getGoalProgress(goal))"
            >
              {{ getGoalProgress(goal) }}%
            </span>
          </div>
        </div>

        <button class="dashboard-sidebar__link" @click="router.push('/dashboard/goals')">
          <span>Ver todas las metas</span>
          <span class="material-symbols-outlined dashboard-sidebar__link-icon">arrow_forward</span>
        </button>
      </div>

      <!-- Sección 3: Vencimientos próximos -->
      <div v-if="urgentBills.length > 0" class="dashboard-sidebar__section">
        <CardInfo
          title="Vencimientos"
          sub-title="Próximos a pagar"
          title-size="base"
          weight="extrabold"
          level="h3"
          color="black"
          sub-title-size="xs"
          sub-title-color="muted"
          icon="alarm"
          icon-variant="secondary"
          icon-size="md"
        />

        <div class="dashboard-sidebar__bills">
          <div v-for="bill in urgentBills" :key="`${bill.type}-${bill.id ?? bill.name}`" class="dashboard-sidebar__bill-row">
            <span class="dashboard-sidebar__dot" :class="getDotClass(bill.daysUntilDue, bill.isEssential ?? false)" />
            <p class="dashboard-sidebar__bill-name">{{ bill.name }}</p>
            <span class="dashboard-sidebar__bill-days" :class="getDaysClass(bill.daysUntilDue, bill.isEssential ?? false)">
              {{ getDaysLabel(bill.daysUntilDue) }}
            </span>
          </div>
        </div>

        <button class="dashboard-sidebar__link" @click="router.push('/dashboard/budget')">
          <span>Ver recordatorios</span>
          <span class="material-symbols-outlined dashboard-sidebar__link-icon">arrow_forward</span>
        </button>
      </div>
    </template>
  </SidebarPage>
</template>

<style scoped lang="postcss">
  .dashboard-sidebar__section {
    @apply flex flex-col gap-3 rounded-lg border border-neutral-100 bg-white p-4;
  }

  /* Score */
  .dashboard-sidebar__score-row {
    @apply flex items-center gap-3;
  }

  .dashboard-sidebar__score-number {
    @apply text-4xl font-extrabold leading-none;
  }

  .dashboard-sidebar__score--healthy {
    @apply text-success-600;
  }

  .dashboard-sidebar__score--regular {
    @apply text-warning-600;
  }

  .dashboard-sidebar__score--critical {
    @apply text-danger-600;
  }

  .dashboard-sidebar__score-meta {
    @apply flex flex-col gap-0.5;
  }

  .dashboard-sidebar__score-label {
    @apply text-sm font-semibold;
  }

  /* Pillars */
  .dashboard-sidebar__pillars {
    @apply flex flex-col gap-2;
  }

  .dashboard-sidebar__pillar {
    @apply flex flex-col gap-1;
  }

  .dashboard-sidebar__pillar-header {
    @apply flex items-center justify-between;
  }

  .dashboard-sidebar__pillar-bar {
    @apply h-1.5 w-full overflow-hidden rounded-full bg-slate-100;
  }

  .dashboard-sidebar__pillar-fill {
    @apply h-full rounded-full transition-all duration-500;
  }

  .dashboard-sidebar__pillar-fill--primary {
    @apply bg-primary-500;
  }

  .dashboard-sidebar__pillar-fill--warning {
    @apply bg-warning-500;
  }

  .dashboard-sidebar__pillar-fill--danger {
    @apply bg-danger-500;
  }

  .dashboard-sidebar__pillar-fill--secondary {
    @apply bg-secondary-500;
  }

  /* Goals */
  .dashboard-sidebar__goals {
    @apply flex flex-col gap-2;
  }

  .dashboard-sidebar__goal-row {
    @apply flex items-center justify-between gap-2;
  }

  .dashboard-sidebar__goal-name {
    @apply min-w-0 truncate text-xs text-neutral-600;
  }

  .dashboard-sidebar__goal-pct {
    @apply shrink-0 text-xs font-bold;
  }

  .dashboard-sidebar__goal-pct--start {
    @apply text-warning-400;
  }

  .dashboard-sidebar__goal-pct--mid {
    @apply text-warning-600;
  }

  .dashboard-sidebar__goal-pct--done {
    @apply text-success-600;
  }

  /* Bills */
  .dashboard-sidebar__bills {
    @apply flex flex-col gap-2;
  }

  .dashboard-sidebar__bill-row {
    @apply flex items-center gap-2;
  }

  .dashboard-sidebar__dot {
    @apply h-2 w-2 shrink-0 rounded-full;
  }

  .dashboard-sidebar__dot--overdue {
    @apply bg-danger-600;
  }

  .dashboard-sidebar__dot--critical {
    @apply bg-danger-500;
  }

  .dashboard-sidebar__dot--soon {
    @apply bg-warning-500;
  }

  .dashboard-sidebar__dot--ok {
    @apply bg-primary-500;
  }

  .dashboard-sidebar__dot--low {
    @apply bg-slate-400;
  }

  .dashboard-sidebar__bill-name {
    @apply min-w-0 flex-1 truncate text-xs text-neutral-600;
  }

  .dashboard-sidebar__bill-days {
    @apply shrink-0 text-xs font-semibold;
  }

  .dashboard-sidebar__bill-days--urgent {
    @apply text-danger-600;
  }

  .dashboard-sidebar__bill-days--soon {
    @apply text-warning-600;
  }

  .dashboard-sidebar__bill-days--ok {
    @apply text-slate-500;
  }

  /* Link */
  .dashboard-sidebar__link {
    @apply flex items-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-800;
  }

  .dashboard-sidebar__link-icon {
    @apply text-sm;
  }

  /* Skeleton */
  .dashboard-sidebar__skeleton-section {
    @apply flex flex-col gap-3 rounded-lg border border-neutral-100 bg-white p-4;
  }

  .dashboard-sidebar__skeleton-header {
    @apply h-10 w-full animate-pulse rounded-lg bg-slate-100;
  }

  .dashboard-sidebar__skeleton-rows {
    @apply flex flex-col gap-2;
  }

  .dashboard-sidebar__skeleton-row {
    @apply h-4 w-full animate-pulse rounded-md bg-slate-100;
  }
</style>
