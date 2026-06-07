<script setup lang="ts">
  import Form from '@/components/organisms/forms/Form.vue'
  import { useGroupsApplication } from '@/composables/application/useGroupsApplication'
  import type { CreateGroupDto, GroupType, UpdateGroupDto } from '@/types/groups.types'

  import { groupFieldsSchema } from './schema/group.fields.schema'

  const props = withDefaults(
    defineProps<{
      mode?: 'create' | 'edit'
      groupId?: string
      initialData?: Partial<CreateGroupDto & { goal?: number | null }>
    }>(),
    {
      mode: 'create',
      groupId: undefined,
      initialData: undefined
    }
  )

  const emit = defineEmits(['onSuccess', 'onClose'])

  const { createGroup, updateGroup } = useGroupsApplication()

  const isEditMode = computed(() => props.mode === 'edit' && !!props.groupId)

  const formSchema = computed(() => groupFieldsSchema(props.mode))

  const formData = computed(() => ({
    name: props.initialData?.name ?? '',
    type: (props.initialData?.type ?? 'SHARED') as string,
    maxMembers: (props.initialData?.maxMembers ?? 5) as number,
    ...(isEditMode.value ? { goal: props.initialData?.goal ?? null } : {})
  }))

  const isSubmitting = ref(false)

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
      if (isEditMode.value && props.groupId) {
        const updateDto: UpdateGroupDto = {
          name: data.name as string,
          type: data.type as GroupType,
          maxMembers: data.maxMembers ? Number(data.maxMembers) : 5,
          goal: data.goal !== undefined && data.goal !== null ? Number(data.goal) : null
        }
        const { success } = await updateGroup(props.groupId, updateDto)
        if (success) emit('onSuccess')
      } else {
        const dto: CreateGroupDto = {
          name: data.name as string,
          type: data.type as GroupType,
          maxMembers: data.maxMembers ? Number(data.maxMembers) : 5
        }
        const { success } = await createGroup(dto)
        if (success) emit('onSuccess')
      }
    } catch (error) {
      console.error('[GroupForm] Error submitting:', error)
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<template>
  <div class="group-form">
    <CardInfo
      :title="isEditMode ? 'Editar Grupo' : 'Crear Grupo'"
      :sub-title="
        isEditMode ? 'Actualiza los datos del grupo.' : 'Crea un nuevo grupo colaborativo.'
      "
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      sub-title-size="xs"
      sub-title-color="muted"
      icon="group"
      icon-size="md"
      icon-variant="primary"
    />

    <div class="group-form__content">
      <Form :model-value="formData" :schema="formSchema" @submit="handleSubmit">
        <template #actions>
          <div class="group-form__actions">
            <Button type="button" variant="ghost" size="sm" @click.stop="emit('onClose')">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {{ isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear Grupo' }}
            </Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .group-form {
    @apply flex h-full w-full flex-col gap-6;
  }

  .group-form__content {
    @apply w-full;
  }

  .group-form__actions {
    @apply flex justify-end gap-2;
  }
</style>
