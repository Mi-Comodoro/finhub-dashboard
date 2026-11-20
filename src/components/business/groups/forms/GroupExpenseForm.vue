<script lang="ts" setup>
  import Form from '@/components/organisms/forms/Form.vue'
  import { useGroupsApplication } from '@/composables/application/useGroupsApplication'
  import { useFeedback } from '@/composables/useFeedBack'
  import type { GroupExpense, GroupMember } from '@/types/groups.types'

  import { groupExpenseFieldsSchema } from './schema/group-expense.schema'

  interface GroupExpenseFormProps {
    groupId: string
    members: GroupMember[]
    expenseId?: string
    initialData?: {
      description: string
      amount: number
      dueDate: string
      responsibleUserId: string
    }
  }

  const props = defineProps<GroupExpenseFormProps>()

  const emit = defineEmits<{
    onSuccess: [expense: GroupExpense]
    onClose: []
  }>()

  const isEditMode = computed(() => !!props.expenseId)

  const { createExpense, updateExpense } = useGroupsApplication()
  const { success: successToast, error: errorToast } = useFeedback()

  const memberOptions = computed(() =>
    props.members.map(m => ({
      label: m.handle ? `@${m.handle}` : (m.displayName ?? m.externalName ?? m.userId ?? ''),
      value: m.userId ?? '',
      disabled: !m.isActive
    }))
  )

  const formSchema = computed(() => groupExpenseFieldsSchema(memberOptions.value, isEditMode.value))

  const formData = computed(() => ({
    description: props.initialData?.description ?? '',
    amount: props.initialData?.amount ?? '',
    dueDate: props.initialData?.dueDate ? new Date(props.initialData.dueDate) : null,
    responsibleUserId: props.initialData?.responsibleUserId ?? ''
  }))

  const isSubmitting = ref(false)

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
      const raw = data as {
        description: string
        amount: string | number
        dueDate: Date | string
        responsibleUserId: string
      }

      const dueDate =
        raw.dueDate instanceof Date
          ? (raw.dueDate.toISOString().split('T')[0] ?? '')
          : String(raw.dueDate)

      if (isEditMode.value) {
        const { success, data: expense } = await updateExpense(props.groupId, props.expenseId!, {
          description: raw.description,
          amount: Number(raw.amount),
          dueDate,
          responsibleUserId: raw.responsibleUserId
        })
        if (success && expense) {
          successToast('Gasto actualizado', 'Los cambios fueron guardados.')
          emit('onSuccess', expense)
        } else {
          errorToast('Error', 'No se pudo actualizar el gasto.')
        }
      } else {
        const { success, data: expense } = await createExpense(props.groupId, {
          description: raw.description,
          amount: Number(raw.amount),
          dueDate,
          responsibleUserId: raw.responsibleUserId
        })
        if (success && expense) {
          successToast('Gasto agregado', 'El gasto fue agregado al plan del grupo.')
          emit('onSuccess', expense)
        }
      }
    } catch (error) {
      console.error('[GroupExpenseForm] Error in handleSubmit:', error)
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<template>
  <div class="group-expense-form">
    <Form :model-value="formData" :schema="formSchema" @submit="handleSubmit">
      <template #actions>
        <div class="group-expense-form__actions">
          <Button type="button" variant="ghost" size="sm" @click.stop="emit('onClose')">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" :disabled="isSubmitting">
            {{ isSubmitting ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Agregar gasto' }}
          </Button>
        </div>
      </template>
    </Form>
  </div>
</template>

<style lang="postcss" scoped>
  .group-expense-form {
    @apply flex w-full flex-col gap-2;
  }

  .group-expense-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
