<script setup lang="ts">
  import FinancialProgressCard from '@/components/molecules/financial-progress-card/FinancialProgressCard.vue'

  interface GoalDetailInsightsProps {
    totalDeposited?: number
    estimatedInterest?: number
    pendingAmount?: number
    interestRateLabel?: string
    currencyCode?: string
  }

  const props = withDefaults(defineProps<GoalDetailInsightsProps>(), {
    totalDeposited: 0,
    estimatedInterest: 0,
    pendingAmount: 0,
    interestRateLabel: '',
    currencyCode: ''
  })

  const cards = computed(() => [
    {
      id: 'total-deposited',
      title: 'Total Aportado',
      subtitle: 'Aportes realizados',
      amount: props.totalDeposited,
      currencyCode: props.currencyCode,
      iconName: 'savings',
      variant: 'primary' as const
    },
    {
      id: 'estimated-interest',
      title: 'Intereses',
      subtitle: `Tasa ${props.interestRateLabel}`,
      amount: props.estimatedInterest,
      currencyCode: props.currencyCode,
      iconName: 'trending_up',
      variant: 'gold' as const
    },
    {
      id: 'pending-amount',
      title: 'Por Alcanzar',
      subtitle: 'Falta para tu meta',
      amount: props.pendingAmount,
      currencyCode: props.currencyCode,
      iconName: 'flag',
      variant: 'warning' as const
    }
  ])
</script>

<template>
  <div class="goal-detail-insights">
    <FinancialProgressCard v-for="card in cards" :key="card.id" v-bind="card" />
  </div>
</template>

<style scoped lang="postcss">
  .goal-detail-insights {
    @apply grid w-full grid-cols-1 gap-4 md:grid-cols-3;
  }
</style>
