import { TOKEN_EXPIRES_AT } from '~/common/constants'
import type { RefreshResponse } from '~/types/auth'

const REFRESH_BEFORE_MS = 5 * 60 * 1000
let timer: ReturnType<typeof setTimeout> | null = null

export function useSessionWatcher() {
  function stopWatcher() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  async function executeRefresh() {
    try {
      const { success, result } = await $fetch<{
        success: boolean
        result: RefreshResponse
      }>('/api/auth/refresh', { method: 'POST' })

      if (success && result?.expiresAt) {
        scheduleRefresh(result.expiresAt)
      } else {
        const { logout } = useAuth()
        await logout()
      }
    } catch {
      const { logout } = useAuth()
      await logout()
    }
  }

  function scheduleRefresh(expiresAtUnix: number) {
    stopWatcher()

    const expiresAtMs = expiresAtUnix * 1000
    const now = Date.now()
    const msUntilRefresh = expiresAtMs - now - REFRESH_BEFORE_MS

    if (msUntilRefresh <= 0) {
      void executeRefresh()
      return
    }

    timer = setTimeout(() => {
      void executeRefresh()
    }, msUntilRefresh)
  }

  function startWatcher(expiresAt?: number) {
    if (!import.meta.client) return

    const resolvedExpiresAt = expiresAt ?? Number(useCookie(TOKEN_EXPIRES_AT).value)

    if (!resolvedExpiresAt || Number.isNaN(resolvedExpiresAt)) return

    scheduleRefresh(resolvedExpiresAt)
  }

  return { startWatcher, stopWatcher }
}
