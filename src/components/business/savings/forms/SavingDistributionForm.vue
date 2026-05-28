<script setup lang="ts">
  import AlertBanner from '@/components/atoms/alert-banner/AlertBanner.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import Form from '@/components/organisms/forms/Form.vue'
  import { useSavingDistributionApplication } from '@/composables/application/useSavingDistributionApplication'
  import { useFinancesStore } from '@/stores/finances.store'
  import { useGoalsStore } from '@/stores/goals.store'
  import { useSavingAllocationsStore } from '@/stores/savingAllocations.store'
  import { percentOf } from '@/utils/currency'
  import { subtractPercentage } from '@/utils/numbers'

  import { savingDistributionFieldsSchema } from './schema/saving-distribution.fields.schema'
  const financesStore = useFinancesStore()
  const currency = computed(() => financesStore.profile?.currency || 'COP')
  const {
    initialize,
    getSavingsAmount,
    getGoalOptions,
    getTotalAllocatedPercentage,
    submitAllocation
  } = useSavingDistributionApplication()

  const goalsStore = useGoalsStore()
  const savingsAllocationsStore = useSavingAllocationsStore()

  const budgetId = ref<string | null>(null)
  onMounted(async () => {
    const result = await initialize()
    budgetId.value = result.budgetId
  })

  const savingsAmount = getSavingsAmount()
  const goals = getGoalOptions()
  const savingAllocationTotal = computed(() =>
    budgetId.value ? getTotalAllocatedPercentage(budgetId.value).value : 0
  )
  const availablePercentage = computed(() => 100 - savingAllocationTotal.value)

  const emit = defineEmits(['onClose', 'onError', 'onSuccess'])
  const formSchema = computed(() =>
    savingDistributionFieldsSchema(goals.value, availablePercentage.value)
  )
  const percentage = ref<number>(0)

  const formKey = ref(0)
  const formData = ref<{ percentage: number; goalId: string }>({ percentage: 0, goalId: '' })

  const newAmount = computed(() =>
    subtractPercentage(savingsAmount.value, savingAllocationTotal.value)
  )

  const currentAllocations = computed(() => {
    if (!budgetId.value) return []
    return savingsAllocationsStore.savingAllocations
      .filter(a => a.budgetId === budgetId.value)
      .map(allocation => {
        const goal = goalsStore.goals.find(g => g.id === allocation.goalId)
        const amount = (savingsAmount.value * allocation.percentage) / 100
        return {
          goalName: goal?.name || 'Meta desconocida',
          percentage: allocation.percentage,
          amount
        }
      })
  })

  watch(formData, value => {
    const pct = Number(value?.percentage ?? 0)
    if (pct > 0) {
      percentage.value = pct
    }
  })
  const handleSubmit = async () => {
    if (!budgetId.value) return

    const { success, error } = await submitAllocation(formData.value, budgetId.value)

    formData.value = { percentage: 0, goalId: '' }
    formKey.value++

    if (success) {
      emit('onSuccess')
    } else {
      emit('onError', error)
    }
  }

  const savingDiscount = computed(() => {
    const base = newAmount.value
    const discount = percentOf(savingsAmount.value, percentage.value, currency.value)
    if (!isFinite(base) || !isFinite(discount)) return 0
    return base - discount
  })
</script>

<template>
  <div class="saving-distribution-form">
    <CardInfo
      title="Distribuir Ahorros"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title="Asigna un porcentaje de tus ahorros a cada meta."
      sub-title-size="xs"
      sub-title-color="muted"
      icon="pie_chart"
      icon-variant="primary"
      icon-size="md"
    />
    <div class="saving-distribution-form__amount">
      <Text size="xs" color="muted">Monto disponible</Text>
      <Text size="sm" weight="bold" class="saving-distribution-form__amount-value">
        {{ formatCurrency(savingDiscount, 'COP') }}
      </Text>
    </div>

    <AlertBanner icon="info" variant="warning">
      <Text size="xs" color="warning">
        <strong>Págate primero.</strong>
        Separa entre 10% y 20% de tus ingresos en cuanto los recibas, antes de cubrir gastos.
      </Text>
    </AlertBanner>

    <div v-if="currentAllocations.length > 0" class="saving-distribution-form__allocations">
      <Text size="xs" weight="semibold" class="saving-distribution-form__allocations-title">
        Distribuciones actuales
      </Text>
      <div class="saving-distribution-form__allocations-list">
        <div
          v-for="(allocation, index) in currentAllocations"
          :key="index"
          class="saving-distribution-form__allocation-item"
        >
          <Text size="xs" class="saving-distribution-form__allocation-name">
            {{ allocation.goalName }}
          </Text>
          <Text size="xs" weight="medium" class="saving-distribution-form__allocation-percentage">
            {{ allocation.percentage }}%
          </Text>
          <Text size="xs" color="muted" class="saving-distribution-form__allocation-amount">
            {{ formatCurrency(allocation.amount, 'COP') }}
          </Text>
        </div>
        <div
          class="saving-distribution-form__allocation-item saving-distribution-form__allocation-item--available"
        >
          <Text size="xs" weight="semibold" class="saving-distribution-form__allocation-name">
            Disponible
          </Text>
          <Text size="xs" weight="bold" class="saving-distribution-form__allocation-percentage">
            {{ availablePercentage }}%
          </Text>
          <Text size="xs" weight="medium" class="saving-distribution-form__allocation-amount">
            {{ formatCurrency(newAmount, 'COP') }}
          </Text>
        </div>
      </div>
    </div>

    <div class="saving-distribution-form__footer">
      <AlertBanner v-if="availablePercentage <= 0" icon="check_circle" variant="success">
        <Text size="xs" color="success">
          <strong>¡Distribución completa!</strong>
          Has asignado el 100% de tus ahorros.
        </Text>
      </AlertBanner>

      <Form v-if="availablePercentage > 0" :key="formKey" v-model="formData" :schema="formSchema">
        <template #actions>
          <div class="saving-distribution-form__actions">
            <Button type="button" variant="ghost" size="sm" @click.stop="emit('onClose')">
              Cancelar
            </Button>
            <Button type="button" variant="primary" size="sm" @click="handleSubmit">Guardar</Button>
          </div>
        </template>
      </Form>

      <div v-else class="saving-distribution-form__actions">
        <Button type="button" variant="ghost" size="sm" @click.stop="emit('onClose')">
          Cerrar
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .saving-distribution-form {
    @apply flex w-full flex-col gap-3;
  }

  .saving-distribution-form__amount {
    @apply flex items-center justify-between rounded-md border border-neutral-100 bg-neutral-50 px-3 py-2;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .saving-distribution-form__amount-value {
    @apply text-primary-900;
  }

  .saving-distribution-form__allocations {
    @apply flex flex-col gap-2 overflow-y-auto rounded-lg border p-2;
    @apply border-neutral-200 bg-neutral-50;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
    max-height: 35vh;
  }

  .saving-distribution-form__allocations-title {
    @apply px-1 text-neutral-500 dark:text-neutral-400;
  }

  .saving-distribution-form__allocations-list {
    @apply flex flex-col gap-1;
  }

  .saving-distribution-form__allocation-item {
    @apply grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md px-2 py-1.5;
    @apply bg-white dark:bg-neutral-900;
  }

  .saving-distribution-form__allocation-item--available {
    @apply border;
    @apply border-primary-200 bg-primary-50;
    @apply dark:border-primary-700 dark:bg-primary-900;
  }

  .saving-distribution-form__allocation-name {
    @apply truncate text-neutral-700 dark:text-neutral-300;
  }

  .saving-distribution-form__allocation-item--available .saving-distribution-form__allocation-name {
    @apply text-primary-900 dark:text-primary-100;
  }

  .saving-distribution-form__allocation-percentage {
    @apply min-w-[40px] text-right;
    @apply text-neutral-900 dark:text-neutral-100;
  }

  .saving-distribution-form__allocation-item--available
    .saving-distribution-form__allocation-percentage {
    @apply text-primary-700 dark:text-primary-300;
  }

  .saving-distribution-form__allocation-amount {
    @apply min-w-[90px] text-right;
  }

  .saving-distribution-form__allocation-item--available
    .saving-distribution-form__allocation-amount {
    @apply text-primary-600 dark:text-primary-400;
  }

  .saving-distribution-form__footer {
    @apply flex flex-col gap-2;
  }

  .saving-distribution-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
