<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  import { Form } from '@/components/organisms/forms'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import { useTransactionApplication } from '@/composables/application/useTransactionApplication'
  import { useCommon } from '@/composables/useCommon'
  import type { AccountData, GoalsData } from '~/types/api'

  import { quickTransactionFieldsSchema } from './schema/quick-transaction.fields.schema'

  interface QuickTransactionFormProps {
    goals?: GoalsData[]
    accounts?: AccountData[]
  }

  const props = withDefaults(defineProps<QuickTransactionFormProps>(), {
    goals: () => [],
    accounts: () => []
  })

  const emit = defineEmits(['onClose'])

  const { createTransaction } = useTransactionApplication()
  const { addContribution } = useGoalsApplication()
  const { currentBudget } = useCommon()

  const selectedType = ref<string>('')
  const formKey = ref(0)

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

  const formSchema = computed(() =>
    quickTransactionFieldsSchema(goalOptions.value, accountOptions.value)
  )

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

  const formData = ref<Record<string, unknown>>({
    type: '',
    amount: 0,
    date: new Date(),
    description: '',
    goalId: '',
    contributionType: 'external',
    accountId: ''
  })

  watch(
    () => formData.value['type'],
    newType => {
      selectedType.value = String(newType ?? '')
    }
  )

  const handleFormUpdate = (data: Record<string, unknown>) => {
    formData.value = data
  }

  const isSubmitting = ref(false)

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!data['amount']) {
      console.warn('[QuickTransactionForm] amount is required')
      return
    }
    if (isSubmitting.value) return
    isSubmitting.value = true

    try {
      const type = String(data['type'] ?? '')
      const amount = Number(data['amount'] ?? 0)
      const date = data['date'] as Date | string
      const description = data['description'] ? String(data['description']) : undefined

      if (type === 'saving') {
        const goalId = String(data['goalId'] ?? '')
        if (!goalId) {
          console.warn('[QuickTransactionForm] goalId is required for saving type')
          return
        }

        const contributionType = String(data['contributionType'] ?? 'external')
        const accountId = data['accountId'] ? String(data['accountId']) : undefined

        const { success } = await addContribution(goalId, {
          amount,
          date: date instanceof Date ? date : new Date(date),
          notes: description,
          contributionType,
          accountId
        })

        if (success) emit('onClose')
      } else {
        const budgetId = currentBudget.value?.id ?? ''

        const { success } = await createTransaction({
          type: type as 'income' | 'expense',
          amount,
          transactionDate: date,
          description,
          source: 'manual',
          budgetId
        })

        if (success) emit('onClose')
      }
    } finally {
      isSubmitting.value = false
    }
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

    <div class="quick-transaction-form__content">
      <Form
        :key="formKey"
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
            <Button type="submit" variant="primary" size="sm" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
            </Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .quick-transaction-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .quick-transaction-form__content {
    @apply w-full;
  }

  .quick-transaction-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
