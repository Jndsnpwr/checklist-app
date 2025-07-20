// src/components/AdminPanel.js
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { collection, doc, getDocs, updateDoc, addDoc, deleteDoc } from "firebase/firestore";

// Estilos CSS para o AdminPanel
const adminPanelStyleTag = `
  .admin-background { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100% ); min-height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #e0e0e0; }
  .admin-container { max-width: 480px; margin: 0 auto; padding: 20px; box-sizing: border-box; }
  .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; }
  .admin-header h2 { margin: 0; font-size: 18px; font-weight: 600; }
  .admin-header .back-button { background: rgba(255, 255, 255, 0.1); border: none; color: #fff; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.3s ease; }
  .admin-header .back-button:hover { background: rgba(255, 255, 255, 0.2); }
  .admin-tabs { display: flex; gap: 10px; margin-bottom: 20px; }
  .admin-tab { flex: 1; padding: 10px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; text-align: center; }
  .admin-tab.active { background: #3498db; color: white; }
  .admin-tab.inactive { background: rgba(255, 255, 255, 0.05); color: #e0e0e0; border: 1px solid rgba(255, 255, 255, 0.1); }
  .admin-card { background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(255, 255, 255, 0.1); }
  .admin-card h3 { margin-top: 0; color: #e0e0e0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 10px; }
  .form-group { margin-bottom: 15px; }
  .form-group label { display: block; margin-bottom: 5px; font-size: 14px; color: #b0c4de; }
  .form-input { width: 100%; background: #0d1117; border: 1px solid #30363d; color: #e0e0e0; border-radius: 8px; padding: 10px; font-size: 15px; box-sizing: border-box; }
  .action-button { background: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.3s ease; width: 100%; margin-top: 10px; }
  .action-button:hover { background: #2980b9; }
  .list-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
  .list-item:last-child { border-bottom: none; }
  .list-item-info { font-size: 14px; }
  .list-item-info b { color: #fff; }
  .list-item-info small { color: #b0c4de; }
  .list-item-actions { display: flex; gap: 5px; }
  .list-item-actions button { padding: 5px 8px; font-size: 12px; border: none; border-radius: 6px; cursor: pointer; }
  .btn-edit { background: #f1c40f; color: #fff; }
  .btn-password { background: #3498db; color: #fff; }
  .btn-delete { background: #e74c3c; color: #fff; }
  .message-feedback { padding: 10px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
  .message-feedback.error { background: rgba(255, 138, 128, 0.1); color: #ff8a80; }
  .message-feedback.success { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
`;

export default function AdminPanel({ onVoltar }) {
  // --- ESTADOS DO COMPONENTE (sem alteração) ---
  const [aba, setAba] = useState("usuarios");
  const [usuarios, setUsuarios] = useState([]);
  const [postos, setPostos] = useState([]);
  const [associacoes, setAssociacoes] = useState([]);
  const [novoUsuario, setNovoUsuario] = useState({ email: "", senha: "", tipo: "supervisor", nome: "" });
  const [novoPosto, setNovoPosto] = useState({ nome: "", cidade: "" });
  const [novaAssoc, setNovaAssoc] = useState({ supervisor: "", gerente: "", posto: "" });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [editandoUsuario, setEditandoUsuario] = useState(null);

  // --- LÓGICA DE DADOS (sem alteração) ---
  const fetchData = async () => {
    setCarregando(true);
    try {
      const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
      setUsuarios(usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const postosSnapshot = await getDocs(collection(db, "postos"));
      setPostos(postosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const assocSnapshot = await getDocs(collection(db, "associacoes"));
      setAssociacoes(assocSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { setErro("Falha ao carregar dados do servidor."); }
    setCarregando(false);
  };

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = adminPanelStyleTag;
    document.head.appendChild(styleElement);
    fetchData();
    return () => { document.head.removeChild(styleElement); };
  }, []);

  useEffect(() => { setErro(""); setMensagem(""); }, [aba]);

  // --- FUNÇÕES DE AÇÃO (sem alteração na lógica) ---
  async function handleNovoUsuario(e) { e.preventDefault(); setErro(""); setMensagem(""); if (!novoUsuario.email.trim() || !novoUsuario.senha.trim() || !novoUsuario.nome.trim()) { return setErro("Preencha nome, e-mail e senha."); } try { const functions = getFunctions(); const criarNovoUsuario = httpsCallable(functions, 'criarNovoUsuario' ); const result = await criarNovoUsuario({ ...novoUsuario }); setMensagem(result.data.result); setNovoUsuario({ email: "", senha: "", tipo: "supervisor", nome: "" }); fetchData(); } catch (error) { setErro(error.message); } }
  async function handleExcluirUsuario(uid) { if (!window.confirm("Tem certeza que deseja excluir este usuário? Esta ação é PERMANENTE.")) return; setErro(""); setMensagem(""); try { const functions = getFunctions(); const deletarUsuario = httpsCallable(functions, 'deletarUsuario' ); await deletarUsuario({ uid: uid }); setMensagem("Usuário deletado com sucesso do sistema."); fetchData(); } catch (error) { setErro(error.message); } }
  async function handleRecuperarSenha(email) { if (!window.confirm(`Deseja enviar um e-mail de redefinição de senha para ${email}?`)) return; setErro(""); setMensagem(""); try { await sendPasswordResetEmail(auth, email); setMensagem(`E-mail de recuperação enviado para ${email}.`); } catch (error) { setErro("Erro ao enviar e-mail de recuperação."); } }
  async function handleSalvarEdicao(e) { e.preventDefault(); if (!editandoUsuario || !editandoUsuario.nome.trim()) return setErro("O nome não pode ficar em branco."); setErro(""); setMensagem(""); try { const userDocRef = doc(db, "usuarios", editandoUsuario.id); await updateDoc(userDocRef, { nome: editandoUsuario.nome, tipo: editandoUsuario.tipo }); setMensagem("Usuário atualizado com sucesso!"); setEditandoUsuario(null); fetchData(); } catch (error) { setErro("Erro ao salvar as alterações."); } }
  async function handleNovoPosto(e) { e.preventDefault(); try { await addDoc(collection(db, "postos"), { nome: novoPosto.nome.trim(), cidade: novoPosto.cidade.trim() }); setMensagem("Posto cadastrado!"); setNovoPosto({ nome: "", cidade: "" }); fetchData(); } catch (e) { setErro("Erro ao cadastrar posto."); } }
  async function handleExcluirPosto(id) { try { await deleteDoc(doc(db, "postos", id)); setMensagem("Posto removido."); fetchData(); } catch (e) { setErro("Erro ao excluir posto."); } }
  async function handleNovaAssoc(e) { e.preventDefault(); try { await addDoc(collection(db, "associacoes"), novaAssoc); setMensagem("Associação criada!"); setNovaAssoc({ supervisor: "", gerente: "", posto: "" }); fetchData(); } catch (e) { setErro("Erro ao criar associação."); } }
  async function handleExcluirAssoc(id) { try { await deleteDoc(doc(db, "associacoes", id)); setMensagem("Associação removida."); fetchData(); } catch (e) { setErro("Erro ao excluir associação."); } }

  const gerentes = usuarios.filter(u => u.tipo === "gerente");
  const supervisores = usuarios.filter(u => u.tipo === "supervisor");

  // --- RENDERIZAÇÃO DO COMPONENTE ---
  return (
    <div className="admin-background">
      <div className="admin-container">
        <header className="admin-header">
          <h2>Painel Administrativo</h2>
          <button onClick={onVoltar} className="back-button">Voltar</button>
        </header>

        <div className="admin-tabs">
          <button onClick={() => setAba("usuarios")} className={`admin-tab ${aba === 'usuarios' ? 'active' : 'inactive'}`}>👤 Usuários</button>
          <button onClick={() => setAba("postos")} className={`admin-tab ${aba === 'postos' ? 'active' : 'inactive'}`}>⛽ Postos</button>
          <button onClick={() => setAba("associacoes")} className={`admin-tab ${aba === 'associacoes' ? 'active' : 'inactive'}`}>🔗 Associações</button>
        </div>

        {carregando && <p className="message-feedback">Carregando dados...</p>}
        {erro && <p className="message-feedback error">{erro}</p>}
        {mensagem && <p className="message-feedback success">{mensagem}</p>}

        {aba === "usuarios" && (
          <>
            <div className="admin-card">
              <h3>Novo Usuário</h3>
              <form onSubmit={handleNovoUsuario}>
                <div className="form-group"><input className="form-input" value={novoUsuario.nome} onChange={e => setNovoUsuario(s => ({ ...s, nome: e.target.value }))} placeholder="Nome completo" /></div>
                <div className="form-group"><input className="form-input" value={novoUsuario.email} onChange={e => setNovoUsuario(s => ({ ...s, email: e.target.value }))} placeholder="E-mail (login)" type="email" /></div>
                <div className="form-group"><input className="form-input" value={novoUsuario.senha} type="password" onChange={e => setNovoUsuario(s => ({ ...s, senha: e.target.value }))} placeholder="Senha (mínimo 6 caracteres)" /></div>
                <div className="form-group">
                  <select className="form-input" value={novoUsuario.tipo} onChange={e => setNovoUsuario(s => ({ ...s, tipo: e.target.value }))}>
                    <option value="supervisor">Supervisor</option>
                    <option value="gerente">Gerente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <button type="submit" className="action-button">Cadastrar Usuário</button>
              </form>
            </div>
            <div className="admin-card">
              <h3>Usuários Cadastrados</h3>
              {usuarios.map(u => (
                <div key={u.id} className="list-item">
                  <div className="list-item-info"><b>{u.nome}</b> <small>({u.tipo})</small></div>
                  <div className="list-item-actions">
                    <button onClick={() => handleRecuperarSenha(u.email)} className="btn-password" title="Redefinir Senha">🔑</button>
                    <button onClick={() => setEditandoUsuario(u)} className="btn-edit" title="Editar">✏️</button>
                    <button onClick={() => handleExcluirUsuario(u.id)} className="btn-delete" title="Excluir">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {aba === "postos" && (
          <>
            <div className="admin-card">
              <h3>Novo Posto</h3>
              <form onSubmit={handleNovoPosto}>
                <div className="form-group"><input className="form-input" value={novoPosto.nome} onChange={e => setNovoPosto(s => ({ ...s, nome: e.target.value }))} placeholder="Nome do posto" /></div>
                <div className="form-group"><input className="form-input" value={novoPosto.cidade} onChange={e => setNovoPosto(s => ({ ...s, cidade: e.target.value }))} placeholder="Cidade" /></div>
                <button type="submit" className="action-button">Cadastrar Posto</button>
              </form>
            </div>
            <div className="admin-card">
              <h3>Postos Cadastrados</h3>
              {postos.map(p => (
                <div key={p.id} className="list-item">
                  <div className="list-item-info"><b>{p.nome}</b> <small>({p.cidade})</small></div>
                  <div className="list-item-actions"><button onClick={() => handleExcluirPosto(p.id)} className="btn-delete">🗑️</button></div>
                </div>
              ))}
            </div>
          </>
        )}

        {aba === "associacoes" && (
          <>
            <div className="admin-card">
              <h3>Nova Associação</h3>
              <form onSubmit={handleNovaAssoc}>
                <div className="form-group"><select className="form-input" value={novaAssoc.supervisor} onChange={e => setNovaAssoc(s => ({ ...s, supervisor: e.target.value }))}><option value="">Selecione um Supervisor...</option>{supervisores.map(u => (<option value={u.id} key={u.id}>{u.nome}</option>))}</select></div>
                <div className="form-group"><select className="form-input" value={novaAssoc.gerente} onChange={e => setNovaAssoc(s => ({ ...s, gerente: e.target.value }))}><option value="">Selecione um Gerente...</option>{gerentes.map(u => (<option value={u.id} key={u.id}>{u.nome}</option>))}</select></div>
                <div className="form-group"><select className="form-input" value={novaAssoc.posto} onChange={e => setNovaAssoc(s => ({ ...s, posto: e.target.value }))}><option value="">Selecione um Posto...</option>{postos.map(p => (<option value={p.id} key={p.id}>{p.nome} - {p.cidade}</option>))}</select></div>
                <button type="submit" className="action-button">Vincular</button>
              </form>
            </div>
            <div className="admin-card">
              <h3>Associações Cadastradas</h3>
              {associacoes.map(a => (
                <div key={a.id} className="list-item">
                  <div className="list-item-info" style={{fontSize: '12px'}}>
                    <p style={{margin:0}}>S: <b>{usuarios.find(u => u.id === a.supervisor)?.nome || 'N/A'}</b></p>
                    <p style={{margin:0}}>G: <b>{usuarios.find(u => u.id === a.gerente)?.nome || 'N/A'}</b></p>
                    <p style={{margin:0}}>P: <b>{postos.find(p => p.id === a.posto)?.nome || 'N/A'}</b></p>
                  </div>
                  <div className="list-item-actions"><button onClick={() => handleExcluirAssoc(a.id)} className="btn-delete">🗑️</button></div>
                </div>
              ))}
            </div>
          </>
        )}

        {editandoUsuario && (
          <div className="modal-overlay">
            <div className="admin-card" style={{ width: '90%', maxWidth: 400 }}>
              <h3>✏️ Editando Usuário</h3>
              <form onSubmit={handleSalvarEdicao}>
                <div className="form-group"><label>Email (não pode ser alterado)</label><input value={editandoUsuario.email} disabled className="form-input" /></div>
                <div className="form-group"><label>Nome</label><input value={editandoUsuario.nome} onChange={e => setEditandoUsuario(u => ({ ...u, nome: e.target.value }))} className="form-input" /></div>
                <div className="form-group"><label>Tipo</label><select value={editandoUsuario.tipo} onChange={e => setEditandoUsuario(u => ({ ...u, tipo: e.target.value }))} className="form-input"><option value="supervisor">Supervisor</option><option value="gerente">Gerente</option><option value="admin">Administrador</option></select></div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                  <button type="button" onClick={() => setEditandoUsuario(null)} className="action-button" style={{width: 'auto', background: 'rgba(255,255,255,0.1)'}}>Cancelar</button>
                  <button type="submit" className="action-button" style={{width: 'auto'}}>Salvar Alterações</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
