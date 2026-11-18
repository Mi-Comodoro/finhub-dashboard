<script setup lang="ts">
  import AlertBanner from '@/components/atoms/alert-banner/AlertBanner.vue'
  import Button from '@/components/atoms/button/Button.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import {
    type DistributionRow,
    useSavingDistributionApplication
  } from '@/composables/application/useSavingDistributionApplication'
  import { useFinancesStore } from '@/stores/finances.store'
  import { formatCurrency } from '@/utils/currency'

  const props = defineProps<{ budgetId?: string }>()
  const emit = defineEmits(['onClose', 'onError', 'onSuccess'])

  const financesStore = useFinancesStore()
  const currency = computed(() => financesStore.profile?.currency || 'COP')

  const {
    initialize,
    buildDistributionRows,
    splitEvenly,
    getSuggestedSplit,
    getAmountForPercentage,
    saveDistribution,
    monthlySavingsAmount
  } = useSavingDistributionApplication()

  const resolvedBudgetId = ref<string | null>(props.budgetId ?? null)
  const rows = ref<DistributionRow[]>([])
  const isLoading = ref(true)
  const isSubmitting = ref(false)

  onMounted(async () => {
    const result = await initialize()
    resolvedBudgetId.value = props.budgetId ?? result.budgetId
    if (!resolvedBudgetId.value) {
      console.warn('[SavingDistributionForm] budgetId is required')
      isLoading.value = false
      return
    }
    rows.value = buildDistributionRows(resolvedBudgetId.value)
    isLoading.value = false
  })

  const totalPercentage = computed(() =>
    rows.value.reduce((acc, r) => acc + (Number(r.percentage) || 0), 0)
  )
  const remainingPercentage = computed(() => 100 - totalPercentage.value)
  const isComplete = computed(() => Math.round(totalPercentage.value * 100) === 10000)
  const isOverAllocated = computed(() => totalPercentage.value > 100)
  const suggestedSplit = computed(() => getSuggestedSplit(rows.value.length))
  const canSubmit = computed(
    () => !isSubmitting.value && !isLoading.value && isComplete.value && rows.value.length > 0
  )

  const clampPercentage = (row: DistributionRow) => {
    const value = Number(row.percentage)
    row.percentage = Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 0
  }

  const applySplit = (values: number[]) => {
    rows.value.forEach((row, index) => {
      row.percentage = values[index] ?? 0
    })
  }
  const applyEvenSplit = () => applySplit(splitEvenly(rows.value.length))
  const applySuggestedSplit = () => {
    if (suggestedSplit.value) applySplit(suggestedSplit.value)
  }

  const handleSubmit = async () => {
    if (!canSubmit.value || !resolvedBudgetId.value) return
    isSubmitting.value = true
    const { success, error } = await saveDistribution(resolvedBudgetId.value, rows.value)
    isSubmitting.value = false

    if (success) {
      emit('onSuccess')
    } else {
      emit('onError', error)
    }
  }
</script>

<template>
  <div class="saving-distribution-form">
    <CardInfo
      title="Distribuir Ahorros"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title="Reparte el 100% de tu ahorro mensual entre tus metas."
      sub-title-size="xs"
      sub-title-color="muted"
      icon="pie_chart"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="saving-distribution-form__amount">
      <Text size="xs" color="muted">Ahorro mensual esperado</Text>
      <Text size="sm" weight="bold" class="saving-distribution-form__amount-value">
        {{ formatCurrency(monthlySavingsAmount ?? 0, currency) }}
      </Text>
    </div>

    <div v-if="isLoading" class="saving-distribution-form__skeleton" />

    <AlertBanner v-else-if="rows.length === 0" icon="info" variant="warning">
      <Text size="xs" color="warning">
        <strong>Aún no tienes metas activas.</strong>
        Crea tus metas de ahorro para poder distribuirlas.
      </Text>
    </AlertBanner>

    <template v-else>
      <div class="saving-distribution-form__shortcuts">
        <Button type="button" variant="secondary" size="sm" icon="balance" @click="applyEvenSplit">
          Repartir en partes iguales
        </Button>
        <Button
          v-if="suggestedSplit"
          type="button"
          variant="ghost"
          size="sm"
          icon="auto_awesome"
          @click="applySuggestedSplit"
        >
          Sugerencia {{ suggestedSplit.join('/') }}
        </Button>
      </div>

      <div class="saving-distribution-form__rows">
        <div v-for="row in rows" :key="row.goalId" class="saving-distribution-form__row">
          <div class="saving-distribution-form__row-top">
            <Text size="xs" weight="semibold" class="saving-distribution-form__goal-name">
              {{ row.goalName }}
            </Text>
            <Text size="xs" color="muted" class="saving-distribution-form__goal-amount">
              {{ formatCurrency(getAmountForPercentage(row.percentage), currency) }}
            </Text>
            <div class="saving-distribution-form__input-wrapper">
              <input
                v-model.number="row.percentage"
                type="number"
                min="0"
                max="100"
                step="1"
                class="saving-distribution-form__input"
                :aria-label="`Porcentaje para ${row.goalName}`"
                @change="clampPercentage(row)"
              />
              <span class="saving-distribution-form__input-suffix">%</span>
            </div>
          </div>
          <input
            v-model.number="row.percentage"
            type="range"
            min="0"
            max="100"
            step="1"
            class="saving-distribution-form__slider"
            :aria-label="`Control de porcentaje para ${row.goalName}`"
          />
        </div>
      </div>

      <div
        class="saving-distribution-form__total"
        :class="{
          'saving-distribution-form__total--over': isOverAllocated,
          'saving-distribution-form__total--complete': isComplete
        }"
      >
        <Text size="xs" weight="semibold">Total asignado</Text>
        <Text size="xs" weight="bold">
          {{ totalPercentage }}% ·
          {{ formatCurrency(getAmountForPercentage(totalPercentage), currency) }}
        </Text>
      </div>

      <AlertBanner v-if="isOverAllocated" icon="warning" variant="danger">
        <Text size="xs" color="error">
          La suma supera el 100%. Quita
          <strong>{{ totalPercentage - 100 }}%</strong>
          para poder guardar.
        </Text>
      </AlertBanner>
      <AlertBanner v-else-if="!isComplete" icon="info" variant="warning">
        <Text size="xs" color="warning">
          Te faltan
          <strong>{{ remainingPercentage }}%</strong>
          por asignar. Debes repartir el 100% para guardar.
        </Text>
      </AlertBanner>
      <AlertBanner v-else icon="check_circle" variant="success">
        <Text size="xs" color="success">
          <strong>¡Distribución completa!</strong>
          Has asignado el 100% de tus ahorros.
        </Text>
      </AlertBanner>
    </template>

    <div class="saving-distribution-form__actions">
      <Button type="button" variant="ghost" size="sm" @click.stop="emit('onClose')">
        Cancelar
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        {{ isSubmitting ? 'Guardando...' : 'Guardar distribución' }}
      </Button>
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
    @apply text-primary-900 dark:text-primary-200;
  }

  .saving-distribution-form__skeleton {
    @apply h-40 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-neutral-700;
  }

  .saving-distribution-form__shortcuts {
    @apply flex flex-wrap items-center gap-2;
  }

  .saving-distribution-form__rows {
    @apply flex flex-col gap-1 overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50 p-2;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
    max-height: 40vh;
  }

  .saving-distribution-form__row {
    @apply flex flex-col gap-2 rounded-md bg-white px-3 py-2 dark:bg-neutral-900;
  }

  .saving-distribution-form__row-top {
    @apply grid grid-cols-[1fr_auto_auto] items-center gap-3;
  }

  .saving-distribution-form__goal-name {
    @apply truncate text-neutral-700 dark:text-neutral-300;
  }

  .saving-distribution-form__goal-amount {
    @apply min-w-[110px] text-right;
  }

  .saving-distribution-form__input-wrapper {
    @apply flex shrink-0 items-center gap-1;
  }

  .saving-distribution-form__input {
    @apply w-14 rounded-md border border-neutral-300 bg-white px-1.5 py-1 text-right text-xs font-medium text-neutral-900 outline-none transition-colors;
    @apply focus:border-primary-500 focus:ring-1 focus:ring-primary-500;
    @apply dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100;
  }

  .saving-distribution-form__input-suffix {
    @apply text-xs font-semibold text-neutral-500;
  }

  .saving-distribution-form__slider {
    @apply h-1.5 w-full cursor-pointer accent-primary-600;
  }

  .saving-distribution-form__total {
    @apply flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 transition-colors;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .saving-distribution-form__total--over {
    @apply border-danger-300 bg-danger-50;
  }

  .saving-distribution-form__total--complete {
    @apply border-success-300 bg-success-50;
  }

  .saving-distribution-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
