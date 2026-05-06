<script setup lang="ts">
  import { computed, ref } from 'vue'

  import { Icon } from '@/components/atoms'
  import { Form } from '@/components/organisms/forms'
  import { useIncomeApplication } from '@/composables/application/useIncomeApplication'
  import { formatCurrency } from '@/utils/currency'

  import { incomeFieldsSchema } from './schema/income.fields.schema'

  const { createIncome, createIncomeWithSavingsPlan, updateIncome } = useIncomeApplication()

  const props = withDefaults(
    defineProps<{
      budgetId?: string
      incomeId?: string
      initialData?: Record<string, unknown>
      showSavingsPlanStep?: boolean
      budgetSavingsPercentage?: number
      currency?: string
    }>(),
    {
      budgetId: '',
      incomeId: undefined,
      initialData: undefined,
      showSavingsPlanStep: false,
      budgetSavingsPercentage: 20,
      currency: 'COP'
    }
  )

  const isEditMode = computed(() => !!props.incomeId)
  const formSchema = computed(() => incomeFieldsSchema())

  const currentStep = ref(1)
  const pendingFormData = ref<Record<string, unknown> | null>(null)
  const createSavingsPlan = ref(true)

  const savingsAmount = computed(() => {
    const amount = Number(pendingFormData.value?.amount ?? 0)
    return Math.round(amount * ((props.budgetSavingsPercentage ?? 20) / 100))
  })

  const emit = defineEmits(['onClose'])
  const close = () => emit('onClose')

  const goBack = () => {
    currentStep.value = 1
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!props.budgetId) {
      console.warn('[IncomeForm] budgetId is required but was not provided')
      return
    }

    if (props.showSavingsPlanStep && !isEditMode.value && currentStep.value === 1) {
      pendingFormData.value = data
      currentStep.value = 2
      return
    }

    await submitIncome(data)
  }

  const handleConfirmStep2 = async () => {
    if (!pendingFormData.value) return

    const incomeData = { ...pendingFormData.value, budgetId: props.budgetId, status: 'PENDING' }

    if (createSavingsPlan.value) {
      const { success } = await createIncomeWithSavingsPlan(
        incomeData,
        props.budgetSavingsPercentage ?? 20
      )
      if (success) emit('onClose')
    } else {
      await submitIncome(pendingFormData.value)
    }
  }

  const submitIncome = async (data: Record<string, unknown>) => {
    try {
      if (isEditMode.value && props.incomeId) {
        const { success } = await updateIncome(props.incomeId, data)
        if (success) emit('onClose')
      } else {
        const { success } = await createIncome({
          ...data,
          budgetId: props.budgetId,
          status: 'PENDING'
        })
        if (success) emit('onClose')
      }
    } catch {
      // Error handling is done in the application layer
    }
  }
</script>

<template>
  <div class="income-form">
    <CardInfo
      :title="isEditMode ? 'Editar Ingreso Planificado' : 'Agregar Ingreso Planificado'"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      :sub-title="
        isEditMode
          ? 'Actualiza la información de tu ingreso planificado.'
          : 'Registra tus ingresos esperados para planificar mejor tu presupuesto.'
      "
      sub-title-size="xs"
      sub-title-color="muted"
      icon="payments"
      icon-variant="primary"
      icon-size="md"
    />

    <!-- Step 1: Income data -->
    <div v-if="currentStep === 1" class="income-form__content">
      <Form :schema="formSchema" :initial-data="initialData" @submit="handleSubmit">
        <template #actions>
          <div class="income-form__actions">
            <Button type="button" variant="ghost" size="sm" @click.stop="close">Cancelar</Button>
            <Button type="submit" variant="primary" size="sm">
              {{ isEditMode ? 'Actualizar' : showSavingsPlanStep ? 'Siguiente' : 'Guardar' }}
            </Button>
          </div>
        </template>
      </Form>
    </div>

    <!-- Step 2: Savings plan -->
    <div v-else class="income-form__step2">
      <div class="income-form__step2-question">
        <span class="income-form__step2-label">¿Generar plan de ahorro?</span>
        <div class="income-form__toggle">
          <button
            class="income-form__toggle-btn"
            :class="{ 'income-form__toggle-btn--active': createSavingsPlan }"
            type="button"
            @click="createSavingsPlan = true"
          >
            Sí
          </button>
          <button
            class="income-form__toggle-btn"
            :class="{ 'income-form__toggle-btn--active': !createSavingsPlan }"
            type="button"
            @click="createSavingsPlan = false"
          >
            No
          </button>
        </div>
      </div>

      <div v-if="createSavingsPlan" class="income-form__savings-preview">
        <Icon name="savings" class-name="income-form__savings-icon" />
        <p class="income-form__savings-text">
          Se apartarán
          <strong>{{ formatCurrency(savingsAmount, currency) }}</strong>
          ({{ budgetSavingsPercentage }}%) automáticamente para tu plan de ahorro.
        </p>
      </div>

      <div class="income-form__actions">
        <Button type="button" variant="ghost" size="sm" @click="goBack">Atrás</Button>
        <Button type="button" variant="primary" size="sm" @click="handleConfirmStep2">
          Confirmar
        </Button>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .income-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .income-form__content {
    @apply w-full;
  }

  .income-form__step2 {
    @apply flex flex-col gap-6;
  }

  .income-form__step2-question {
    @apply flex items-center justify-between gap-4;
  }

  .income-form__step2-label {
    @apply text-sm font-semibold text-neutral-700;
  }

  .income-form__toggle {
    @apply flex overflow-hidden rounded-lg border border-neutral-200;
  }

  .income-form__toggle-btn {
    @apply px-4 py-1.5 text-sm font-medium text-neutral-500 transition-colors;
  }

  .income-form__toggle-btn--active {
    @apply bg-primary-500 text-white;
  }

  .income-form__savings-preview {
    @apply flex items-start gap-3 rounded-lg bg-primary-50 p-4;
  }

  .income-form__savings-icon {
    @apply mt-0.5 shrink-0 text-primary-600;
  }

  .income-form__savings-text {
    @apply text-sm text-primary-700;
  }

  .income-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
