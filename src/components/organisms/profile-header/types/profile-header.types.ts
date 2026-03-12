export interface ProfileHeaderUser {
  displayName?: string
  email?: string
  photo?: string
  phoneNumber?: string
  status?: 'active' | 'inactive' | 'pending' | 'error'
}

export interface ProfileHeaderProps {
  user: ProfileHeaderUser
  isVerified?: boolean
  statusText?: string
  planLabel?: string
}
