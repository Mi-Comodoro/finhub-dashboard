<script setup lang="ts">
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import Form from '@/components/organisms/forms/Form.vue'
  import { useBillsApplication } from '@/composables/application/useBillsApplication'
  import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
  import type { Bill, CreateBillDto } from '~/types/bills.types'

  import { billFieldsSchema } from './schema/bill.fields.schema'

  const { fetchCategories, categories } = useCategoryApplication()
  const { createBill, updateBill } = useBillsApplication()

  const props = withDefaults(
    defineProps<{
      bill?: Bill | null
      mode?: 'create' | 'edit'
    }>(),
    {
      bill: null,
      mode: 'create'
    }
  )

  const emit = defineEmits<{
    success: []
    close: []
  }>()

  const isEditMode = computed(() => props.mode === 'edit' && !!props.bill)

  onMounted(fetchCategories)

  const categoryOptions = computed(() =>
    categories.value.map(c => ({
      label: c.isSelectable ? c.name : ` ${c.name.toUpperCase()}`,
      value: c.id,
      disabled: !c.isSelectable
    }))
  )

  const formSchema = computed(() => billFieldsSchema(categoryOptions.value))

  const initialData = computed(() => {
    if (!props.bill) return {}
    return {
      name: props.bill.name,
      categoryId: props.bill.categoryId,
      expectedAmount: props.bill.expectedAmount,
      billingDay: props.bill.billingDay,
      frequency: props.bill.frequency
    }
  })

  const handleSubmit = async (data: Record<string, unknown>) => {
    const dto: CreateBillDto = {
      name: data.name as string,
      categoryId: data.categoryId as string,
      expectedAmount: Number(data.expectedAmount),
      billingDay: Number(data.billingDay),
      frequency: data.frequency as 'monthly' | 'yearly'
    }

    const result =
      isEditMode.value && props.bill ? await updateBill(props.bill.id, dto) : await createBill(dto)

    if (result.success) emit('success')
  }
</script>

<template>
  <div class="bill-form">
    <CardInfo
      :title="isEditMode ? 'Editar Factura' : 'Nueva Factura'"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      :sub-title="
        isEditMode ? 'Actualiza los datos de la factura.' : 'Registra una factura recurrente.'
      "
      sub-title-size="xs"
      sub-title-color="muted"
      icon="receipt_long"
      icon-variant="primary"
      icon-size="md"
    />

    <Form :schema="formSchema" :initial-data="initialData" @submit="handleSubmit">
      <template #actions>
        <div class="bill-form__actions">
          <Button type="button" variant="ghost" size="sm" @click.stop="emit('close')">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {{ isEditMode ? 'Actualizar' : 'Guardar' }}
          </Button>
        </div>
      </template>
    </Form>
  </div>
</template>

<style scoped lang="postcss">
  .bill-form {
    @apply flex flex-col gap-4 p-1;
  }

  .bill-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
