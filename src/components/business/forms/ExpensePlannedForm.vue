<script setup lang="ts">
  import { Form } from '@/components/organisms/forms'
  import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
  import { useExpenseApplication } from '@/composables/application/useExpenseApplication'
  import type { ExpenseData } from '~/types/domain'

  import { expensedPlannedFieldsSchema } from './schema/expense.fields.schema'

  const { fetchCategories, categories } = useCategoryApplication()
  const { addExpense } = useExpenseApplication()

  const props = defineProps<{ budgetId: string }>()
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

  const formSchema = computed(() => expensedPlannedFieldsSchema(selectOptions.value))
  const emit = defineEmits(['onClose'])
  const close = () => {
    emit('onClose')
  }

  const handleSubmit = async (data: ExpenseData) => {
    try {
      const buildData = {
        ...data,
        budgetId: props.budgetId,
        status: 'PLANNED'
      }
      const { success } = await addExpense(buildData)
      if (success) {
        emit('onClose')
      }
    } catch (error) {
      console.error('Error completo:', error)
    }
  }
</script>
<template>
  <div class="expense-planned-form">
    <CardInfo
      title="Agregar Gasto Planificado"
      title-size="2xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title="Planifica tus gastos futuros para mantener tu presupuesto bajo control."
      sub-title-size="sm"
      sub-title-color="muted"
      icon="event"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="expense-planned-form__content">
      <Form :schema="formSchema" @submit="handleSubmit">
        <template #actions>
          <div class="expense-planned-form__actions">
            <Button type="button" variant="ghost" @click.stop="close">Cancelar</Button>
            <Button type="submit" variant="primary">Guardar</Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.expense-planned-form {
  @apply flex h-full w-full flex-col gap-6;
}

.expense-planned-form__content {
  @apply w-full;
}

.expense-planned-form__actions {
  @apply flex justify-end gap-2;
}
</style>
