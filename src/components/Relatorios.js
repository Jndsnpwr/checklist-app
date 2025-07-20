import React from "react";

export default function Relatorios({ usuarioLogado, onVoltar }) {
  // Aqui, futuramente, você pode puxar os relatórios do backend ou Google Drive.
  // Por enquanto, só uma tela de exemplo:
  return (
    <div style={{
      minHeight: "100vh", background: "#f8f8f8", padding: 0, maxWidth: 480, margin: "0 auto"
    }}>
      <header style={{
        background: "#e2b572",
        padding: "18px 10px 12px 10px",
        borderRadius: "0 0 20px 20px",
        textAlign: "center"
      }}>
        <h2 style={{ margin: 0, color: "#72530c" }}>Relatórios Enviados</h2>
        <span style={{ color: "#94782b", fontSize: 16 }}>
          Usuário: <b>{usuarioLogado}</b>
        </span>
        <button
          onClick={onVoltar}
          style={{
            float: "right",
            background: "#b58944",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "5px 15px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 14
          }}
        >
          Voltar ao menu
        </button>
      </header>
      <div style={{ padding: 30, color: "#94782b", textAlign: "center" }}>
        <p>Em breve você verá aqui todos os relatórios enviados!</p>
        <p>Esta funcionalidade está em construção 👷‍♂️</p>
      </div>
    </div>
  );
}
