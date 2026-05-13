import { useAnalyticsApi } from '@/composables/api/useAnalyticsApi'

export function useAnalyticsApplication() {
  const analyticsApi = useAnalyticsApi()

  const {
    data: healthScore,
    pending: healthScorePending,
    refresh: refreshHealthScore
  } = useAsyncData('healthScore', async () => {
    const response = await analyticsApi.getFinancialHealthScore()
    return response.result
  })

  return { healthScore, healthScorePending, refreshHealthScore }
}
