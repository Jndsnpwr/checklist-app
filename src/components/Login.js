import React, { useState, useEffect } from "react";
// Importe os métodos de autenticação do Firebase
import { auth } from "../firebaseConfig"; // Verifique se o caminho está correto
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

// Função para criar o fundo de estrelas (mantida do seu código original)
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

// Estilos CSS em JS (mantidos do seu código original)
const styleTag = `
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative;
}
.subtle-stars { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.3; z-index: 0;}
.star { position: absolute; background: rgba(255,255,255,0.6); border-radius: 50%; animation: subtle-twinkle 4s infinite ease-in-out;}
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
.footer-link {color:#7f8c8d;text-decoration:none;font-size:13px;transition:color 0.3s ease; cursor: pointer;}
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
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState(""); // Para mensagens de sucesso (ex: recuperação de senha)
  const [carregando, setCarregando] = useState(false);

  // Efeito para injetar os estilos e o fundo de estrelas na página
  useEffect(() => {
    if (!document.getElementById("login-style")) {
      const style = document.createElement("style");
      style.id = "login-style";
      style.innerHTML = styleTag;
      document.head.appendChild(style);
    }
    createSubtleStars();
    // Função de limpeza para remover as estrelas quando o componente for desmontado
    return () => {
      const stars = document.getElementById('stars');
      if (stars) {
        stars.remove();
      }
    };
  }, []);

  // Função para lidar com o login via Firebase
  const handleLogin = (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    if (!email || !senha) {
      setErro("Por favor, preencha o e-mail e a senha.");
      return;
    }

    setCarregando(true);
    signInWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        // Sucesso! Chama a função onLogin passada pelo componente pai
        onLogin(userCredential.user);
      })
      .catch((error) => {
        // Trata os erros mais comuns do Firebase
        switch (error.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
          case "auth/invalid-credential":
            setErro("E-mail ou senha inválidos.");
            break;
          case "auth/invalid-email":
            setErro("O formato do e-mail é inválido.");
            break;
          default:
            setErro("Ocorreu um erro ao tentar fazer login.");
            break;
        }
      })
      .finally(() => {
        setCarregando(false);
      });
  };

  // Função para lidar com a recuperação de senha via Firebase
  const handleRecuperarSenha = () => {
    setErro("");
    setMensagem("");

    if (!email) {
      setErro("Por favor, informe seu e-mail para recuperar a senha.");
      return;
    }

    setCarregando(true);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMensagem("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      })
      .catch((error) => {
        if (error.code === "auth/user-not-found") {
          setErro("Nenhum usuário encontrado com este e-mail.");
        } else {
          setErro("Ocorreu um erro ao tentar enviar o e-mail de recuperação.");
        }
      })
      .finally(() => {
        setCarregando(false);
      });
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <img
          src="/logo_sao_roque.png"
          alt="Rede São Roque"
          className="logo"
        />
        <h1 className="system-title">Portal Corporativo</h1>
        <p className="subtitle">Acesso seguro ao sistema</p>
        
        <form onSubmit={handleLogin} autoComplete="off" style={{ width: '100%' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              disabled={carregando}
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
              onChange={(e) => setSenha(e.target.value)}
              disabled={carregando}
            />
          </div>

          {/* Exibe mensagens de erro ou sucesso */}
          {erro && <div style={{ color: "#e74c3c", marginBottom: 12, fontSize: 15 }}>{erro}</div>}
          {mensagem && <div style={{ color: "#27ae60", marginBottom: 12, fontSize: 15 }}>{mensagem}</div>}

          <button type="submit" className="login-button" disabled={carregando}>
            {carregando ? "Acessando..." : "Acessar Sistema"}
          </button>
        </form>

        <div className="footer-links">
          <a onClick={handleRecuperarSenha} className="footer-link">Esqueci minha senha</a>
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
