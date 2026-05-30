/**
 * usePlan — composable de restricciones por plan (ADR-010)
 *
 * Uso correcto:
 *   const { isFree, can } = usePlan()
 *
 * Nunca llamar inline en template:
 *   ❌ v-if="usePlan().isFree"
 *   ✅ const { isFree } = usePlan()
 *
 * Estrategia visual:
 *   - Feature de Plus/Pro en cuenta FREE → mostrar con UBadge lock + UTooltip
 *   - Feature inexistente en todos los planes inferiores → ocultar con v-if
 *   - 403 con PLAN_LIMIT_REACHED → emitir evento para abrir modal de upgrade
 */

import { computed } from 'vue'

import type { AccountType, PlanCapabilities } from '~/types/plan.types'
import { PLAN_CAPABILITIES } from '~/types/plan.types'

export const usePlan = () => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  const accountType = computed<AccountType>(() => (authStore.accountType as AccountType) ?? 'FREE')

  const isTrial = computed(() => accountType.value === 'TRIAL')
  const isFree = computed(() => accountType.value === 'FREE')
  const isPlus = computed(() => accountType.value === 'PLUS')
  const isPro = computed(() => accountType.value === 'PRO')
  const isPartner = computed(() => accountType.value === 'PARTNER')
  const hasFullAccess = computed(() =>
    (['TRIAL', 'PRO', 'PARTNER'] as AccountType[]).includes(accountType.value)
  )

  const trialEndsAt = computed(() => userStore.trialEndsAt)
  const trialDaysRemaining = computed(() => {
    if (!isTrial.value || !trialEndsAt.value) return 0
    return Math.max(0, Math.ceil((trialEndsAt.value.getTime() - Date.now()) / 86_400_000))
  })

  const capabilities = computed<PlanCapabilities>(() => PLAN_CAPABILITIES[accountType.value])

  const can = (feature: keyof PlanCapabilities): boolean => capabilities.value[feature] as boolean

  return {
    accountType,
    isTrial,
    isFree,
    isPlus,
    isPro,
    isPartner,
    hasFullAccess,
    trialEndsAt,
    trialDaysRemaining,
    capabilities,
    can
  }
}
