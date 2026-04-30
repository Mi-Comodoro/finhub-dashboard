<!--
  InsightList
  Renderiza una lista de insights financieros
-->

<script setup lang="ts">
  import type { FinancialInsight } from '@/types/insights'

  import InsightCard from './InsightCard.vue'

  interface Props {
    insights?: FinancialInsight[]
  }

  withDefaults(defineProps<Props>(), {
    insights: () => []
  })
</script>

<template>
  <div v-if="insights.length > 0" class="insight-list">
    <InsightCard
      v-for="insight in insights"
      :key="insight.id"
      :insight="insight"
    />
  </div>
</template>

<style scoped lang="postcss">
  .insight-list {
    @apply space-y-2;
  }
</style>
