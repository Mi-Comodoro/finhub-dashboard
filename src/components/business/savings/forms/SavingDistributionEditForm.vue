<script setup lang="ts">
  import AlertBanner from '@/components/atoms/alert-banner/AlertBanner.vue'
  import Button from '@/components/atoms/button/Button.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import { useSavingDistributionApplication } from '@/composables/application/useSavingDistributionApplication'
  import { useGoalsStore } from '@/stores/goals.store'
  import { useSavingAllocationsStore } from '@/stores/savingAllocations.store'

  const props = defineProps<{ budgetId: string }>()
  const emit = defineEmits(['onClose', 'onSuccess', 'onError'])

  const goalsStore = useGoalsStore()
  const savingsAllocationsStore = useSavingAllocationsStore()
  const { updateDistribution } = useSavingDistributionApplication()

  interface DistributionRow {
    goalId: string
    goalName: string
    percentage: number
  }

  const rows = ref<DistributionRow[]>([])
  const isSubmitting = ref(false)

  onMounted(() => {
    const current = savingsAllocationsStore.savingAllocations.filter(
      a => a.budgetId === props.budgetId
    )
    rows.value = current.map(a => {
      const goal = goalsStore.goals.find(g => g.id === a.goalId)
      return {
        goalId: a.goalId,
        goalName: goal?.name ?? 'Meta desconocida',
        percentage: Number(a.percentage)
      }
    })
  })

  const totalPercentage = computed(() =>
    rows.value.reduce((s, r) => s + (Number(r.percentage) || 0), 0)
  )
  const isOverAllocated = computed(() => totalPercentage.value > 100)
  const canSubmit = computed(
    () => !isSubmitting.value && !isOverAllocated.value && rows.value.length > 0
  )

  const handleSubmit = async () => {
    if (!canSubmit.value) return
    isSubmitting.value = true

    const distributions = rows.value.map(r => ({
      goalId: r.goalId,
      percentage: Number(r.percentage)
    }))

    const { success, error } = await updateDistribution(props.budgetId, distributions)
    isSubmitting.value = false

    if (success) {
      emit('onSuccess')
    } else {
      emit('onError', error)
    }
  }
</script>

<template>
  <div class="distribution-edit-form">
    <CardInfo
      title="Reajustar Distribución"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title="Modifica el porcentaje asignado a cada meta de ahorro."
      sub-title-size="xs"
      sub-title-color="muted"
      icon="pie_chart"
      icon-variant="primary"
      icon-size="md"
    />

    <AlertBanner icon="info" variant="warning">
      <Text size="sm" color="warning">
        <strong>Cambios prospectivos.</strong>
        Los cambios aplicarán a los próximos planes de ahorro generados. Las distribuciones actuales
        no se verán afectadas.
      </Text>
    </AlertBanner>

    <div class="distribution-edit-form__rows">
      <div
        v-for="(row, index) in rows"
        :key="row.goalId"
        class="distribution-edit-form__row"
        :class="{ 'distribution-edit-form__row--last': index === rows.length - 1 }"
      >
        <Text size="sm" class="distribution-edit-form__goal-name">
          {{ row.goalName }}
        </Text>
        <div class="distribution-edit-form__input-wrapper">
          <input
            v-model.number="row.percentage"
            type="number"
            min="1"
            max="100"
            class="distribution-edit-form__input"
          />
          <span class="distribution-edit-form__input-suffix">%</span>
        </div>
      </div>
    </div>

    <div
      class="distribution-edit-form__total"
      :class="{
        'distribution-edit-form__total--over': isOverAllocated,
        'distribution-edit-form__total--complete': totalPercentage === 100
      }"
    >
      <Text size="sm" weight="semibold">Total asignado</Text>
      <Text size="sm" weight="bold">{{ totalPercentage }}%</Text>
    </div>

    <AlertBanner v-if="isOverAllocated" icon="warning" variant="danger">
      <Text size="sm" color="error">
        La suma de porcentajes ({{ totalPercentage }}%) supera el 100%.
      </Text>
    </AlertBanner>

    <div class="distribution-edit-form__actions">
      <Button type="button" variant="ghost" size="sm" @click="emit('onClose')">Cancelar</Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
      </Button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .distribution-edit-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .distribution-edit-form__rows {
    @apply flex flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .distribution-edit-form__row {
    @apply flex items-center justify-between gap-4 rounded-md bg-white p-3;
    @apply dark:bg-neutral-900;
    @apply border-b border-neutral-100 dark:border-neutral-700;
  }

  .distribution-edit-form__row--last {
    @apply border-b-0;
  }

  .distribution-edit-form__goal-name {
    @apply flex-1 text-neutral-700 dark:text-neutral-300;
  }

  .distribution-edit-form__input-wrapper {
    @apply flex items-center gap-1;
  }

  .distribution-edit-form__input {
    @apply w-20 rounded-md border border-neutral-300 bg-white px-2 py-1 text-right text-sm font-medium text-neutral-900 outline-none transition-colors;
    @apply focus:border-primary-500 focus:ring-1 focus:ring-primary-500;
    @apply dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100;
  }

  .distribution-edit-form__input-suffix {
    @apply text-sm font-semibold text-neutral-500;
  }

  .distribution-edit-form__total {
    @apply flex items-center justify-between rounded-md border-2 border-neutral-200 bg-neutral-50 px-4 py-3;
    @apply transition-colors;
  }

  .distribution-edit-form__total--over {
    @apply border-danger-300 bg-danger-50;
  }

  .distribution-edit-form__total--complete {
    @apply border-success-300 bg-success-50;
  }

  .distribution-edit-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
