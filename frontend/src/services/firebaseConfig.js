import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Added for OTP

const firebaseConfig = {
  apiKey: "AIzaSyAqeKocHXxmYMbX7IuK0ohOkBQzw7Ktz3M",
  authDomain: "sakshi-otp.firebaseapp.com",
  projectId: "sakshi-otp",
  storageBucket: "sakshi-otp.firebasestorage.app",
  messagingSenderId: "715526535084",
  appId: "1:715526535084:web:8a816afef4c9a0200d2c09",
  measurementId: "G-PV49LG3ETD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth for your LoginScreen
export const auth = getAuth(app);