import type {
  AddMemberDto,
  ContributionSummary,
  CreateGroupDto,
  CreateGroupExpenseDto,
  Group,
  GroupBudgetProgress,
  GroupExpense,
  GroupMember,
  InviteWithContextDto,
  RespondGroupInvitationDto,
  RespondInvitationResult,
  UpdateGroupDto,
  UpdateGroupExpenseDto
} from '@/types/groups.types'

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

  const getContributions = async (groupId: string) =>
    $fetch<{ success: boolean; result: ContributionSummary }>(
      `/api/groups/${groupId}/contributions`
    )

  const getExpenses = async (groupId: string) =>
    $fetch<{ success: boolean; result: GroupExpense[] }>(`/api/groups/${groupId}/expenses`)

  const createExpense = async (groupId: string, data: CreateGroupExpenseDto) =>
    $fetch<{ success: boolean; result: GroupExpense }>(`/api/groups/${groupId}/expenses`, {
      method: 'POST',
      body: data
    })

  const payExpense = async (groupId: string, expenseId: string) =>
    $fetch<{ success: boolean; result: GroupExpense }>(
      `/api/groups/${groupId}/expenses/${expenseId}/pay`,
      { method: 'PATCH' }
    )

  const markCxp = async (groupId: string, expenseId: string) =>
    $fetch<{ success: boolean; result: GroupExpense }>(
      `/api/groups/${groupId}/expenses/${expenseId}/pending`,
      { method: 'PATCH' }
    )

  const updateExpense = async (groupId: string, expenseId: string, data: UpdateGroupExpenseDto) =>
    $fetch<{ success: boolean; result: GroupExpense }>(
      `/api/groups/${groupId}/expenses/${expenseId}`,
      { method: 'PATCH', body: data }
    )

  const getGroupBudgetProgress = async (groupId: string) =>
    $fetch<{ success: boolean; result: GroupBudgetProgress }>(
      `/api/groups/${groupId}/budget-progress`
    )

  const inviteWithContext = async (groupId: string, data: InviteWithContextDto) =>
    $fetch<{ success: boolean; result: GroupMember }>(`/api/groups/${groupId}/invite-context`, {
      method: 'POST',
      body: data
    })

  const respondToInvitation = async (groupId: string, data: RespondGroupInvitationDto) =>
    $fetch<{ success: boolean; result: RespondInvitationResult }>(
      `/api/groups/${groupId}/respond-invitation`,
      { method: 'POST', body: data }
    )

  return {
    getGroups,
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    getContributions,
    getExpenses,
    createExpense,
    payExpense,
    markCxp,
    updateExpense,
    getGroupBudgetProgress,
    inviteWithContext,
    respondToInvitation
  }
}
