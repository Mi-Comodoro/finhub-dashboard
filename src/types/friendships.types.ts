export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'

export interface Friendship {
  id: string
  requesterId: string
  addresseeId: string
  status: FriendshipStatus
  createdAt: string
  updatedAt: string
}

export interface FriendProfile {
  id: string
  handle: string | null
  displayName: string | null
  photo?: string | null
}

export interface FriendshipRequest {
  friendshipId: string
  requester: FriendProfile
  createdAt: string
}

export interface FriendshipSent {
  friendshipId: string
  addressee: FriendProfile
  createdAt: string
  status: FriendshipStatus
}

export interface FriendWithProfile {
  friendshipId: string
  friendUserId: string
  displayName: string | null
  handle: string | null
  photo: string | null
}

export interface FriendSearchResult {
  id: string
  handle: string
  displayName: string
  photo?: string
}
