export default defineNuxtPlugin(async () => {
  const { isAuthenticated, populateSessionFromServer } = useAuth()
  const { startWatcher } = useSessionWatcher()
  const authStore = useAuthStore()

  if (!isAuthenticated.value) {
    try {
      await populateSessionFromServer()

      const expiresAt = authStore.session?.sessionExpiresAt

      if (expiresAt) {
        startWatcher(Math.floor(expiresAt.getTime() / 1000))
      }
    } catch (error) {
      console.error('No se pudo restaurar la sesion', error)
    }
  }
})
