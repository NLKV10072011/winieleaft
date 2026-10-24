import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBADjhz8M7sZ7AQdFMnSmsFcqZ4sfJa1Vc",
  authDomain: "winieleaft.firebaseapp.com",
  projectId: "winieleaft",
  storageBucket: "winieleaft.firebasestorage.app",
  messagingSenderId: "686553818144",
  appId: "1:686553818144:web:47efdb73b595486af54845",
  measurementId: "G-J6K93VWRWF"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
