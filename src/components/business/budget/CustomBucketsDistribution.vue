<script setup lang="ts">
  import { useBudgetActions } from '@/composables/application/useBudgetActions'
  import type { CustomBucket } from '~/types/domain'

  interface Props {
    needsLimit: number
    wantsLimit: number
    savingsLimit: number
    customBuckets: CustomBucket[]
    budgetId?: string
    isEditMode?: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:needsLimit': [value: number]
    'update:wantsLimit': [value: number]
    'update:savingsLimit': [value: number]
    'update:customBuckets': [buckets: CustomBucket[]]
    'delete-bucket': [bucketId: string]
  }>()

  const showAddModal = ref(false)
  const bucketDeleteError = ref<string | null>(null)
  const bucketDeleteErrorId = ref<string | null>(null)

  const total = computed(() => {
    const customTotal = props.customBuckets.reduce((s, b) => s + (b.percentage ?? 0), 0)
    return props.needsLimit + props.wantsLimit + props.savingsLimit + customTotal
  })

  const isValid = computed(() => total.value === 100)

  const availablePercentage = computed(() => Math.max(0, 100 - total.value))

  const CUSTOM_BUCKET_COLORS = ['#a78bfa', '#fb923c', '#f472b6', '#22d3ee', '#4ade80', '#facc15']
  const getBucketColor = (index: number) =>
    CUSTOM_BUCKET_COLORS[index % CUSTOM_BUCKET_COLORS.length]!

  const statusLabel = computed(() => {
    if (isValid.value) return '100% ✅'
    if (total.value < 100) return `⚠️ Faltan ${100 - total.value}%`
    return `⚠️ Te pasaste ${total.value - 100}%`
  })

  const handleAddBucket = (bucket: Omit<CustomBucket, 'id'>) => {
    const newBucket: CustomBucket = { ...bucket, id: crypto.randomUUID() }
    emit('update:customBuckets', [...props.customBuckets, newBucket])
    showAddModal.value = false
  }

  const handleDeleteBucket = async (bucketId: string) => {
    bucketDeleteError.value = null
    bucketDeleteErrorId.value = null

    if (props.isEditMode && props.budgetId) {
      const { deleteCustomBucket } = useBudgetActions()
      const { success, error } = await deleteCustomBucket(props.budgetId, bucketId)
      if (!success) {
        bucketDeleteError.value = error ?? 'No se pudo eliminar el bucket'
        bucketDeleteErrorId.value = bucketId
        return
      }
    }
    emit(
      'update:customBuckets',
      props.customBuckets.filter(b => b.id !== bucketId)
    )
    emit('delete-bucket', bucketId)
  }
</script>

<template>
  <div class="custom-dist">
    <!-- Barra de distribución visual -->
    <div class="custom-dist__bar">
      <div
        class="custom-dist__bar-segment custom-dist__bar-segment--needs"
        :style="{ width: `${needsLimit}%` }"
      />
      <div
        class="custom-dist__bar-segment custom-dist__bar-segment--wants"
        :style="{ width: `${wantsLimit}%` }"
      />
      <div
        class="custom-dist__bar-segment custom-dist__bar-segment--savings"
        :style="{ width: `${savingsLimit}%` }"
      />
      <div
        v-for="(bucket, i) in customBuckets"
        :key="bucket.id"
        class="custom-dist__bar-segment"
        :style="{ width: `${bucket.percentage}%`, backgroundColor: getBucketColor(i) }"
      />
    </div>

    <div class="custom-dist__rows">
      <!-- Necesidades -->
      <div class="custom-dist__row">
        <span class="custom-dist__emoji">🏠</span>
        <span class="custom-dist__name">Necesidades</span>
        <input
          :value="needsLimit"
          class="custom-dist__input"
          type="number"
          min="1"
          max="98"
          @input="emit('update:needsLimit', Number(($event.target as HTMLInputElement).value))"
        />
        <span class="custom-dist__pct">%</span>
      </div>

      <!-- Deseos -->
      <div class="custom-dist__row">
        <span class="custom-dist__emoji">🌟</span>
        <span class="custom-dist__name">Deseos</span>
        <input
          :value="wantsLimit"
          class="custom-dist__input"
          type="number"
          min="1"
          max="98"
          @input="emit('update:wantsLimit', Number(($event.target as HTMLInputElement).value))"
        />
        <span class="custom-dist__pct">%</span>
      </div>

      <!-- Ahorro -->
      <div class="custom-dist__row">
        <span class="custom-dist__emoji">💰</span>
        <span class="custom-dist__name">Ahorro</span>
        <input
          :value="savingsLimit"
          class="custom-dist__input"
          type="number"
          min="1"
          max="98"
          @input="emit('update:savingsLimit', Number(($event.target as HTMLInputElement).value))"
        />
        <span class="custom-dist__pct">%</span>
      </div>

      <!-- Custom buckets -->
      <div
        v-for="(bucket, i) in customBuckets"
        :key="bucket.id"
        class="custom-dist__row custom-dist__row--custom"
      >
        <span class="custom-dist__bucket-dot" :style="{ backgroundColor: getBucketColor(i) }" />
        <span class="custom-dist__name">{{ bucket.name }}</span>
        <input
          :value="bucket.percentage"
          class="custom-dist__input"
          type="number"
          min="1"
          max="98"
          @input="
            emit(
              'update:customBuckets',
              customBuckets.map(b =>
                b.id === bucket.id
                  ? { ...b, percentage: Number(($event.target as HTMLInputElement).value) }
                  : b
              )
            )
          "
        />
        <span class="custom-dist__pct">%</span>
        <button class="custom-dist__delete" @click="handleDeleteBucket(bucket.id)">
          <span class="material-symbols-outlined">close</span>
        </button>
        <div
          v-if="bucketDeleteErrorId === bucket.id && bucketDeleteError"
          class="custom-dist__error-tooltip"
        >
          {{ bucketDeleteError }}
        </div>
      </div>
    </div>

    <!-- Separador y total -->
    <div class="custom-dist__separator" />
    <div
      class="custom-dist__total"
      :class="isValid ? 'custom-dist__total--valid' : 'custom-dist__total--invalid'"
    >
      Total: {{ statusLabel }}
    </div>

    <!-- Botón agregar -->
    <Button variant="ghost" size="sm" class="custom-dist__add-btn" @click="showAddModal = true">
      <span class="material-symbols-outlined">add</span>
      Agregar categoría propia
    </Button>

    <!-- Modal -->
    <AddCustomBucketModal
      :show="showAddModal"
      @close="showAddModal = false"
      @add="handleAddBucket"
    />
  </div>
</template>

<style scoped lang="postcss">
  .custom-dist {
    @apply flex flex-col gap-3;
  }
  .custom-dist__bar {
    @apply flex h-3 w-full overflow-hidden rounded-full;
  }
  .custom-dist__bar-segment {
    @apply transition-all duration-300;
  }
  .custom-dist__bar-segment--needs {
    @apply bg-primary-500;
  }
  .custom-dist__bar-segment--wants {
    @apply bg-success-500;
  }
  .custom-dist__bar-segment--savings {
    @apply bg-secondary-700;
  }
  .custom-dist__rows {
    @apply flex flex-col gap-2;
  }
  .custom-dist__row {
    @apply relative flex items-center gap-2;
  }
  .custom-dist__row--custom {
    @apply rounded-lg bg-neutral-50 px-2 py-1 dark:bg-neutral-800;
  }
  .custom-dist__emoji {
    @apply text-base;
  }
  .custom-dist__bucket-dot {
    @apply h-3 w-3 shrink-0 rounded-full;
  }
  .custom-dist__name {
    @apply flex-1 text-sm text-neutral-700 dark:text-neutral-300;
  }
  .custom-dist__input {
    @apply w-16 rounded border border-neutral-200 px-2 py-1 text-right text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 dark:border-neutral-700 dark:bg-neutral-800;
  }
  .custom-dist__pct {
    @apply text-sm text-neutral-500;
  }
  .custom-dist__delete {
    @apply flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 transition hover:bg-danger-50 hover:text-danger-500;
  }
  .custom-dist__separator {
    @apply border-t border-neutral-200 dark:border-neutral-700;
  }
  .custom-dist__total {
    @apply text-right text-sm font-semibold;
  }
  .custom-dist__total--valid {
    @apply text-success-600;
  }
  .custom-dist__total--invalid {
    @apply text-danger-600;
  }
  .custom-dist__add-btn {
    @apply self-start;
  }
  .custom-dist__error-tooltip {
    @apply absolute left-0 top-full z-10 mt-1 rounded-lg bg-danger-50 p-2 text-xs text-danger-700 shadow-sm;
  }
</style>
