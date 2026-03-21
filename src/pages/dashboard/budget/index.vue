<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'

  import { Button, Heading, MetricCard, Text } from '@/components/atoms'
  import { Select } from '@/components/molecules'
  import { BudgetTable } from '@/components/organisms'
  import { useBudget } from '@/composables/useBudget'
  import { getBudgetStatus, monthShort } from '@/composables/useBudgetPeriod'
  import { useBudgetStore } from '@/stores/budget.store'
  import { useFinancesStore } from '@/stores/finances.store'

  useRoute()
  definePageMeta({
    layout: 'dashboard',
    title: 'Presupuesto',
    breadcrumb: 'Presupuesto'
  })

  const { fetchBudgets } = useBudget()
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()

  const router = useRouter()

  // ─── Year filter ─────────────────────────────────────────────────────────────
  const now = new Date()
  const currentYear = now.getFullYear()
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 3 + i)
  const selectedYear = ref<number>(currentYear)

  onMounted(() => fetchBudgets(selectedYear.value))

  watch(selectedYear, year => fetchBudgets(year))

  const currency = computed(() => financesStore.defaultCurrency)

  // ─── Summary metrics ─────────────────────────────────────────────────────────
  /*   const totalBudgeted = computed(() =>
    budgetStore.budgetPlans.reduce((sum, p) => sum + p, 0)
  ) */

  // % executed = 0 until transactions are loaded
  const avgExecution = computed(() => 0)

  const nextClosingDate = computed(() => {
    const active = budgetStore.budgetPlans.find(p => getBudgetStatus(p.year, p.month) === 'active')
    if (!active) return null
    const m = new Date(`${active.year}-${active.month}-01`).getMonth() + 1
    const lastDay = new Date(active.year, m, 0)
    return `${lastDay.getDate()} ${monthShort(active.month)} ${active.year}`
  })

  const budgetDetails = (id: string) => {
    router.push(`/dashboard/budget/${id}`)
  }
</script>

<template>
  <div class="space-y-4 p-4">
    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold" class="mb-1">
          Presupuestos del Año
        </Heading>
        <Text size="sm" color="muted">
          Listado detallado de periodos presupuestarios en
          {{ currency === 'COP' ? 'pesos colombianos (COP)' : currency }}
        </Text>
      </div>

      <div class="flex shrink-0 items-center gap-3">
        <!-- Year filter -->

        <Select
          name="year-filter"
          :model-value="selectedYear"
          :options="availableYears.map(y => ({ label: y.toString(), value: y }))"
          class="w-28"
          @update:model-value="selectedYear = Number($event)"
        />

        <Button variant="primary" size="sm" icon="add">Nuevo Presupuesto</Button>
      </div>
    </div>

    <!-- ── Summary cards ──────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="TOTAL PRESUPUESTADO"
        :value="1000000000"
        :currency-code="currency"
        icon="account_balance_wallet"
        variant="income"
        size="sm"
      />
      <MetricCard
        title="EJECUCIÓN PROMEDIO"
        :value="`${avgExecution}%`"
        icon="trending_up"
        variant="neutral"
        size="sm"
        :currency="false"
        icon-class="bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400"
      />
      <MetricCard
        :title="nextClosingDate ? 'PRÓXIMO CIERRE' : 'SIN PERIODO ACTIVO'"
        :value="nextClosingDate ?? '—'"
        icon="event"
        variant="neutral"
        size="sm"
        :currency="false"
        icon-class="bg-warning-50 text-warning-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      />
    </div>

    <!-- ── Loading ────────────────────────────────────────────────────────── -->
    <div v-if="budgetStore.isLoading" class="space-y-2">
      <div
        v-for="n in 4"
        :key="n"
        class="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
      />
    </div>

    <!-- ── Error ──────────────────────────────────────────────────────────── -->
    <div
      v-else-if="budgetStore.error"
      class="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20"
    >
      <Text size="sm" class="text-red-700 dark:text-red-300">{{ budgetStore.error }}</Text>
    </div>

    <!-- ── Empty ──────────────────────────────────────────────────────────── -->
    <div
      v-else-if="budgetStore.budgetPlans.length === 0"
      class="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800"
    >
      <Text color="muted">No hay presupuestos registrados para {{ selectedYear }}.</Text>
    </div>

    <!-- ── Table ──────────────────────────────────────────────────────────── -->
    <BudgetTable
      v-else
      :plans="budgetStore.budgetPlans"
      :currency="currency"
      :selected-year="selectedYear"
      :avg-execution="avgExecution"
      :next-closing-date="nextClosingDate!"
      @view="budgetDetails"
      @duplicate="(id: string) => console.log('duplicate', id)"
      @delete="(id: string) => console.log('delete', id)"
    />
  </div>
</template>
