<!--
  InsightList
  Renderiza una lista de insights financieros
-->

<script setup lang="ts">
  import type { FinancialInsight } from '@/types/insights'

  import InsightCard from './InsightCard.vue'

  interface Props {
    insights: FinancialInsight[]
  }

  defineProps<Props>()
</script>

<template>
  <div v-if="insights.length > 0" class="space-y-2">
    <InsightCard
      v-for="insight in insights"
      :key="insight.id"
      :insight="insight"
    />
  </div>
</template>
