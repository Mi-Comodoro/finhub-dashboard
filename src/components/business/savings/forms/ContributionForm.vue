<script setup lang="ts">
  import { Button } from '@/components/atoms'
  import { CardInfo } from '@/components/molecules'
  import { Form } from '@/components/organisms'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'

  import { contributionFieldsSchema } from './schema/contribution.fields.schema'

  interface ContributionFormProps {
    goalId?: string
  }

  const props = withDefaults(defineProps<ContributionFormProps>(), {
    goalId: ''
  })
  const emit = defineEmits(['onClose'])

  const { addContribution } = useGoalsApplication()

  const formSchema = contributionFieldsSchema()

  const initialData = {
    amount: '',
    date: new Date(),
    note: ''
  }

  const close = () => {
    emit('onClose')
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!props.goalId) {
      console.warn('[ContributionForm] goalId is required')
      return
    }

    try {
      const rawDate = data.date as Date | string
      const { success } = await addContribution(props.goalId, {
        amount: Number(data.amount) || 0,
        date: (rawDate instanceof Date ? rawDate : new Date(rawDate)).toISOString(),
        note: (data.note as string) || undefined
      })
      if (success) emit('onClose')
    } catch (error) {
      console.error('Error creating contribution:', error)
    }
  }
</script>

<template>
  <div class="contribution-form">
    <CardInfo
      title="Registrar Aporte"
      sub-title="Agrega un aporte a tu meta de ahorro."
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title-size="xs"
      sub-title-color="muted"
      icon="savings"
      icon-variant="primary"
      icon-size="md"
    />

    <Form :schema="formSchema" :model-value="initialData" @submit="handleSubmit">
      <template #actions>
        <div class="contribution-form__actions">
          <Button type="button" variant="ghost" size="sm" @click.stop="close">Cancelar</Button>
          <Button type="submit" variant="primary" size="sm">Guardar</Button>
        </div>
      </template>
    </Form>
  </div>
</template>

<style lang="postcss" scoped>
  .contribution-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .contribution-form__actions {
    @apply flex items-center justify-end gap-3 pt-4;
  }
</style>
