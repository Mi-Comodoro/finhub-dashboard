import type { Auth, GoogleAuthProvider } from 'firebase/auth'

export interface FirebasePlugin {
  auth: Auth
  googleProvider: GoogleAuthProvider
  signInWithPopup: (typeof import('firebase/auth'))['signInWithPopup']
  firebaseSignOut: (typeof import('firebase/auth'))['signOut']
  onAuthStateChanged: (typeof import('firebase/auth'))['onAuthStateChanged']
  initFirebase: () => Promise<{ auth: Auth; googleProvider: GoogleAuthProvider }>
}

// Extiende la interfaz de NuxtApp
declare module '#app' {
  interface NuxtApp {
    $firebase: FirebasePlugin
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $firebase: FirebasePlugin
  }
}
