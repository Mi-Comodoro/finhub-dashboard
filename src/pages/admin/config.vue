<script setup lang="ts">
  import { onMounted, ref } from 'vue'

  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import { useToast } from '@/components/organisms/toast/useToast'
  import { useAdminApplication } from '@/composables/application/useAdminApplication'

  definePageMeta({
    layout: 'dashboard',
    ssr: false,
    middleware: ['auth', 'admin'],
    title: 'Configuración del sistema',
    breadcrumb: 'Configuración'
  })

  const { configItems, isLoadingConfig, fetchConfig, updateConfigItem } = useAdminApplication()

  const { show: showToast } = useToast()
  const editingKey = ref<string | null>(null)
  const editingValue = ref('')
  const isSaving = ref(false)

  const startEdit = (key: string, currentValue: string) => {
    editingKey.value = key
    editingValue.value = currentValue
  }

  const cancelEdit = () => {
    editingKey.value = null
    editingValue.value = ''
  }

  const saveEdit = async (key: string) => {
    if (!editingValue.value.trim()) return
    isSaving.value = true
    const { success } = await updateConfigItem(key, editingValue.value.trim())
    isSaving.value = false

    if (success) {
      showToast({
        title: 'Guardado',
        description: `Configuración "${key}" actualizada`,
        type: 'success'
      })
      cancelEdit()
    } else {
      showToast({
        title: 'Error',
        description: 'No se pudo actualizar la configuración',
        type: 'error'
      })
    }
  }

  onMounted(() => {
    fetchConfig()
  })
</script>

<template>
  <div class="config-page">
    <div class="config-page__header">
      <Heading level="h1" size="2xl" weight="extrabold">Configuración del sistema</Heading>
      <Text size="xs" color="muted">
        Variables configurables que controlan el comportamiento de la plataforma
      </Text>
    </div>

    <div class="config-page__card">
      <div v-if="isLoadingConfig" class="config-page__skeleton-list">
        <div v-for="n in 7" :key="n" class="config-page__skeleton-row" />
      </div>

      <table v-else class="config-page__table">
        <thead>
          <tr>
            <th class="config-page__th">Variable</th>
            <th class="config-page__th">Valor</th>
            <th class="config-page__th">Descripción</th>
            <th class="config-page__th config-page__th--action">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in configItems" :key="item.key" class="config-page__row">
            <td class="config-page__td config-page__td--key">
              <span class="config-page__key-badge">{{ item.key }}</span>
            </td>
            <td class="config-page__td">
              <div v-if="editingKey === item.key" class="config-page__edit-field">
                <input
                  v-model="editingValue"
                  class="config-page__input"
                  type="text"
                  @keydown.enter="saveEdit(item.key)"
                  @keydown.escape="cancelEdit"
                />
              </div>
              <span v-else class="config-page__value">{{ item.value }}</span>
            </td>
            <td class="config-page__td config-page__td--desc">
              <Text size="xs" color="muted">{{ item.description ?? '—' }}</Text>
            </td>
            <td class="config-page__td config-page__td--action">
              <div v-if="editingKey === item.key" class="config-page__action-group">
                <button
                  class="config-page__btn config-page__btn--save"
                  :disabled="isSaving"
                  @click="saveEdit(item.key)"
                >
                  <span class="material-symbols-outlined">check</span>
                </button>
                <button class="config-page__btn config-page__btn--cancel" @click="cancelEdit">
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>
              <button
                v-else
                class="config-page__btn config-page__btn--edit"
                @click="startEdit(item.key, item.value)"
              >
                <span class="material-symbols-outlined">edit</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .config-page {
    @apply flex flex-col gap-4 px-4 py-2;
  }

  .config-page__header {
    @apply flex flex-col gap-1;
  }

  .config-page__card {
    @apply rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800;
  }

  .config-page__skeleton-list {
    @apply flex flex-col gap-2 p-5;
  }

  .config-page__skeleton-row {
    @apply h-10 w-full animate-pulse rounded-xl bg-slate-100;
  }

  .config-page__table {
    @apply w-full border-collapse;
  }

  .config-page__th {
    @apply border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-400;
  }

  .config-page__th--action {
    @apply w-24 text-center;
  }

  .config-page__row {
    @apply border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700;
  }

  .config-page__td {
    @apply px-5 py-3 text-sm text-neutral-800 dark:text-neutral-200;
  }

  .config-page__td--key {
    @apply w-56;
  }

  .config-page__td--desc {
    @apply max-w-xs;
  }

  .config-page__td--action {
    @apply text-center;
  }

  .config-page__key-badge {
    @apply rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300;
  }

  .config-page__value {
    @apply font-medium;
  }

  .config-page__edit-field {
    @apply flex items-center;
  }

  .config-page__input {
    @apply w-full rounded-lg border border-primary-300 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-primary-600 dark:bg-neutral-700 dark:text-white;
  }

  .config-page__action-group {
    @apply flex items-center justify-center gap-1;
  }

  .config-page__btn {
    @apply flex items-center justify-center rounded-lg p-1.5 transition-colors;
  }

  .config-page__btn .material-symbols-outlined {
    @apply text-base;
  }

  .config-page__btn--edit {
    @apply text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200;
  }

  .config-page__btn--save {
    @apply text-success-600 hover:bg-success-50 dark:hover:bg-success-900;
  }

  .config-page__btn--cancel {
    @apply text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900;
  }
</style>
