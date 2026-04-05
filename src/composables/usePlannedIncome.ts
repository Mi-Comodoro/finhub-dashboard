import { translate } from '@/utils/translateToUI'
const mapSource = (source: string) => {
  return translate[source]
}
export function usePlannedIncome() {
  const store = usePlannedIncomeStore()
  const summary = computed(() => store.summary)
  const sources = computed(() => summary.value?.map(item => mapSource(item.source)))

  const lastUpdate = computed(() => summary.value?.find(i => i.updatedAt)?.updatedAt)
  const expectedAmount = computed(() => store.expectedIncome)
  const buckets = computed(() => store.buckets)
  const needsAmount = computed(() => buckets.value.needsAmount)
  const wantsAmount = computed(() => buckets.value.wantsAmount)
  const savingsAmount = computed(() => buckets.value.savingsAmount)
  const error = computed(() => store.error)

  const processingIncomeId = computed(() => store.processingIncomeId)
  const markAsReceived = async (id: string) => {
    return await store.markAsReceived(id)
  }

  return {
    error,
    sources,
    lastUpdate,
    buckets,
    expectedAmount,
    needsAmount,
    wantsAmount,
    savingsAmount,
    summary,
    processingIncomeId,
    markAsReceived
  }
}
