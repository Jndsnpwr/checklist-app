import React, { useState } from "react";

// Funções utilitárias para salvar/carregar do localStorage
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function load(key, def) {
  try {
    const x = localStorage.getItem(key);
    return x ? JSON.parse(x) : def;
  } catch { return def; }
}

export default function AdminPanel({ onVoltar }) {
  // Estado de abas
  const [aba, setAba] = useState("usuarios");

  // Usuários (admin, gerente, supervisor)
  const [usuarios, setUsuarios] = useState(() => load("usuarios_sr", []));
  // Postos
  const [postos, setPostos] = useState(() => load("postos_sr", []));
  // Associações: supervisor > gerente > posto
  const [associacoes, setAssociacoes] = useState(() => load("associacoes_sr", []));

  // Cadastro de usuário
  const [novoUsuario, setNovoUsuario] = useState({ nome: "", senha: "", tipo: "supervisor" });
  function handleNovoUsuario(e) {
    e.preventDefault();
    if (!novoUsuario.nome.trim() || !novoUsuario.senha.trim()) return;
    if (usuarios.some(u => u.nome === novoUsuario.nome.trim())) return;
    const novo = {
      id: Date.now() + Math.random().toString(36).substr(2,5),
      ...novoUsuario,
      nome: novoUsuario.nome.trim(),
      senha: novoUsuario.senha.trim()
    };
    const lista = [...usuarios, novo];
    setUsuarios(lista); save("usuarios_sr", lista);
    setNovoUsuario({ nome: "", senha: "", tipo: "supervisor" });
  }
  function handleExcluirUsuario(id) {
    const lista = usuarios.filter(u => u.id !== id);
    setUsuarios(lista); save("usuarios_sr", lista);
    // Exclui das associações também
    setAssociacoes(a => {
      const novas = a.filter(x => x.supervisor !== id && x.gerente !== id);
      save("associacoes_sr", novas);
      return novas;
    });
  }

  // Cadastro de posto
  const [novoPosto, setNovoPosto] = useState({ nome: "", cidade: "" });
  function handleNovoPosto(e) {
    e.preventDefault();
    if (!novoPosto.nome.trim() || !novoPosto.cidade.trim()) return;
    if (postos.some(p => p.nome === novoPosto.nome.trim())) return;
    const novo = {
      id: Date.now() + Math.random().toString(36).substr(2,5),
      nome: novoPosto.nome.trim(),
      cidade: novoPosto.cidade.trim()
    };
    const lista = [...postos, novo];
    setPostos(lista); save("postos_sr", lista);
    setNovoPosto({ nome: "", cidade: "" });
  }
  function handleExcluirPosto(id) {
    const lista = postos.filter(p => p.id !== id);
    setPostos(lista); save("postos_sr", lista);
    setAssociacoes(a => {
      const novas = a.filter(x => x.posto !== id);
      save("associacoes_sr", novas);
      return novas;
    });
  }

  // Cadastro de associação (vínculo supervisor > gerente > posto)
  const [novaAssoc, setNovaAssoc] = useState({ supervisor: "", gerente: "", posto: "" });
  function handleNovaAssoc(e) {
    e.preventDefault();
    if (!novaAssoc.supervisor || !novaAssoc.gerente || !novaAssoc.posto) return;
    // Não deixar duplicado
    if (associacoes.some(a =>
      a.supervisor === novaAssoc.supervisor &&
      a.gerente === novaAssoc.gerente &&
      a.posto === novaAssoc.posto
    )) return;
    const nova = { id: Date.now() + Math.random().toString(36).substr(2,5), ...novaAssoc };
    const lista = [...associacoes, nova];
    setAssociacoes(lista); save("associacoes_sr", lista);
    setNovaAssoc({ supervisor: "", gerente: "", posto: "" });
  }
  function handleExcluirAssoc(id) {
    const lista = associacoes.filter(a => a.id !== id);
    setAssociacoes(lista); save("associacoes_sr", lista);
  }

  // Filtrar por tipo
  const gerentes = usuarios.filter(u => u.tipo === "gerente");
  const supervisores = usuarios.filter(u => u.tipo === "supervisor");
  const admins = usuarios.filter(u => u.tipo === "admin");

  return (
    <div style={{
      maxWidth: 480, margin: "0 auto", background: "#fffbe6", minHeight: "100vh", paddingBottom: 24,
      borderRadius: 10, boxShadow: "0 2px 10px #ffeebb"
    }}>
      <header style={{
        background: "#ffdf7a",
        padding: "18px 10px 12px 10px",
        borderRadius: "0 0 20px 20px",
        textAlign: "center"
      }}>
        <h2 style={{ margin: 0, color: "#be7b00" }}>Painel Administrativo</h2>
        <button
          onClick={onVoltar}
          style={{
            float: "right",
            background: "#dab45a",
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

      <div style={{ display: "flex", justifyContent: "center", gap: 12, margin: "24px 0 12px" }}>
        <button onClick={() => setAba("usuarios")} style={{ background: aba==="usuarios" ? "#dab45a" : "#ffebc1", border: "none", padding: 8, borderRadius: 6, fontWeight: "bold", cursor: "pointer" }}>Usuários</button>
        <button onClick={() => setAba("postos")} style={{ background: aba==="postos" ? "#dab45a" : "#ffebc1", border: "none", padding: 8, borderRadius: 6, fontWeight: "bold", cursor: "pointer" }}>Postos</button>
        <button onClick={() => setAba("associacoes")} style={{ background: aba==="associacoes" ? "#dab45a" : "#ffebc1", border: "none", padding: 8, borderRadius: 6, fontWeight: "bold", cursor: "pointer" }}>Associações</button>
      </div>

      {aba === "usuarios" && (
        <div style={{ padding: "0 14px" }}>
          <h3 style={{ color: "#b87c00" }}>Cadastro de Usuários</h3>
          <form onSubmit={handleNovoUsuario} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            <input
              value={novoUsuario.nome}
              onChange={e => setNovoUsuario(s => ({ ...s, nome: e.target.value }))}
              placeholder="Nome do usuário"
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
            />
            <input
              value={novoUsuario.senha}
              type="password"
              onChange={e => setNovoUsuario(s => ({ ...s, senha: e.target.value }))}
              placeholder="Senha"
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
            />
            <select
              value={novoUsuario.tipo}
              onChange={e => setNovoUsuario(s => ({ ...s, tipo: e.target.value }))}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
            >
              <option value="supervisor">Supervisor</option>
              <option value="gerente">Gerente</option>
              <option value="admin">Administrador</option>
            </select>
            <button type="submit" style={{
              background: "#dab45a", color: "#fff", border: "none", borderRadius: 6,
              padding: "8px 0", fontWeight: "bold", fontSize: 15, cursor: "pointer"
            }}>Cadastrar Usuário</button>
          </form>
          <div>
            <b>Usuários cadastrados:</b>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {usuarios.map(u => (
                <li key={u.id} style={{ marginBottom: 8, borderBottom: "1px solid #ffe9b0" }}>
                  <span><b>{u.nome}</b> <small>({u.tipo})</small></span>
                  <button onClick={() => handleExcluirUsuario(u.id)} style={{ background: "#e74c3c", color: "#fff", border: "none", borderRadius: 6, marginLeft: 12, padding: "2px 10px", cursor: "pointer" }}>Excluir</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {aba === "postos" && (
        <div style={{ padding: "0 14px" }}>
          <h3 style={{ color: "#b87c00" }}>Cadastro de Postos</h3>
          <form onSubmit={handleNovoPosto} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            <input
              value={novoPosto.nome}
              onChange={e => setNovoPosto(s => ({ ...s, nome: e.target.value }))}
              placeholder="Nome do posto"
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
            />
            <input
              value={novoPosto.cidade}
              onChange={e => setNovoPosto(s => ({ ...s, cidade: e.target.value }))}
              placeholder="Cidade"
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
            />
            <button type="submit" style={{
              background: "#dab45a", color: "#fff", border: "none", borderRadius: 6,
              padding: "8px 0", fontWeight: "bold", fontSize: 15, cursor: "pointer"
            }}>Cadastrar Posto</button>
          </form>
          <div>
            <b>Postos cadastrados:</b>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {postos.map(p => (
                <li key={p.id} style={{ marginBottom: 8, borderBottom: "1px solid #ffe9b0" }}>
                  <span><b>{p.nome}</b> <small>({p.cidade})</small></span>
                  <button onClick={() => handleExcluirPosto(p.id)} style={{ background: "#e74c3c", color: "#fff", border: "none", borderRadius: 6, marginLeft: 12, padding: "2px 10px", cursor: "pointer" }}>Excluir</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {aba === "associacoes" && (
        <div style={{ padding: "0 14px" }}>
          <h3 style={{ color: "#b87c00" }}>Vincular Supervisor, Gerente e Posto</h3>
          <form onSubmit={handleNovaAssoc} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            <select
              value={novaAssoc.supervisor}
              onChange={e => setNovaAssoc(s => ({ ...s, supervisor: e.target.value }))}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
            >
              <option value="">Supervisor...</option>
              {supervisores.map(u => (
                <option value={u.id} key={u.id}>{u.nome}</option>
              ))}
            </select>
            <select
              value={novaAssoc.gerente}
              onChange={e => setNovaAssoc(s => ({ ...s, gerente: e.target.value }))}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
            >
              <option value="">Gerente...</option>
              {gerentes.map(u => (
                <option value={u.id} key={u.id}>{u.nome}</option>
              ))}
            </select>
            <select
              value={novaAssoc.posto}
              onChange={e => setNovaAssoc(s => ({ ...s, posto: e.target.value }))}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
            >
              <option value="">Posto...</option>
              {postos.map(p => (
                <option value={p.id} key={p.id}>{p.nome} - {p.cidade}</option>
              ))}
            </select>
            <button type="submit" style={{
              background: "#dab45a", color: "#fff", border: "none", borderRadius: 6,
              padding: "8px 0", fontWeight: "bold", fontSize: 15, cursor: "pointer"
            }}>Vincular</button>
          </form>
          <div>
            <b>Associações cadastradas:</b>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {associacoes.map(a => (
                <li key={a.id} style={{ marginBottom: 8, borderBottom: "1px solid #ffe9b0" }}>
                  <span>
                    Supervisor: <b>{usuarios.find(u => u.id === a.supervisor)?.nome}</b> | 
                    Gerente: <b>{usuarios.find(u => u.id === a.gerente)?.nome}</b> | 
                    Posto: <b>{postos.find(p => p.id === a.posto)?.nome}</b>
                  </span>
                  <button onClick={() => handleExcluirAssoc(a.id)} style={{ background: "#e74c3c", color: "#fff", border: "none", borderRadius: 6, marginLeft: 12, padding: "2px 10px", cursor: "pointer" }}>Excluir</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
