import type { FetchError } from 'ofetch'
import { computed } from 'vue'

import { useLegalApi } from '@/composables/api/useLegalApi'
import { useLegalStore } from '@/stores/legal.store'

// Business logic: authorization to process personal data (Ley 1581). The server decides whether
// accepting the policy is mandatory (LEGAL_CONSENT_REQUIRED); until it is, nothing changes in the UI.
export const useLegalApplication = () => {
  const legalApi = useLegalApi()
  const store = useLegalStore()

  const consentRequired = computed(() => store.consentRequired)
  const policyVersion = computed(() => store.policyVersion)
  const needsAcceptance = computed(() => store.needsAcceptance)

  // Public: used by the login and signup screens
  const loadVersions = async () => {
    try {
      const { success, result } = await legalApi.getVersions()
      if (success && result) store.setVersions(result)
      return { success }
    } catch {
      // Never block the login screen because of this
      return { success: false }
    }
  }

  // Authenticated: does this person still have to accept the current version?
  const loadConsentStatus = async () => {
    try {
      store.setLoading(true)
      const { success, result } = await legalApi.getConsent()
      if (success && result) {
        store.setVersions(result)
        store.setNeedsAcceptance(result.needsAcceptance)
      }
      return { success }
    } catch {
      return { success: false }
    } finally {
      store.setLoading(false)
    }
  }

  const acceptPolicy = async () => {
    try {
      store.setLoading(true)
      const { success, result } = await legalApi.acceptConsent(store.policyVersion)
      if (success && result) store.setNeedsAcceptance(result.needsAcceptance)
      return { success, message: undefined as string | undefined }
    } catch (err) {
      const data = (err as FetchError)?.data as { message?: string } | undefined
      return { success: false, message: data?.message }
    } finally {
      store.setLoading(false)
    }
  }

  return {
    consentRequired,
    policyVersion,
    needsAcceptance,
    loadVersions,
    loadConsentStatus,
    acceptPolicy
  }
}
