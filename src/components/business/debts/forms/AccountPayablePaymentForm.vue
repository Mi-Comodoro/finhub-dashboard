<script setup lang="ts">
  import Form from '@/components/organisms/forms/Form.vue'
  import { useAccountsPayableApplication } from '@/composables/application/useAccountsPayableApplication'
  import { useBudgetActions } from '@/composables/application/useBudgetActions'
  import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
  import { useTransactionApplication } from '@/composables/application/useTransactionApplication'
  import { useCommon } from '@/composables/useCommon'
  import { useFeedback } from '@/composables/useFeedback'
  import { useFinancesStore } from '@/stores/finances.store'
  import { formatCurrency } from '@/utils/currency'
  import type { AccountPayable } from '~/types/accounts-payable.types'

  import { paymentFieldsSchema } from './schema/account-payable.fields.schema'

  const props = defineProps<{
    account: AccountPayable | null
  }>()

  const emit = defineEmits<{ close: [] }>()

  const { registerPayment, currency } = useAccountsPayableApplication()
  const { createTransaction } = useTransactionApplication()
  const { fetchCategories, categories } = useCategoryApplication()
  const { currentBudget } = useCommon()
  const { fetchCurrentBudget } = useBudgetActions()
  const financesStore = useFinancesStore()
  const { success: successToast, error: errorToast } = useFeedback()

  const isSubmitting = ref(false)

  const expenseCategoryOptions = computed(() =>
    categories.value
      .filter(c => c.isSelectable && c.type === 'expense')
      .map(c => ({ label: c.name, value: c.id }))
  )

  const formSchema = computed(() => paymentFieldsSchema(expenseCategoryOptions.value))

  const formInitialData = computed(() => ({
    amount: 0,
    paymentDate: new Date(),
    categoryId: '',
    notes: ''
  }))

  const toDateString = (val: unknown): string => {
    if (val instanceof Date) return val.toISOString().split('T')[0]
    return String(val)
  }

  onMounted(async () => {
    await Promise.all([
      fetchCategories(),
      currentBudget.value ? Promise.resolve() : fetchCurrentBudget(financesStore.profile?.id ?? '')
    ])
  })

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!props.account || isSubmitting.value) return
    isSubmitting.value = true
    try {
      const paymentDate = toDateString(data.paymentDate)
      const dto = {
        amount: Number(data.amount),
        paymentDate,
        notes: data.notes ? String(data.notes) : undefined
      }

      const { success } = await registerPayment(props.account.id, dto)
      if (!success) {
        errorToast('Error', 'No se pudo registrar el pago.')
        return
      }

      let expenseCreated = false
      if (currentBudget.value?.id) {
        const { success: txSuccess } = await createTransaction({
          type: 'expense',
          amount: Number(data.amount),
          transactionDate: paymentDate,
          categoryId: data.categoryId ? String(data.categoryId) : undefined,
          description: data.notes ? String(data.notes) : `Pago: ${props.account.name}`,
          source: 'manual',
          budgetId: currentBudget.value.id
        })
        expenseCreated = txSuccess
        if (!txSuccess) {
          errorToast(
            'Advertencia',
            'El pago fue registrado pero no se pudo crear el gasto en el presupuesto.'
          )
        }
      }

      if (expenseCreated || !currentBudget.value?.id) {
        successToast(
          'Pago registrado',
          expenseCreated
            ? 'El pago fue registrado y se creó un gasto en el presupuesto.'
            : 'El pago fue registrado. Sin presupuesto activo, no se creó gasto.'
        )
      }
      emit('close')
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<template>
  <div class="payment-form">
    <CardInfo
      title="Registrar pago"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      :sub-title="
        account
          ? `Balance actual: ${formatCurrency(account.currentBalance, currency)}`
          : 'Registra un pago realizado.'
      "
      sub-title-size="xs"
      sub-title-color="muted"
      icon="payments"
      icon-size="md"
      icon-variant="primary"
    />

    <div v-if="currentBudget" class="payment-form__budget-info">
      <span class="material-symbols-outlined payment-form__budget-icon">account_balance</span>
      <Text size="xs" color="muted">Se registrará como gasto en el presupuesto activo</Text>
    </div>

    <Form :schema="formSchema" :model-value="formInitialData" @submit="handleSubmit">
      <template #actions>
        <div class="payment-form__actions">
          <Button type="button" variant="ghost" size="sm" @click="emit('close')">Cancelar</Button>
          <Button type="submit" variant="primary" size="sm" :loading="isSubmitting">
            Registrar pago
          </Button>
        </div>
      </template>
    </Form>
  </div>
</template>

<style scoped lang="postcss">
  .payment-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .payment-form__budget-info {
    @apply flex items-center gap-2 rounded-lg bg-danger-50 px-3 py-2;
  }

  .payment-form__budget-icon {
    @apply text-sm text-danger-600;
  }

  .payment-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
