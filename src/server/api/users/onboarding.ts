import { ACCESS_TOKEN } from '~/common/constants'

import { validateError } from '../utils/auth.error'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getCookie(event, ACCESS_TOKEN)
  const body = await readBody(event)

  if (!token) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

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
          usage: body.finances.usage,
          monthPayment: body.finances.monthPayment,
          biweeklyPayments: body.finances.biweeklyPayments
        },
        budget: {
          strategy: body.budget.strategy,
          budgetFrequency: body.finances.budgetFrequency,
          needs: body.budget.customAllocations.needs,
          wants: body.budget.customAllocations.wants,
          savings: body.budget.customAllocations.savings
        },
        incomes: {
          incomes: body.incomes.incomes,
          frequency: body.incomes.frequency,
          paymentsDates: body.incomes.paymentsDates
        }
      },
      headers: {
        authorization: `Bearer ${token}`
      },
      onResponseError: ({ response }) => {
        validateError(event, response.status)
      }
    }
  )

  return {
    success,
    result: data
  }
})
