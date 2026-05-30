import { storeToRefs } from 'pinia'

import { useAdminApi } from '~/composables/api/useAdminApi'
import { useAdminStore } from '~/stores/admin.store'
import type {
  AnnouncementSegment,
  AnnouncementSendPayload,
  AuditLogFilters,
  GrowthPeriod
} from '~/types/domain'

export const useAdminApplication = () => {
  const adminStore = useAdminStore()
  const {
    stats,
    metricsSummary,
    growthData,
    configItems,
    announcements,
    auditLogs,
    auditTotal,
    auditPage,
    users,
    selectedUser,
    pagination,
    isLoading,
    isLoadingUser,
    isLoadingMetrics,
    isLoadingGrowth,
    isLoadingConfig,
    isLoadingAnnouncements,
    isLoadingAudit,
    error
  } = storeToRefs(adminStore)
  const adminApi = useAdminApi()

  const fetchStats = async () => {
    try {
      adminStore.setLoading(true)
      adminStore.setError(null)
      const { success, result } = await adminApi.getStats()
      if (success && result) adminStore.setStats(result)
      return { success }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener estadísticas'
      adminStore.setError(message)
      return { success: false }
    } finally {
      adminStore.setLoading(false)
    }
  }

  const fetchMetricsSummary = async () => {
    try {
      adminStore.setLoadingMetrics(true)
      const { success, result } = await adminApi.getMetricsSummary()
      if (success && result) adminStore.setMetricsSummary(result)
      return { success }
    } catch {
      return { success: false }
    } finally {
      adminStore.setLoadingMetrics(false)
    }
  }

  const fetchUserGrowth = async (period: GrowthPeriod) => {
    try {
      adminStore.setLoadingGrowth(true)
      const { success, result } = await adminApi.getUserGrowth(period)
      if (success && result) adminStore.setGrowthData(result)
      return { success }
    } catch {
      return { success: false }
    } finally {
      adminStore.setLoadingGrowth(false)
    }
  }

  const fetchUsers = async (page = 1) => {
    try {
      adminStore.setLoading(true)
      adminStore.setError(null)
      const { success, result } = await adminApi.getUsers(page)
      if (success && result) adminStore.setUsers(result.users, result.pagination)
      return { success }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener usuarios'
      adminStore.setError(message)
      return { success: false }
    } finally {
      adminStore.setLoading(false)
    }
  }

  const fetchUserDetail = async (id: string) => {
    try {
      adminStore.setLoadingUser(true)
      adminStore.setError(null)
      const { success, result } = await adminApi.getUserById(id)
      if (success && result) adminStore.setSelectedUser(result)
      return { success }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener detalle del usuario'
      adminStore.setError(message)
      return { success: false }
    } finally {
      adminStore.setLoadingUser(false)
    }
  }

  const changeRole = async (userId: string, role: 'admin' | 'user') => {
    adminStore.updateUserRole(userId, role)
    return { success: true }
  }

  const clearSelectedUser = () => {
    adminStore.setSelectedUser(null)
  }

  const fetchConfig = async () => {
    try {
      adminStore.setLoadingConfig(true)
      const { success, result } = await adminApi.getConfig()
      if (success && result) adminStore.setConfigItems(result)
      return { success }
    } catch {
      return { success: false }
    } finally {
      adminStore.setLoadingConfig(false)
    }
  }

  const updateConfigItem = async (key: string, value: string) => {
    try {
      const { success } = await adminApi.updateConfig(key, value)
      if (success) adminStore.updateConfigItem(key, value)
      return { success }
    } catch {
      return { success: false }
    }
  }

  const fetchAnnouncements = async () => {
    try {
      adminStore.setLoadingAnnouncements(true)
      const { success, result } = await adminApi.getAnnouncements()
      if (success && result) adminStore.setAnnouncements(result)
      return { success }
    } catch {
      return { success: false }
    } finally {
      adminStore.setLoadingAnnouncements(false)
    }
  }

  const sendAnnouncement = async (payload: AnnouncementSendPayload) => {
    try {
      const { success, result } = await adminApi.sendAnnouncement(payload)
      if (success && result) {
        adminStore.prependAnnouncement({
          id: result.id,
          title: payload.title,
          segment: payload.segment,
          recipientCount: result.recipientCount,
          sentAt: new Date().toISOString(),
          sentBy: ''
        })
      }
      return { success, recipientCount: result?.recipientCount ?? 0 }
    } catch {
      return { success: false, recipientCount: 0 }
    }
  }

  const previewAnnouncementCount = async (segment: AnnouncementSegment) => {
    try {
      const { result } = await adminApi.previewAnnouncementCount(segment)
      return result?.count ?? 0
    } catch {
      return 0
    }
  }

  const fetchAuditLogs = async (filters: AuditLogFilters = {}) => {
    try {
      adminStore.setLoadingAudit(true)
      const { success, result } = await adminApi.getAuditLogs(filters)
      if (success && result) adminStore.setAuditLogs(result.data, result.total, result.page)
      return { success }
    } catch {
      return { success: false }
    } finally {
      adminStore.setLoadingAudit(false)
    }
  }

  return {
    stats,
    metricsSummary,
    growthData,
    configItems,
    announcements,
    auditLogs,
    auditTotal,
    auditPage,
    users,
    selectedUser,
    pagination,
    isLoading,
    isLoadingUser,
    isLoadingMetrics,
    isLoadingGrowth,
    isLoadingConfig,
    isLoadingAnnouncements,
    isLoadingAudit,
    error,
    fetchStats,
    fetchMetricsSummary,
    fetchUserGrowth,
    fetchUsers,
    fetchUserDetail,
    changeRole,
    clearSelectedUser,
    fetchConfig,
    updateConfigItem,
    fetchAnnouncements,
    sendAnnouncement,
    previewAnnouncementCount,
    fetchAuditLogs
  }
}
