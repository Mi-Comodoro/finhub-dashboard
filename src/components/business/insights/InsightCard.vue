<!--
  InsightCard
  Muestra un insight financiero con mensaje, submensaje opcional y CTA opcional
-->

<script setup lang="ts">
  import AlertBanner from '@/components/atoms/alert-banner/AlertBanner.vue'
  import type { AlertVariant } from '@/components/atoms/alert-banner/types/alert-banner.types'
  import type { FinancialInsight, InsightType } from '@/types/insights'

  interface Props {
    insight?: FinancialInsight
  }

  const props = withDefaults(defineProps<Props>(), {
    insight: () =>
      ({ id: '', type: 'success', title: '', message: '', category: 'general' }) as FinancialInsight
  })

  // Mapear tipos de insight a variantes de AlertBanner
  const variantMap: Record<InsightType, AlertVariant> = {
    success: 'success',
    warning: 'warning',
    action: 'info',
    info: 'neutral'
  }

  const variant = computed(() => variantMap[props.insight.type])
</script>

<template>
  <AlertBanner :variant="variant" :icon="insight.icon">
    <div class="insight-card">
      <div class="insight-card__content">
        <p class="insight-card__message">{{ insight.message }}</p>
        <p v-if="insight.subMessage" class="insight-card__sub-message">
          {{ insight.subMessage }}
        </p>
      </div>
      <NuxtLink v-if="insight.cta" :to="insight.cta.route" class="insight-card__cta">
        {{ insight.cta.label }}
      </NuxtLink>
    </div>
  </AlertBanner>
</template>

<style scoped lang="postcss">
  .insight-card {
    @apply flex items-start justify-between gap-3;
  }

  .insight-card__content {
    @apply flex-1;
  }

  .insight-card__message {
    @apply text-sm font-medium leading-snug;
  }

  .insight-card__sub-message {
    @apply mt-1 text-xs opacity-80;
  }

  .insight-card__cta {
    @apply shrink-0 rounded-md bg-white/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/30;
  }
</style>
