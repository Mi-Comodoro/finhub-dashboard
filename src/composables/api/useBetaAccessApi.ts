import type {
  BetaAccessRequest,
  BetaAccessStatus,
  BetaAccessSummary,
  BetaInvite
} from '~/types/beta-access.types'

export function useBetaAccessApi() {
  // Public: used by the sign-up screen to pre-fill the invited email
  const getInvitation = async (token: string) =>
    $fetch<{ success: boolean; result: { email: string } }>(
      `/api/beta-access/invitations/${encodeURIComponent(token)}`
    )

  // Admin
  const listRequests = async (status?: BetaAccessStatus) =>
    $fetch<{ success: boolean; result: BetaAccessRequest[] }>('/api/admin/beta-access', {
      query: status ? { status } : undefined
    })

  const getSummary = async () =>
    $fetch<{ success: boolean; result: BetaAccessSummary }>('/api/admin/beta-access/summary')

  const approve = async (id: string) =>
    $fetch<{ success: boolean; result: BetaInvite }>(`/api/admin/beta-access/${id}/approve`, {
      method: 'POST'
    })

  const reject = async (id: string) =>
    $fetch<{ success: boolean; result: { rejected: boolean } }>(
      `/api/admin/beta-access/${id}/reject`,
      { method: 'POST' }
    )

  return { getInvitation, listRequests, getSummary, approve, reject }
}
