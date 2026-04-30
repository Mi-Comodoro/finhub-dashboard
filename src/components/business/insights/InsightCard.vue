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
    insight: () => ({ id: '', type: 'success', title: '', message: '', category: 'general' } as FinancialInsight)
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
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1">
        <p class="font-medium text-sm leading-snug">{{ insight.message }}</p>
        <p v-if="insight.subMessage" class="mt-1 text-xs opacity-80">
          {{ insight.subMessage }}
        </p>
      </div>
      <NuxtLink
        v-if="insight.cta"
        :to="insight.cta.route"
        class="shrink-0 rounded-md bg-white/50 dark:bg-black/20 px-3 py-1.5 text-xs font-medium hover:bg-white/80 dark:hover:bg-black/30 transition-colors"
      >
        {{ insight.cta.label }}
      </NuxtLink>
    </div>
  </AlertBanner>
</template>
