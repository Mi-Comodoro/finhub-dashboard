import type { PlanData } from '~/types/api'

export const usePlansApi = () => {
  const getPublicPlans = async () =>
    $fetch<{ success: boolean; result: PlanData[] }>('/api/plans')

  const getAdminPlans = async () =>
    $fetch<{ success: boolean; result: PlanData[] }>('/api/admin/plans')

  const createPlan = async (data: Record<string, unknown>) =>
    $fetch<{ success: boolean; result: PlanData }>('/api/admin/plans', {
      method: 'POST',
      body: data
    })

  const updatePlan = async (id: string, data: Record<string, unknown>) =>
    $fetch<{ success: boolean; result: PlanData }>(`/api/admin/plans/${id}`, {
      method: 'PATCH',
      body: data
    })

  const deletePlan = async (id: string) =>
    $fetch<{ success: boolean; result: { id: string } }>(`/api/admin/plans/${id}`, {
      method: 'DELETE'
    })

  return { getPublicPlans, getAdminPlans, createPlan, updatePlan, deletePlan }
}
