import type { FetchError } from 'ofetch'

import { useGroupsApi } from '@/composables/api/useGroupsApi'
import { useGroupsStore } from '@/stores/groups.store'
import type {
  AddMemberDto,
  ContributionSummary,
  CreateGroupDto,
  CreateGroupExpenseDto,
  GroupExpense,
  UpdateGroupDto
} from '@/types/groups.types'

const createErrorMessage = (error: FetchError) => {
  if (error.status === 401) {
    return {
      status: error.status,
      title: 'Tu sesión ha expirado.',
      message: 'Por seguridad, tu sesión ha caducado. Por favor, inicia sesión nuevamente.'
    }
  }
  return {
    title: '¡Ups! Algo no salió como esperábamos',
    message: 'Lo sentimos, no pudimos completar esta acción.'
  }
}

export const useGroupsApplication = () => {
  const groupsStore = useGroupsStore()
  const groupsApi = useGroupsApi()

  const fetchGroups = async () => {
    groupsStore.setLoading(true)
    groupsStore.setError(null)
    try {
      const { result } = await groupsApi.getGroups()
      groupsStore.setGroups(result)
      return { success: true }
    } catch (err) {
      groupsStore.setError(createErrorMessage(err as FetchError))
      return { success: false }
    } finally {
      groupsStore.setLoading(false)
    }
  }

  const fetchGroup = async (id: string) => {
    groupsStore.setLoading(true)
    groupsStore.setError(null)
    try {
      const { result } = await groupsApi.getGroup(id)
      groupsStore.setSelectedGroup(result)
      return { success: true }
    } catch (err) {
      groupsStore.setError(createErrorMessage(err as FetchError))
      return { success: false }
    } finally {
      groupsStore.setLoading(false)
    }
  }

  const createGroup = async (dto: CreateGroupDto) => {
    try {
      await groupsApi.createGroup(dto)
      await fetchGroups()
      return { success: true }
    } catch (err) {
      groupsStore.setError(createErrorMessage(err as FetchError))
      return { success: false }
    }
  }

  const updateGroup = async (id: string, dto: UpdateGroupDto) => {
    try {
      await groupsApi.updateGroup(id, dto)
      await fetchGroups()
      return { success: true }
    } catch (err) {
      groupsStore.setError(createErrorMessage(err as FetchError))
      return { success: false }
    }
  }

  const deleteGroup = async (id: string) => {
    try {
      await groupsApi.deleteGroup(id)
      await fetchGroups()
      return { success: true }
    } catch (err) {
      groupsStore.setError(createErrorMessage(err as FetchError))
      return { success: false }
    }
  }

  const addMember = async (groupId: string, dto: AddMemberDto) => {
    try {
      await groupsApi.addMember(groupId, dto)
      await fetchGroup(groupId)
      return { success: true }
    } catch (err) {
      groupsStore.setError(createErrorMessage(err as FetchError))
      return { success: false }
    }
  }

  const removeMember = async (groupId: string, userId: string) => {
    try {
      await groupsApi.removeMember(groupId, userId)
      await fetchGroup(groupId)
      return { success: true }
    } catch (err) {
      groupsStore.setError(createErrorMessage(err as FetchError))
      return { success: false }
    }
  }

  const fetchContributions = async (
    groupId: string
  ): Promise<{ success: boolean; data?: ContributionSummary }> => {
    try {
      const { result } = await groupsApi.getContributions(groupId)
      return { success: true, data: result }
    } catch (err) {
      return { success: false }
    }
  }

  const fetchExpenses = async (
    groupId: string
  ): Promise<{ success: boolean; data?: GroupExpense[] }> => {
    try {
      const { result } = await groupsApi.getExpenses(groupId)
      return { success: true, data: result }
    } catch (err) {
      return { success: false }
    }
  }

  const createExpense = async (
    groupId: string,
    dto: CreateGroupExpenseDto
  ): Promise<{ success: boolean; data?: GroupExpense }> => {
    try {
      const { result } = await groupsApi.createExpense(groupId, dto)
      return { success: true, data: result }
    } catch (err) {
      return { success: false }
    }
  }

  const payExpense = async (
    groupId: string,
    expenseId: string
  ): Promise<{ success: boolean; data?: GroupExpense }> => {
    try {
      const { result } = await groupsApi.payExpense(groupId, expenseId)
      return { success: true, data: result }
    } catch (err) {
      return { success: false }
    }
  }

  const markExpenseCxp = async (
    groupId: string,
    expenseId: string
  ): Promise<{ success: boolean; data?: GroupExpense }> => {
    try {
      const { result } = await groupsApi.markCxp(groupId, expenseId)
      return { success: true, data: result }
    } catch (err) {
      return { success: false }
    }
  }

  const groups = computed(() => groupsStore.groups)
  const selectedGroup = computed(() => groupsStore.selectedGroup)
  const isLoading = computed(() => groupsStore.isLoading)
  const error = computed(() => groupsStore.error)

  return {
    groups,
    selectedGroup,
    isLoading,
    error,
    fetchGroups,
    fetchGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    fetchContributions,
    fetchExpenses,
    createExpense,
    payExpense,
    markExpenseCxp
  }
}
