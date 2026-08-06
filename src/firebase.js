// ============================================================
// CONFIGURACIÓN DE FIREBASE
// Ya está completo con los datos de tu proyecto "brujula-educativa-a8e37".
// ============================================================
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGN5GvcGACNl063T7MFgpDDmzy0Z8ecIs",
  authDomain: "brujula-educativa-a8e37.firebaseapp.com",
  projectId: "brujula-educativa-a8e37",
  storageBucket: "brujula-educativa-a8e37.firebasestorage.app",
  messagingSenderId: "1010734872562",
  appId: "1:1010734872562:web:b7975fd2cb6dd1656a1d6b",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
