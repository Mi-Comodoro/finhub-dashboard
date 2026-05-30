import type {
  FriendSearchResult,
  FriendshipRequest,
  FriendshipSent,
  FriendWithProfile
} from '@/types/friendships.types'

export const useFriendshipsApi = () => {
  const getFriends = async () => {
    return await $fetch<{ success: boolean; result: FriendWithProfile[] }>('/api/friendships')
  }

  const getReceivedRequests = async () => {
    return await $fetch<{ success: boolean; result: FriendshipRequest[] }>(
      '/api/friendships/requests/received'
    )
  }

  const getSentRequests = async () => {
    return await $fetch<{ success: boolean; result: FriendshipSent[] }>(
      '/api/friendships/requests/sent'
    )
  }

  const sendRequest = async (handle: string) => {
    return await $fetch<{ success: boolean; result: { id: string } }>('/api/friendships/request', {
      method: 'POST',
      body: { handle }
    })
  }

  const acceptRequest = async (requesterId: string) => {
    return await $fetch<{ success: boolean; result: { success: boolean } }>(
      `/api/friendships/${requesterId}/accept`,
      { method: 'POST' }
    )
  }

  const rejectRequest = async (requesterId: string) => {
    return await $fetch<{ success: boolean; result: { success: boolean } }>(
      `/api/friendships/${requesterId}/reject`,
      { method: 'POST' }
    )
  }

  const removeFriend = async (friendId: string) => {
    return await $fetch<{ success: boolean; result: { success: boolean } }>(
      `/api/friendships/${friendId}`,
      { method: 'DELETE' }
    )
  }

  const searchUsers = async (q: string) => {
    return await $fetch<{ success: boolean; result: FriendSearchResult[] }>('/api/users/search', {
      query: { q }
    })
  }

  const updateHandle = async (handle: string) => {
    return await $fetch<{ success: boolean; result: { handle: string } }>('/api/users/handle', {
      method: 'PATCH',
      body: { handle }
    })
  }

  return {
    getFriends,
    getReceivedRequests,
    getSentRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    searchUsers,
    updateHandle
  }
}
