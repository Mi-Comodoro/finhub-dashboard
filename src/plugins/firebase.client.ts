// plugins/firebase.client.ts
import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth'

import { useFirebaseApi } from '@/composables/api/useFirebaseApi'

export default defineNuxtPlugin(async nuxtApp => {
  const { getFirebaseConfig } = useFirebaseApi()

  const initFirebase = async () => {
    if (import.meta.server) return
    const firebaseConfig = await getFirebaseConfig()
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

    const auth = getAuth(app)
    const googleProvider = new GoogleAuthProvider()

    return { auth, googleProvider }
  }

  nuxtApp.provide('firebase', {
    initFirebase,
    onAuthStateChanged,
    signInWithPopup,
    firebaseSignOut
  })
})
