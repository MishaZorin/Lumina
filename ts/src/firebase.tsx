import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCCnscG9vhW-elrCM5NGS8e6Nakzz0zqRI",
  authDomain: "blogging-platform-2fe3f.firebaseapp.com",
  projectId: "blogging-platform-2fe3f",
  storageBucket: "blogging-platform-2fe3f.firebasestorage.app",
  messagingSenderId: "334211030008",
  appId: "1:334211030008:web:98b39c22322f93794f940d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;