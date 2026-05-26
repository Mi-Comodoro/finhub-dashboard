<script setup lang="ts">
  import Card from '@/components/atoms/card/Card.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import type { Currency } from '@/utils/currency'
  import { formatCurrency } from '@/utils/currency'

  defineProps<{
    planned: number
    suggested: number
    real: number
    currency: Currency
  }>()
</script>

<template>
  <Card class="savings-info-card">
    <div class="savings-info-card__header">
      <span class="material-symbols-outlined savings-info-card__icon">savings</span>
      <Heading level="h3" size="sm" weight="extrabold">AHORRO</Heading>
    </div>

    <div class="savings-info-card__rows">
      <div class="savings-info-card__row">
        <Text size="xs" color="muted">Planificado</Text>
        <Text size="sm" weight="semibold">{{ formatCurrency(planned, currency) }}</Text>
      </div>
      <div class="savings-info-card__divider" />
      <div class="savings-info-card__row">
        <Text size="xs" color="muted">Sugerido</Text>
        <Text size="sm" weight="semibold">{{ formatCurrency(suggested, currency) }}</Text>
      </div>
      <div class="savings-info-card__divider" />
      <div class="savings-info-card__row">
        <Text size="xs" color="muted">Real</Text>
        <Text size="sm" weight="semibold" class="savings-info-card__real-value">
          {{ formatCurrency(real, currency) }}
        </Text>
      </div>
    </div>
  </Card>
</template>

<style scoped lang="postcss">
  .savings-info-card {
    @apply flex h-auto w-full flex-col gap-4 p-5;
  }

  .savings-info-card__header {
    @apply flex items-center gap-2;
  }

  .savings-info-card__icon {
    @apply text-amber-500;
  }

  .savings-info-card__rows {
    @apply flex flex-col gap-2;
  }

  .savings-info-card__row {
    @apply flex items-center justify-between;
  }

  .savings-info-card__divider {
    @apply border-t border-neutral-100;
  }

  .savings-info-card__real-value {
    @apply text-amber-600;
  }
</style>
