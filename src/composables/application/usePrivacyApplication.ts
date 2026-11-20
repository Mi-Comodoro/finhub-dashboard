import type { FetchError } from 'ofetch'
import { computed } from 'vue'

import { usePrivacyApi } from '@/composables/api/usePrivacyApi'
import { usePrivacyStore } from '@/stores/privacy.store'

// The phrase the person must type to confirm. The server validates it again.
export const DELETION_CONFIRMATION_PHRASE = 'ELIMINAR MI CUENTA'

const getErrorReason = (error: unknown): string | undefined => {
  const data = (error as FetchError)?.data as { message?: string } | undefined
  return typeof data?.message === 'string' ? data.message : undefined
}

// Business logic: right of access and erasure of personal data (Ley 1581 de 2012)
export const usePrivacyApplication = () => {
  const privacyApi = usePrivacyApi()
  const store = usePrivacyStore()

  const deletion = computed(() => store.deletion)
  const isDeletionRequested = computed(() => Boolean(store.deletion?.requested))
  const isLoading = computed(() => store.isLoading)

  const loadDeletionStatus = async () => {
    try {
      const { success, result } = await privacyApi.getDeletion()
      if (success && result) store.setDeletion(result)
      return { success }
    } catch {
      // Never block the dashboard because of this
      return { success: false }
    }
  }

  // Returns the file content so the component only has to hand it to the browser
  const exportMyData = async () => {
    try {
      store.setLoading(true)
      const { success, result } = await privacyApi.exportData()
      if (!success || !result)
        return { success: false, message: undefined, fileName: '', content: '' }

      const day = new Date().toISOString().slice(0, 10)
      return {
        success: true,
        message: undefined as string | undefined,
        fileName: `mis-datos-mi-comodoro-${day}.json`,
        content: JSON.stringify(result, null, 2)
      }
    } catch (err) {
      return { success: false, message: getErrorReason(err), fileName: '', content: '' }
    } finally {
      store.setLoading(false)
    }
  }

  const requestDeletion = async (confirmation: string) => {
    try {
      store.setLoading(true)
      const { success, result } = await privacyApi.requestDeletion(confirmation)
      if (success && result) store.setDeletion(result)
      return { success, message: undefined as string | undefined }
    } catch (err) {
      return { success: false, message: getErrorReason(err) }
    } finally {
      store.setLoading(false)
    }
  }

  const cancelDeletion = async () => {
    try {
      store.setLoading(true)
      const { success, result } = await privacyApi.cancelDeletion()
      if (success && result) store.setDeletion(result)
      return { success, message: undefined as string | undefined }
    } catch (err) {
      return { success: false, message: getErrorReason(err) }
    } finally {
      store.setLoading(false)
    }
  }

  return {
    deletion,
    isDeletionRequested,
    isLoading,
    loadDeletionStatus,
    exportMyData,
    requestDeletion,
    cancelDeletion
  }
}
