<script setup lang="ts">
  import Form from '@/components/organisms/forms/Form.vue'
  import type { TransactionData } from '@/composables/api/useTransactionApi'
  import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
  import { useTransactionApplication } from '@/composables/application/useTransactionApplication'

  import { transactionFieldsSchema } from './schema/transaction.fields.schema'

  const { fetchCategories, categories } = useCategoryApplication()
  const { createTransaction, updateTransaction } = useTransactionApplication()

  const props = withDefaults(
    defineProps<{
      budgetId?: string
      transactionId?: string
      initialData?: Partial<TransactionData>
    }>(),
    {
      budgetId: '',
      transactionId: undefined,
      initialData: undefined
    }
  )

  const isEditMode = computed(() => !!props.transactionId)

  onMounted(async () => {
    await fetchCategories()
  })

  const selectOptions = computed(() =>
    categories.value.map(item => ({
      label: item.isSelectable ? `${item.name}` : ` ${item.name.toUpperCase()}`,
      value: item.id,
      disabled: !item.isSelectable
    }))
  )

  const formSchema = computed(() => transactionFieldsSchema(selectOptions.value))
  const emit = defineEmits(['onClose'])
  const close = () => {
    emit('onClose')
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!isEditMode.value && !props.budgetId) {
      console.warn('[TransactionForm] budgetId is required but was not provided')
      return
    }
    try {
      if (isEditMode.value && props.transactionId) {
        const { type: _type, ...updateData } = data
        if (!updateData['categoryId']) delete updateData['categoryId']
        const { success } = await updateTransaction(props.transactionId, updateData)
        if (success) {
          emit('onClose')
        }
      } else {
        const buildData = { ...data, budgetId: props.budgetId }
        const { success } = await createTransaction(buildData)
        if (success) {
          emit('onClose')
        }
      }
    } catch (error) {
      console.error('Error completo:', error)
    }
  }
</script>

<template>
  <div class="transaction-form">
    <CardInfo
      :title="isEditMode ? 'Editar Transacción' : 'Nueva Transacción'"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      :sub-title="
        isEditMode
          ? 'Modifica los datos de esta transacción.'
          : 'Registra un movimiento financiero manual.'
      "
      sub-title-size="xs"
      sub-title-color="muted"
      icon="receipt_long"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="transaction-form__content">
      <Form :schema="formSchema" :model-value="initialData" @submit="handleSubmit">
        <template #actions>
          <div class="transaction-form__actions">
            <Button type="button" variant="ghost" size="sm" @click.stop="close">Cancelar</Button>
            <Button type="submit" variant="primary" size="sm">
              {{ isEditMode ? 'Actualizar' : 'Guardar' }}
            </Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .transaction-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .transaction-form__content {
    @apply w-full;
  }

  .transaction-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
