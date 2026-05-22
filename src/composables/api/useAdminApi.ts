import type { AdminStats, AdminUserDetail, AdminUsersResult } from '~/types/domain'

export function useAdminApi() {
  const getStats = async () => $fetch<{ success: boolean; result: AdminStats }>('/api/admin/stats')

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

  return { getStats, getUsers, getUserById, updateUser, deleteUser }
}
