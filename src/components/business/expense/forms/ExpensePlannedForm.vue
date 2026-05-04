<script setup lang="ts">
  import { Form } from '@/components/organisms/forms'
  import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
  import { useExpenseApplication } from '@/composables/application/useExpenseApplication'
  import type { ExpenseData } from '~/types/domain'

  import { expensedPlannedFieldsSchema } from './schema/expense.fields.schema'

  const { fetchCategories, categories } = useCategoryApplication()
  const { addExpense, updateExpense } = useExpenseApplication()

  const props = withDefaults(
    defineProps<{
      budgetId?: string
      expenseId?: string
      initialData?: Partial<ExpenseData>
    }>(),
    {
      budgetId: '',
      expenseId: undefined,
      initialData: undefined
    }
  )

  const isEditMode = computed(() => !!props.expenseId)

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
    if (!props.budgetId) {
      console.warn('[ExpensePlannedForm] budgetId is required but was not provided')
      return
    }
    try {
      if (isEditMode.value && props.expenseId) {
        const { success } = await updateExpense(props.expenseId, data)
        if (success) {
          emit('onClose')
        }
      } else {
        const buildData = {
          ...data,
          budgetId: props.budgetId,
          status: 'PLANNED'
        }
        const { success } = await addExpense(buildData)
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
  <div class="expense-planned-form">
    <CardInfo
      :title="isEditMode ? 'Editar Gasto' : 'Registrar Gasto'"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      :sub-title="
        isEditMode
          ? 'Actualiza los detalles del gasto.'
          : 'Registra un gasto dentro de tu presupuesto.'
      "
      sub-title-size="xs"
      sub-title-color="muted"
      icon="receipt_long"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="expense-planned-form__content">
      <Form :schema="formSchema" :initial-data="initialData" @submit="handleSubmit">
        <template #actions>
          <div class="expense-planned-form__actions">
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
