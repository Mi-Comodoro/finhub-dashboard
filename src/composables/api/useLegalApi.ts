export interface LegalVersions {
  policyVersion: string
  consentRequired: boolean
}

export interface ConsentStatus extends LegalVersions {
  accepted: boolean
  acceptedVersion: string | null
  acceptedAt: string | null
  needsAcceptance: boolean
}

export const useLegalApi = () => {
  const getVersions = async () =>
    await $fetch<{ success: boolean; result: LegalVersions }>('/api/legal/versions')

  const getConsent = async () =>
    await $fetch<{ success: boolean; result: ConsentStatus }>('/api/legal/consent')

  const acceptConsent = async (version: string) =>
    await $fetch<{ success: boolean; result: ConsentStatus }>('/api/legal/consent', {
      method: 'POST',
      body: { version }
    })

  return { getVersions, getConsent, acceptConsent }
}
