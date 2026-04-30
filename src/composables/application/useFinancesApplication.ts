import { useFinancesStore } from '@/stores/finances.store'

export const useFinancesApplication = () => {
  const financesStore = useFinancesStore()

  const currency = computed(() => financesStore.defaultCurrency)
  const profile = computed(() => financesStore.profile)

  return {
    currency,
    profile
  }
}
