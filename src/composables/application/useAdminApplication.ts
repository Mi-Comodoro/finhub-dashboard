import { storeToRefs } from 'pinia'

import { useAdminApi } from '~/composables/api/useAdminApi'
import { useAdminStore } from '~/stores/admin.store'

export const useAdminApplication = () => {
  const adminStore = useAdminStore()
  const { stats, users, selectedUser, pagination, isLoading, isLoadingUser, error } =
    storeToRefs(adminStore)
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

  return {
    stats,
    users,
    selectedUser,
    pagination,
    isLoading,
    isLoadingUser,
    error,
    fetchStats,
    fetchUsers,
    fetchUserDetail,
    changeRole,
    clearSelectedUser
  }
}
