export type GroupType = 'SHARED' | 'FAMILIAR' | 'TRAVEL'
export type GroupRole = 'OWNER' | 'EDITOR' | 'VIEWER'

export interface GroupMember {
  userId: string
  name?: string
  email?: string
  role: GroupRole
}

export interface Group {
  id: string
  name: string
  type: GroupType
  maxMembers: number
  ownerId: string
  members: GroupMember[]
  createdAt: string
}

export interface CreateGroupDto {
  name: string
  type: GroupType
  maxMembers?: number
}

export interface UpdateGroupDto {
  name?: string
  type?: GroupType
  maxMembers?: number
}

export interface AddMemberDto {
  userId: string
  role?: GroupRole
}
