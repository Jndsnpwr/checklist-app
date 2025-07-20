// src/components/ChecklistAdministrativo.js
import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";

// Importações do Firebase
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

// Estrutura de páginas com emoji
const PAGINAS = [
  {
    titulo: "Conferências Administrativas",
    emoji: "💼",
    itens: [
      "Conferência de frente de caixa",
      "Conferência de saldo do cofre",
    ]
  }
];

// Estilos CSS para o novo design (idênticos ao outro checklist para consistência)
const checklistStyleTag = `
  .checklist-background { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); min-height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #e0e0e0; }
  .checklist-container { max-width: 480px; margin: 0 auto; padding: 20px; box-sizing: border-box; }
  .checklist-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; }
  .checklist-header .title-block h2 { margin: 0; font-size: 18px; font-weight: 600; }
  .checklist-header .title-block p { margin: 0; font-size: 13px; color: #b0c4de; }
  .checklist-header .back-button { background: rgba(255, 255, 255, 0.1); border: none; color: #fff; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.3s ease; }
  .checklist-header .back-button:hover { background: rgba(255, 255, 255, 0.2); }
  .page-indicator { text-align: center; margin-bottom: 20px; padding: 15px; background: rgba(255, 255, 255, 0.08); border-radius: 12px; }
  .page-indicator .emoji { font-size: 28px; }
  .page-indicator h3 { margin: 5px 0; font-size: 18px; }
  .page-indicator .page-number { font-size: 13px; color: #b0c4de; }
  .item-card { background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 15px; margin-bottom: 15px; border: 1px solid rgba(255, 255, 255, 0.1); }
  .item-card .item-title { font-weight: 600; font-size: 16px; margin-bottom: 15px; }
  .action-button { background: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.3s ease; }
  .action-button:hover { background: #2980b9; }
  .secondary-button { background: rgba(255, 255, 255, 0.1); color: #e0e0e0; }
  .secondary-button:hover { background: rgba(255, 255, 255, 0.2); }
  .send-button { background: #27ae60; width: 100%; margin-top: 20px; }
  .send-button:hover { background: #2ecc71; }
`;

export default function ChecklistAdministrativo({ usuarioLogado, onVoltar }) {
  // Lógica de estados e funções
  const [pagina] = useState(0); // Sempre 0, pois só há uma página
  const [fotos, setFotos] = useState({});
  const [showWebcam, setShowWebcam] = useState({});
  const [imgPreview, setImgPreview] = useState(null);
  const [editingComment, setEditingComment] = useState({});
  const [commentDraft, setCommentDraft] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const webcamRef = useRef(null);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = checklistStyleTag;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleCapture = (page, idx) => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setFotos(prev => ({ ...prev, [page]: { ...prev[page], [idx]: [...(prev[page]?.[idx] || []), { foto: imageSrc, comentario: "" }] } }));
    }
    setShowWebcam(prev => ({ ...prev, [`${page}_${idx}`]: false }));
  };
  const handleRemoverFoto = (page, idx, fotoIdx) => {
    setFotos(prev => ({ ...prev, [page]: { ...prev[page], [idx]: prev[page][idx].filter((_, i) => i !== fotoIdx) } }));
  };
  const handleEditarComentario = (page, idx, fotoIdx) => {
    setEditingComment({ page, idx, fotoIdx });
    setCommentDraft(fotos[page][idx][fotoIdx].comentario || "");
  };
  const handleSalvarComentario = () => {
    const { page, idx, fotoIdx } = editingComment;
    setFotos(prev => {
      const updatedFotos = [...prev[page][idx]];
      updatedFotos[fotoIdx] = { ...updatedFotos[fotoIdx], comentario: commentDraft };
      return { ...prev, [page]: { ...prev[page], [idx]: updatedFotos } };
    });
    setEditingComment({});
    setCommentDraft("");
  };
  const handleEnviarRelatorio = async () => {
    if (!window.confirm("Tem certeza que deseja enviar o relatório?")) return;
    setEnviando(true);
    setErro("");
    const storage = getStorage();
    const relatorioFinal = {
      tipo: "Administrativo",
      supervisorId: usuarioLogado.id,
      supervisorNome: usuarioLogado.nome,
      data: serverTimestamp(),
      paginas: [],
    };
    try {
      for (let i = 0; i < PAGINAS.length; i++) {
        const paginaAtual = PAGINAS[i];
        const itensDaPagina = [];
        for (let j = 0; j < paginaAtual.itens.length; j++) {
          const itemAtual = paginaAtual.itens[j];
          const fotosDoItem = fotos[i]?.[j] || [];
          const urlsFotos = [];
          for (const fotoInfo of fotosDoItem) {
            const timestamp = new Date().getTime();
            const fotoRef = ref(storage, `checklists/administrativo/${usuarioLogado.id}/${timestamp}_${i}_${j}.jpg`);
            await uploadString(fotoRef, fotoInfo.foto, 'data_url');
            const downloadURL = await getDownloadURL(fotoRef);
            urlsFotos.push({ url: downloadURL, comentario: fotoInfo.comentario });
          }
          itensDaPagina.push({ nome: itemAtual, fotos: urlsFotos });
        }
        relatorioFinal.paginas.push({ titulo: paginaAtual.titulo, itens: itensDaPagina });
      }
      await addDoc(collection(db, "relatoriosChecklist"), relatorioFinal);
      alert("Relatório Administrativo enviado com sucesso!");
      onVoltar();
    } catch (error) {
      console.error("Erro ao enviar relatório:", error);
      setErro("Ocorreu um erro ao enviar o relatório.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="checklist-background">
      <div className="checklist-container">
        {enviando && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, color: 'white', flexDirection: 'column' }}>
            <h2>Enviando Relatório...</h2>
            <p>Por favor, aguarde.</p>
          </div>
        )}
        <header className="checklist-header">
          <div className="title-block">
            <h2>Checklist Administrativo</h2>
            <p>Supervisor: {usuarioLogado.nome}</p>
          </div>
          <button onClick={onVoltar} className="back-button">Voltar</button>
        </header>

        <div className="page-indicator">
          <div className="emoji">{PAGINAS[pagina].emoji}</div>
          <h3>{PAGINAS[pagina].titulo}</h3>
        </div>

        {erro && <p style={{ padding: '10px', color: '#ff8a80', background: 'rgba(255, 138, 128, 0.1)', textAlign: 'center', borderRadius: '8px' }}>{erro}</p>}

        <form onSubmit={e => e.preventDefault()}>
          {PAGINAS[pagina].itens.map((item, idx) => (
            <div key={idx} className="item-card">
              <div className="item-title">{item}</div>
              <div className="item-content">
                {(fotos[pagina]?.[idx] || []).length > 0 && (
                  <div style={{ marginBottom: 15 }}>
                    {fotos[pagina][idx].map((f, fotoIdx) => (
                      <div key={fotoIdx} style={{ padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button type="button" style={{ border: "none", background: "none", color: "#58a6ff", textDecoration: "underline", cursor: "pointer" }} onClick={() => setImgPreview(f.foto)}>
                          Ver foto {fotoIdx + 1}
                        </button>
                        <button type="button" style={{ marginLeft: 15, background: 'rgba(255, 138, 128, 0.1)', color: '#ff8a80', border: 'none', borderRadius: 5, padding: "3px 10px", cursor: "pointer" }} onClick={() => handleRemoverFoto(pagina, idx, fotoIdx)}>
                          Excluir
                        </button>
                        <div style={{ marginTop: 8 }}>
                          <span style={{ fontSize: 14, color: "#b0c4de" }}>
                            {f.comentario ? <><b>Comentário:</b> {f.comentario}</> : <i>Sem comentário</i>}
                          </span>
                          <button type="button" style={{ marginLeft: 12, background: 'rgba(255,255,255,0.1)', color: '#e0e0e0', border: 'none', padding: "2px 12px", borderRadius: 7, cursor: "pointer" }} onClick={() => handleEditarComentario(pagina, idx, fotoIdx)}>
                            {f.comentario ? "📝 Editar" : "💬 Adicionar"}
                          </button>
                        </div>
                        {editingComment.page === pagina && editingComment.idx === idx && editingComment.fotoIdx === fotoIdx && (
                          <div style={{ marginTop: 10 }}>
                            <textarea rows={2} style={{ width: "100%", borderRadius: 8, border: "1px solid #30363d", padding: 10, fontSize: 15, resize: "vertical", background: '#0d1117', color: '#e0e0e0', boxSizing: 'border-box' }} placeholder="Digite o comentário..." value={commentDraft} onChange={e => setCommentDraft(e.target.value)} maxLength="70" />
                            <button type="button" className="action-button" style={{ marginTop: 8, marginRight: 8 }} onClick={handleSalvarComentario}>Salvar</button>
                            <button type="button" className="action-button secondary-button" onClick={() => setEditingComment({})}>Cancelar</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {showWebcam[`${pagina}_${idx}`] ? (
                  <div>
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: "100%", borderRadius: 10, marginBottom: 10 }} videoConstraints={{ facingMode: "environment" }} playsInline={true} />
                    <button type="button" className="action-button" onClick={() => handleCapture(pagina, idx)}>📸 Tirar foto</button>
                    <button type="button" className="action-button secondary-button" style={{ marginLeft: 10 }} onClick={() => setShowWebcam(prev => ({ ...prev, [`${pagina}_${idx}`]: false }))}>Cancelar</button>
                  </div>
                ) : (
                  <button type="button" className="action-button" onClick={() => setShowWebcam(prev => ({ ...prev, [`${pagina}_${idx}`]: true }))}>📷 Adicionar Foto</button>
                )}
              </div>
            </div>
          ))}
        </form>

        <button type="button" onClick={handleEnviarRelatorio} className="action-button send-button">✔️ Enviar Relatório</button>

        {imgPreview && (
          <div onClick={() => setImgPreview(null)} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, cursor: "pointer" }}>
            <img src={imgPreview} alt="Foto ampliada" style={{ maxWidth: "95vw", maxHeight: "90vh", borderRadius: 12 }} />
          </div>
        )}
      </div>
    </div>
  );
}
