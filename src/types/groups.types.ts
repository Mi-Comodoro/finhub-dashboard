export type GroupType = 'SHARED' | 'FAMILIAR' | 'TRAVEL'
export type GroupStatus = 'Planificando' | 'Activo' | 'Cerrado'
export type MemberRole = 'ORGANIZER' | 'CO_ORGANIZER' | 'MEMBER' | 'VIEWER'
export type MemberStatus = 'active' | 'invited' | 'external'
export type ExpenseStatus = 'planned' | 'paid' | 'cxp'

export interface GroupMember {
  id?: string
  userId?: string | null
  handle?: string | null
  externalName?: string | null
  role: MemberRole
  memberStatus: MemberStatus
  isActive: boolean
}

export interface Group {
  id: string
  name: string
  type: GroupType
  status: GroupStatus
  maxMembers: number
  ownerId: string
  goal?: number | null
  destination?: string | null
  estimatedDate?: string | null
  members: GroupMember[]
  createdAt: string
}

export interface ContributionMember {
  userId: string | null
  handle: string | null
  externalName: string | null
  role: MemberRole
  memberStatus: MemberStatus
  totalAmount: number
  percentage: number
  budgetLabel: string | null
}

export interface ContributionSummary {
  goal: number | null
  totalContributed: number
  members: ContributionMember[]
}

export interface GroupExpense {
  id: string
  groupId: string
  description: string
  amount: number
  dueDate: string
  responsibleUserId: string
  status: ExpenseStatus
  transactionId: string | null
  cxpId: string | null
  createdAt: string
  updatedAt: string
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
  role?: MemberRole
}

export interface CreateGroupExpenseDto {
  description: string
  amount: number
  dueDate: string
  responsibleUserId: string
}
