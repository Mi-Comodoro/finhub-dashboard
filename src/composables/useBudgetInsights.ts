import { computed } from 'vue'

import { usePlannedIncomeStore } from '@/stores/planned-income.store'
import { usePlannedSavingStore } from '@/stores/planned-saving.store'

export function useBudgetInsights() {
  const plannedIncomeStore = usePlannedIncomeStore()
  const plannedSavingStore = usePlannedSavingStore()

  const ingresoRecibido = computed(() => plannedIncomeStore.totalGenerated || 0)
  const ahorroGenerado = computed(() => plannedSavingStore.totalSavingGenerated || 0)

  return {
    ingresoRecibido,
    ahorroGenerado
  }
}
