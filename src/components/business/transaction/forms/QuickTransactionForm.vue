<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'

  import Icon from '@/components/atoms/icons/Icon.vue'
  import Form from '@/components/organisms/forms/Form.vue'
  import { useToast } from '@/components/organisms/toast/useToast'
  import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import { useTransactionApplication } from '@/composables/application/useTransactionApplication'
  import { useCommon } from '@/composables/useCommon'
  import type { Currency } from '@/utils/currency'
  import { formatCurrency } from '@/utils/currency'
  import type { AccountData, GoalsData } from '~/types/api'

  import { quickTransactionFieldsSchema } from './schema/quick-transaction.fields.schema'

  interface QuickTransactionFormProps {
    goals?: GoalsData[]
    accounts?: AccountData[]
    budgetSavingsPercentage?: number
    currency?: Currency
  }

  const props = withDefaults(defineProps<QuickTransactionFormProps>(), {
    goals: () => [],
    accounts: () => [],
    budgetSavingsPercentage: 20,
    currency: 'COP' as Currency
  })

  const emit = defineEmits(['onClose'])

  const { createTransaction, createTransactionWithSavingsPlan } = useTransactionApplication()
  const { addContribution } = useGoalsApplication()
  const { fetchCategories, categories } = useCategoryApplication()
  const { currentBudget } = useCommon()
  const { show } = useToast()

  const selectedType = ref<string>('')
  const currentStep = ref(1)
  const pendingFormData = ref<Record<string, unknown> | null>(null)
  const createSavingsPlan = ref(true)
  const isSubmitting = ref(false)

  const goalOptions = computed(() =>
    (props.goals ?? []).map(goal => ({
      label: goal.name,
      value: goal.id,
      disabled: !goal.isActive
    }))
  )

  const accountOptions = computed(() =>
    (props.accounts ?? []).map(account => ({
      label: account.name,
      value: account.id,
      disabled: !account.isActive
    }))
  )

  const incomeCategoryOptions = computed(() =>
    (categories.value ?? [])
      .filter(c => c.isSelectable && c.type === 'income')
      .map(c => ({ label: c.name, value: c.id }))
  )

  const expenseCategoryOptions = computed(() =>
    (categories.value ?? [])
      .filter(c => c.isSelectable && c.type === 'expense')
      .map(c => ({ label: c.name, value: c.id }))
  )

  const filteredCategoryOptions = computed(() => {
    if (selectedType.value === 'income') return incomeCategoryOptions.value
    if (selectedType.value === 'expense') return expenseCategoryOptions.value
    return []
  })

  const formSchema = computed(() =>
    quickTransactionFieldsSchema(
      goalOptions.value,
      accountOptions.value,
      filteredCategoryOptions.value
    )
  )

  onMounted(() => {
    if (!categories.value?.length) fetchCategories()
  })

  const cardTitle = computed(() => {
    if (selectedType.value === 'income') return 'Registrar Ingreso'
    if (selectedType.value === 'expense') return 'Registrar Gasto'
    if (selectedType.value === 'saving') return 'Aporte a Meta'
    return 'Nueva Transacción'
  })

  const cardIcon = computed(() => {
    if (selectedType.value === 'income') return 'payments'
    if (selectedType.value === 'expense') return 'receipt_long'
    if (selectedType.value === 'saving') return 'savings'
    return 'swap_horiz'
  })

  const cardSubTitle = computed(() => {
    if (selectedType.value === 'income') return 'Registra un ingreso recibido.'
    if (selectedType.value === 'expense') return 'Registra un gasto realizado.'
    if (selectedType.value === 'saving') return 'Registra un aporte a tu meta de ahorro.'
    return 'Selecciona el tipo de movimiento a registrar.'
  })

  const formData = ref<Record<string, string | number | boolean | Date | null>>({
    type: '',
    amount: 0,
    date: new Date(),
    categoryId: '',
    description: '',
    goalId: '',
    contributionType: 'external',
    accountId: ''
  })

  watch(
    () => formData.value['type'],
    newType => {
      selectedType.value = String(newType ?? '')
      formData.value = { ...formData.value, categoryId: '' }
    }
  )

  watch(filteredCategoryOptions, newOptions => {
    if (newOptions.length > 0 && !formData.value['categoryId']) {
      formData.value = { ...formData.value, categoryId: newOptions[0].value }
    }
  })

  const savingsAmount = computed(() => {
    const amount = Number(pendingFormData.value?.['amount'] ?? 0)
    return Math.round(amount * ((props.budgetSavingsPercentage ?? 20) / 100))
  })

  const handleFormUpdate = (data: Record<string, string | number | boolean | Date | null>) => {
    formData.value = data
  }

  const toDateString = (date: Date | string | null | undefined): string => {
    if (!date) return new Date().toISOString()
    return date instanceof Date ? date.toISOString() : new Date(date).toISOString()
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!data['amount']) {
      show({
        title: 'Monto requerido',
        description: 'Ingresa un monto para continuar.',
        type: 'error'
      })
      return
    }

    const type = String(data['type'] ?? '')

    // Income: go to step 2 for savings plan decision
    if (type === 'income' && currentStep.value === 1) {
      pendingFormData.value = data
      currentStep.value = 2
      return
    }

    if (isSubmitting.value) return
    isSubmitting.value = true

    try {
      const amount = Number(data['amount'] ?? 0)
      const date = data['date'] as Date | string | null
      const description = data['description'] ? String(data['description']) : undefined

      if (type === 'saving') {
        const goalId = String(data['goalId'] ?? '')
        if (!goalId) {
          show({
            title: 'Meta requerida',
            description: 'Selecciona una meta de ahorro.',
            type: 'error'
          })
          return
        }

        const { success } = await addContribution(goalId, {
          amount,
          date: toDateString(date),
          note: description
        })

        if (success) {
          show({
            title: 'Aporte registrado',
            description: 'El aporte a tu meta se guardó correctamente.',
            type: 'success'
          })
          emit('onClose')
        } else {
          show({
            title: 'Error al guardar',
            description: 'No se pudo registrar el aporte. Inténtalo de nuevo.',
            type: 'error'
          })
        }
      } else {
        const budgetId = currentBudget.value?.id ?? ''
        const categoryId = String(data['categoryId'] ?? '')
        const { success } = await createTransaction({
          type: type as 'income' | 'expense',
          amount,
          transactionDate: toDateString(date),
          description,
          source: 'manual',
          budgetId,
          categoryId
        })

        if (success) {
          show({
            title: type === 'income' ? 'Ingreso registrado' : 'Gasto registrado',
            description:
              type === 'income'
                ? 'El ingreso se guardó correctamente.'
                : 'El gasto se guardó correctamente.',
            type: 'success'
          })
          emit('onClose')
        } else {
          show({
            title: 'Error al guardar',
            description: 'No se pudo registrar el movimiento. Inténtalo de nuevo.',
            type: 'error'
          })
        }
      }
    } finally {
      isSubmitting.value = false
    }
  }

  const handleConfirmStep2 = async () => {
    if (!pendingFormData.value) return
    if (isSubmitting.value) return
    isSubmitting.value = true

    try {
      const data = pendingFormData.value
      const amount = Number(data['amount'] ?? 0)
      const date = data['date'] as Date | string | null
      const description = data['description'] ? String(data['description']) : undefined
      const budgetId = currentBudget.value?.id ?? ''
      const categoryId = data['categoryId'] ? String(data['categoryId']) : undefined

      const transactionPayload = {
        type: 'income' as const,
        amount,
        transactionDate: toDateString(date),
        description,
        source: 'manual',
        budgetId,
        categoryId
      }

      let success = false

      if (createSavingsPlan.value) {
        const result = await createTransactionWithSavingsPlan(
          transactionPayload,
          props.budgetSavingsPercentage ?? 20
        )
        success = result.success
      } else {
        const result = await createTransaction(transactionPayload)
        success = result.success
      }

      if (success) {
        const msg = createSavingsPlan.value
          ? 'Ingreso registrado y plan de ahorro creado correctamente.'
          : 'Ingreso registrado correctamente.'
        show({ title: 'Ingreso registrado', description: msg, type: 'success' })
        emit('onClose')
      } else {
        show({
          title: 'Error al guardar',
          description: 'No se pudo registrar el ingreso. Inténtalo de nuevo.',
          type: 'error'
        })
      }
    } finally {
      isSubmitting.value = false
    }
  }

  const goBack = () => {
    currentStep.value = 1
  }
</script>

<template>
  <div class="quick-transaction-form">
    <CardInfo
      :title="cardTitle"
      :sub-title="cardSubTitle"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title-size="xs"
      sub-title-color="muted"
      :icon="cardIcon"
      icon-size="md"
      icon-variant="primary"
    />

    <!-- Step 1: transaction data -->
    <div v-if="currentStep === 1" class="quick-transaction-form__content">
      <Form
        :schema="formSchema"
        :model-value="formData"
        @update:model-value="handleFormUpdate"
        @submit="handleSubmit"
      >
        <template #actions>
          <div class="quick-transaction-form__actions">
            <Button type="button" variant="ghost" size="sm" @click.stop="emit('onClose')">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {{ selectedType === 'income' ? 'Siguiente' : 'Guardar' }}
            </Button>
          </div>
        </template>
      </Form>
    </div>

    <!-- Step 2: savings plan decision (income only) -->
    <div v-else class="quick-transaction-form__step2">
      <div class="quick-transaction-form__step2-question">
        <span class="quick-transaction-form__step2-label">¿Generar plan de ahorro?</span>
        <div class="quick-transaction-form__toggle">
          <button
            class="quick-transaction-form__toggle-btn"
            :class="{ 'quick-transaction-form__toggle-btn--active': createSavingsPlan }"
            type="button"
            @click="createSavingsPlan = true"
          >
            Sí
          </button>
          <button
            class="quick-transaction-form__toggle-btn"
            :class="{ 'quick-transaction-form__toggle-btn--active': !createSavingsPlan }"
            type="button"
            @click="createSavingsPlan = false"
          >
            No
          </button>
        </div>
      </div>

      <div v-if="createSavingsPlan" class="quick-transaction-form__savings-preview">
        <Icon name="savings" class-name="quick-transaction-form__savings-icon" />
        <p class="quick-transaction-form__savings-text">
          Se apartarán
          <strong>{{ formatCurrency(savingsAmount, currency) }}</strong>
          ({{ budgetSavingsPercentage }}%) automáticamente para tu plan de ahorro.
        </p>
      </div>

      <div class="quick-transaction-form__actions">
        <Button type="button" variant="ghost" size="sm" @click="goBack">Atrás</Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          :disabled="isSubmitting"
          @click="handleConfirmStep2"
        >
          {{ isSubmitting ? 'Guardando...' : 'Confirmar' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .quick-transaction-form {
    @apply flex min-h-0 w-full flex-1 flex-col gap-6;
  }

  .quick-transaction-form__content {
    @apply flex min-h-0 flex-1 flex-col;
  }

  .quick-transaction-form__actions {
    @apply flex justify-end gap-2;
  }

  .quick-transaction-form__step2 {
    @apply flex flex-col gap-6;
  }

  .quick-transaction-form__step2-question {
    @apply flex items-center justify-between gap-4;
  }

  .quick-transaction-form__step2-label {
    @apply text-sm font-semibold text-neutral-700;
  }

  .quick-transaction-form__toggle {
    @apply flex overflow-hidden rounded-lg border border-neutral-200;
  }

  .quick-transaction-form__toggle-btn {
    @apply px-4 py-1.5 text-sm font-medium text-neutral-500 transition-colors;
  }

  .quick-transaction-form__toggle-btn--active {
    @apply bg-primary-900 text-white;
  }

  .quick-transaction-form__savings-preview {
    @apply flex items-start gap-3 rounded-lg bg-primary-50 p-4;
  }

  .quick-transaction-form__savings-icon {
    @apply mt-0.5 shrink-0 text-primary-600;
  }

  .quick-transaction-form__savings-text {
    @apply text-sm text-primary-700;
  }
</style>
