<script setup lang="ts">
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import Select from '@/components/molecules/select/Select.vue'
  import SidebarPage from '@/components/templates/SidebarPage.vue'
  import { useAnalyticsApplication } from '@/composables/application/useAnalyticsApplication'
  import { useAnalyticsCashFlowApplication } from '@/composables/application/useAnalyticsCashFlowApplication'
  import { useAnalyticsExpensesApplication } from '@/composables/application/useAnalyticsExpensesApplication'
  import { useAnalyticsNetPositionApplication } from '@/composables/application/useAnalyticsNetPositionApplication'
  import { useAnalyticsSavingsTrendApplication } from '@/composables/application/useAnalyticsSavingsTrendApplication'
  import { useExpensesPresenter } from '@/composables/presenters/useExpensesPresenter'
  import { useAnalyticsPeriod } from '@/composables/useAnalyticsPeriod'
  import { formatCompactCurrency } from '@/utils/currency'

  const AnalyticsSaludView = defineAsyncComponent(
    () => import('@/components/business/analytics/AnalyticsSaludView.vue')
  )
  const AnalyticsFlujoCajaView = defineAsyncComponent(
    () => import('@/components/business/analytics/AnalyticsFlujoCajaView.vue')
  )
  const AnalyticsGastosView = defineAsyncComponent(
    () => import('@/components/business/analytics/AnalyticsGastosView.vue')
  )
  const AnalyticsAhorroView = defineAsyncComponent(
    () => import('@/components/business/analytics/AnalyticsAhorroView.vue')
  )
  const AnalyticsNetPositionView = defineAsyncComponent(
    () => import('@/components/business/analytics/AnalyticsNetPositionView.vue')
  )

  definePageMeta({
    layout: 'dashboard',
    title: 'Analítica',
    breadcrumb: 'Analítica'
  })

  const period = useAnalyticsPeriod()
  const { selectedYear, selectedMonth, availableYears, availableMonths, periodLabel } = period
  provide('analyticsPeriod', period)

  // ── Shared data for sidebar (same useAsyncData keys → no extra API calls) ──

  const { healthScore } = useAnalyticsApplication()

  const { fetchTransactionsByPeriod, currency } = useAnalyticsCashFlowApplication()
  const { data: cashflowTxs } = useAsyncData(
    'analytics-cashflow',
    () => fetchTransactionsByPeriod(selectedYear.value, selectedMonth.value),
    { watch: [selectedYear, selectedMonth] }
  )

  const { fetchExpensesByPeriod } = useAnalyticsExpensesApplication()
  const { groupByCategory } = useExpensesPresenter()
  const { data: expensesData } = useAsyncData(
    'analytics-expenses',
    () => fetchExpensesByPeriod(selectedYear.value, selectedMonth.value),
    { watch: [selectedYear, selectedMonth] }
  )

  const { totalSaved: savingsTotalSaved, savingsByMonth } =
    useAnalyticsSavingsTrendApplication(selectedYear)

  const { netPosition, debtRatioStatus } = useAnalyticsNetPositionApplication()

  // ── Sidebar computed state ──

  const sidebarHealthScore = computed(() => healthScore.value?.totalScore ?? 0)
  const sidebarHealthLevel = computed(() => {
    const level = healthScore.value?.level ?? ''
    const labels: Record<string, string> = {
      critical: 'Crítico',
      at_risk: 'En riesgo',
      regular: 'Regular',
      healthy: 'Saludable',
      optimal: 'Óptimo'
    }
    return labels[level] ?? '—'
  })

  const sidebarNetFlow = computed(() => {
    const txs = cashflowTxs.value ?? []
    const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    return inc - exp
  })
  const sidebarHasTxs = computed(() => (cashflowTxs.value ?? []).length > 0)

  const sidebarTotalExpense = computed(() =>
    (expensesData.value ?? []).reduce((s, e) => s + Number(e.amount), 0)
  )
  const sidebarTopCategory = computed(
    () => groupByCategory(expensesData.value ?? [])[0]?.name ?? null
  )
  const sidebarHasExpenses = computed(() => (expensesData.value ?? []).length > 0)

  const sidebarMonthSaving = computed(
    () => savingsByMonth.value[selectedMonth.value - 1]?.actual ?? 0
  )
  const sidebarHasSavings = computed(() => savingsTotalSaved.value > 0)

  const sidebarHasDebts = computed(() => (netPosition.value?.totalDebts ?? 0) > 0)
  const sidebarRatioPct = computed(() =>
    ((netPosition.value?.debtToIncomeRatio ?? 0) * 100).toFixed(1)
  )

  const sidebarHealthColor = computed(() => {
    const level = healthScore.value?.level ?? ''
    if (level === 'critical') return 'danger'
    if (level === 'at_risk' || level === 'regular') return 'warning'
    if (level === 'optimal') return 'success'
    return 'primary'
  })

  const sidebarHealthNeedsAttention = computed(
    () => sidebarHealthScore.value > 0 && sidebarHealthScore.value < 60
  )

  // ── Navigation ──

  const ALL_SECTIONS = [
    { id: 'salud', label: 'Salud Financiera', icon: 'favorite' },
    { id: 'flujo', label: 'Flujo de Caja', icon: 'account_balance' },
    { id: 'gastos', label: 'Gastos', icon: 'shopping_cart' },
    { id: 'ahorro', label: 'Ahorro', icon: 'savings' },
    { id: 'posicion', label: 'Posición Neta', icon: 'balance' }
  ]

  const activeSection = ref('salud')

  const scrollTo = (id: string) => {
    if (import.meta.client) {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  onMounted(() => {
    const sectionIds = ALL_SECTIONS.map(s => s.id)
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) activeSection.value = entry.target.id
        }
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    )
    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    onUnmounted(() => observer.disconnect())
  })
</script>

<template>
  <div class="analytics-page">
    <div class="analytics-page__header">
      <div class="analytics-page__title-block">
        <Heading level="h1" size="2xl" weight="extrabold">Analítica</Heading>
        <Text size="xs" color="muted">
          Entiende en detalle a dónde y cómo evolucionan tus finanzas.
        </Text>
      </div>
      <div class="analytics-page__period">
        <Select
          v-model="selectedMonth"
          name="month"
          :options="availableMonths.map(m => ({ label: m.label, value: m.value }))"
        />
        <Select
          v-model="selectedYear"
          name="year"
          :options="availableYears.map(y => ({ label: String(y), value: y }))"
        />
      </div>
    </div>

    <!-- Mobile chips -->
    <div class="analytics-chips">
      <button
        v-for="s in ALL_SECTIONS"
        :key="s.id"
        :class="['analytics-chip', { 'analytics-chip--active': activeSection === s.id }]"
        @click="scrollTo(s.id)"
      >
        {{ s.label }}
      </button>
    </div>

    <div class="analytics-page__body">
      <!-- ── Main content ── -->
      <div class="analytics-page__main">
        <section id="salud" class="analytics-section">
          <Heading level="h2" size="xl" weight="bold">Salud Financiera</Heading>
          <div class="analytics-section__content">
            <AnalyticsSaludView />
          </div>
        </section>

        <div class="analytics-section__divider" />

        <section id="flujo" class="analytics-section">
          <Heading level="h2" size="xl" weight="bold">Flujo de Caja</Heading>
          <div class="analytics-section__content">
            <AnalyticsFlujoCajaView />
          </div>
        </section>

        <div class="analytics-section__divider" />

        <section id="gastos" class="analytics-section">
          <Heading level="h2" size="xl" weight="bold">Gastos</Heading>
          <div class="analytics-section__content">
            <AnalyticsGastosView />
          </div>
        </section>

        <div class="analytics-section__divider" />

        <section id="ahorro" class="analytics-section">
          <Heading level="h2" size="xl" weight="bold">Ahorro</Heading>
          <div class="analytics-section__content">
            <AnalyticsAhorroView />
          </div>
        </section>

        <div class="analytics-section__divider" />

        <section id="posicion" class="analytics-section">
          <Heading level="h2" size="xl" weight="bold">Posición Neta</Heading>
          <div class="analytics-section__content">
            <AnalyticsNetPositionView />
          </div>
        </section>
      </div>

      <!-- ── Sidebar ── -->
      <aside class="analytics-page__sidebar">
        <SidebarPage>
          <!-- Period badge -->
          <div class="analytics-sidebar__period">
            <span class="material-symbols-outlined analytics-sidebar__period-icon">
              calendar_today
            </span>
            <span class="analytics-sidebar__period-text">{{ periodLabel }}</span>
          </div>

          <!-- Salud Financiera -->
          <div
            :class="[
              'analytics-sidebar__section',
              { 'analytics-sidebar__section--active': activeSection === 'salud' }
            ]"
          >
            <button class="analytics-sidebar__section-head" @click="scrollTo('salud')">
              <span class="material-symbols-outlined analytics-sidebar__section-icon">
                favorite
              </span>
              <span class="analytics-sidebar__section-label">Salud Financiera</span>
              <span
                v-if="sidebarHealthNeedsAttention"
                class="analytics-sidebar__alert analytics-sidebar__alert--warning"
              />
            </button>
            <p class="analytics-sidebar__section-status">
              <span
                :class="[
                  'analytics-sidebar__score-value',
                  `analytics-sidebar__score-value--${sidebarHealthColor}`
                ]"
              >
                {{ sidebarHealthScore }}/100
              </span>
              · {{ sidebarHealthLevel }}
            </p>
            <button
              v-if="sidebarHealthNeedsAttention"
              class="analytics-sidebar__section-cta"
              @click="scrollTo('salud')"
            >
              ¿Cómo mejorar?
            </button>
          </div>

          <!-- Flujo de Caja -->
          <div
            :class="[
              'analytics-sidebar__section',
              { 'analytics-sidebar__section--active': activeSection === 'flujo' }
            ]"
          >
            <button class="analytics-sidebar__section-head" @click="scrollTo('flujo')">
              <span class="material-symbols-outlined analytics-sidebar__section-icon">
                account_balance
              </span>
              <span class="analytics-sidebar__section-label">Flujo de Caja</span>
              <span
                v-if="sidebarHasTxs && sidebarNetFlow < 0"
                class="analytics-sidebar__alert analytics-sidebar__alert--danger"
              />
            </button>
            <p v-if="sidebarHasTxs" class="analytics-sidebar__section-status">
              Neto:
              <span
                :class="
                  sidebarNetFlow >= 0 ? 'analytics-sidebar__val--ok' : 'analytics-sidebar__val--bad'
                "
              >
                {{ formatCompactCurrency(sidebarNetFlow, currency) }}
              </span>
            </p>
            <p
              v-else
              class="analytics-sidebar__section-status analytics-sidebar__section-status--empty"
            >
              Sin movimientos este mes
            </p>
            <NuxtLink
              v-if="!sidebarHasTxs"
              to="/dashboard/budget"
              class="analytics-sidebar__section-cta"
            >
              Ir al presupuesto
            </NuxtLink>
          </div>

          <!-- Gastos -->
          <div
            :class="[
              'analytics-sidebar__section',
              { 'analytics-sidebar__section--active': activeSection === 'gastos' }
            ]"
          >
            <button class="analytics-sidebar__section-head" @click="scrollTo('gastos')">
              <span class="material-symbols-outlined analytics-sidebar__section-icon">
                shopping_cart
              </span>
              <span class="analytics-sidebar__section-label">Gastos</span>
            </button>
            <p v-if="sidebarHasExpenses" class="analytics-sidebar__section-status">
              {{ formatCompactCurrency(sidebarTotalExpense, currency) }}
              <template v-if="sidebarTopCategory">· {{ sidebarTopCategory }}</template>
            </p>
            <p
              v-else
              class="analytics-sidebar__section-status analytics-sidebar__section-status--empty"
            >
              Sin gastos registrados
            </p>
            <NuxtLink
              v-if="!sidebarHasExpenses"
              to="/dashboard/budget"
              class="analytics-sidebar__section-cta"
            >
              Registrar gasto
            </NuxtLink>
          </div>

          <!-- Ahorro -->
          <div
            :class="[
              'analytics-sidebar__section',
              { 'analytics-sidebar__section--active': activeSection === 'ahorro' }
            ]"
          >
            <button class="analytics-sidebar__section-head" @click="scrollTo('ahorro')">
              <span class="material-symbols-outlined analytics-sidebar__section-icon">savings</span>
              <span class="analytics-sidebar__section-label">Ahorro</span>
            </button>
            <p v-if="sidebarHasSavings" class="analytics-sidebar__section-status">
              +{{ formatCompactCurrency(sidebarMonthSaving, currency) }} este mes
            </p>
            <p
              v-else
              class="analytics-sidebar__section-status analytics-sidebar__section-status--empty"
            >
              Sin aportes este mes
            </p>
            <NuxtLink
              v-if="!sidebarHasSavings"
              to="/dashboard/goals"
              class="analytics-sidebar__section-cta"
            >
              Ver metas
            </NuxtLink>
          </div>

          <!-- Posición Neta -->
          <div
            :class="[
              'analytics-sidebar__section',
              { 'analytics-sidebar__section--active': activeSection === 'posicion' }
            ]"
          >
            <button class="analytics-sidebar__section-head" @click="scrollTo('posicion')">
              <span class="material-symbols-outlined analytics-sidebar__section-icon">balance</span>
              <span class="analytics-sidebar__section-label">Posición Neta</span>
            </button>
            <p v-if="sidebarHasDebts" class="analytics-sidebar__section-status">
              Ratio: {{ sidebarRatioPct }}% ·
              <span
                :class="[
                  'analytics-sidebar__ratio-badge',
                  `analytics-sidebar__ratio-badge--${debtRatioStatus.color}`
                ]"
              >
                {{ debtRatioStatus.label }}
              </span>
            </p>
            <p
              v-else
              class="analytics-sidebar__section-status analytics-sidebar__section-status--ok"
            >
              ✓ Sin deudas registradas
            </p>
          </div>
        </SidebarPage>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .analytics-page {
    @apply flex flex-col gap-4 px-4 py-2;
  }

  .analytics-page__header {
    @apply flex flex-wrap items-start justify-between gap-4;
  }

  .analytics-page__title-block {
    @apply flex flex-col gap-1;
  }

  .analytics-page__period {
    @apply flex items-center gap-2;
  }

  /* Mobile chips */
  .analytics-chips {
    @apply flex gap-2 overflow-x-auto pb-1 lg:hidden;
    scrollbar-width: none;
  }

  .analytics-chips::-webkit-scrollbar {
    display: none;
  }

  .analytics-chip {
    @apply shrink-0 whitespace-nowrap rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600;
    @apply transition-colors hover:border-primary-300 hover:text-primary-700;
  }

  .analytics-chip--active {
    @apply border-primary-400 bg-primary-50 text-primary-700;
  }

  /* Body: 2-column grid on large screens */
  .analytics-page__body {
    @apply grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px];
  }

  .analytics-page__main {
    @apply flex min-w-0 flex-col gap-10;
  }

  /* Sidebar: hidden on mobile, sticky on desktop */
  .analytics-page__sidebar {
    @apply hidden lg:sticky lg:top-4 lg:block lg:self-start;
  }

  /* ── Sections ── */
  .analytics-section {
    @apply flex scroll-mt-4 flex-col gap-2;
  }

  .analytics-section__content {
    @apply mt-2;
  }

  .analytics-section__divider {
    @apply border-t border-neutral-100;
  }

  /* Period badge */
  .analytics-sidebar__period {
    @apply flex items-center gap-1.5 rounded-lg bg-primary-50 px-2.5 py-1.5;
    @apply dark:bg-primary-900;
  }

  .analytics-sidebar__period-icon {
    @apply shrink-0 text-xs leading-none text-primary-600 dark:text-primary-400;
  }

  .analytics-sidebar__period-text {
    @apply text-[11px] font-semibold text-primary-700 dark:text-primary-300;
  }

  /* Section cards */
  .analytics-sidebar__section {
    @apply flex flex-col gap-2 rounded-lg border border-neutral-100 bg-white p-3;
    @apply transition-colors dark:border-neutral-700 dark:bg-neutral-800;
  }

  .analytics-sidebar__section--active {
    @apply border-primary-200 bg-primary-50;
    @apply dark:border-primary-800 dark:bg-primary-900;
  }

  .analytics-sidebar__section-head {
    @apply flex w-full items-center gap-2 text-left;
  }

  .analytics-sidebar__section-icon {
    @apply shrink-0 text-sm leading-none text-neutral-400 transition-colors;
  }

  .analytics-sidebar__section--active .analytics-sidebar__section-icon {
    @apply text-primary-600;
  }

  .analytics-sidebar__section-label {
    @apply flex-1 text-xs font-semibold text-neutral-700 transition-colors;
    @apply dark:text-neutral-300;
  }

  .analytics-sidebar__section--active .analytics-sidebar__section-label {
    @apply text-primary-700;
  }

  .analytics-sidebar__section-status {
    @apply text-[11px] text-neutral-500;
  }

  .analytics-sidebar__section-status--empty {
    @apply italic text-neutral-400;
  }

  .analytics-sidebar__section-status--ok {
    @apply text-success-600;
  }

  .analytics-sidebar__section-cta {
    @apply text-[11px] font-medium text-primary-600 underline underline-offset-2;
    @apply hover:text-primary-700;
  }

  .analytics-sidebar__ratio-badge {
    @apply inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold;
  }

  .analytics-sidebar__ratio-badge--primary {
    @apply bg-primary-100 text-primary-700;
  }

  .analytics-sidebar__ratio-badge--warning {
    @apply bg-warning-100 text-warning-700;
  }

  .analytics-sidebar__ratio-badge--danger {
    @apply bg-danger-100 text-danger-700;
  }

  /* Score color in sidebar */
  .analytics-sidebar__score-value {
    @apply font-semibold;
  }

  .analytics-sidebar__score-value--danger {
    @apply text-danger-600;
  }

  .analytics-sidebar__score-value--warning {
    @apply text-warning-600;
  }

  .analytics-sidebar__score-value--primary {
    @apply text-primary-600;
  }

  .analytics-sidebar__score-value--success {
    @apply text-success-600;
  }

  /* Net flow color */
  .analytics-sidebar__val--ok {
    @apply font-medium text-primary-600;
  }

  .analytics-sidebar__val--bad {
    @apply font-medium text-danger-600;
  }

  /* Alert dot */
  .analytics-sidebar__alert {
    @apply ml-auto h-2 w-2 shrink-0 rounded-full;
  }

  .analytics-sidebar__alert--warning {
    @apply bg-warning-500;
  }

  .analytics-sidebar__alert--danger {
    @apply bg-danger-500;
  }
</style>
