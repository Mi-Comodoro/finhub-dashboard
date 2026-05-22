import { ACCESS_TOKEN } from '~/common/constants'

export default defineNuxtRouteMiddleware(async to => {
  const { authStore, initSession } = useSession()

  // Only call the API once per session — skip if already verified or already initialized
  if (!authStore.isInitialized) {
    await initSession()
  }

  const isLoggedIn = authStore.isAuthenticated
  const isProtected = to.path.startsWith('/dashboard') || to.path.startsWith('/admin')
  const isHome = to.path === '/'

  if (!isLoggedIn && isProtected) {
    // On SSR: if the access-token cookie is present, initSession() likely failed due to
    // a transient refresh race (new cookie set in response but not readable in same request).
    // Return without redirecting — session.client.ts will recover the session client-side
    // using the refreshed cookie the browser already has from the Set-Cookie response.
    if (import.meta.server && useCookie(ACCESS_TOKEN).value) {
      return
    }
    return navigateTo('/', { replace: true })
  }

  if (isLoggedIn && isHome) {
    return navigateTo('/dashboard', { replace: true })
  }
})
