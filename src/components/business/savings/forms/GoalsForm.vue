<script lang="ts" setup>
  import { Form } from '@/components/organisms'
  import { useAccountSavingsApplication } from '@/composables/application/useAccountSavingsApplication'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import type { GoalsData } from '~/types/api'

  import { goalsFieldsSchema, reasonTips } from './schema/goals.fiels.schema'

  interface GoalsFormProps {
    mode?: 'create' | 'edit'
    initialData?: {
      id: string
      name: string
      reason: string
      accountId: string
      targetAmount?: number | null
      targetDate?: Date | null
      isActive: boolean
    } | null
  }

  const props = withDefaults(defineProps<GoalsFormProps>(), {
    mode: 'create',
    initialData: null
  })

  const emit = defineEmits(['onSuccess', 'onError', 'onClose'])

  const { accounts: accountsData } = useAccountSavingsApplication()
  const { addGoal, editGoal } = useGoalsApplication()

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
  const formData = computed(() => {
    // Estado inicial por defecto para 'create'
    const baseData = {
      name: '',
      reason: '',
      accountId: '',
      targetAmount: '',
      targetDate: null,
      isActive: true
    }

    if (props.mode === 'edit' && props.initialData) {
      return {
        name: props.initialData.name,
        reason: props.initialData.reason,
        accountId: props.initialData.accountId,
        targetAmount:
          props.initialData.targetAmount !== null && props.initialData.targetAmount !== undefined
            ? String(props.initialData.targetAmount)
            : '',
        targetDate: props.initialData.targetDate ? new Date(props.initialData.targetDate) : null,
        isActive: props.initialData.isActive
      }
    }

    return baseData
  })

  const currentTip = computed(() => {
    const reason = (formData.value as { reason: string }).reason
    if (!reason || !reasonTips[reason]) return null
    return reasonTips[reason]
  })
  const isSubmitting = ref(false)
  const handleSubmit = async (data: Record<string, unknown>) => {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
      const raw = data as {
        name: string
        reason: string
        accountId: string
        targetAmount?: string | number
        targetDate?: Date
        isActive: boolean
      }

      const buildData: Partial<GoalsData> = {
        name: raw.name,
        reason: raw.reason,
        accountId: raw.accountId,
        isActive: true,
        // Explicit null checks for targetAmount (0 is valid!)
        ...(raw.targetAmount !== undefined && raw.targetAmount !== null && raw.targetAmount !== ''
          ? { targetAmount: Number(raw.targetAmount) }
          : {}),
        ...(raw.targetDate ? { targetDate: raw.targetDate } : {})
      }

      let success: boolean

      if (props.mode === 'edit' && props.initialData?.id) {
        const result = await editGoal(props.initialData.id, buildData)
        success = result.success
      } else {
        const result = await addGoal(buildData as GoalsData)
        success = result.success
      }

      emit('onClose', success)
    } catch (error) {
      emit('onClose', false)
      console.error('Error in handleSubmit:', error)
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<template>
  <div class="goals-form">
    <CardInfo
      :title="mode === 'edit' ? 'Editar Meta de Ahorro' : 'Crear Nueva Meta de Ahorro'"
      :sub-title="
        mode === 'edit' ? 'Actualiza los detalles de tu meta.' : 'Define tu objetivo de ahorro.'
      "
      title-size="2xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title-size="sm"
      sub-title-color="muted"
      icon="savings"
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
      <Form :key="formKey" :model-value="formData" :schema="formSchema" @submit="handleSubmit">
        <template #actions>
          <div class="goals-form__actions">
            <Button type="button" variant="ghost" @click.stop="emit('onClose')">Cancelar</Button>
            <Button type="submit" variant="primary">
              {{ isSubmitting ? 'Guardando...' : mode === 'edit' ? 'Actualizar' : 'Guardar Meta' }}
            </Button>
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
