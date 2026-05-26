<script setup lang="ts">
  import Form from '@/components/organisms/forms/Form.vue'
  import { useBudgetActions } from '@/composables/application/useBudgetActions'
  import { replaceUnderscoresWithSpaces } from '@/utils/strings'

  import { budgetCloneFieldsSchema } from './schema/budget-clone.fields.schema'

  interface Props {
    sourceBudgetId?: string
    sourceBudgetName?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    sourceBudgetId: '',
    sourceBudgetName: ''
  })
  const emit = defineEmits(['onClose', 'onSuccess'])

  // Opciones de mes y año
  const monthOptions = computed(() => [
    { label: 'Enero', value: 1 },
    { label: 'Febrero', value: 2 },
    { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Mayo', value: 5 },
    { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 },
    { label: 'Noviembre', value: 11 },
    { label: 'Diciembre', value: 12 }
  ])

  const yearOptions = computed(() => {
    const currentYear = new Date().getFullYear()
    return [
      { label: String(currentYear), value: currentYear },
      { label: String(currentYear + 1), value: currentYear + 1 },
      { label: String(currentYear + 2), value: currentYear + 2 }
    ]
  })

  // Schema
  const cloneSchema = computed(() => budgetCloneFieldsSchema(monthOptions.value, yearOptions.value))

  // Submit handler
  const handleSubmit = async (data: { month: number; year: number }) => {
    const { handleClone } = useBudgetActions()

    const { success } = await handleClone(
      props.sourceBudgetId,
      Number(data.month),
      Number(data.year)
    )

    if (success) {
      emit('onSuccess')
      emit('onClose')
    }
  }
</script>

<template>
  <div class="flex h-full w-full flex-col gap-6">
    <CardInfo
      title="Clonar presupuesto"
      title-size="xl"
      weight="extrabold"
      level="h1"
      color="black"
      :sub-title="`Se copiará la configuración de '${replaceUnderscoresWithSpaces(sourceBudgetName)}' al nuevo período`"
      sub-title-size="sm"
      sub-title-color="muted"
      icon="content_copy"
      icon-variant="primary"
      icon-size="md"
    />

    <div class="w-full">
      <Form :schema="cloneSchema" @submit="handleSubmit">
        <template #actions>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" @click="emit('onClose')">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">Clonar presupuesto</Button>
          </div>
        </template>
      </Form>
    </div>
  </div>
</template>
