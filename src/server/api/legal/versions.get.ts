// Público: versión vigente de la política y si la aceptación es obligatoria.
// Si el backend no responde se devuelve "no obligatoria" para no bloquear el inicio de sesión.
export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  try {
    const { success, data } = await $fetch<{
      success: boolean
      data: { policyVersion: string; consentRequired: boolean }
    }>(`${config.public.apiBase}/legal/versions`)

    return { success, result: data }
  } catch {
    return { success: false, result: { policyVersion: '', consentRequired: false } }
  }
})
