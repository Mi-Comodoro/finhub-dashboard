export type PlanType = 'free' | 'pro'

const COOKIE_NAME = 'mc_plan'
const REF_COOKIE_NAME = 'mc_ref'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 días

export const useOnboardingPlan = () => {
  const planCookie = useCookie<PlanType | null>(COOKIE_NAME, {
    maxAge: COOKIE_MAX_AGE,
    default: () => null,
  })

  const refCookie = useCookie<string | null>(REF_COOKIE_NAME, {
    maxAge: COOKIE_MAX_AGE,
    default: () => null,
  })

  const setPlan = (plan: PlanType) => {
    planCookie.value = plan
  }

  const getPlan = (): PlanType => planCookie.value ?? 'free'

  const clearPlan = () => {
    planCookie.value = null
  }

  const setRef = (ref: string) => {
    refCookie.value = ref
  }

  return { setPlan, getPlan, clearPlan, setRef, plan: planCookie }
}
