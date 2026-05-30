import type { PlansApiResponse } from '~/types/api'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const { success, data } = await $fetch<PlansApiResponse>(`${config.public.apiBase}/plans`)
  return { success, result: data }
})
