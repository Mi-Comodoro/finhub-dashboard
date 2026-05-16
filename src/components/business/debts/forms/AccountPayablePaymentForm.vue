<script setup lang="ts">
  import { Form } from '@/components/organisms/forms'
  import { useFinancesStore } from '@/stores/finances.store'
  import type { Currency } from '@/utils/currency'
  import { formatCurrency } from '@/utils/currency'
  import type { AccountPayable, RegisterPaymentDto } from '~/types/accounts-payable.types'

  import { paymentFieldsSchema } from './schema/account-payable.fields.schema'

  defineProps<{
    account: AccountPayable | null
  }>()

  const emit = defineEmits<{
    success: [dto: RegisterPaymentDto]
    close: []
  }>()

  const financesStore = useFinancesStore()
  const currency = computed(() => financesStore.defaultCurrency as Currency)

  const formSchema = paymentFieldsSchema()

  const today = new Date().toISOString().split('T')[0]
  const formInitialData = computed(() => ({
    amount: 0,
    paymentDate: new Date(today),
    notes: ''
  }))

  const handleSubmit = (data: Record<string, unknown>) => {
    const dto: RegisterPaymentDto = {
      amount: data.amount as number,
      paymentDate: new Date(data.paymentDate as string).toISOString().split('T')[0],
      notes: (data.notes as string) || undefined
    }
    emit('success', dto)
  }
</script>

<template>
  <div class="payment-form">
    <CardInfo
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      title="Registrar pago"
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

    <Form :schema="formSchema" :model-value="formInitialData" @submit="handleSubmit">
      <template #actions>
        <div class="payment-form__actions">
          <Button type="button" variant="ghost" size="sm" @click="emit('close')">Cancelar</Button>
          <Button type="submit" variant="primary" size="sm">Registrar pago</Button>
        </div>
      </template>
    </Form>
  </div>
</template>

<style scoped lang="postcss">
  .payment-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .payment-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
