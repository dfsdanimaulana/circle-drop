import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyAcfx8Qtml3RjqiYk4RgU3fYRh7nTMR4hc',
    authDomain: 'circle-drop-f3768.firebaseapp.com',
    projectId: 'circle-drop-f3768',
    storageBucket: 'circle-drop-f3768.appspot.com',
    messagingSenderId: '965744831453',
    appId: '1:965744831453:web:68e262530eaed8af5ea434'
}

initializeApp(firebaseConfig)

// init services
export const db = getFirestore()
export const auth = getAuth()
