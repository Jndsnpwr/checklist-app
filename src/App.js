import React, { useState } from "react";
import ChecklistOperacional from "./components/ChecklistOperacional";
import ChecklistAdministrativo from "./components/ChecklistAdministrativo";
import ChecklistNaoConformidades from "./components/ChecklistNaoConformidades";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login"
import "./testeFirebase"; // ou "./testeFirebase" se o arquivo estiver em src/

// --- RESET ADMIN (use apenas se quiser limpar todos os usuários) ---
localStorage.setItem(
  "usuarios_sr",
  JSON.stringify([
    {
      id: "admin_jandson",
      usuario: "jandson",
      senha: "sr2025",
      tipo: "admin"
    }
  ])
);
// -------------------------------------------------------------------

// --- CRIAR ADMIN VIA CÓDIGO, caso não exista nenhum ---
if (!localStorage.getItem("usuarios_sr")) {
  localStorage.setItem(
    "usuarios_sr",
    JSON.stringify([
      {
        id: "admin_jandson",
        usuario: "jandson",
        senha: "sr2025",
        tipo: "admin"
      }
    ])
  );
}
// ------------------------------------------------------

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [tela, setTela] = useState("menu");

  if (!usuarioLogado) {
    return (
      <Login
        onLogin={(user) => {
          setUsuarioLogado(user);
          setTela("menu");
        }}
      />
    );
  }

  if (tela === "operacional") {
    return (
      <ChecklistOperacional
        usuarioLogado={usuarioLogado}
        onVoltar={() => setTela("menu")}
      />
    );
  }
  if (tela === "administrativo") {
    return (
      <ChecklistAdministrativo
        usuarioLogado={usuarioLogado}
        onVoltar={() => setTela("menu")}
      />
    );
  }
  if (tela === "naoConformidades") {
    return (
      <ChecklistNaoConformidades
        usuarioLogado={usuarioLogado}
        onVoltar={() => setTela("menu")}
      />
    );
  }
  if (tela === "admin") {
    return (
      <AdminPanel
        onVoltar={() => setTela("menu")}
      />
    );
  }

  // Menu principal
  return (
    <div
      style={{
        background: "#f8f8f8",
        minHeight: "100vh",
        padding: 0,
        fontFamily: "Arial, sans-serif",
        maxWidth: 480,
        margin: "0 auto",
        borderRadius: 10,
        boxShadow: "0 2px 10px #eee",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
      <header style={{
        background: "#ffd470",
        padding: "18px 10px 12px 10px",
        borderRadius: "0 0 20px 20px",
        textAlign: "center",
        width: "100%",
        marginBottom: 24
      }}>
        <h2 style={{ margin: 0, color: "#4B2E05" }}>Menu Principal</h2>
        <span style={{ color: "#7e5a1a", fontSize: 16 }}>
          Usuário: <b>{usuarioLogado.usuario}</b>
        </span>
        <button
          onClick={() => {
            setUsuarioLogado(null);
            setTela("menu");
          }}
          style={{
            float: "right",
            background: "#e74c3c",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "5px 15px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 14
          }}
        >
          Sair
        </button>
      </header>
      <div style={{ width: "90%", margin: "0 auto" }}>
        <button
          style={{
            background: "#dab45a",
            color: "#fff",
            border: "none",
            padding: "15px 32px",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            margin: "16px 0",
            width: "100%"
          }}
          onClick={() => setTela("operacional")}
        >
          Checklist Operacional
        </button>
        <button
          style={{
            background: "#92c3e7",
            color: "#184969",
            border: "none",
            padding: "15px 32px",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            margin: "16px 0",
            width: "100%"
          }}
          onClick={() => setTela("administrativo")}
        >
          Checklist Administrativo
        </button>
        <button
          style={{
            background: "#ffc44f",
            color: "#8a6b10",
            border: "none",
            padding: "15px 32px",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            margin: "16px 0",
            width: "100%"
          }}
          onClick={() => setTela("naoConformidades")}
        >
          Não Conformidades
        </button>
        <button
          style={{
            background: "#f1a535",
            color: "#fff",
            border: "none",
            padding: "15px 32px",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            margin: "16px 0",
            width: "100%"
          }}
          onClick={() => setTela("admin")}
        >
          Painel Administrativo
        </button>
      </div>
    </div>
  );
}

export default App;
