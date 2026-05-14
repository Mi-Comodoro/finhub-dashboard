import type { AuthResponseResult, RefreshResponse } from '@/types/auth'

export const useAuthApi = () => {
  const loginWithCredentials = async (email: string, password: string) => {
    return await $fetch<AuthResponseResult>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
  }

  const loginWithGoogleToken = async (idToken: string, name: string, rejectPhoto?: boolean) => {
    return await $fetch<AuthResponseResult>('/api/auth/google', {
      method: 'POST',
      body: { data: { idToken, name, ...(rejectPhoto ? { rejectPhoto: true } : {}) } }
    })
  }

  const logout = async () => {
    return await $fetch('/api/auth/logout', { method: 'POST' })
  }

  const refreshToken = async () => {
    return await $fetch<{
      success: boolean
      result: RefreshResponse
    }>('/api/auth/refresh', { method: 'POST' })
  }

  return {
    loginWithCredentials,
    loginWithGoogleToken,
    logout,
    refreshToken
  }
}
