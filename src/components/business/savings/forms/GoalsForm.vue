<script lang="ts" setup>
  import { Form } from '@/components/organisms'
  import { useAccountSavingsApplication } from '@/composables/application/useAccountSavingsApplication'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import type { GoalsData } from '~/types/api'

  import { goalsFieldsSchema, reasonTips } from './schema/goals.fiels.schema'

  const { accounts: accountsData } = useAccountSavingsApplication()
  const { addGoal, error } = useGoalsApplication()

  const emit = defineEmits(['onSuccess', 'onError', 'onClose'])

  const accounts = computed(
    () =>
      accountsData.value?.map(item => ({
        label: item.name,
        value: item.id,
        disabled: !item.isActive
      })) ?? []
  )
  const formSchema = computed(() => goalsFieldsSchema(accounts.value))

  const formKey = ref(0)
  const formData = ref({})

  const currentTip = computed(() => {
    const reason = (formData.value as Record<string, string>).reason
    if (!reason || !reasonTips[reason]) return null
    return reasonTips[reason]
  })

  const handleSubmit = async () => {
    const raw = formData.value as Record<string, unknown>

    const buildData: GoalsData = {
      name: raw.name as string,
      reason: raw.reason as string,
      accountId: raw.accountId as string,
      isActive: true,
      // Explicit check for targetAmount (don't use truthy - 0 is falsy!)
      ...(raw.targetAmount !== undefined && raw.targetAmount !== null && raw.targetAmount !== ''
        ? { targetAmount: Number(raw.targetAmount) }
        : {}),
      // targetDate check
      ...(raw.targetDate
        ? { targetDate: raw.targetDate as Date }
        : {})
    } as GoalsData

    const { success } = await addGoal(buildData)
    formData.value = {}
    formKey.value++

    if (success) {
      emit('onSuccess')
    } else {
      emit('onError', error.value)
    }
  }
</script>

<template>
  <div class="goals-form">
    <CardInfo
      title="Nueva Meta"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title="Define tus propósitos financieros"
      sub-title-size="sm"
      sub-title-color="muted"
      icon="add_task"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="goals-form__alert">
      <AlertBanner
        :title="currentTip?.title ?? 'Selecciona un motivo'"
        :variant="currentTip?.variant ?? 'info'"
        icon="info"
      >
        <Text size="xs" class="goals-form__alert-text">
          {{ currentTip?.description ?? 'El motivo que elijas determinará las recomendaciones.' }}
        </Text>
      </AlertBanner>
    </div>

    <div v-if="accounts.length > 0" class="goals-form__content">
      <Form :key="formKey" v-model="formData" :schema="formSchema" @submit="handleSubmit">
        <template #actions>
          <div class="goals-form__actions">
            <Button type="button" variant="ghost" @click.stop="emit('onClose')">Cancelar</Button>
            <Button type="submit" variant="primary">Guardar</Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .goals-form {
    @apply flex h-full w-full flex-col gap-2 rounded-md bg-white;
  }

  .goals-form__alert {
    @apply relative z-10 mt-2 flex flex-col;
  }

  .goals-form__alert-text {
    @apply flex items-start gap-1;
  }

  .goals-form__content {
    @apply w-full;
  }

  .goals-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
