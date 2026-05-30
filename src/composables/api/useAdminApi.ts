import type {
  AdminMetricsSummary,
  AdminStats,
  AdminUserDetail,
  AdminUsersResult,
  AnnouncementItem,
  AnnouncementSegment,
  AnnouncementSendPayload,
  AnnouncementSendResult,
  AuditLogFilters,
  AuditLogResult,
  GrowthPeriod,
  SystemConfigItem,
  UserGrowthResponse
} from '~/types/domain'

export function useAdminApi() {
  const getStats = async () => $fetch<{ success: boolean; result: AdminStats }>('/api/admin/stats')

  const getMetricsSummary = async () =>
    $fetch<{ success: boolean; result: AdminMetricsSummary }>('/api/admin/metrics/summary')

  const getUserGrowth = async (period: GrowthPeriod) =>
    $fetch<{ success: boolean; result: UserGrowthResponse }>(
      `/api/admin/metrics/user-growth?period=${period}`
    )

  const getUsers = async (page = 1, limit = 20) =>
    $fetch<{ success: boolean; result: AdminUsersResult }>(
      `/api/admin/users?page=${page}&limit=${limit}`
    )

  const getUserById = async (id: string) =>
    $fetch<{ success: boolean; result: AdminUserDetail }>(`/api/admin/users/${id}`)

  const updateUser = async (id: string, dto: Partial<AdminUserDetail>) =>
    $fetch<{ success: boolean; result: AdminUserDetail }>(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: dto
    })

  const deleteUser = async (id: string) =>
    $fetch<{ success: boolean; result: unknown }>(`/api/admin/users/${id}`, {
      method: 'DELETE'
    })

  const getConfig = async () =>
    $fetch<{ success: boolean; result: SystemConfigItem[] }>('/api/admin/config')

  const updateConfig = async (key: string, value: string) =>
    $fetch<{ success: boolean; result: SystemConfigItem }>(`/api/admin/config/${key}`, {
      method: 'PATCH',
      body: { value }
    })

  const getAnnouncements = async () =>
    $fetch<{ success: boolean; result: AnnouncementItem[] }>('/api/admin/announcements')

  const sendAnnouncement = async (payload: AnnouncementSendPayload) =>
    $fetch<{ success: boolean; result: AnnouncementSendResult }>('/api/admin/announcements', {
      method: 'POST',
      body: payload
    })

  const previewAnnouncementCount = async (segment: AnnouncementSegment) =>
    $fetch<{ success: boolean; result: { count: number } }>(
      `/api/admin/announcements/preview?segment=${segment}`
    )

  const getAuditLogs = async (filters: AuditLogFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.action) params.set('action', filters.action)
    if (filters.targetType) params.set('targetType', filters.targetType)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    if (filters.page) params.set('page', String(filters.page))
    const qs = params.toString() ? `?${params.toString()}` : ''
    return $fetch<{ success: boolean; result: AuditLogResult }>(`/api/admin/audit-logs${qs}`)
  }

  return {
    getStats,
    getMetricsSummary,
    getUserGrowth,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getConfig,
    updateConfig,
    getAnnouncements,
    sendAnnouncement,
    previewAnnouncementCount,
    getAuditLogs
  }
}
