<script setup lang="ts">
  import type { CustomBucket } from '~/types/domain'

  interface Props {
    show: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    close: []
    add: [bucket: Omit<CustomBucket, 'id'>]
  }>()

  const name = ref('')
  const purpose = ref('')

  const nameError = computed(() => {
    if (!name.value.trim()) return 'El nombre es obligatorio'
    if (name.value.length > 30) return 'Máximo 30 caracteres'
    return ''
  })

  const isValid = computed(() => !nameError.value)

  const handleAdd = () => {
    if (!isValid.value) return
    emit('add', {
      name: name.value.trim(),
      purpose: purpose.value.trim() || undefined,
      percentage: 1
    })
    name.value = ''
    purpose.value = ''
  }
</script>

<template>
  <ModalWizard :show="show">
    <div class="add-bucket-modal">
      <CardInfo
        title="Nueva categoría propia"
        sub-title="Ajusta el porcentaje desde la distribución después de agregarla"
        icon="category"
        icon-variant="primary"
        icon-size="md"
        title-size="xl"
        weight="extrabold"
        level="h1"
        color="black"
        sub-title-size="xs"
        sub-title-color="muted"
      />

      <div class="add-bucket-modal__fields">
        <div class="add-bucket-modal__field">
          <label class="add-bucket-modal__label">
            Nombre
            <span class="add-bucket-modal__required">*</span>
          </label>
          <input
            v-model="name"
            class="add-bucket-modal__input"
            :class="{ 'add-bucket-modal__input--error': nameError }"
            type="text"
            maxlength="30"
            placeholder="Ej: Fondo de viaje"
          />
          <span v-if="nameError" class="add-bucket-modal__error">{{ nameError }}</span>
        </div>

        <div class="add-bucket-modal__field">
          <label class="add-bucket-modal__label">
            Propósito
            <span class="add-bucket-modal__optional">(opcional)</span>
          </label>
          <input
            v-model="purpose"
            class="add-bucket-modal__input"
            type="text"
            maxlength="80"
            placeholder="Ej: Ahorro para viaje a Europa"
          />
        </div>
      </div>

      <div class="add-bucket-modal__actions">
        <Button variant="ghost" size="sm" @click="emit('close')">Cancelar</Button>
        <Button variant="primary" size="sm" :disabled="!isValid" @click="handleAdd">Agregar</Button>
      </div>
    </div>
  </ModalWizard>
</template>

<style scoped lang="postcss">
  .add-bucket-modal {
    @apply flex flex-col gap-6 p-1;
  }
  .add-bucket-modal__fields {
    @apply flex flex-col gap-4;
  }
  .add-bucket-modal__field {
    @apply flex flex-col gap-1;
  }
  .add-bucket-modal__label {
    @apply text-sm font-medium text-neutral-700 dark:text-neutral-300;
  }
  .add-bucket-modal__required {
    @apply text-danger-500;
  }
  .add-bucket-modal__optional {
    @apply text-xs text-neutral-400;
  }
  .add-bucket-modal__input {
    @apply rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-700 dark:bg-neutral-800;
  }
  .add-bucket-modal__input--error {
    @apply border-danger-400 focus:border-danger-400 focus:ring-danger-100;
  }
  .add-bucket-modal__error {
    @apply text-xs text-danger-600;
  }
  .add-bucket-modal__actions {
    @apply flex justify-end gap-2;
  }
</style>
