<script lang="ts" setup>
  import Form from '@/components/organisms/forms/Form.vue'
  import { useGroupsApplication } from '@/composables/application/useGroupsApplication'
  import { useFeedback } from '@/composables/useFeedBack'
  import type { GroupExpense, GroupMember } from '@/types/groups.types'

  import { groupExpenseFieldsSchema } from './schema/group-expense.schema'

  interface GroupExpenseFormProps {
    groupId: string
    members: GroupMember[]
  }

  const props = defineProps<GroupExpenseFormProps>()

  const emit = defineEmits<{
    onSuccess: [expense: GroupExpense]
    onClose: []
  }>()

  const { createExpense } = useGroupsApplication()
  const { success: successToast } = useFeedback()

  const memberOptions = computed(() =>
    props.members.map(m => ({
      label: m.handle ? `@${m.handle}` : (m.externalName ?? m.userId ?? ''),
      value: m.userId ?? '',
      disabled: !m.isActive
    }))
  )

  const formSchema = computed(() => groupExpenseFieldsSchema(memberOptions.value))

  const formData = {
    description: '',
    amount: '',
    dueDate: null,
    responsibleUserId: ''
  }

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

      const dto = {
        description: raw.description,
        amount: Number(raw.amount),
        dueDate:
          raw.dueDate instanceof Date
            ? raw.dueDate.toISOString().split('T')[0]
            : String(raw.dueDate),
        responsibleUserId: raw.responsibleUserId
      }

      const { success, data: expense } = await createExpense(props.groupId, dto)

      if (success && expense) {
        successToast('Gasto agregado', 'El gasto fue agregado al plan del grupo.')
        emit('onSuccess', expense)
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
            {{ isSubmitting ? 'Guardando...' : 'Agregar gasto' }}
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
