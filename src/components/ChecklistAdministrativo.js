// src/components/ChecklistAdministrativo.js
import React, { useState } from "react";
import Webcam from "react-webcam";

const PAGINAS = [
  {
    titulo: "Conferências Administrativas",
    itens: [
      "Conferência de frente de caixa",
      "Conferência de saldo do cofre",
    ]
  }
];

export default function ChecklistAdministrativo({ usuarioLogado, onVoltar }) {
  const [pagina, setPagina] = useState(0);
  const [fotos, setFotos] = useState({});
  const [showWebcam, setShowWebcam] = useState({});
  const [imgPreview, setImgPreview] = useState(null);
  const [editingComment, setEditingComment] = useState({});
  const [commentDraft, setCommentDraft] = useState("");
  const webcamRef = React.useRef(null);

  const handleCapture = (page, idx) => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFotos((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        [idx]: [...(prev[page]?.[idx] || []), { foto: imageSrc, comentario: "" }]
      }
    }));
    setShowWebcam((prev) => ({ ...prev, [`${page}_${idx}`]: false }));
  };

  const handleRemoverFoto = (page, idx, fotoIdx) => {
    setFotos((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        [idx]: prev[page][idx].filter((_, i) => i !== fotoIdx)
      }
    }));
  };

  const handleEditarComentario = (page, idx, fotoIdx) => {
    setEditingComment({ page, idx, fotoIdx });
    setCommentDraft(fotos[page][idx][fotoIdx].comentario || "");
  };

  const handleSalvarComentario = () => {
    const { page, idx, fotoIdx } = editingComment;
    setFotos((prev) => {
      const updatedFotos = [...prev[page][idx]];
      updatedFotos[fotoIdx] = {
        ...updatedFotos[fotoIdx],
        comentario: commentDraft
      };
      return {
        ...prev,
        [page]: {
          ...prev[page],
          [idx]: updatedFotos
        }
      };
    });
    setEditingComment({});
    setCommentDraft("");
  };

  return (
    <div style={{
      background: "#f8f8f8",
      minHeight: "100vh",
      padding: 0,
      fontFamily: "Arial, sans-serif",
      maxWidth: 480,
      margin: "0 auto",
      borderRadius: 10,
      boxShadow: "0 2px 10px #eee"
    }}>
      <header style={{
        background: "#add8e6",
        padding: "18px 10px 12px 10px",
        borderRadius: "0 0 20px 20px",
        textAlign: "center"
      }}>
        <h2 style={{ margin: 0, color: "#245c6e" }}>Checklist Administrativo</h2>
        <span style={{ color: "#376985", fontSize: 16 }}>
          Supervisor: <b>{usuarioLogado}</b>
        </span>
        <button
          onClick={onVoltar}
          style={{
            float: "right",
            background: "#4c9ba9",
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

      <div style={{
        background: "#e7f7fb",
        padding: "12px 10px",
        fontWeight: "bold",
        fontSize: 18,
        marginTop: 10,
        borderRadius: 8,
        margin: "16px 10px 0 10px",
        color: "#245c6e",
        textAlign: "center"
      }}>
        {PAGINAS[pagina].titulo}
      </div>

      <form style={{ margin: "12px 10px" }} onSubmit={e => e.preventDefault()}>
        {PAGINAS[pagina].itens.map((item, idx) => (
          <div key={idx}
            style={{
              marginBottom: 22,
              background: "#fff",
              borderRadius: 8,
              padding: 10,
              boxShadow: "0 1px 6px #d6ecf3"
            }}>
            <div style={{ fontWeight: "bold", color: "#245c6e", marginBottom: 6 }}>
              {item}
            </div>
            {(fotos[pagina]?.[idx] || []).length > 0 && (
              <div style={{ marginBottom: 8 }}>
                {fotos[pagina][idx].map((f, fotoIdx) => (
                  <div key={fotoIdx} style={{ marginBottom: 6 }}>
                    <button type="button"
                      style={{
                        border: "none",
                        background: "none",
                        color: "#0366d6",
                        textDecoration: "underline",
                        fontSize: 15,
                        cursor: "pointer",
                        marginRight: 14
                      }}
                      onClick={() => setImgPreview(f.foto)}>
                      Ver foto {fotoIdx + 1}
                    </button>
                    <button type="button"
                      style={{
                        background: "#e6f7fa",
                        border: "1px solid #add8e6",
                        color: "#245c6e",
                        borderRadius: 5,
                        fontSize: 13,
                        padding: "3px 10px",
                        cursor: "pointer"
                      }}
                      onClick={() => handleRemoverFoto(pagina, idx, fotoIdx)}>
                      Excluir foto
                    </button>
                    <div style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 14, color: "#245c6e" }}>
                        {f.comentario
                          ? <><b>Comentário:</b> {f.comentario}</>
                          : <i>Sem comentário</i>}
                      </span>
                      <button type="button"
                        style={{
                          marginLeft: 12,
                          background: "#f0f8ff",
                          color: "#245c6e",
                          border: "1px solid #add8e6",
                          padding: "2px 12px",
                          borderRadius: 7,
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: 13
                        }}
                        onClick={() => handleEditarComentario(pagina, idx, fotoIdx)}>
                        {f.comentario ? "Editar" : "Adicionar"} comentário
                      </button>
                    </div>
                    {editingComment.page === pagina && editingComment.idx === idx && editingComment.fotoIdx === fotoIdx && (
                      <div style={{ marginTop: 6 }}>
                        <textarea
                          rows={2}
                          style={{
                            width: "100%",
                            borderRadius: 5,
                            border: "1px solid #add8e6",
                            padding: 7,
                            fontSize: 15,
                            resize: "vertical"
                          }}
                          placeholder="Digite o comentário..."
                          value={commentDraft}
                          onChange={e => setCommentDraft(e.target.value)}
                        />
                        <button
                          type="button"
                          style={{
                            background: "#f0f8ff",
                            color: "#245c6e",
                            border: "1px solid #add8e6",
                            padding: "5px 15px",
                            borderRadius: 7,
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: 13,
                            marginTop: 4,
                            marginRight: 6
                          }}
                          onClick={handleSalvarComentario}
                        >
                          Salvar comentário
                        </button>
                        <button
                          type="button"
                          style={{
                            background: "#fff",
                            color: "#245c6e",
                            border: "1px solid #ccc",
                            padding: "5px 12px",
                            borderRadius: 7,
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: 13,
                            marginTop: 4,
                          }}
                          onClick={() => setEditingComment({})}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showWebcam[`${pagina}_${idx}`] ? (
              <div style={{ marginBottom: 8 }}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  style={{ width: "100%", maxWidth: 320, borderRadius: 10, marginBottom: 6 }}
                  videoConstraints={{
                    facingMode: "environment"
                  }}
                />
                <button type="button"
                  style={{
                    background: "#4c9ba9",
                    color: "#fff",
                    border: "none",
                    padding: "8px 15px",
                    borderRadius: 7,
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: 14,
                    marginRight: 12
                  }}
                  onClick={() => handleCapture(pagina, idx)}>
                  Tirar foto
                </button>
                <button type="button"
                  style={{
                    background: "#f0f8ff",
                    color: "#245c6e",
                    border: "1px solid #add8e6",
                    padding: "7px 12px",
                    borderRadius: 7,
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: 14
                  }}
                  onClick={() => setShowWebcam(prev => ({ ...prev, [`${pagina}_${idx}`]: false }))}>
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                style={{
                  background: "#4c9ba9",
                  color: "#fff",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: 7,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: 15,
                  marginBottom: 8
                }}
                onClick={() => setShowWebcam(prev => ({ ...prev, [`${pagina}_${idx}`]: true }))}>
                Tirar foto
              </button>
            )}
          </div>
        ))}
      </form>
      {imgPreview && (
        <div
          onClick={() => setImgPreview(null)}
          style={{
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 1000,
            cursor: "pointer"
          }}>
          <img
            src={imgPreview}
            alt="Foto ampliada"
            style={{
              maxWidth: "95vw",
              maxHeight: "90vh",
              borderRadius: 12,
              boxShadow: "0 2px 12px #222"
            }}
          />
        </div>
      )}
    </div>
  );
}
