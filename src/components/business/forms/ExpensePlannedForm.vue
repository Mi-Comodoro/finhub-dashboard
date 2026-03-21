<script setup lang="ts">
  import { Form } from '@/components/organisms/forms'
  import { useCategories } from '@/composables/useCategories'
  import { useExpense } from '@/composables/useExpense'
  import { useCategoryStore } from '@/stores/categories.store'
  import type { ExpenseData } from '~/types/domain'

  import { expensedPlannedFieldsSchema } from './schema/fields.schema'

  const { fetchCategories } = useCategories()
  const categoryStore = useCategoryStore()

  const props = defineProps<{ budgetId: string }>()
  onMounted(async () => {
    await fetchCategories()
  })
  const selectOptions = computed(() =>
    categoryStore.categories.map(item => ({
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

  const { addExpensed } = useExpense()
  const handleSubmit = async (data: ExpenseData) => {
    try {
      const buildData = {
        ...data,
        budgetId: props.budgetId,
        status: 'PLANNED'
      }
      await addExpensed(buildData)
      emit('onClose')
    } catch (error) {
      console.error('Error completo:', error)
    }
  }
</script>
<template>
  <div class="flex h-full w-full flex-col gap-6">
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

    <div class="w-full">
      <Form :schema="formSchema" @submit="handleSubmit">
        <template #actions>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="ghost" @click.stop="close">Cancelar</Button>
            <Button type="submit" variant="primary">Guardar</Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>
<style lang="postcss" scoped></style>
