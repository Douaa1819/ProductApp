import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDP6RU0ZXUg41QlHe5W0OfiGllF6GhGuHY",
  authDomain: "product-app-a0f3a.firebaseapp.com",
  projectId: "product-app-a0f3a",
  storageBucket: "product-app-a0f3a.appspot.com",
  messagingSenderId: "1059273047533",
  appId: "1:1059273047533:web:38a2fc7c6a0ef05bfcbbe4",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)

export { db }