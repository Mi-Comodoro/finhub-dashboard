import { useAnalyticsApi } from '@/composables/api/useAnalyticsApi'

export function useAnalyticsNetPositionApplication() {
  const { getNetPosition, getDebtProjection } = useAnalyticsApi()

  const { data: netPosition, pending: loadingPosition, error: errorPosition } =
    useAsyncData('analytics-net-position', () =>
      getNetPosition().then(r => r.result)
    )

  const { data: debtProjection, pending: loadingProjection } =
    useAsyncData('analytics-debt-projection', () =>
      getDebtProjection().then(r => r.result)
    )

  const netPositionColor = computed(() => {
    const val = netPosition.value?.netPosition ?? 0
    if (val > 0) return 'primary'
    if (val < 0) return 'danger'
    return 'warning'
  })

  const debtRatioStatus = computed(() => {
    const ratio = netPosition.value?.debtToIncomeRatio ?? 0
    if (ratio < 0.3) return { label: 'Saludable', color: 'primary' }
    if (ratio < 0.5) return { label: 'Moderado', color: 'warning' }
    return { label: 'Alto riesgo', color: 'danger' }
  })

  return {
    netPosition,
    loadingPosition,
    errorPosition,
    debtProjection,
    loadingProjection,
    netPositionColor,
    debtRatioStatus,
  }
}
