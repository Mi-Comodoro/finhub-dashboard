import type { FirebaseConfig } from '~/common/interfaces/firebase.interface'

export const useFirebaseApi = () => {
  /** Configuración pública de Firebase servida por el BFF */
  const getFirebaseConfig = async () => {
    return await $fetch<FirebaseConfig>('/api/firebase')
  }

  return { getFirebaseConfig }
}
