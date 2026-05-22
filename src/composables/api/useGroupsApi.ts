import type { AddMemberDto, CreateGroupDto, Group, UpdateGroupDto } from '@/types/groups.types'

export function useGroupsApi() {
  const getGroups = async () => $fetch<{ success: boolean; result: Group[] }>('/api/groups')

  const getGroup = async (id: string) =>
    $fetch<{ success: boolean; result: Group }>(`/api/groups/${id}`)

  const createGroup = async (data: CreateGroupDto) =>
    $fetch<{ success: boolean; result: Group }>('/api/groups', { method: 'POST', body: data })

  const updateGroup = async (id: string, data: UpdateGroupDto) =>
    $fetch<{ success: boolean; result: Group }>(`/api/groups/${id}`, {
      method: 'PATCH',
      body: data
    })

  const deleteGroup = async (id: string) =>
    $fetch<{ success: boolean }>(`/api/groups/${id}`, { method: 'DELETE' })

  const addMember = async (groupId: string, data: AddMemberDto) =>
    $fetch<{ success: boolean; result: Group }>(`/api/groups/${groupId}/members`, {
      method: 'POST',
      body: data
    })

  const removeMember = async (groupId: string, userId: string) =>
    $fetch<{ success: boolean }>(`/api/groups/${groupId}/members/${userId}`, {
      method: 'DELETE'
    })

  return { getGroups, getGroup, createGroup, updateGroup, deleteGroup, addMember, removeMember }
}
