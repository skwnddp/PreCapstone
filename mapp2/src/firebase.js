// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Firebase 인증 기능 추가
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Firestore 기능 추가

// Your web app's Firebase configuration
const FierebaseApiKey = process.env.REACT_APP_FIREBASE_KEY

const firebaseConfig = {
  apiKey: FierebaseApiKey,
  authDomain: "precap-db.firebaseapp.com",
  projectId: "precap-db",
  storageBucket: "precap-db.firebasestorage.app",
  messagingSenderId: "598975747036",
  appId: "1:598975747036:web:cb380f92b438d49d8b7519",
  measurementId: "G-G2F8G3NRHM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app); // 인증 객체 초기화

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

// Export the app and auth objects so they can be used elsewhere
export { app, auth, analytics };
