<script setup lang="ts">
  import FinancialTipCarousel from '@/components/business/savings/FinancialTipCarousel.vue'

  const tips = [
    {
      id: 'compound-interest',
      icon: 'percent',
      message: 'Interés compuesto diario',
      subMessage: 'El interés se calcula día a día con interés compuesto.'
    },
    {
      id: 'daily-growth',
      icon: 'trending_up',
      message: 'Crecimiento constante',
      subMessage: 'Tu capital crece un poco cada día que permanece depositado.'
    },
    {
      id: 'future-contributions',
      icon: 'calendar_month',
      message: 'Aportes futuros estimados',
      subMessage:
        'En vistas de 3 meses o más, los aportes futuros son estimados basados en tu último aporte registrado.'
    },
    {
      id: 'projections-disclaimer',
      icon: 'info',
      message: 'Proyecciones aproximadas',
      subMessage:
        'Las proyecciones pueden variar según las actualizaciones de tasa de interés por parte de las entidades financieras.'
    }
  ]
</script>

<template>
  <FinancialTipCarousel :tips="tips" />
</template>
