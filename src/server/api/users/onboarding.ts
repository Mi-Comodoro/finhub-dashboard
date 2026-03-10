export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const auth = getHeader(event, 'authorization')
  const body = await readBody(event)

  const { success, data } = await $fetch<{ success: boolean; data: { onboarding: string } }>(
    `${config.public.apiBase}/users/onboarding`,
    {
      method: 'POST',
      body: {
        userInfo: {
          displayName: body.personalInfo.displayName,
          email: body.personalInfo.email,
          phone: body.personalInfo.phone,
          gender: body.personalInfo.gender
        },
        finances: {
          profile: body.finances.profile,
          currency: body.finances.currency,
          usage: body.finances.usage
        },
        budget: {
          strategy: body.budget.strategy,
          budgetFrequency: body.finances.budgetFrequency,
          needs: body.budget.customAllocations.needs,
          wants: body.budget.customAllocations.wants,
          savings: body.budget.customAllocations.savings
        }
      },
      headers: { Authorization: auth ?? '' }
    }
  )

  return {
    success,
    result: data
  }
})
