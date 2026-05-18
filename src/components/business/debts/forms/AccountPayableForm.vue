<script setup lang="ts">
  import { Form } from '@/components/organisms/forms'
  import type { AccountPayable, CreateAccountPayableDto } from '~/types/accounts-payable.types'

  import { accountPayableFieldsSchema } from './schema/account-payable.fields.schema'

  const props = withDefaults(
    defineProps<{
      mode?: 'create' | 'edit'
      initialData?: AccountPayable | null
      isLoading?: boolean
    }>(),
    {
      mode: 'create',
      initialData: null,
      isLoading: false
    }
  )

  const emit = defineEmits<{
    success: [dto: CreateAccountPayableDto]
    close: []
  }>()

  const formSchema = accountPayableFieldsSchema()

  const formInitialData = computed(() => {
    if (props.mode === 'edit' && props.initialData) {
      return {
        name: props.initialData.name,
        type: props.initialData.type,
        originalAmount: props.initialData.originalAmount,
        minimumPayment: props.initialData.minimumPayment ?? 0,
        interestRate: props.initialData.interestRate ?? null,
        nextPaymentDate: props.initialData.nextPaymentDate
          ? new Date(props.initialData.nextPaymentDate)
          : null,
        notes: ''
      }
    }
    return {
      name: '',
      type: 'loan',
      originalAmount: 0,
      minimumPayment: 0,
      interestRate: null,
      nextPaymentDate: null,
      notes: ''
    }
  })

  const handleSubmit = (data: Record<string, unknown>) => {
    const dto: CreateAccountPayableDto = {
      name: data.name as string,
      type: data.type as CreateAccountPayableDto['type'],
      originalAmount: data.originalAmount as number,
      minimumPayment: (data.minimumPayment as number) || undefined,
      interestRate: data.interestRate ? Number(data.interestRate) : undefined,
      nextPaymentDate: data.nextPaymentDate
        ? new Date(data.nextPaymentDate as string).toISOString().split('T')[0]
        : undefined,
      notes: (data.notes as string) || undefined
    }
    emit('success', dto)
  }
</script>

<template>
  <div class="account-payable-form">
    <CardInfo
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      :title="mode === 'edit' ? 'Editar deuda' : 'Nueva deuda'"
      sub-title="Registra un compromiso financiero para hacer seguimiento."
      sub-title-size="xs"
      sub-title-color="muted"
      icon="credit_card"
      icon-size="md"
      icon-variant="primary"
    />

    <Form :schema="formSchema" :model-value="formInitialData" @submit="handleSubmit">
      <template #actions>
        <div class="account-payable-form__actions">
          <Button type="button" variant="ghost" size="sm" @click="emit('close')">Cancelar</Button>
          <Button type="submit" variant="primary" size="sm" :loading="isLoading">
            {{ mode === 'edit' ? 'Actualizar' : 'Guardar' }}
          </Button>
        </div>
      </template>
    </Form>
  </div>
</template>

<style scoped lang="postcss">
  .account-payable-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .account-payable-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
