import type { AdminStats, AdminUserDetail,AdminUsersResult } from '~/types/domain'

export function useAdminApi() {
  const getStats = async () =>
    $fetch<{ success: boolean; result: AdminStats }>('/api/admin/stats')

  const getUsers = async (page = 1, limit = 20) =>
    $fetch<{ success: boolean; result: AdminUsersResult }>(
      `/api/admin/users?page=${page}&limit=${limit}`
    )

  const getUserById = async (id: string) =>
    $fetch<{ success: boolean; result: AdminUserDetail }>(`/api/admin/users/${id}`)

  return { getStats, getUsers, getUserById }
}
