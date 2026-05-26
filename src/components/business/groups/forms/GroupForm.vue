<script setup lang="ts">
  import Form from '@/components/organisms/forms/Form.vue'
  import { useGroupsApplication } from '@/composables/application/useGroupsApplication'
  import type { CreateGroupDto, GroupType } from '@/types/groups.types'

  import { groupFieldsSchema } from './schema/group.fields.schema'

  const props = withDefaults(
    defineProps<{
      mode?: 'create' | 'edit'
      groupId?: string
      initialData?: Partial<CreateGroupDto>
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

  const formSchema = groupFieldsSchema()

  const formData = computed(() => ({
    name: props.initialData?.name ?? '',
    type: (props.initialData?.type ?? 'SHARED') as string,
    maxMembers: (props.initialData?.maxMembers ?? 5) as number
  }))

  const isSubmitting = ref(false)

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
      const dto: CreateGroupDto = {
        name: data.name as string,
        type: data.type as GroupType,
        maxMembers: data.maxMembers ? Number(data.maxMembers) : 5
      }

      const { success } =
        isEditMode.value && props.groupId
          ? await updateGroup(props.groupId, dto)
          : await createGroup(dto)

      if (success) emit('onSuccess')
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
