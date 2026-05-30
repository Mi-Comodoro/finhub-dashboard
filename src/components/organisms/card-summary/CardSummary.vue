<script lang="ts" setup>
  import Button from '@/components/atoms/button/Button.vue'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'

  import type { CardSummaryProps } from './types/card-summary.types'

  defineProps<CardSummaryProps>()

  const emit = defineEmits(['action'] as const)
  const handleClick = () => {
    emit('action')
  }
</script>
<template>
  <div class="card-wrapper">
    <div class="card-summary">
      <CardInfo
        :title="title"
        :sub-title="subTitle"
        level="h2"
        color="black"
        title-size="base"
        weight="semibold"
        sub-title-color="muted"
        sub-title-size="sm"
        icon="security"
        icon-variant="primary"
      />

      <Button v-if="action" size="sm" variant="primary" @click="handleClick">{{ action }}</Button>
    </div>
  </div>
</template>
<style lang="postcss" scoped>
  .card-wrapper {
    @apply p-2;
  }
  .card-summary {
    @apply mx-4 flex flex-1 items-center justify-between gap-2 rounded-md border border-neutral-200 bg-neutral-50 p-4;
  }
</style>
