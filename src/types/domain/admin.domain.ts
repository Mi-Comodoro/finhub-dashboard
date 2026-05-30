import type { UserRole } from './auth.domain'

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalBudgets: number
  totalTransactions: number
  newUsersLast7Days: number
  newUsersLast30Days: number
}

export interface AdminMetricsDelta {
  totalUsers: number
  activeThisMonth: number
  trialUsers: number
  payingUsers: number
}

export interface AdminMetricsSummary {
  totalUsers: number
  activeThisMonth: number
  trialUsers: number
  payingUsers: number
  conversionRate: number
  activeBudgets: number
  deltas: AdminMetricsDelta
}

export interface UserGrowthDataPoint {
  date: string
  newUsers: number
  cumulative: number
}

export interface UserGrowthSummary {
  total: number
  periodStart: string
  periodEnd: string
  growthRate: number
}

export type GrowthPeriod = '30d' | '90d' | '12m'

export interface UserGrowthResponse {
  period: GrowthPeriod
  data: UserGrowthDataPoint[]
  summary: UserGrowthSummary
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

export interface SystemConfigItem {
  key: string
  value: string
  description: string | null
  updatedAt: string
}

export type AnnouncementSegment = 'all' | 'free' | 'trial' | 'plus' | 'pro' | 'partner'

export interface AnnouncementItem {
  id: string
  title: string
  segment: AnnouncementSegment
  recipientCount: number
  sentAt: string
  sentBy: string
}

export interface AnnouncementSendPayload {
  title: string
  body: string
  segment: AnnouncementSegment
}

export interface AnnouncementSendResult {
  id: string
  recipientCount: number
}

export type AuditAction =
  | 'USER_ROLE_CHANGED'
  | 'PLAN_CHANGED'
  | 'TRIAL_EXTENDED'
  | 'USER_DELETED'
  | 'CONFIG_UPDATED'
  | 'ANNOUNCEMENT_SENT'

export type AuditTargetType = 'user' | 'config' | 'announcement'

export interface AuditLogItem {
  id: string
  adminId: string
  adminHandle: string
  action: AuditAction
  targetId: string | null
  targetType: AuditTargetType | null
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  ip: string | null
  createdAt: string
}

export interface AuditLogResult {
  data: AuditLogItem[]
  total: number
  page: number
  limit: number
}

export interface AuditLogFilters {
  action?: string
  targetType?: string
  from?: string
  to?: string
  page?: number
}

export interface AdminState {
  stats: AdminStats | null
  metricsSummary: AdminMetricsSummary | null
  growthData: UserGrowthResponse | null
  configItems: SystemConfigItem[]
  announcements: AnnouncementItem[]
  auditLogs: AuditLogItem[]
  auditTotal: number
  auditPage: number
  users: AdminUser[]
  selectedUser: AdminUserDetail | null
  pagination: AdminPagination
  isLoading: boolean
  isLoadingUser: boolean
  isLoadingMetrics: boolean
  isLoadingGrowth: boolean
  isLoadingConfig: boolean
  isLoadingAnnouncements: boolean
  isLoadingAudit: boolean
  error: string | null
}
