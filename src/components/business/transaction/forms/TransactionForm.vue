<script setup lang="ts">
  import { Form } from '@/components/organisms/forms'
  import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
  import { useTransactionApplication } from '@/composables/application/useTransactionApplication'
  import type { TransactionData } from '@/composables/api/useTransactionApi'

  import { transactionFieldsSchema } from './schema/transaction.fields.schema'

  const { fetchCategories, categories } = useCategoryApplication()
  const { createTransaction, updateTransaction } = useTransactionApplication()

  const props = defineProps<{
    budgetId: string
    transactionId?: string
    initialData?: Partial<TransactionData>
  }>()

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

  const handleSubmit = async (data: TransactionData) => {
    try {
      if (isEditMode.value && props.transactionId) {
        const { success } = await updateTransaction(props.transactionId, data)
        if (success) {
          emit('onClose')
        }
      } else {
        const buildData = {
          ...data,
          budgetId: props.budgetId
        }
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
      title-size="2xl"
      weight="extrabold"
      level="h1"
      color="black"
      :sub-title="
        isEditMode
          ? 'Actualiza la información de tu transacción.'
          : 'Registra manualmente una transacción no planificada.'
      "
      sub-title-size="sm"
      sub-title-color="muted"
      :icon="isEditMode ? 'edit' : 'add_circle'"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="transaction-form__content">
      <Form :schema="formSchema" :initial-data="initialData" @submit="handleSubmit">
        <template #actions>
          <div class="transaction-form__actions">
            <Button type="button" variant="ghost" @click.stop="close">Cancelar</Button>
            <Button type="submit" variant="primary">
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
