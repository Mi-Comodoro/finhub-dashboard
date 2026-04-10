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
      // Silenciosamente ignorar el error 401 (esperado cuando no hay sesión)
      // Solo loguear errores inesperados
      const is401 = error?.statusCode === 401 || error?.response?.status === 401
      if (!is401) {
        console.error('No se pudo restaurar la sesion', error)
      }
    }
  }
})
