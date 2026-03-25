<script setup lang="ts">
  // Referencia al wizard para poder llamar tryComplete
  import { computed, onMounted, ref } from 'vue'

  import { Button, Card, Heading, Text } from '@/components/atoms'
  import { BudgetDonutChart } from '@/components/molecules'
  import { OnboardingWizard } from '@/components/organisms'
  import { useModalNotification } from '@/components/organisms/modal-notification/useModalNotification'
  import { ModalWizard } from '@/components/organisms/modal-wizard'
  import { useAuthStore } from '@/stores/auth.store'
  import { useBudgetStore } from '@/stores/budget.store'
  import { useFinancesStore } from '@/stores/finances.store'
  import { usePlannedIncomeStore } from '@/stores/planned-income.store'
  import { formatCurrency, percentOf, subtractAmounts } from '@/utils/currency'
  import { useOnBoarding } from '~/composables/useOnBoarding'
  import type { OnboardingFormData } from '~/types/ui'

  const authStore = useAuthStore()

  const showWizard = ref(false)

  // Solo una función handleWizardCompleted, tipada correctamente
  const { completeOnboarding, isLoading, error } = useOnBoarding()
  const { showModal, hideModal } = useModalNotification()
  async function handleWizardCompleted(data: OnboardingFormData) {
    const success = await completeOnboarding(data)

    if (success && !isLoading.value) {
      showModal('success', {
        title: 'Onboarding Completado',
        message: '¡Tu perfil ha sido configurado exitosamente! Bienvenido a FinHub.',
        actionLabel: 'Aceptar',
        onAction: hideModal
      })
    } else {
      showModal('error', {
        title: 'Error al Completar Onboarding',
        message:
          error.value ||
          'Hubo un problema al completar el onboarding. Por favor, intenta de nuevo.',
        actionLabel: undefined
      })
    }

    showWizard.value = false
  }

  definePageMeta({
    layout: 'dashboard',
    title: 'Dashboard',
    breadcrumb: 'Dashboard'
  })

  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()
  const plannedIncomeStore = usePlannedIncomeStore()

  onMounted(async () => {
    await budgetStore.fetchCurrentBudget()
    await plannedIncomeStore.fetchPlannedIncomeByBudgetId(
      budgetStore.currentBudgetPlan?.id as string
    )

    // Mostrar wizard si el usuario necesita onboarding
    setTimeout(() => {
      if (authStore.needsOnboarding()) {
        showWizard.value = true
      }
    }, 500)
  })

  const expectedAmount = computed(() => plannedIncomeStore.expectedIncome)
  const buckets = computed(() => {
    const { needsAmount, wantsAmount, savingsAmount } = plannedIncomeStore.buckets
    return { needsAmount, wantsAmount, savingsAmount }
  })

  const currency = computed(() => financesStore.defaultCurrency)

  // Expenses start at 0 until transactions are loaded
  const totalExpenses = computed(() => 0)

  // Available = (totalIncome - savingsAmount) - expenses
  const available = computed(() =>
    subtractAmounts(
      subtractAmounts(expectedAmount.value, buckets.value.savingsAmount, currency.value),
      totalExpenses.value,
      currency.value
    )
  )

  // Budget used = totalExpenses / spendable income (income - savings)
  const plan = computed(() => budgetStore.currentBudgetPlan)
  const categories = computed(() => {
    if (!plan.value) return []
    const cur = currency.value
    return [
      {
        id: 'needs',
        name: 'Gastos Fijos',
        type: 'needs' as const,
        budgeted: percentOf(expectedAmount.value, plan.value.limits.needs, cur),
        spent: 0,
        percentage: plan.value.limits.needs
      },
      {
        id: 'wants',
        name: 'Gastos Variables u Ocasionales',
        type: 'wants' as const,
        budgeted: percentOf(expectedAmount.value, plan.value.limits.wants, cur),
        spent: 0,
        percentage: plan.value.limits.wants
      },
      {
        id: 'savings',
        name: 'Ahorro e Inversiones',
        type: 'savings' as const,
        budgeted: percentOf(expectedAmount.value, plan.value.limits.savings, cur),
        spent: 0,
        percentage: plan.value.limits.savings
      }
    ]
  })

  const router = useRouter()
</script>

<template>
  <div class="space-y-4 p-4">
    <!-- Dashboard Header -->

    <!-- Quick Actions -->
    <div class="flex items-center justify-between">
      <div class="md:pr-4 xl:pr-0">
        <div class="mb-2 flex items-center gap-2">
          <Heading level="h1" size="2xl" weight="extrabold" class="mb-1">
            Tu Plan Financiero
          </Heading>
          <Badge
            bold
            :rounded="false"
            :variant="budgetStore.currentBudgetPlan?.status === 'PLANNED' ? 'warning' : 'secondary'"
            class-name="uppercase"
          >
            {{
              budgetStore.currentBudgetPlan?.status === 'PLANNED' ? 'Planificado' : 'En Ejecución'
            }}
          </Badge>
        </div>

        <Text size="sm" color="muted">
          Conoce el estado de tus finanzas y toma decisiones inteligentes con datos en tiempo real.
        </Text>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm" icon="download">Reporte</Button>
        <Button variant="primary" size="sm" icon="add">Nueva Transacción</Button>
      </div>
    </div>

    <div
      v-if="expectedAmount"
      class="mb-8 grid w-full grid-cols-1 items-start gap-6 xl:grid-cols-[auto_1fr]"
    >
      <div class="grid w-fit grid-cols-1 gap-2 md:grid-cols-2">
        <Card
          class="relative h-40 w-[350px] space-y-4 overflow-hidden !bg-primary-900"
          class-name="!p-0"
        >
          <div class="relative z-10 p-4">
            <div class="flex flex-col gap-2 space-y-2">
              <div class="flex items-center gap-1">
                <IconBadge
                  icon="account_balance_wallet"
                  class="w-fit"
                  icon-class="bg-transparent text-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400"
                />
                <Label class="uppercase !text-neutral-300" weight="bold">Ingreso</Label>
              </div>

              <Heading size="3xl" color="white" weight="bold" class="flex items-end">
                {{ formatCurrency(expectedAmount, currency) }}
                <span class="mx-2 text-2xl text-primary-300">{{ currency }}</span>
              </Heading>
            </div>
          </div>
          <div class="pointer-events-none absolute -bottom-8 -right-8 opacity-20">
            <span class="material-symbols-outlined rotate-12 !text-[150px] text-primary-500">
              credit_card
            </span>
          </div>
        </Card>
        <Card
          v-if="buckets.savingsAmount"
          class="relative h-40 w-[350px] space-y-4 overflow-hidden !bg-primary-900"
          class-name="!p-0"
        >
          <div class="relative z-10 p-4">
            <div class="flex flex-col gap-2 space-y-2">
              <div class="flex items-center gap-1">
                <IconBadge
                  icon="savings"
                  class="w-fit"
                  icon-class="bg-transparent text-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400"
                />
                <Label class="uppercase !text-neutral-300" weight="bold">Ahorro Sugerido/Mes</Label>
              </div>

              <Heading size="3xl" color="white" weight="bold" class="flex items-end">
                {{ formatCurrency(buckets.savingsAmount, currency) }}
                <span class="mx-2 text-2xl text-primary-300">{{ currency }}</span>
              </Heading>
            </div>
          </div>
          <div class="pointer-events-none absolute -bottom-8 -right-8 opacity-20">
            <span class="material-symbols-outlined rotate-12 !text-[150px] text-primary-500">
              savings
            </span>
          </div>
        </Card>
        <Card
          v-if="available"
          class="relative h-40 w-[350px] space-y-4 overflow-hidden !bg-primary-900"
          class-name="!p-0"
        >
          <div class="relative z-10 p-4">
            <div class="flex flex-col gap-2 space-y-2">
              <div class="flex items-center gap-1">
                <IconBadge
                  icon="payments"
                  class="w-fit"
                  icon-class="bg-transparent text-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400"
                />
                <Label class="uppercase !text-neutral-300" weight="bold">Disponible</Label>
              </div>

              <Heading size="3xl" color="white" weight="bold" class="flex items-end">
                {{ formatCurrency(available, currency) }}
                <span class="mx-2 text-2xl text-primary-300">{{ currency }}</span>
              </Heading>
            </div>
          </div>
          <div class="pointer-events-none absolute -bottom-8 -right-8 opacity-20">
            <span class="material-symbols-outlined rotate-12 !text-[150px] text-primary-500">
              payments
            </span>
          </div>
        </Card>
        <div
          v-if="expectedAmount"
          class="relative z-10 flex h-40 max-w-[350px] flex-col gap-4 overflow-hidden"
        >
          <Card class="flex h-40 flex-col space-y-4">
            <div class="p-2">
              <Text color="muted" size="sm" class="leading-relaxed">
                Ahora es el momento de definir cómo vas a ahorrar tu
                <strong>{{ plan?.limits.savings }}%</strong>
              </Text>
            </div>

            <div class="z-10 flex items-center gap-2">
              <Button size="sm" @click="router.push(`/dashboard/goals`)">Definir Metas</Button>
            </div>
          </Card>
          <div class="pointer-events-none absolute -bottom-8 -right-8 opacity-20">
            <span class="material-symbols-outlined rotate-12 !text-[150px] text-primary-500">
              savings
            </span>
          </div>
        </div>
      </div>
      <div class="mb-8 grid grid-cols-1">
        <!-- Budget Distribution -->
        <div
          class="rounded-md border border-slate-200 bg-white transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800"
        >
          <div class="flex border-b border-slate-100 px-5 py-4 dark:border-slate-700">
            <Heading level="h3" size="lg" weight="semibold">
              {{
                budgetStore.currentBudgetPlan?.status === 'PLANNED'
                  ? 'Planificacion del Presupuesto'
                  : 'Estado del Presupuesto'
              }}
            </Heading>
            <Badge
              size="sm"
              class="ml-2"
              :variant="
                budgetStore.currentBudgetPlan?.strategy === 'BALANCED' ? 'primary' : 'secondary'
              "
            >
              {{
                budgetStore.currentBudgetPlan?.strategy === 'BALANCED'
                  ? '50/30/20'
                  : 'Personalizada'
              }}
            </Badge>
          </div>

          <div class="flex items-center gap-6 p-5">
            <!-- Donut (left, fixed size) -->
            <div class="shrink-0">
              <ClientOnly>
                <BudgetDonutChart
                  :items="categories"
                  :total="expectedAmount"
                  :currency="currency"
                  :show-legend="false"
                />
                <template #fallback>
                  <div
                    class="h-44 w-44 animate-pulse rounded-full bg-slate-100 dark:bg-slate-700"
                  />
                </template>
              </ClientOnly>
            </div>

            <!-- Execution bars (right) -->
            <div class="min-w-0 flex-1 space-y-4">
              <div v-for="cat in categories" :key="cat.id" class="space-y-1.5">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex min-w-0 items-center gap-2">
                    <span
                      :class="[
                        'h-3 w-3 shrink-0 rounded-full',
                        cat.type === 'needs'
                          ? 'bg-teal-500'
                          : cat.type === 'wants'
                            ? 'bg-indigo-500'
                            : 'bg-yellow-400'
                      ]"
                    />
                    <Text size="sm" class="truncate">
                      {{ cat.name }}
                      <span class="text-slate-400">({{ cat.percentage }}%)</span>
                    </Text>
                  </div>
                  <Text size="sm" weight="semibold" class="shrink-0">
                    {{ formatCurrency(cat.budgeted, currency) }}
                  </Text>
                </div>
                <div
                  class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
                >
                  <!-- fills with cat.spent / cat.budgeted × 100 once transactions load -->
                  <div
                    :class="[
                      'h-full rounded-full transition-all duration-700',
                      cat.type === 'needs'
                        ? 'bg-teal-500'
                        : cat.type === 'wants'
                          ? 'bg-indigo-500'
                          : 'bg-yellow-400'
                    ]"
                    :style="{
                      width:
                        cat.budgeted > 0
                          ? `${Math.min((cat.spent / cat.budgeted) * 100, 100)}%`
                          : '0%'
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="grid w-fit grid-cols-1 gap-2 md:grid-cols-2">
        <div class="grid w-fit grid-cols-1 gap-2">
          <Card
            v-if="strategyInfo"
            class="relative h-fit w-64 space-y-4 overflow-hidden"
            class-name="!p-0"
          >
            <div class="relative z-10 flex flex-col gap-4 p-4">
              <div class="flex items-center gap-2">
                <Icon name="lightbulb" size="md" class-name="text-secondary-600" />
                <Heading
                  level="h1"
                  size="sm"
                  weight="extrabold"
                  color="secondary"
                  class="leading-tight"
                >
                  Informacion
                </Heading>
              </div>

              <Card class="!bg-secondary-100">
                <Label title-size="xs" weight="bold" color="secondary">Regla del 50/30/20</Label>
                <Text size="xs" color="secondary" class="flex items-start gap-1 leading-relaxed">
                  {{ strategyInfo.description }}
                </Text>
              </Card>
            </div>
          </Card>
          <Card
            v-if="strategyInfo"
            class="relative h-fit w-64 space-y-4 overflow-hidden"
            class-name="!p-0"
          >
            <div class="relative z-10 flex flex-col gap-4 p-4">
              <div class="flex items-center gap-2">
                <Icon name="lightbulb" size="md" class-name="text-secondary-600" />
                <Heading
                  level="h1"
                  size="sm"
                  weight="extrabold"
                  color="secondary"
                  class="leading-tight"
                >
                  Tips
                </Heading>
              </div>

              <Card class="!bg-secondary-100">
                <Label title-size="xs" weight="bold" color="secondary">
                  Pagate a ti mismo primero
                </Label>
                <Text size="xs" color="secondary" class="flex items-start gap-1 leading-relaxed">
                  Pagate a ti mismo primero: Uno de los principios de Finanzas Personales
                </Text>
              </Card>
            </div>
          </Card>
        </div>
      </div> -->
    </div>

    <!-- Onboarding Wizard -->
    <ModalWizard :show="showWizard" class="px-8">
      <OnboardingWizard ref="wizardRef" @completed="handleWizardCompleted" />
    </ModalWizard>
  </div>
</template>

<style scoped></style>
