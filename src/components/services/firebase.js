// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore = banco de dados em nuvem
import { getAuth } from "firebase/auth";           // Auth = autenticação, se quiser usar

const firebaseConfig = {
  apiKey: "AIzaSyB0nNQVlfyoe_VJck7XrtCR3c-60UZeDn8",
  authDomain: "checklistapp-643ca.firebaseapp.com",
  projectId: "checklistapp-643ca",
  storageBucket: "checklistapp-643ca.appspot.com",
  messagingSenderId: "84945907923",
  appId: "1:84945907923:web:5d21b7311e437bc06ca426",
  measurementId: "G-HZZ4TQFWK"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
