export type BetaAccessStatus = 'pending' | 'approved' | 'rejected' | 'registered'

export interface BetaAccessRequest {
  id: string
  /** Null once the person registered: the account already stores the email */
  email: string | null
  status: BetaAccessStatus
  policyVersion: string
  consentAt: string
  decidedBy: string | null
  decidedAt: string | null
  inviteExpiresAt: string | null
  registeredAt: string | null
  createdAt: string
}

export interface BetaAccessSummary {
  pending: number
  approved: number
  registered: number
  rejected: number
  maxUsers: number
  used: number
}

/** Returned only once, when an admin approves (or re-issues) an invitation */
export interface BetaInvite {
  id: string
  email: string | null
  inviteToken: string
  inviteExpiresAt: string
}
