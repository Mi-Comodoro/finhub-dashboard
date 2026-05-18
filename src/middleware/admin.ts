import { useAuthStore } from '@/stores/auth.store'

export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuthStore()
  if (user?.role !== 'admin') {
    return navigateTo('/dashboard')
  }
})
