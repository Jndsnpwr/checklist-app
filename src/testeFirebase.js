import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

// Teste: salvar um documento de teste no Firestore
async function salvarTeste() {
  try {
    const docRef = await addDoc(collection(db, "testes"), {
      nome: "Teste de conexão",
      timestamp: new Date()
    });
    console.log("Documento salvo com ID:", docRef.id);
  } catch (e) {
    console.error("Erro ao salvar:", e);
  }
}

salvarTeste();