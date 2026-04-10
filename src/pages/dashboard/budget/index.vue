<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'

  import { Badge, Button, Heading, MetricCard, Text } from '@/components/atoms'
  import { ProgressBar, Select } from '@/components/molecules'
  import { type Column, DataTable } from '@/components/organisms'
  import { getBudgetStatus, monthShort } from '@/composables/useBudgetPeriod'
  import { useAuthStore } from '@/stores/auth.store'
  import { useBudgetStore } from '@/stores/budget.store'
  import { useFinancesStore } from '@/stores/finances.store'
  import { useModalStore } from '@/stores/modal.store'
  import { usePlannedIncomeStore } from '@/stores/planned-income.store'
  import type { PlannedIncomeSummary } from '~/types/domain'

  import type { CurrentBudgetPlan } from '../../../types/domain/budget.domain'

  useRoute()
  definePageMeta({
    layout: 'dashboard',
    title: 'Presupuesto',
    breadcrumb: 'Presupuesto'
  })

  const authStore = useAuthStore()
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()
  const modalStore = useModalStore()
  const plannedIncomeStore = usePlannedIncomeStore()
  const router = useRouter()

  // ─── Year filter ─────────────────────────────────────────────────────────────
  const now = new Date()
  const currentYear = now.getFullYear()
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 3 + i)
  const selectedYear = ref<number>(currentYear)
  const allPlannedIncomes = ref<PlannedIncomeSummary[]>([])

  const handleActions = () => {
    if (budgetStore.error?.status === 401) {
      authStore.clearAuth()
      return navigateTo('/', { replace: true })
    } else {
      modalStore.hideModal()
    }
  }
  onMounted(async () => {
    await budgetStore.fetchBudgets(selectedYear.value)
    if (budgetStore.error) {
      modalStore.showModal('error', {
        title: budgetStore.error.title,
        message: budgetStore.error.message,
        actionLabel: 'Aceptar',
        onAction: handleActions
      })
    }
    const { result } = await plannedIncomeStore.fetchPlannedIncome()
    allPlannedIncomes.value = result!
  })
  defineEmits(['view', 'duplicate', 'delete'] as const)
  watch(selectedYear, year => budgetStore.fetchBudgets(year))

  const currency = computed(() => financesStore.defaultCurrency)

  // % executed = 0 until transactions are loaded
  const avgExecution = computed(() => 0)

  const getNextClosing = (budget: CurrentBudgetPlan) => {
    const active = getBudgetStatus(budget.year, budget.month) === 'active'
    if (!active) return null
    const m = new Date(`${budget.year}-${budget.month}-01`).getMonth() + 1
    const lastDay = new Date(budget.year, m, 0)
    return `${lastDay.getDate()} ${monthShort(budget.month)} ${budget.year}`
  }
  const currentNextClosingDate = computed(() => {
    const active = budgetStore.budgetPlans.find(p => getBudgetStatus(p.year, p.month) === 'active')
    if (!active) return null
    const m = new Date(`${active.year}-${active.month}-01`).getMonth() + 1
    const lastDay = new Date(active.year, m, 0)
    return `${lastDay.getDate()} ${monthShort(active.month)} ${active.year}`
  })
  type MetricVariant = 'income' | 'expense' | 'available' | 'neutral' | 'undefined'
  type MetricSize = 'sm' | 'md' | 'lg'
  const metricData = [
    {
      title: 'TOTAL PRESUPUESTADO',
      value: '1000000000',
      icon: 'account_balance_wallet',
      variant: 'income' as MetricVariant,
      size: 'sm' as MetricSize
    },
    {
      title: 'EJECUCIÓN PROMEDIO',
      value: `${avgExecution.value}%`,
      icon: 'trending_up',
      variant: 'neutral' as MetricVariant,
      size: 'sm' as MetricSize,
      currency: false,
      iconClass:
        'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400'
    },
    {
      title: currentNextClosingDate.value ? 'PRÓXIMO CIERRE' : 'SIN PERIODO ACTIVO',
      value: currentNextClosingDate.value ?? '—',
      icon: 'event',
      variant: 'neutral' as MetricVariant,
      size: 'sm' as MetricSize,
      currency: false,
      iconClass: 'bg-warning-50 text-warning-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
  ]
  const budgetDetails = (id: string) => {
    router.push(`/dashboard/budget/${id}`)
  }

  const columns: Column[] = [
    { key: 'period', label: 'Periodo', bold: true },
    { key: 'status', label: 'Estado', type: 'badge' },
    { key: 'nextClosingDate', label: 'Proximo Cierre', type: 'date' },
    { key: 'avgExecution', label: 'Ejecucion' },
    { key: 'expectedIncome', label: 'Monto esperado', type: 'currency' }
  ]

  const budgetPlan = ref<
    {
      id: string
      period: string
      status: string
      nextClosingDate: string | null
      avgExecution: number
      expectedIncome: number
    }[]
  >([])

  const result = computed(() => {
    // 1. Indexamos presupuestos para búsqueda rápida O(1)
    const budgetMap = new Map(budgetStore.budgetPlans.map(b => [String(b.id), b]))

    // 2. Set para rastrear IDs ya procesados y evitar duplicados
    const seenIds = new Set<string>()

    const avgValue = avgExecution.value
    const incomes = allPlannedIncomes.value || []
    const expectedValue = plannedIncomeStore.getExpectedAmount(incomes)

    return incomes.flatMap(planned => {
      const bId = String(planned.budgetId)
      const budget = budgetMap.get(bId)

      // Filtramos si: no existe el presupuesto O ya lo procesamos
      if (!budget || seenIds.has(bId)) return []

      // Marcamos como "visto"
      seenIds.add(bId)

      return [
        {
          id: budget.id,
          period: `${budget.month}/${budget.year}`,
          status: budget.status,
          nextClosingDate: getNextClosing(budget),
          avgExecution: avgValue,
          expectedIncome: expectedValue
        }
      ]
    })
  })
  const plans = computed(() => budgetPlan.value)

  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalPages = computed(() => Math.ceil(plans.value.length / pageSize.value))
  const showPagination = computed(() => totalPages.value > 1)

  const countLabel = computed(() => {
    const total = result.value.length
    const unit = `periodo${total !== 1 ? 's' : ''}`
    if (!showPagination.value) return `${total} ${unit}`
    const from = (currentPage.value - 1) * pageSize.value + 1

    const to = Math.min(currentPage.value * pageSize.value, total)
    return `${from}–${to} de ${total} ${unit}`
  })
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
        v-for="(data, index) in metricData"
        :key="index"
        :title="data.title"
        :value="data.value"
        :icon="data.icon"
        :variant="data.variant"
        :size="data.size"
        :currency="data.currency"
        :icon-class="data.iconClass"
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
      <Text size="sm" class="text-red-700 dark:text-red-300">{{ budgetStore.error.message }}</Text>
    </div>

    <!-- ── Empty ──────────────────────────────────────────────────────────── -->
    <div
      v-else-if="budgetStore.budgetPlans.length === 0"
      class="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800"
    >
      <Text color="muted">No hay presupuestos registrados para {{ selectedYear }}.</Text>
    </div>

    <!-- ── Table ──────────────────────────────────────────────────────────── -->

    <DataTable :columns="columns" :data="result!">
      <template #cell-status="{ value }">
        <Badge size="xs">{{ value }}</Badge>
      </template>
      <template #cell-avgExecution="{ value }">
        <ProgressBar :progress="value" />
      </template>
      <template #actions="{ row }">
        <div class="flex w-full justify-end gap-4">
          <Button
            variant="primary"
            icon="visibility"
            icon-only
            @click="budgetDetails(row.id as string)"
          >
            Ver
          </Button>
          <Button
            variant="secondary"
            icon="content_copy"
            icon-only
            @click="$emit('duplicate', row.id)"
          >
            Duplicar
          </Button>
          <Button variant="danger" icon="delete" icon-only @click="$emit('delete', row.id)">
            Eliminar
          </Button>
        </div>
      </template>
      <template #empty>No hay datos</template>
      <template #footer>
        <div
          v-if="showPagination"
          class="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 dark:border-slate-700"
        >
          <Text size="xs" color="muted">Mostrando {{ countLabel }}</Text>
          <div class="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </template>
    </DataTable>
  </div>
</template>
