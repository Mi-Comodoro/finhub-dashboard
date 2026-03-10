import type { FirebaseConfig } from '~/common/interfaces/firebase.interface'

export default defineEventHandler((): FirebaseConfig => {
  const config = useRuntimeConfig()
  return {
    apiKey: config.FB_API_KEY,
    authDomain: config.FB_AUTH_DOMAIN,
    projectId: config.FB_PROJECT_ID,
    storageBucket: config.FB_STORAGE_BUCKET,
    messagingSenderId: config.FB_MESSAGING_SENDER_ID,
    appId: config.FB_APP_ID,
    measurementId: config.FB_MEASUREMENT_ID
  }
})
