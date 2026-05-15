import { defineStore } from 'pinia'

import type {
  AdminPagination,
  AdminState,
  AdminStats,
  AdminUser,
  AdminUserDetail
} from '~/types/domain'

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    stats: null,
    users: [],
    selectedUser: null,
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    isLoading: false,
    isLoadingUser: false,
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

    setError(error: string | null) {
      this.error = error
    },

    setStats(stats: AdminStats) {
      this.stats = stats
      this.error = null
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

    clearAdmin() {
      this.stats = null
      this.users = []
      this.selectedUser = null
      this.error = null
    }
  }
})
