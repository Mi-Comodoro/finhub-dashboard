import { defineStore } from 'pinia'

import type { UserMe } from '~/types/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null as string | null,
    email: null as string | null,
    handle: null as string | null,
    name: null as string | null,
    displayName: null as string | null,
    photo: null as string | null,
    rejectPhoto: false as boolean,
    phone: null as string | null,
    gender: 'prefer_not_to_say' as 'male' | 'female' | 'prefer_not_to_say',
    createdAt: null as Date | null,
    trialEndsAt: null as Date | null,
    isActive: false,
    isPhoneVerified: false as boolean,
    country: null as string | null
  }),

  getters: {
    userInfo: state => ({
      id: state.id,
      email: state.email,
      name: state.name,
      displayName: state.displayName,
      photo: state.photo,
      phone: state.phone,
      gender: state.gender,
      trialEndsAt: state.trialEndsAt,
      isActive: state.isActive,
      country: state.country
    })
  },
  actions: {
    setUser(userData: UserMe['result']['user']) {
      this.id = userData.id ?? this.id
      this.email = userData.email ?? this.email
      this.handle = userData.handle ?? this.handle
      this.name = userData.name ?? this.name
      this.displayName = userData.displayName ?? this.displayName
      this.photo = userData.photo ?? this.photo
      this.rejectPhoto = userData.rejectPhoto ?? this.rejectPhoto
      this.phone = userData.phone ?? this.phone
      this.gender = (
        ['male', 'female', 'prefer_not_to_say'].includes(userData.gender as string)
          ? userData.gender
          : this.gender
      ) as 'male' | 'female' | 'prefer_not_to_say'
      this.createdAt = userData.createdAt ? new Date(userData.createdAt) : this.createdAt
      this.trialEndsAt = userData.trialEndsAt ? new Date(userData.trialEndsAt) : this.trialEndsAt
      this.isActive = userData.isActive ?? this.isActive
      this.isPhoneVerified = userData.isPhoneVerified ?? this.isPhoneVerified
      this.country = userData.country ?? this.country
    },
    clearUser() {
      this.id = null
      this.email = null
      this.handle = null
      this.name = null
      this.displayName = null
      this.photo = null
      this.rejectPhoto = false
      this.phone = null
      this.gender = 'prefer_not_to_say'
      this.createdAt = null
      this.trialEndsAt = null
      this.isActive = false
      this.isPhoneVerified = false
      this.country = null
    }
  }
})
