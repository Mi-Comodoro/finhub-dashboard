// plugins/firebase.client.ts
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth'

import type { FirebaseConfig } from '~/common/interfaces/firebase.interface'
export default defineNuxtPlugin(async nuxtApp => {
  const initFirebase = async () => {
    if (import.meta.server) return
    const FIREBASE_CONFIG_PATH = '/api/firebase'
    const firebaseConfig: FirebaseConfig = await $fetch<FirebaseConfig>(FIREBASE_CONFIG_PATH)
    const app = initializeApp(firebaseConfig)

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
