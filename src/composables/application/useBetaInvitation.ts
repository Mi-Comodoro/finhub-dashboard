import { storeToRefs } from 'pinia'

import { useBetaAccessApi } from '~/composables/api/useBetaAccessApi'
import { useBetaAccessStore } from '~/stores/beta-access.store'

const COOKIE_NAME = 'mc_invite'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14 // the invitation expires in 14 days

/**
 * Closed beta: keeps the invitation the person arrived with (`/?invite=<token>`) until they register.
 * The token is single-use and tied to one email; the server validates it again on sign-up.
 */
export const useBetaInvitation = () => {
  const store = useBetaAccessStore()
  const { invitedEmail } = storeToRefs(store)
  const api = useBetaAccessApi()
  const tokenCookie = useCookie<string | null>(COOKIE_NAME, {
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
    default: () => null
  })

  const clear = () => {
    tokenCookie.value = null
    store.setInvitedEmail(null)
  }

  /**
   * Validates a token and remembers it. Only a rejected token (404) is forgotten: after a temporary
   * failure it stays saved, so the next visit can try again.
   */
  const capture = async (
    token: string
  ): Promise<{ success: boolean; error?: string; invalid?: boolean }> => {
    try {
      const { success, result } = await api.getInvitation(token)
      if (!success || !result?.email) throw new Error('Unexpected invitation response')
      tokenCookie.value = token
      store.setInvitedEmail(result.email)
      return { success: true }
    } catch (err) {
      const { statusCode, data } = (err ?? {}) as {
        statusCode?: number
        data?: { message?: string }
      }
      const invalid = statusCode === 404

      if (invalid) clear()
      else tokenCookie.value = token

      return {
        success: false,
        invalid,
        error: data?.message ?? 'No pudimos comprobar tu invitación. Inténtalo en unos minutos.'
      }
    }
  }

  /** On a later visit: recovers the invited email from the saved token */
  const restore = async () => {
    if (tokenCookie.value && !invitedEmail.value) await capture(tokenCookie.value)
  }

  return { token: tokenCookie, invitedEmail, capture, restore, clear }
}
