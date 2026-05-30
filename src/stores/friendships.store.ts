import { defineStore } from 'pinia'

import type {
  FriendshipRequest,
  FriendshipSent,
  FriendWithProfile
} from '@/types/friendships.types'

export const useFriendshipsStore = defineStore('friendships', {
  state: () => ({
    friends: [] as FriendWithProfile[],
    receivedRequests: [] as FriendshipRequest[],
    sentRequests: [] as FriendshipSent[],
    isLoading: false,
    error: null as { title: string; message: string } | null
  }),
  getters: {
    pendingCount: state => state.receivedRequests.length
  },
  actions: {
    setFriends(data: FriendWithProfile[]) {
      this.friends = data
    },
    setReceivedRequests(data: FriendshipRequest[]) {
      this.receivedRequests = data
    },
    setSentRequests(data: FriendshipSent[]) {
      this.sentRequests = data
    },
    setLoading(loading: boolean) {
      this.isLoading = loading
    },
    setError(err: { title: string; message: string } | null) {
      this.error = err
    },
    removeFromReceived(requesterId: string) {
      this.receivedRequests = this.receivedRequests.filter(r => r.requester.id !== requesterId)
    },
    removeSentByAddresseeId(addresseeId: string) {
      this.sentRequests = this.sentRequests.filter(r => r.addressee.id !== addresseeId)
    },
    removeFriendById(friendUserId: string) {
      this.friends = this.friends.filter(f => f.friendUserId !== friendUserId)
    }
  }
})
