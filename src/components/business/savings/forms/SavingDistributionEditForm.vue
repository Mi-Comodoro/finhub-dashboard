<script setup lang="ts">
  import SavingDistributionForm from '@/components/business/savings/forms/SavingDistributionForm.vue'

  // "Reajustar distribución" reuses the single-step assistant (replaces the whole template)
  defineProps<{ budgetId: string }>()
  const emit = defineEmits(['onClose', 'onSuccess', 'onError'])
</script>

<template>
  <SavingDistributionForm
    :budget-id="budgetId"
    @on-close="emit('onClose')"
    @on-success="emit('onSuccess')"
    @on-error="emit('onError', $event)"
  />
</template>
