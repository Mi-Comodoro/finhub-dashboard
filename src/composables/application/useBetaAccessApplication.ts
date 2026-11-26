import { storeToRefs } from 'pinia'

import { useBetaAccessApi } from '~/composables/api/useBetaAccessApi'
import { useBetaAccessStore } from '~/stores/beta-access.store'
import type { BetaAccessStatus, BetaInvite } from '~/types/beta-access.types'

const errorMessage = (err: unknown, fallback: string): string => {
  const data = (err as { data?: { message?: string } } | null)?.data
  return data?.message ?? (err instanceof Error ? err.message : fallback)
}

/** Admin use cases: review beta access requests and issue invitations */
export const useBetaAccessApplication = () => {
  const store = useBetaAccessStore()
  const { requests, summary, isLoading, error } = storeToRefs(store)
  const api = useBetaAccessApi()

  const loadSummary = async () => {
    try {
      const { success, result } = await api.getSummary()
      if (success) store.setSummary(result)
      return { success }
    } catch {
      return { success: false }
    }
  }

  const loadRequests = async (status?: BetaAccessStatus) => {
    try {
      store.setLoading(true)
      store.setError(null)
      const { success, result } = await api.listRequests(status)
      if (success) store.setRequests(result)
      return { success }
    } catch (err) {
      store.setError(errorMessage(err, 'No se pudieron cargar las solicitudes'))
      return { success: false }
    } finally {
      store.setLoading(false)
    }
  }

  const refresh = async (status?: BetaAccessStatus) => {
    await Promise.all([loadRequests(status), loadSummary()])
  }

  /** Approves (or re-issues) the invitation. The token is only available in this result. */
  const approve = async (
    id: string
  ): Promise<{ success: boolean; invite?: BetaInvite; error?: string }> => {
    try {
      const { success, result } = await api.approve(id)
      return success ? { success, invite: result } : { success: false }
    } catch (err) {
      return { success: false, error: errorMessage(err, 'No se pudo aprobar la solicitud') }
    }
  }

  const reject = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { success } = await api.reject(id)
      return { success }
    } catch (err) {
      return { success: false, error: errorMessage(err, 'No se pudo rechazar la solicitud') }
    }
  }

  /** The link an admin sends to the invited person */
  const buildInviteLink = (token: string): string => {
    const origin = import.meta.client ? window.location.origin : ''
    return `${origin}/?invite=${encodeURIComponent(token)}`
  }

  return { requests, summary, isLoading, error, refresh, approve, reject, buildInviteLink }
}
