export interface DeletionStatus {
  requested: boolean
  requestedAt: string | null
  scheduledAt: string | null
  /** Days left before the permanent deletion (null when there is no request) */
  daysLeft: number | null
}

export const usePrivacyApi = () => {
  const exportData = async () =>
    await $fetch<{ success: boolean; result: Record<string, unknown> }>('/api/privacy/export')

  const getDeletion = async () =>
    await $fetch<{ success: boolean; result: DeletionStatus }>('/api/privacy/deletion')

  const requestDeletion = async (confirmation: string) =>
    await $fetch<{ success: boolean; result: DeletionStatus }>('/api/privacy/deletion', {
      method: 'POST',
      body: { confirmation }
    })

  const cancelDeletion = async () =>
    await $fetch<{ success: boolean; result: DeletionStatus }>('/api/privacy/deletion', {
      method: 'DELETE'
    })

  return { exportData, getDeletion, requestDeletion, cancelDeletion }
}
