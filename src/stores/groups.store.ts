import { defineStore } from 'pinia'

import type { Group } from '@/types/groups.types'

export const useGroupsStore = defineStore('groups', {
  state: (): {
    groups: Group[]
    selectedGroup: Group | null
    isLoading: boolean
    error: { title: string; message: string; status?: number } | null
  } => ({
    groups: [],
    selectedGroup: null,
    isLoading: false,
    error: null
  }),
  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },
    setGroups(groups: Group[]) {
      this.groups = groups
      this.error = null
    },
    setSelectedGroup(group: Group | null) {
      this.selectedGroup = group
    },
    setError(error: { title: string; message: string; status?: number } | null) {
      this.error = error
    }
  }
})
