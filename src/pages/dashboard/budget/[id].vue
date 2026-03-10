<script setup lang="ts">
  import { computed, onMounted } from 'vue'

  import { AlertBanner, Button, Heading, Icon, MetricCard, Text } from '@/components/atoms'
  import {
    BudgetCategoryRow,
    BudgetDonutChart,
    type BudgetDonutItem,
    SectionCard
  } from '@/components/molecules'
  import { useBudget } from '@/composables/useBudget'
  import { getBudgetStatus, STATUS_LABEL } from '@/composables/useBudgetPeriod'
  import { useBudgetStore } from '@/stores/budget.store'
  import { useFinancesStore } from '@/stores/finances.store'
  import { percentOf } from '@/utils/currency'

  definePageMeta({ layout: 'dashboard' })

  const route = useRoute()
  const router = useRouter()
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()
  const { fetchBudgets } = useBudget()

  const currency = computed(() => financesStore.defaultCurrency)

  // ─── Load data if navigated directly (store empty) ────────────────────────
  onMounted(async () => {
    if (budgetStore.budgetPlans.length === 0) {
      await fetchBudgets()
    }
  })

  // ─── Current plan ─────────────────────────────────────────────────────────
  const planId = computed(() => route.params.id as string)

  const plan = computed(() => budgetStore.budgetPlans.find(p => p.id === planId.value) ?? null)

  const planStatus = computed(() =>
    plan.value ? getBudgetStatus(plan.value.year, plan.value.month) : 'closed'
  )

  // ─── Derived amounts ──────────────────────────────────────────────────────
  const needsAmount = computed(() =>
    plan.value ? percentOf(plan.value.totalIncome, plan.value.limits.needs, currency.value) : 0
  )
  const wantsAmount = computed(() =>
    plan.value ? percentOf(plan.value.totalIncome, plan.value.limits.wants, currency.value) : 0
  )
  const savingsAmount = computed(() =>
    plan.value ? percentOf(plan.value.totalIncome, plan.value.limits.savings, currency.value) : 0
  )

  // ─── Spending data — placeholder until transactions are linked ────────────
  // TODO: replace with real values from transactions store once integrated
  const spentNeeds = computed(() => 0)
  const spentWants = computed(() => 0)

  const remainingNeeds = computed(() => needsAmount.value - spentNeeds.value)
  const remainingWants = computed(() => wantsAmount.value - spentWants.value)

  const needsUsedPct = computed(() =>
    needsAmount.value > 0 ? Math.round((spentNeeds.value / needsAmount.value) * 100) : 0
  )
  const wantsUsedPct = computed(() =>
    wantsAmount.value > 0 ? Math.round((spentWants.value / wantsAmount.value) * 100) : 0
  )

  const saldoDisponible = computed(
    () => (plan.value?.totalIncome ?? 0) - spentNeeds.value - spentWants.value
  )

  // ─── Donut chart items ────────────────────────────────────────────────────────
  const donutItems = computed<BudgetDonutItem[]>(() => {
    if (!plan.value) return []
    return [
      {
        id: 'needs',
        name: 'Gastos Fijos',
        type: 'needs',
        budgeted: needsAmount.value,
        percentage: plan.value.limits.needs
      },
      {
        id: 'wants',
        name: 'Gastos Variables u Ocasionales',
        type: 'wants',
        budgeted: wantsAmount.value,
        percentage: plan.value.limits.wants
      },
      {
        id: 'savings',
        name: 'Ahorro e Inversiones',
        type: 'savings',
        budgeted: savingsAmount.value,
        percentage: plan.value.limits.savings
      }
    ]
  })

  // ─── Strategy info ──────────────────────────────────────────────────────
  const strategyInfo = computed(() => {
    if (!plan.value) return null
    const isBalanced = plan.value.strategy === 'BALANCED'
    return {
      label: isBalanced ? '50/30/20' : 'Personalizada',
      icon: isBalanced ? 'auto_awesome' : 'tune',
      title: isBalanced ? 'Regla del 50/30/20' : 'Distribución personalizada',
      description: isBalanced
        ? 'Método de presupuesto diseñado por Elizabeth Warren: la mitad del ingreso cubre necesidades esenciales, el 30% para gastos flexibles y el 20% se destina al ahorro e inversión. Ideal para construir hábitos financieros saludables.'
        : `Este presupuesto usa una distribución ajustada a tus necesidades: ${plan.value.limits.needs}% para gastos fijos, ${plan.value.limits.wants}% para gastos variables y ${plan.value.limits.savings}% para ahorro. Puedes modificar los porcentajes en cualquier momento.`
    }
  })
</script>

<template>
  <div class="mx-auto space-y-6 px-4 py-6">
    <!-- ── Loading state ───────────────────────────────────────────────────── -->
    <template v-if="budgetStore.isLoading">
      <div class="animate-pulse space-y-4">
        <div class="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div v-for="i in 4" :key="i" class="h-24 rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>
        <div class="h-72 rounded-xl bg-slate-200 dark:bg-slate-700" />
      </div>
    </template>

    <!-- ── Not found ───────────────────────────────────────────────────────── -->
    <template v-else-if="!plan">
      <div class="flex flex-col items-center gap-4 py-20 text-center">
        <Icon name="search_off" class="text-slate-400 dark:text-slate-600" size="2xl" />
        <Heading level="h3" color="muted">Presupuesto no encontrado</Heading>
        <Text size="sm" color="muted">No se encontró un presupuesto con el ID indicado.</Text>
        <Button
          variant="ghost"
          size="sm"
          icon="arrow_back"
          class="mt-2"
          @click="router.push('/dashboard/budget')"
        >
          Volver a Presupuestos
        </Button>
      </div>
    </template>

    <!-- ── Main content ────────────────────────────────────────────────────── -->
    <template v-else>
      <!-- Header -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <!-- Back link -->

          <div class="flex">
            <Button
              icon="arrow_back"
              icon-only
              variant="ghost"
              size="sm"
              @click="router.push('/dashboard/budget')"
            />
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <Heading level="h1" size="2xl" weight="extrabold">
                  {{ replaceUnderscoresWithSpaces(plan.name) }}
                </Heading>
                <!-- Status badge -->
                <Badge
                  :variant="
                    planStatus === 'active'
                      ? 'success'
                      : planStatus === 'upcoming'
                        ? 'warning'
                        : 'default'
                  "
                  size="sm"
                >
                  {{ STATUS_LABEL[planStatus] }}
                </Badge>

                <!-- Shared badge -->
                <Badge v-if="plan.isShared" variant="warning" size="xs" class="ml-2">
                  <Icon name="group" size="xs" />
                  Compartido
                </Badge>
              </div>
              <Text size="sm" color="muted" class="mt-0.5">
                Análisis mensual · Estrategia
                <Badge variant="secondary" size="xs" class="ml-1">
                  {{ strategyInfo?.label }}
                </Badge>
              </Text>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-2">
          <Button v-if="planStatus !== 'closed'" variant="ghost" size="sm" icon="edit">
            Editar
          </Button>
          <Button v-if="planStatus === 'active'" variant="primary" size="sm" icon="content_copy">
            Duplicar
          </Button>
          <Button v-if="planStatus === 'upcoming'" variant="danger" size="sm" icon="delete_outline">
            Eliminar
          </Button>
        </div>
      </div>

      <!-- ── Summary metric cards ─────────────────────────────────────────── -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <!-- Ingreso Total: fijo al crear el presupuesto -->
        <MetricCard
          title="Ingreso Total"
          variant="income"
          :value="plan.totalIncome"
          :currency-code="currency"
          icon="account_balance_wallet"
          subtitle="Base del período"
          icon-class="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
        />
        <!-- Gastos Fijos: tope restante (baja con transacciones) -->
        <MetricCard
          title="Gastos Fijos"
          :value="remainingNeeds"
          :currency-code="currency"
          icon="home"
          variant="expense"
          :percentage="needsUsedPct"
          :percentage-text="`de ${formatCurrency(needsAmount, currency)}`"
          icon-class="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
        />
        <!-- Gastos Variables: tope restante (baja con transacciones) -->
        <MetricCard
          title="Gastos Variables"
          :value="remainingWants"
          :currency-code="currency"
          icon="shopping_bag"
          variant="expense"
          :percentage="wantsUsedPct"
          :percentage-text="`de ${formatCurrency(wantsAmount, currency)}`"
          icon-class="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
        />
        <!-- Ahorro e Inversiones: monto fijo asignado -->
        <MetricCard
          title="Ahorro e Inversiones"
          :value="savingsAmount"
          :currency-code="currency"
          icon="savings"
          :subtitle="`${plan.limits.savings}% del ingreso`"
          icon-class="bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400"
        />
        <!-- Saldo Disponible: lo que queda libre después de gastos reales -->
        <MetricCard
          title="Saldo Disponible"
          :value="saldoDisponible"
          :currency-code="currency"
          icon="account_balance"
          variant="available"
          subtitle="Sin comprometer"
        />
      </div>

      <!-- ── Strategy insight ────────────────────────────────────────────── -->

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- LEFT: Distribución -->
        <SectionCard title="Distribución">
          <div class="flex w-full items-center justify-center gap-6 p-5">
            <!-- Donut (left, fixed size) -->
            <div class="shrink-0">
              <ClientOnly>
                <BudgetDonutChart
                  :items="donutItems"
                  :total="plan.totalIncome"
                  :currency="currency"
                  :show-legend="false"
                />
                <template #fallback>
                  <div
                    class="h-44 w-44 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700"
                  />
                </template>
              </ClientOnly>
            </div>

            <!-- Execution bars (right, fills remaining space) -->
            <div class="min-w-0 max-w-80 flex-1 space-y-4">
              <BudgetCategoryRow
                label="Gastos Fijos"
                :percentage="plan.limits.needs"
                :amount="needsAmount"
                :currency="currency"
                color="bg-teal-500"
              />
              <BudgetCategoryRow
                label="Gastos Variables"
                :percentage="plan.limits.wants"
                :amount="wantsAmount"
                :currency="currency"
                color="bg-indigo-500"
              />
              <BudgetCategoryRow
                label="Ahorro e Inversiones"
                :percentage="plan.limits.savings"
                :amount="savingsAmount"
                :currency="currency"
                color="bg-yellow-400"
              />
            </div>
          </div>

          <AlertBanner
            v-if="strategyInfo"
            variant="purple"
            :icon="strategyInfo.icon"
            :title="strategyInfo.title"
            class="m-5"
          >
            <Text size="sm" class="mb-3 leading-relaxed">{{ strategyInfo.description }}</Text>
          </AlertBanner>
        </SectionCard>

        <!-- RIGHT: Desglose de Ahorros -->
        <SectionCard title="Desglose de Ahorros">
          <template #action>
            <Icon name="bolt" class="text-yellow-400" size="sm" />
          </template>

          <!-- Sub-segment rows — replace with v-for when API ready -->
          <div class="flex-1 divide-y divide-slate-100 px-5 dark:divide-slate-700">
            <div class="space-y-2 py-4">
              <div class="flex items-center justify-between">
                <Text size="sm" weight="medium" class="text-teal-600 dark:text-teal-400">
                  Sub-segmento 1
                  <Text size="xs" color="muted" class="inline">(–%)</Text>
                </Text>
                <Text size="sm" weight="semibold">–</Text>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div class="h-full w-0 rounded-full bg-teal-500" />
              </div>
            </div>

            <div class="space-y-2 py-4">
              <div class="flex items-center justify-between">
                <Text size="sm" weight="medium" class="text-indigo-600 dark:text-indigo-400">
                  Sub-segmento 2
                  <Text size="xs" color="muted" class="inline">(–%)</Text>
                </Text>
                <Text size="sm" weight="semibold">–</Text>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div class="h-full w-0 rounded-full bg-indigo-500" />
              </div>
            </div>

            <div class="space-y-2 py-4">
              <div class="flex items-center justify-between">
                <Text size="sm" weight="medium" class="text-slate-500 dark:text-slate-400">
                  Sub-segmento 3
                  <Text size="xs" color="muted" class="inline">(–%)</Text>
                </Text>
                <Text size="sm" weight="semibold">–</Text>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div class="h-full w-0 rounded-full bg-slate-400" />
              </div>
            </div>
          </div>

          <template #footer>
            <div class="mx-5 mb-5 mt-2 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-700/50">
              <Text size="xs" color="muted" class="italic">
                Los sub-segmentos se configurarán cuando se definan los objetivos de ahorro.
              </Text>
            </div>
          </template>
        </SectionCard>
      </div>

      <!-- ── Transactions section (placeholder) ──────────────────────────── -->
      <SectionCard title="Transacciones">
        <template #action>
          <Badge variant="default" size="xs">Próximamente</Badge>
        </template>

        <div class="flex flex-col items-center gap-3 py-16 text-center">
          <Icon name="receipt_long" class="text-primary-300 dark:text-primary-800" size="2xl" />
          <Text size="sm" color="muted">Las transacciones de este período aparecerán aquí.</Text>
        </div>
      </SectionCard>
    </template>
  </div>
</template>
