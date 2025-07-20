import React, { useState } from "react";

// Simulação de "banco de dados" de usuários em localStorage (persistente no navegador)
function getUsuarios() {
  const data = localStorage.getItem("usuarios_sr");
  if (data) return JSON.parse(data);
  // Usuário padrão: admin
  return [{ usuario: "jandson", senha: "sr2025", tipo: "admin" }];
}
function saveUsuarios(lista) {
  localStorage.setItem("usuarios_sr", JSON.stringify(lista));
}

function createSubtleStars() {
  if (document.getElementById('stars')) return;
  const starsContainer = document.createElement('div');
  starsContainer.id = 'stars';
  starsContainer.className = 'subtle-stars';
  const numberOfStars = 50;
  for (let i = 0; i < numberOfStars; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.width = Math.random() * 2 + 1 + 'px';
    star.style.height = star.style.width;
    star.style.animationDelay = Math.random() * 4 + 's';
    starsContainer.appendChild(star);
  }
  document.body.appendChild(starsContainer);
}

// CSS igual antes, pode copiar do exemplo anterior ou manter junto
const styleTag = `
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative;
}
.subtle-stars { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.3; z-index: 0;}
.star { position: absolute; background: rgba(255,255,255,0.6); border-radius: 50%; animation: subtle-twinkle 4s infinite ease-in-out;}
@keyframes subtle-twinkle { 0%,100%{opacity:0.3;} 50%{opacity:0.8;} }
.login-container { background: rgba(255,255,255,0.97);backdrop-filter: blur(18px); border-radius: 16px; padding: 40px 24px; width: 100%; max-width: 360px; text-align: center; box-shadow: 0 12px 24px rgba(0,0,0,0.13), 0 1px 0 rgba(255,255,255,0.17); border: 1px solid rgba(255,255,255,0.26); margin: auto; position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center;}
.logo { width:120px;height:auto;margin-bottom:22px;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.11)); }
.system-title { color:#2c3e50;font-size:21px;font-weight:300;margin-bottom:6px;letter-spacing:-0.5px;}
.subtitle {color:#7f8c8d;font-size:14px;margin-bottom:20px;font-weight:400;}
.form-group {margin-bottom:20px;text-align:left;width:100%;}
.form-label {display:block;color:#34495e;font-size:14px;font-weight:500;margin-bottom:6px;letter-spacing:0.3px;}
.form-input {width:100%;padding:13px 12px;background:rgba(255,255,255,0.93);border:2px solid #e8eaed;border-radius:8px;color:#2c3e50;font-size:16px;transition:all 0.3s ease;font-family:inherit;}
.form-input:focus {outline:none;border-color:#3498db;background:#fff;box-shadow:0 0 0 3px rgba(52,152,219,0.11);}
.form-input::placeholder {color:#a0a7ac;}
.login-button {width:100%;padding:13px 0;background:linear-gradient(135deg,#3498db 0%,#2980b9 100%);border:none;border-radius:8px;color:white;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.3s ease;margin-top:10px;letter-spacing:0.4px;}
.login-button:hover {background:linear-gradient(135deg,#2980b9 0%,#1f5f8b 100%);transform:translateY(-1px);box-shadow:0 4px 12px rgba(52,152,219,0.15);}
.login-button:active {transform:translateY(0);}
.footer-links {margin-top:20px;display:flex;justify-content:space-between;align-items:center;width:100%;}
.footer-link {color:#7f8c8d;text-decoration:none;font-size:13px;transition:color 0.3s ease;}
.footer-link:hover {color:#3498db;}
.security-badge {margin-top:12px;padding:10px;background:rgba(46,204,113,0.08);border-radius:6px;border-left:3px solid #2ecc71;}
.security-text {color:#27ae60;font-size:12px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:6px;}
.security-icon {width:16px;height:16px;fill:currentColor;}
@media (max-width: 480px) {
  .login-container {padding:26px 7vw;margin:0;}
  .logo {width:80px;}
  .system-title {font-size:15px;}
  .footer-links {flex-direction:column;gap:10px;}
}
`;

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [usuarios, setUsuarios] = useState(getUsuarios());
  const [show2fa, setShow2fa] = useState(false);
  const [codigo2fa, setCodigo2fa] = useState("");
  const [input2fa, setInput2fa] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [novoUser, setNovoUser] = useState({ usuario: "", senha: "", tipo: "user" });
  const [msg, setMsg] = useState("");

  React.useEffect(() => {
    if (!document.getElementById("login-style")) {
      const style = document.createElement("style");
      style.id = "login-style";
      style.innerHTML = styleTag;
      document.head.appendChild(style);
    }
    createSubtleStars();
    return () => {
      if (document.getElementById('stars')) {
        document.getElementById('stars').remove();
      }
    };
  }, []);

  function gerarCodigo2fa() {
    return (Math.floor(100000 + Math.random() * 900000)).toString(); // 6 dígitos
  }

  // Validação de login
  const handleSubmit = (e) => {
    e.preventDefault();
    setErro(""); setMsg("");
    const u = usuarios.find(
      (u) => u.usuario === usuario.trim() && u.senha === senha.trim()
    );
    if (!usuario.trim() || !senha.trim()) {
      setErro("Preencha usuário e senha.");
      return;
    }
    if (!u) {
      setErro("Usuário ou senha inválidos!");
      return;
    }
    // 2FA simulado (mostra na tela para usuário)
    const cod = gerarCodigo2fa();
    setCodigo2fa(cod);
    setShow2fa(true);
    setTimeout(() => {
      alert("Seu código de autenticação é: " + cod + "\n\n(Na versão real será enviado por SMS ou e-mail.)");
    }, 300); // Mostra o código para simulação
    // Se for admin, já ativa adminMode depois
    if (u.tipo === "admin") setAdminMode(true);
    else setAdminMode(false);
  };

  const handleSubmit2fa = (e) => {
    e.preventDefault();
    setErro(""); setMsg("");
    if (input2fa.trim() === codigo2fa) {
      setShow2fa(false);
      setCodigo2fa("");
      setInput2fa("");
      // Retorna o usuário logado ao app principal (pode passar permissões se quiser)
      onLogin(usuario);
    } else {
      setErro("Código de autenticação inválido.");
    }
  };

  // ADMIN: Cadastrar novo usuário
  const handleNovoUser = (e) => {
    e.preventDefault();
    setMsg(""); setErro("");
    if (!novoUser.usuario.trim() || !novoUser.senha.trim()) {
      setErro("Preencha todos os campos do novo usuário.");
      return;
    }
    if (usuarios.find(u => u.usuario === novoUser.usuario.trim())) {
      setErro("Usuário já existe!");
      return;
    }
    const newList = [
      ...usuarios,
      {
        usuario: novoUser.usuario.trim(),
        senha: novoUser.senha.trim(),
        tipo: novoUser.tipo,
      },
    ];
    setUsuarios(newList);
    saveUsuarios(newList);
    setNovoUser({ usuario: "", senha: "", tipo: "user" });
    setMsg("Usuário cadastrado com sucesso!");
  };

  // ADMIN: Excluir usuário (exceto admin)
  const handleDeleteUser = (u) => {
    if (u.tipo === "admin") return;
    const list = usuarios.filter(x => x.usuario !== u.usuario);
    setUsuarios(list);
    saveUsuarios(list);
    setMsg("Usuário removido.");
  };

  // TELA 2FA
  if (show2fa) {
    return (
      <div className="login-bg" style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div className="login-container">
          <img src="/logo_sao_roque.png" alt="Rede São Roque" className="logo" />
          <h2 className="system-title">Autenticação em 2 fatores</h2>
          <p className="subtitle">Digite o código de 6 dígitos enviado para seu dispositivo<br />
            <span style={{ color: "#aaa", fontSize: 12 }}>(Para testar, código: <b>{codigo2fa}</b>)</span>
          </p>
          <form onSubmit={handleSubmit2fa} autoComplete="off">
            <input
              type="text"
              className="form-input"
              maxLength={6}
              style={{ textAlign: "center", fontSize: 22, letterSpacing: 8, margin: "18px 0" }}
              placeholder="000000"
              value={input2fa}
              onChange={e => setInput2fa(e.target.value.replace(/\D/g, ""))}
              autoFocus
            />
            {erro && <div style={{ color: "#e74c3c", marginBottom: 10 }}>{erro}</div>}
            <button type="submit" className="login-button">Validar código</button>
          </form>
        </div>
      </div>
    );
  }

  // ADMIN: tela de cadastro de usuários
  if (adminMode) {
    return (
      <div className="login-bg" style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div className="login-container">
          <img src="/logo_sao_roque.png" alt="Rede São Roque" className="logo" />
          <h2 className="system-title">Administração de Usuários</h2>
          <form onSubmit={handleNovoUser} autoComplete="off">
            <div className="form-group">
              <label className="form-label">Nome do usuário</label>
              <input
                className="form-input"
                placeholder="Novo usuário"
                value={novoUser.usuario}
                onChange={e => setNovoUser(s => ({ ...s, usuario: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                className="form-input"
                placeholder="Senha"
                type="password"
                value={novoUser.senha}
                onChange={e => setNovoUser(s => ({ ...s, senha: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Permissão</label>
              <select
                className="form-input"
                value={novoUser.tipo}
                onChange={e => setNovoUser(s => ({ ...s, tipo: e.target.value }))}
              >
                <option value="user">Usuário comum</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button className="login-button" type="submit">Cadastrar usuário</button>
          </form>
          {msg && <div style={{ color: "#27ae60", marginTop: 10 }}>{msg}</div>}
          {erro && <div style={{ color: "#e74c3c", marginTop: 10 }}>{erro}</div>}

          <div style={{ marginTop: 24 }}>
            <h4 style={{ margin: "6px 0 10px", color: "#34495e" }}>Usuários cadastrados</h4>
            {usuarios.length < 2 && <div style={{ fontSize: 13, color: "#888" }}>Nenhum usuário além do admin.</div>}
            <ul style={{ listStyle: "none", padding: 0 }}>
              {usuarios.map((u, idx) => (
                <li key={idx} style={{ marginBottom: 10, fontSize: 15, color: "#34495e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>
                    <b>{u.usuario}</b> ({u.tipo === "admin" ? "Admin" : "Usuário"})
                  </span>
                  {u.tipo !== "admin" && (
                    <button onClick={() => handleDeleteUser(u)} style={{
                      fontSize: 12, padding: "3px 11px", borderRadius: 6, border: "none",
                      background: "#e74c3c", color: "#fff", cursor: "pointer"
                    }}>Excluir</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <button
            className="login-button"
            style={{ background: "#b58944", marginTop: 22 }}
            onClick={() => setAdminMode(false)}
          >
            Voltar para login
          </button>
        </div>
      </div>
    );
  }

  // TELA LOGIN padrão
  return (
    <div className="login-bg" style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div className="login-container">
        <img
          src="/logo_sao_roque.png"
          alt="Rede São Roque"
          className="logo"
        />
        <h1 className="system-title">Portal Corporativo</h1>
        <p className="subtitle">Acesso seguro ao sistema</p>
        <form onSubmit={handleSubmit} autoComplete="off" style={{ width: '100%' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="usuario">Usuário</label>
            <input
              id="usuario"
              type="text"
              className="form-input"
              placeholder="Digite seu nome de usuário"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              className="form-input"
              placeholder="Digite sua senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
            />
          </div>
          {erro && (
            <div style={{ color: "#e74c3c", marginBottom: 8, fontSize: 15 }}>{erro}</div>
          )}
          <button type="submit" className="login-button">
            Acessar Sistema
          </button>
        </form>
        <div className="footer-links">
          <a href="#" className="footer-link">Esqueci minha senha</a>
          <a href="#" className="footer-link">Suporte técnico</a>
        </div>
        <div className="security-badge">
          <div className="security-text">
            <svg className="security-icon" viewBox="0 0 24 24">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V16H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"/>
            </svg>
            Conexão segura e criptografada
          </div>
        </div>
      </div>
    </div>
  );
}
