// src/components/Checklist.js
import React, { useState } from "react";
import Webcam from "react-webcam";

function Checklist({ usuarioLogado, onLogout }) {
  // Apenas um item de exemplo
  const [fotos, setFotos] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [popupImg, setPopupImg] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const webcamRef = React.useRef(null);

  // Captura a foto da webcam
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFotos((prev) => [...prev, imageSrc]);
    setComentarios((prev) => [...prev, ""]);
    setShowCamera(false);
  };

  // Excluir foto
  const handleExcluirFoto = (idx) => {
    setFotos((prev) => prev.filter((_, i) => i !== idx));
    setComentarios((prev) => prev.filter((_, i) => i !== idx));
  };

  // Editar comentário
  const handleComentarioChange = (idx, valor) => {
    setComentarios((prev) => prev.map((c, i) => (i === idx ? valor : c)));
  };

  return (
    <div style={{ maxWidth: 600, margin: "32px auto", padding: 24, background: "#fff8ec", borderRadius: 14, boxShadow: "0 1px 8px #e1cfa980" }}>
      <h2>Checklist Operacional – Com Webcam</h2>
      <p>Bem-vindo, <b>{usuarioLogado}</b>!</p>
      <button onClick={onLogout} style={{ marginBottom: 24 }}>Sair</button>
      
      <div style={{ marginBottom: 28, background: "#fff5e3", padding: 16, borderRadius: 10 }}>
        <strong>Acessos de entrada e saída do posto</strong>
        <div style={{ margin: "10px 0" }}>
          <button
            onClick={() => setShowCamera(true)}
            style={{ padding: "7px 16px", background: "#dab45a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
            type="button"
          >
            Tirar Foto
          </button>
        </div>
        {showCamera && (
          <div style={{ margin: "10px 0", textAlign: "center" }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={320}
              height={240}
              videoConstraints={{
                facingMode: "environment"
              }}
            />
            <div>
              <button onClick={capture} style={{ margin: 10, background: "#65b532", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer" }}>
                Capturar Foto
              </button>
              <button onClick={() => setShowCamera(false)} style={{ background: "#aaa", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div>
          {fotos.length === 0 && (
            <span style={{ color: "#b7853a" }}>Nenhuma foto tirada ainda.</span>
          )}
          {fotos.map((url, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <button
                onClick={() => setPopupImg(url)}
                style={{ border: "none", background: "none", color: "#965c0d", textDecoration: "underline", marginRight: 10, cursor: "pointer" }}
                type="button"
              >
                Ver foto {idx + 1}
              </button>
              <input
                type="text"
                placeholder="Comentário..."
                value={comentarios[idx]}
                onChange={(e) => handleComentarioChange(idx, e.target.value)}
                style={{ marginRight: 10, borderRadius: 6, border: "1px solid #dab45a", padding: "3px 9px" }}
              />
              <button
                onClick={() => handleExcluirFoto(idx)}
                style={{ background: "#eee3d2", color: "#d3342f", border: "1px solid #dab45a", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}
                type="button"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal da foto */}
      {popupImg && (
        <div
          onClick={() => setPopupImg(null)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
          }}>
          <img src={popupImg} alt="Foto ampliada" style={{ maxHeight: "80vh", borderRadius: 10, boxShadow: "0 1px 16px #222" }} />
        </div>
      )}
    </div>
  );
}

export default Checklist;
