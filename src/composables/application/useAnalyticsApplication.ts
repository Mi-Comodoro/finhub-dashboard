import { useAnalyticsApi } from '@/composables/api/useAnalyticsApi'

export function useAnalyticsApplication() {
  const analyticsApi = useAnalyticsApi()

  const { data: healthScore, refresh: refreshHealthScore } = useAsyncData(
    'healthScore',
    async () => {
      const response = await analyticsApi.getFinancialHealthScore()
      return response.result
    }
  )

  return { healthScore, refreshHealthScore }
}
