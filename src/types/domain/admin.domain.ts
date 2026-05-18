import type { UserRole } from './auth.domain'

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalBudgets: number
  totalTransactions: number
  newUsersLast7Days: number
  newUsersLast30Days: number
}

export interface AdminUser {
  id: string
  email: string
  displayName: string
  role: UserRole
  createdAt: string
  isActive: boolean
}

export interface AdminUserDetail extends AdminUser {
  name: string
  phone: string
  country: string
  accountType: string
}

export interface AdminPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AdminUsersResult {
  users: AdminUser[]
  pagination: AdminPagination
}

export interface AdminState {
  stats: AdminStats | null
  users: AdminUser[]
  selectedUser: AdminUserDetail | null
  pagination: AdminPagination
  isLoading: boolean
  isLoadingUser: boolean
  error: string | null
}
