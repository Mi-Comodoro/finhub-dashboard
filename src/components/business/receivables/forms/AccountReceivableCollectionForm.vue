<script setup lang="ts">
  import { computed } from 'vue'

  import { Form } from '@/components/organisms/forms'
  import { useAccountsReceivableApplication } from '@/composables/application/useAccountsReceivableApplication'
  import type { AccountReceivable, RegisterCollectionDto } from '@/types/accounts-receivable.types'
  import { formatCurrency } from '@/utils/currency'

  import { collectionFieldsSchema } from './schema/collection.fields.schema'

  const props = defineProps<{
    account: AccountReceivable
  }>()

  const emit = defineEmits(['onClose'])
  const close = () => emit('onClose')

  const { registerCollection, currency } = useAccountsReceivableApplication()
  const formSchema = computed(() => collectionFieldsSchema())

  const today = new Date().toISOString().split('T')[0]
  const initialData = { collectionDate: today }

  const handleSubmit = async (data: Record<string, unknown>) => {
    const dto = data as unknown as RegisterCollectionDto
    const { success } = await registerCollection(props.account.id, dto)
    if (success) close()
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

    <Form :schema="formSchema" :initial-data="initialData" @submit="handleSubmit">
      <template #actions>
        <div class="collection-form__actions">
          <Button type="button" variant="ghost" size="sm" @click.stop="close">Cancelar</Button>
          <Button type="submit" variant="primary" size="sm">Registrar</Button>
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
  }

  .collection-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
