import { defineStore } from 'pinia'

import type {
  AdminMetricsSummary,
  AdminPagination,
  AdminState,
  AdminStats,
  AdminUser,
  AdminUserDetail,
  AnnouncementItem,
  AuditLogItem,
  SystemConfigItem,
  UserGrowthResponse
} from '~/types/domain'

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    stats: null,
    metricsSummary: null,
    growthData: null,
    configItems: [],
    announcements: [],
    auditLogs: [],
    auditTotal: 0,
    auditPage: 1,
    users: [],
    selectedUser: null,
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    isLoading: false,
    isLoadingUser: false,
    isLoadingMetrics: false,
    isLoadingGrowth: false,
    isLoadingConfig: false,
    isLoadingAnnouncements: false,
    isLoadingAudit: false,
    error: null
  }),

  getters: {},

  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setLoadingUser(loading: boolean) {
      this.isLoadingUser = loading
    },

    setLoadingMetrics(loading: boolean) {
      this.isLoadingMetrics = loading
    },

    setLoadingGrowth(loading: boolean) {
      this.isLoadingGrowth = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    setStats(stats: AdminStats) {
      this.stats = stats
      this.error = null
    },

    setMetricsSummary(summary: AdminMetricsSummary) {
      this.metricsSummary = summary
      this.error = null
    },

    setGrowthData(data: UserGrowthResponse) {
      this.growthData = data
    },

    setLoadingConfig(loading: boolean) {
      this.isLoadingConfig = loading
    },

    setConfigItems(items: SystemConfigItem[]) {
      this.configItems = items
    },

    updateConfigItem(key: string, value: string) {
      const idx = this.configItems.findIndex(i => i.key === key)
      if (idx !== -1) {
        const existing = this.configItems[idx]!
        this.configItems[idx] = {
          key: existing.key,
          value,
          description: existing.description,
          updatedAt: existing.updatedAt
        }
      }
    },

    setUsers(users: AdminUser[], pagination: AdminPagination) {
      this.users = [...users]
      this.pagination = pagination
      this.error = null
    },

    setSelectedUser(user: AdminUserDetail | null) {
      this.selectedUser = user
    },

    updateUserRole(userId: string, role: 'admin' | 'user') {
      const idx = this.users.findIndex(u => u.id === userId)
      if (idx !== -1) this.users[idx] = { ...this.users[idx], role }
    },

    setLoadingAnnouncements(loading: boolean) {
      this.isLoadingAnnouncements = loading
    },

    setAnnouncements(items: AnnouncementItem[]) {
      this.announcements = items
    },

    prependAnnouncement(item: AnnouncementItem) {
      this.announcements = [item, ...this.announcements]
    },

    setLoadingAudit(loading: boolean) {
      this.isLoadingAudit = loading
    },

    setAuditLogs(data: AuditLogItem[], total: number, page: number) {
      this.auditLogs = data
      this.auditTotal = total
      this.auditPage = page
    },

    clearAdmin() {
      this.stats = null
      this.metricsSummary = null
      this.growthData = null
      this.configItems = []
      this.announcements = []
      this.auditLogs = []
      this.auditTotal = 0
      this.auditPage = 1
      this.users = []
      this.selectedUser = null
      this.error = null
    }
  }
})
