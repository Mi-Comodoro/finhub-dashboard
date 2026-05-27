export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const { phone } = getQuery(event)

  const { data } = await $fetch<{ success: boolean; data: { available: boolean } }>(
    `${config.public.apiBase}/users/check-phone`,
    { query: { phone } }
  )

  return { available: data.available }
})
