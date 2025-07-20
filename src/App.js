// src/App.js

import React, { useState, useEffect } from 'react';

// Importações do Firebase (sem alteração)
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Importações dos componentes de tela (sem alteração)
import Login from "./components/Login";
import AdminPanel from "./components/AdminPanel";
import ChecklistOperacional from "./components/ChecklistOperacional";
import ChecklistAdministrativo from "./components/ChecklistAdministrativo";
import ChecklistNaoConformidades from "./components/ChecklistNaoConformidades";

// 1. NOVO: Estilos CSS para o novo menu. Injetados diretamente para simplicidade.
const menuStyleTag = `
  .menu-background {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    min-height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }
  .menu-container {
    width: 100%;
    max-width: 480px;
    color: #fff;
  }
  .menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
  }
  .menu-header .user-info {
    font-size: 14px;
  }
  .menu-header .user-info span {
    font-weight: 700;
    color: #e0e0e0;
  }
  .menu-header .logout-button {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.3s ease;
  }
  .menu-header .logout-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  .menu-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  .menu-card {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.3s ease, background 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .menu-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
  }
  .menu-card .icon {
    font-size: 36px;
    margin-bottom: 10px;
  }
  .menu-card h3 {
    font-size: 16px;
    margin: 0 0 5px 0;
    font-weight: 600;
  }
  .menu-card p {
    font-size: 12px;
    color: #b0c4de;
    margin: 0;
  }
  /* Estilo especial para o card de admin */
  .menu-card.admin-card {
    background: rgba(241, 165, 53, 0.15);
    border-color: rgba(241, 165, 53, 0.3);
  }
  .menu-card.admin-card:hover {
    background: rgba(241, 165, 53, 0.25);
  }
`;

function App() {
  // Lógica de estados e autenticação (sem alteração)
  const [tela, setTela] = useState("menu"); 
  const [user, setUser] = useState(null); 
  const [userInfo, setUserInfo] = useState(null); 
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Injeta os estilos do novo menu na página
    const styleElement = document.createElement('style');
    styleElement.innerHTML = menuStyleTag;
    document.head.appendChild(styleElement);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "usuarios", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserInfo(userDoc.data());
        }
      } else {
        setUser(null);
        setUserInfo(null);
      }
      setCarregando(false);
    });
    return () => {
      document.head.removeChild(styleElement);
      unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => setTela("menu"));
  };

  if (carregando) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a2e', color: 'white' }}>Carregando...</div>;
  }

  if (!user) {
    return <Login onLogin={(loggedInUser) => setUser(loggedInUser)} />;
  }

  // Roteador de telas (sem alteração na lógica)
  switch (tela) {
    case "operacional":
      return <ChecklistOperacional usuarioLogado={userInfo} onVoltar={() => setTela("menu")} />;
    case "administrativo":
      return <ChecklistAdministrativo usuarioLogado={userInfo} onVoltar={() => setTela("menu")} />;
    case "naoConformidades":
      return <ChecklistNaoConformidades usuarioLogado={userInfo} onVoltar={() => setTela("menu")} />;
    case "admin":
      if (userInfo && userInfo.tipo === 'admin') {
        return <AdminPanel onVoltar={() => setTela("menu")} />;
      }
      setTela("menu"); 
      return null;
    default:
      // 2. NOVO: Renderização do Menu Principal com o novo design
      return (
        <div className="menu-background">
          <div className="menu-container">
            <header className="menu-header">
              <div className="user-info">
                Bem-vindo, <br/>
                <span>{userInfo ? userInfo.nome : user.email}</span>
              </div>
              <button onClick={handleLogout} className="logout-button">
                {/* Ícone de Sair (SVG) */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Sair
              </button>
            </header>

            <main className="menu-grid">
              {/* Card 1: Checklist Operacional */}
              <div className="menu-card" onClick={() => setTela("operacional")}>
                <div className="icon">📋</div>
                <h3>Operacional</h3>
                <p>Verificação de rotinas da pista e anexos.</p>
              </div>

              {/* Card 2: Checklist Administrativo */}
              <div className="menu-card" onClick={() => setTela("administrativo")}>
                <div className="icon">💼</div>
                <h3>Administrativo</h3>
                <p>Conferência de caixa e cofre.</p>
              </div>

              {/* Card 3: Não Conformidades */}
              <div className="menu-card" onClick={() => setTela("naoConformidades")}>
                <div className="icon">⚠️</div>
                <h3>Não Conformidades</h3>
                <p>Registro de ocorrências e desvios.</p>
              </div>

              {/* Card 4: Painel Administrativo (condicional) */}
              {userInfo && userInfo.tipo === 'admin' && (
                <div className="menu-card admin-card" onClick={() => setTela("admin")}>
                  <div className="icon">⚙️</div>
                  <h3>Painel Admin</h3>
                  <p>Gestão de usuários e postos.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      );
  }
}

export default App;
