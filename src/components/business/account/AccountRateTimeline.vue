<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'

  import { useAccountApi } from '@/composables/api/useAccountApi'
  import type { AccountRateHistory } from '@/types/api'

  interface AccountRateTimelineProps {
    accountId?: string
  }

  const props = withDefaults(defineProps<AccountRateTimelineProps>(), {
    accountId: ''
  })

  const { fetchRateHistory } = useAccountApi()

  const history = ref<AccountRateHistory[]>([])
  const showAll = ref(false)
  const isLoading = ref(false)

  const visibleHistory = computed(() => {
    if (showAll.value) {
      return history.value
    }
    return history.value.slice(0, 5)
  })

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const rateChangeClass = (entry: AccountRateHistory): string => {
    if (entry.newRate > entry.previousRate) {
      return 'rate-timeline__change--up'
    }
    if (entry.newRate < entry.previousRate) {
      return 'rate-timeline__change--down'
    }
    return 'rate-timeline__change--neutral'
  }

  const getIconName = (entry: AccountRateHistory): string => {
    if (entry.newRate > entry.previousRate) {
      return 'trending_up'
    }
    if (entry.newRate < entry.previousRate) {
      return 'trending_down'
    }
    return 'trending_flat'
  }

  onMounted(async () => {
    isLoading.value = true
    try {
      history.value = await fetchRateHistory(props.accountId)
    } catch (error) {
      console.error('Error loading rate history:', error)
      history.value = []
    } finally {
      isLoading.value = false
    }
  })
</script>

<template>
  <div class="rate-timeline">
    <div v-if="isLoading" class="rate-timeline__loading">
      <Text size="xs" color="muted">Cargando historial...</Text>
    </div>

    <div v-else-if="history.length === 0" class="rate-timeline__empty">
      <Text size="xs" color="muted">Sin cambios registrados</Text>
    </div>

    <div v-else class="rate-timeline__list">
      <div v-for="entry in visibleHistory" :key="entry.id" class="rate-timeline__entry">
        <div class="rate-timeline__date">
          <Text size="xs" color="muted">{{ formatDate(entry.changedAt) }}</Text>
        </div>
        <div class="rate-timeline__change">
          <Text size="xs" :class="rateChangeClass(entry)">
            {{ entry.previousRate.toFixed(2) }}%
            <Icon :name="getIconName(entry)" size="xs" />
            {{ entry.newRate.toFixed(2) }}%
          </Text>
        </div>
      </div>

      <button
        v-if="history.length > 5"
        type="button"
        class="rate-timeline__toggle"
        @click="showAll = !showAll"
      >
        <Text size="xs" color="primary">
          {{ showAll ? 'Ver menos' : `Ver ${history.length - 5} más` }}
        </Text>
      </button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .rate-timeline {
    @apply w-full;
  }

  .rate-timeline__loading {
    @apply py-2;
  }

  .rate-timeline__empty {
    @apply py-2;
  }

  .rate-timeline__list {
    @apply flex flex-col gap-1;
  }

  .rate-timeline__entry {
    @apply flex items-center justify-between gap-2 py-1;
  }

  .rate-timeline__date {
    @apply flex-shrink-0;
  }

  .rate-timeline__change {
    @apply flex items-center gap-1;
  }

  .rate-timeline__change--up {
    @apply text-success-600 dark:text-success-400;
  }

  .rate-timeline__change--down {
    @apply text-danger-600 dark:text-danger-400;
  }

  .rate-timeline__change--neutral {
    @apply text-neutral-600 dark:text-neutral-400;
  }

  .rate-timeline__toggle {
    @apply mt-2 cursor-pointer border-none bg-transparent p-0 text-left transition-opacity hover:opacity-70;
  }
</style>
