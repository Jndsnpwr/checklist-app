// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Cole o config aqui
const firebaseConfig = {
  apiKey: "AIzaSyDSE49fYF9R_40yl0R-ThBwvoTLm3VN73w",
  authDomain: "checklistapp-5d8a6.firebaseapp.com",
  projectId: "checklistapp-5d8a6",
  storageBucket: "checklistapp-5d8a6.firebasestorage.app",
  messagingSenderId: "70589052713",
  appId: "1:70589052713:web:1240fd799e293055dca938",
  
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
