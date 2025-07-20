// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Inicializa o app com privilégios de admin para acessar os serviços do Firebase
admin.initializeApp();

/**
 * Função para criar um novo usuário com permissões personalizadas.
 * Apenas usuários autenticados com a claim 'admin' podem chamar esta função.
 */
exports.criarNovoUsuario = functions.https.onCall(async (data, context ) => {
  // 1. VERIFICAÇÃO DE PERMISSÃO
  // Garante que o usuário que está fazendo a chamada tem a permissão de 'admin'.
  // Esta é a camada de segurança mais importante.
  if (context.auth.token.tipo !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Apenas administradores podem criar novos usuários."
     );
  }

  // 2. VALIDAÇÃO DOS DADOS RECEBIDOS
  // Pega os dados enviados pelo painel (email, senha, nome, tipo).
  const { email, senha, nome, tipo } = data;

  // Garante que todos os campos necessários foram enviados.
  if (!email || !senha || !nome || !tipo) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Informações incompletas. É necessário fornecer nome, e-mail, senha e tipo."
     );
  }

  try {
    // 3. CRIAÇÃO DO USUÁRIO NO FIREBASE AUTHENTICATION
    const userRecord = await admin.auth().createUser({
      email: email,
      password: senha,
      displayName: nome,
    });

    // 4. DEFINIÇÃO DAS PERMISSÕES (CUSTOM CLAIMS)
    // Adiciona a permissão ('admin', 'supervisor', etc.) ao token do novo usuário.
    await admin.auth().setCustomUserClaims(userRecord.uid, { tipo: tipo });

    // 5. SALVAMENTO DOS DADOS NO FIRESTORE
    // Cria um documento na coleção 'usuarios' com as informações do novo usuário.
    await admin.firestore().collection("usuarios").doc(userRecord.uid).set({
      nome: nome,
      email: email,
      tipo: tipo,
    });

    // 6. RETORNO DE SUCESSO
    // Envia uma resposta de sucesso de volta para o aplicativo.
    return {
      result: `Usuário ${nome} (${email}) criado com sucesso.`,
    };

  } catch (error) {
    // 7. TRATAMENTO DE ERROS
    // Trata erros específicos, como e-mail já existente.
    if (error.code === "auth/email-already-exists") {
      throw new functions.https.HttpsError(
        "already-exists",
        "O e-mail fornecido já está em uso por outro usuário."
       );
    }
    // Para qualquer outro erro, retorna uma mensagem genérica.
    console.error("Erro inesperado ao criar usuário:", error); // Log para depuração
    throw new functions.https.HttpsError(
      "internal",
      "Ocorreu um erro inesperado no servidor. Tente novamente."
     );
  }
});


/**
 * Função para deletar um usuário do Auth e do Firestore.
 * Apenas usuários autenticados com a claim 'admin' podem chamar esta função.
 */
exports.deletarUsuario = functions.https.onCall(async (data, context ) => {
  // Verificação de permissão
  if (context.auth.token.tipo !== 'admin') {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Apenas administradores podem deletar usuários.",
     );
  }

  const uid = data.uid;
  if (!uid) {
    throw new functions.https.HttpsError("invalid-argument", "O UID do usuário é obrigatório para a exclusão." );
  }

  try {
    // Deleta do Authentication
    await admin.auth().deleteUser(uid);
    // Deleta do Firestore
    await admin.firestore().collection("usuarios").doc(uid).delete();
    return { result: "Usuário deletado com sucesso." };
  } catch (error) {
    console.error("Erro inesperado ao deletar usuário:", error);
    throw new functions.https.HttpsError("internal", "Erro ao deletar usuário." );
  }
});
