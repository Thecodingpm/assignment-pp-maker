import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCOP2I1M6EOVtgCxychQ-A6KtcWv18MoB8",
  authDomain: "assignment-pp-maker.firebaseapp.com",
  projectId: "assignment-pp-maker",
  storageBucket: "assignment-pp-maker.firebasestorage.app",
  messagingSenderId: "385627382015",
  appId: "1:385627382015:web:99c6db059923a0fdff6cca",
  measurementId: "G-3N0ZJD1LCE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
// Ensure auth persists across reloads and restarts
try {
  if (typeof window !== 'undefined') {
    void setPersistence(auth, browserLocalPersistence);
  }
} catch (e) {
  // ignore if not available during SSR
}

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;