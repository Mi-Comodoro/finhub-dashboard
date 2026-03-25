<script setup lang="ts">
  import { AlertBanner } from '@/components/atoms'
  import { Form } from '@/components/organisms'
  import { useBudgetStore } from '@/stores/budget.store'
  import { useGoalsStore } from '@/stores/goals.store'
  import { usePlannedIncomeStore } from '@/stores/planned-income.store'
  import { useSavingAllocationsStore } from '@/stores/savingAllocations.store'
  import { subtractPercentage } from '@/utils/numbers'

  import { savingDistributionFieldsSchema } from './schema/saving-distribution.fields.schema'
  const plannedIncomeStore = usePlannedIncomeStore()
  const goalsStore = useGoalsStore()
  const budgetStore = useBudgetStore()

  const savingsAllocationsStore = useSavingAllocationsStore()

  const budgetId = ref()
  onMounted(async () => {
    await budgetStore.fetchCurrentBudget()
    budgetId.value = budgetStore?.currentBudgetPlan?.id
    await plannedIncomeStore.fetchPlannedIncomeByBudgetId(budgetId.value as string)
    if (savingsAllocationsStore.savingAllocations.length < 1) {
      await savingsAllocationsStore.fetchSavingAllocations()
    }
  })
  const savingsAmount = computed(() => plannedIncomeStore.buckets.savingsAmount)
  const goals = computed(() =>
    goalsStore.goals.map(item => ({
      label: item.name,
      value: item.id!,
      disabled: !item.isActive
    }))
  )

  const emit = defineEmits(['onClose', 'onError', 'onSuccess'])
  const formSchema = computed(() => savingDistributionFieldsSchema(goals.value))
  const percentage = ref<number>(0)

  const formKey = ref(0)
  const formData = ref<{ percentage: number; goalId: string }>({ percentage: 0, goalId: '' })
  const savingAllocationTotal = computed(() =>
    savingsAllocationsStore.savingAllocations.reduce((acc, sa) => acc + Number(sa.percentage), 0)
  )

  const newAmount = computed(() =>
    subtractPercentage(savingsAmount.value, savingAllocationTotal.value)
  )
  watch(formData, value => {
    if (value?.percentage && value?.percentage > 0) {
      percentage.value = value?.percentage
    }
  })
  const handleSubmit = () => {
    const buildData = {
      ...formData.value,
      budgetId: budgetId.value
    } as { budgetId: string; goalId: string; percentage: number }

    savingsAllocationsStore.addSavingAllocation(buildData)

    formData.value = { percentage: 0, goalId: '' }
    formKey.value++

    if (!savingsAllocationsStore.error) {
      emit('onSuccess')
    } else {
      emit('onError', goalsStore.error)
    }
  }

  const savingDiscount = computed(() => subtractPercentage(newAmount.value, percentage.value))
</script>

<template>
  <div class="flex h-full w-full flex-col gap-6">
    <CardInfo
      title="Agregar Distribucion de Ahorros"
      title-size="2xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title="Crea el hábito que transformará tu tranquilidad financiera."
      sub-title-size="sm"
      sub-title-color="muted"
      icon="donut_large"
      icon-variant="primary"
      icon-size="md"
    />
    <Text size="xl" weight="bold" class="">
      Monto disponible
      <strong class="text-primary-900">
        {{ formatCurrency(savingDiscount, 'COP') }}
      </strong>
    </Text>

    <AlertBanner icon="info" variant="warning">
      <Text size="sm" color="warning">
        <strong>Págate a ti mismo primero</strong>
        es una estrategia de finanzas personales donde priorizas el ahorro e inversión antes de
        pagar facturas o gastos discrecionales. Al recibir tus ingresos, separa automáticamente
        entre el 10% y 20% para tu
        <strong>Yo</strong>
        del futuro (ahorro, emergencia o inversión, retiro, entre otros.), convirtiendo el ahorro en
        un gasto fijo obligatorio.
      </Text>
    </AlertBanner>

    <Form :key="formKey" v-model="formData" :schema="formSchema">
      <template #actions>
        <div class="flex justify-end gap-2">
          <Button type="button" variant="ghost" @click.stop="emit('onClose')">Cancelar</Button>
          <Button type="submit" variant="primary" @click="handleSubmit">Guardar</Button>
        </div>
      </template>
    </Form>
  </div>
</template>
