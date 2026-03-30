export default defineNuxtPlugin(async () => {
  const { isAuthenticated, populateSessionFromServer } = useAuth()
  const token = useCookie<string | null>('ACCESS_TOKEN') // leer cookie persistente

  if (token.value && !isAuthenticated.value) {
    try {
      await populateSessionFromServer(token.value)
    } catch (error) {
      console.error('No se pudo restaurar la sesión', error)
    }
  }
})
