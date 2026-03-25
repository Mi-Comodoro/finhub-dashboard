<script setup lang="ts">
  import { useBudgetStore } from '@/stores/budget.store'
  import { useFinancesStore } from '@/stores/finances.store'
  import { usePlannedIncomeStore } from '@/stores/planned-income.store'
  import { useSavingAllocationsStore } from '@/stores/savingAllocations.store'
  import DateUtils from '~/utils/date'

  import { subtractPercentage } from '../../../utils/numbers'

  const budgetStore = useBudgetStore()
  const plannedIncomeStore = usePlannedIncomeStore()
  const financeStore = useFinancesStore()
  const savingsAllocationsStore = useSavingAllocationsStore()

  onMounted(async () => {
    await budgetStore.fetchCurrentBudget()
    await plannedIncomeStore.fetchPlannedIncomeByBudgetId(
      budgetStore.currentBudgetPlan?.id as string as string
    )
    if (savingsAllocationsStore.savingAllocations.length < 1) {
      await savingsAllocationsStore.fetchSavingAllocations()
    }
  })

  const savingsAmount = computed(() => plannedIncomeStore.buckets.savingsAmount)

  const currency = computed(() => financeStore.config?.defaultCurrency).value!
  const countAssignedSavingAllocation = computed(
    () => savingsAllocationsStore.savingAllocations.length
  )
  const savingAllocationTotal = computed(() =>
    savingsAllocationsStore.savingAllocations.reduce((acc, sa) => acc + Number(sa.percentage), 0)
  )

  const pendingAssignedAmount = computed(() =>
    countAssignedSavingAllocation.value === 0
      ? savingsAmount.value
      : subtractPercentage(savingsAmount.value, savingAllocationTotal.value)
  )

  const pendingAmount = computed(() =>
    pendingAssignedAmount.value === savingsAmount.value
      ? savingsAmount.value
      : pendingAssignedAmount.value
  )

  savingsAllocationsStore.setNewSavingAmount(pendingAmount.value)
</script>

<template>
  <div class="relative z-10 flex flex-col gap-4 overflow-hidden">
    <Card class="flex !p-4">
      <div class="grid w-full grid-cols-4 gap-4">
        <div class="flex w-full items-center gap-2">
          <div class="flex items-start gap-2">
            <IconBadge icon="account_balance" variant="primary" />
          </div>
          <div class="">
            <Label variant="section" size="sm" text="Proyección de ahorro mensual" color="muted" />
            <Heading color="black" size="3xl" weight="bold">
              {{ formatCurrency(savingsAmount, currency) }}
              <span class="text-sm uppercase text-primary-500">{{ currency }}</span>
            </Heading>
          </div>
        </div>
        <div>
          <Label variant="section" size="sm" text="Ultima Actualizacion" color="muted" />

          <!-- TODO: Cambiar por la fecha real, que seria la fecha mas reciente de la tabla de allocations -->
          <Text color="muted" size="sm" weight="bold">
            {{ DateUtils.formatSmartDate(new Date()) }}
          </Text>
        </div>
        <div class="flex w-full items-center">
          <ProgressBar :progress="savingAllocationTotal" />
        </div>
        <div class="z-10 w-full place-items-end p-4 text-end">
          <Label variant="section" text="Restante por Asignar" color="muted" />
          <Heading color="warning" size="2xl" weight="bold">
            {{ formatCurrency(pendingAmount, currency) }}
          </Heading>
        </div>
      </div>
    </Card>
    <div class="pointer-events-none absolute -bottom-8 -right-8 opacity-20">
      <span class="material-symbols-outlined rotate-12 !text-[150px] text-primary-500">
        savings
      </span>
    </div>
  </div>
</template>
