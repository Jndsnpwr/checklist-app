// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOnNQVlfyoe_VJck7XrtCR3c-60UZeDn8",
  authDomain: "checklistapp-643ca.firebaseapp.com",
  projectId: "checklistapp-643ca",
  storageBucket: "checklistapp-643ca.appspot.com",
  messagingSenderId: "84945907923",
  appId: "1:84945907923:web:5d21b7311e437bc06ca426",
  measurementId: "G-HZZ4T0FWK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };