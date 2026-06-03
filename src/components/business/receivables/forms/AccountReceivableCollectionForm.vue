<script setup lang="ts">
  import Form from '@/components/organisms/forms/Form.vue'
  import { useAccountsReceivableApplication } from '@/composables/application/useAccountsReceivableApplication'
  import { useBudgetActions } from '@/composables/application/useBudgetActions'
  import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
  import { useTransactionApplication } from '@/composables/application/useTransactionApplication'
  import { useCommon } from '@/composables/useCommon'
  import { useFeedback } from '@/composables/useFeedBack'
  import { useFinancesStore } from '@/stores/finances.store'
  import type { AccountReceivable } from '@/types/accounts-receivable.types'
  import { formatCurrency } from '@/utils/currency'

  import { collectionFieldsSchema } from './schema/collection.fields.schema'

  const props = defineProps<{
    account: AccountReceivable
  }>()

  const emit = defineEmits(['onClose'])
  const close = () => emit('onClose')

  const { registerCollection, currency } = useAccountsReceivableApplication()
  const { createTransaction } = useTransactionApplication()
  const { fetchCategories, categories } = useCategoryApplication()
  const { currentBudget } = useCommon()
  const { fetchCurrentBudget } = useBudgetActions()
  const financesStore = useFinancesStore()
  const { success: successToast, error: errorToast } = useFeedback()
  const isSubmitting = ref(false)

  const incomeCategoryOptions = computed(() =>
    categories.value
      .filter(c => c.isSelectable && c.type === 'income')
      .map(c => ({ label: c.name, value: c.id }))
  )

  const formSchema = computed(() => collectionFieldsSchema(incomeCategoryOptions.value))

  const initialData = { collectionDate: new Date(), categoryId: '' }

  const toDateString = (val: unknown): string => {
    if (val instanceof Date) return val.toISOString().split('T')[0] ?? ''
    return String(val)
  }

  onMounted(async () => {
    await Promise.all([
      fetchCategories(),
      currentBudget.value ? Promise.resolve() : fetchCurrentBudget(financesStore.profile?.id ?? '')
    ])
  })

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
      const collectionDate = toDateString(data.collectionDate)
      const dto = {
        amount: Number(data.amount),
        collectionDate,
        notes: data.notes ? String(data.notes) : undefined
      }
      const { success } = await registerCollection(props.account.id, dto)
      if (!success) {
        errorToast('Error', 'No se pudo registrar el cobro.')
        return
      }

      let incomeCreated = false
      if (currentBudget.value?.id) {
        const { success: txSuccess } = await createTransaction({
          type: 'income',
          amount: Number(data.amount),
          transactionDate: collectionDate,
          categoryId: data.categoryId ? String(data.categoryId) : undefined,
          description: data.notes ? String(data.notes) : `Cobro: ${props.account.name}`,
          source: 'manual',
          budgetId: currentBudget.value.id
        })
        incomeCreated = txSuccess
        if (!txSuccess) {
          errorToast(
            'Advertencia',
            'El cobro fue registrado pero no se pudo crear el ingreso en el presupuesto.'
          )
        }
      }

      if (incomeCreated || !currentBudget.value?.id) {
        successToast(
          'Cobro registrado',
          incomeCreated
            ? 'El cobro fue registrado y se creó un ingreso en el presupuesto.'
            : 'El cobro fue registrado. Sin presupuesto activo, no se creó ingreso.'
        )
      }
      close()
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<template>
  <div class="collection-form">
    <CardInfo
      title="Registrar Cobro"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      :sub-title="`Registra un pago recibido para: ${account.name}`"
      sub-title-size="xs"
      sub-title-color="muted"
      icon="payments"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="collection-form__balance">
      <Text size="xs" color="muted">Saldo pendiente</Text>
      <Heading level="h3" size="xl" weight="bold">
        {{ formatCurrency(account.currentBalance, currency) }}
      </Heading>
    </div>

    <div v-if="currentBudget" class="collection-form__budget-info">
      <span class="material-symbols-outlined collection-form__budget-icon">account_balance</span>
      <Text size="xs" color="muted">Se registrará como ingreso en el presupuesto activo</Text>
    </div>

    <Form :schema="formSchema" :model-value="initialData" @submit="handleSubmit">
      <template #actions>
        <div class="collection-form__actions">
          <Button type="button" variant="ghost" size="sm" @click.stop="close">Cancelar</Button>
          <Button type="submit" variant="primary" size="sm" :loading="isSubmitting">
            Registrar
          </Button>
        </div>
      </template>
    </Form>
  </div>
</template>

<style scoped lang="postcss">
  .collection-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .collection-form__balance {
    @apply rounded-lg bg-primary-50 p-4;
    @apply dark:border dark:border-primary-800 dark:bg-primary-900/30;
  }

  .collection-form__budget-info {
    @apply flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2;
    @apply dark:border dark:border-primary-800 dark:bg-primary-900/30;
  }

  .collection-form__budget-icon {
    @apply text-sm text-primary-600 dark:text-primary-400;
  }

  .collection-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
