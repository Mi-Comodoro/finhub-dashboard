import { useOnboardingPlan } from '@/composables/application/useOnboardingPlan'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const { setPlan, setRef } = useOnboardingPlan()

  const plan = route.query['plan']
  const ref = route.query['ref']

  if (plan === 'free' || plan === 'pro') {
    setPlan(plan)
  }

  if (typeof ref === 'string' && ref.length > 0) {
    setRef(ref)
  }
})
