import React, { useState, useRef } from "react";
import Webcam from "react-webcam";

export default function ChecklistNaoConformidades({ usuarioLogado, onVoltar }) {
  const [naoConformidades, setNaoConformidades] = useState([]);
  const [descricaoNC, setDescricaoNC] = useState("");
  const [fotosNC, setFotosNC] = useState([]);
  const [videoNC, setVideoNC] = useState(null);
  const [imgPreviewNC, setImgPreviewNC] = useState(null);
  const [videoPreviewNC, setVideoPreviewNC] = useState(null);
  const [showWebcamFoto, setShowWebcamFoto] = useState(false);
  const [showWebcamVideo, setShowWebcamVideo] = useState(false);
  const [erroNC, setErroNC] = useState("");
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [videoChunks, setVideoChunks] = useState([]);

  // Tirar foto da webcam
  function handleTirarFoto() {
    const imageSrc = webcamRef.current.getScreenshot();
    setFotosNC(prev => [...prev, { url: imageSrc, name: `Foto ${prev.length + 1}` }]);
    setShowWebcamFoto(false);
  }

  function handleExcluirFoto(idx) {
    setFotosNC(prev => prev.filter((_, i) => i !== idx));
  }

  // Gravar vídeo (webcam)
  function startRecording() {
    setVideoChunks([]);
    setRecording(true);
    mediaRecorderRef.current = new window.MediaRecorder(webcamRef.current.stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) setVideoChunks((prev) => prev.concat(event.data));
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(videoChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoNC({ url, name: `Video_${Date.now()}` });
      setShowWebcamVideo(false);
      setRecording(false);
      setVideoChunks([]);
    };
    mediaRecorderRef.current.start();
  }

  function stopRecording() {
    mediaRecorderRef.current.stop();
    setRecording(false);
  }

  function handleExcluirVideo() {
    setVideoNC(null);
  }

  // Adicionar não conformidade
  function handleAddNC() {
    setErroNC("");
    if (!descricaoNC.trim()) {
      setErroNC("Descrição obrigatória.");
      return;
    }
    if (fotosNC.length === 0 && !videoNC) {
      setErroNC("Adicione pelo menos uma foto ou vídeo.");
      return;
    }
    setNaoConformidades((prev) => [
      ...prev,
      {
        descricao: descricaoNC,
        fotos: fotosNC,
        video: videoNC,
      },
    ]);
    setDescricaoNC("");
    setFotosNC([]);
    setVideoNC(null);
  }
  function handleExcluirNC(idx) {
    setNaoConformidades(prev => prev.filter((_, i) => i !== idx));
  }

  return (
    <div style={{
      background: "#fffbe6",
      minHeight: "100vh",
      padding: 0,
      fontFamily: "Arial, sans-serif",
      maxWidth: 480,
      margin: "0 auto",
      borderRadius: 10,
      boxShadow: "0 2px 10px #ffeebb"
    }}>
      <header style={{
        background: "#ffdf7a",
        padding: "18px 10px 12px 10px",
        borderRadius: "0 0 20px 20px",
        textAlign: "center"
      }}>
        <h2 style={{ margin: 0, color: "#be7b00" }}>Não Conformidades</h2>
        <span style={{ color: "#987400", fontSize: 16 }}>
          Supervisor: <b>{usuarioLogado.usuario || usuarioLogado}</b>
        </span>
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
      <div style={{
        margin: "28px 10px",
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 7px #eed08a20",
        padding: 14,
      }}>
        <h3 style={{ color: "#be7b00", marginTop: 0 }}>Registrar nova não conformidade</h3>
        <div style={{ fontSize: 15, color: "#987400", marginBottom: 10 }}>
          Relate tudo que está fora do padrão. Adicione descrição e, se possível, fotos e vídeo.
        </div>
        <textarea
          placeholder="Descreva a não conformidade (obrigatório)"
          value={descricaoNC}
          onChange={e => setDescricaoNC(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            padding: 7,
            borderRadius: 8,
            border: "1px solid #f6c96a",
            marginBottom: 10,
            fontSize: 15
          }}
        />
        {/* FOTOS */}
        <div style={{ marginBottom: 12 }}>
          {showWebcamFoto ? (
            <div>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ width: "100%", maxWidth: 320, borderRadius: 10, marginBottom: 8 }}
                videoConstraints={{
                  facingMode: "environment"
                }}
              />
              <button
                type="button"
                style={{
                  background: "#dab45a",
                  color: "#fff",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: 7,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: 15,
                  marginBottom: 8
                }}
                onClick={handleTirarFoto}>
                Tirar foto
              </button>
              <button
                type="button"
                style={{
                  background: "#fffbe6",
                  color: "#be7b00",
                  border: "1px solid #e7d08a",
                  padding: "7px 12px",
                  borderRadius: 7,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: 14,
                  marginLeft: 10
                }}
                onClick={() => setShowWebcamFoto(false)}>
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              style={{
                background: "#dab45a",
                color: "#fff",
                border: "none",
                padding: "8px 18px",
                borderRadius: 7,
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: 15,
                marginBottom: 8
              }}
              onClick={() => setShowWebcamFoto(true)}>
              Tirar foto
            </button>
          )}
        </div>
        {/* Lista de fotos adicionadas */}
        {fotosNC.length > 0 && (
          <div style={{ marginBottom: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {fotosNC.map((foto, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setImgPreviewNC(foto.url)}
                  style={{ border: "none", background: "none", cursor: "pointer" }}
                >
                  <img
                    src={foto.url}
                    alt={foto.name}
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #ebc970" }}
                  />
                </button>
                <button
                  onClick={() => handleExcluirFoto(idx)}
                  style={{
                    position: "absolute", top: -6, right: -6, background: "#e74c3c",
                    color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 13, cursor: "pointer"
                  }}
                >×</button>
              </div>
            ))}
          </div>
        )}
        {/* VÍDEO */}
        <div style={{ marginBottom: 12 }}>
          {showWebcamVideo ? (
            <div>
              <Webcam
                audio={true}
                ref={webcamRef}
                videoConstraints={{ facingMode: "environment" }}
                style={{ width: "100%", maxWidth: 320, borderRadius: 10, marginBottom: 8 }}
              />
              {!recording ? (
                <button
                  type="button"
                  style={{
                    background: "#dab45a",
                    color: "#fff",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: 7,
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: 15,
                    marginBottom: 8
                  }}
                  onClick={startRecording}>
                  Iniciar gravação
                </button>
              ) : (
                <button
                  type="button"
                  style={{
                    background: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: 7,
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: 15,
                    marginBottom: 8
                  }}
                  onClick={stopRecording}>
                  Parar gravação
                </button>
              )}
              <button
                type="button"
                style={{
                  background: "#fffbe6",
                  color: "#be7b00",
                  border: "1px solid #e7d08a",
                  padding: "7px 12px",
                  borderRadius: 7,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: 14,
                  marginLeft: 10
                }}
                onClick={() => { setShowWebcamVideo(false); setRecording(false); }}>
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              style={{
                background: "#dab45a",
                color: "#fff",
                border: "none",
                padding: "8px 18px",
                borderRadius: 7,
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: 15,
                marginBottom: 8
              }}
              onClick={() => setShowWebcamVideo(true)}>
              Gravar vídeo
            </button>
          )}
        </div>
        {/* Vídeo adicionado */}
        {videoNC && (
          <div style={{ marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => setVideoPreviewNC(videoNC.url)}
              style={{ border: "none", background: "none", color: "#af8700", textDecoration: "underline", cursor: "pointer" }}
            >
              Ver vídeo anexado
            </button>
            <button
              onClick={handleExcluirVideo}
              style={{
                marginLeft: 8, background: "#e74c3c",
                color: "#fff", border: "none", borderRadius: 6, padding: "2px 12px", fontSize: 13, cursor: "pointer"
              }}
            >Excluir vídeo</button>
          </div>
        )}
        {erroNC && <div style={{ color: "#e74c3c", fontSize: 14 }}>{erroNC}</div>}
        <button
          type="button"
          style={{
            background: "#dab45a",
            color: "#fff",
            border: "none",
            padding: "10px 24px",
            borderRadius: 7,
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 16,
            marginTop: 10
          }}
          onClick={handleAddNC}
        >
          Adicionar Não Conformidade
        </button>
      </div>
      {/* Lista de não conformidades */}
      {naoConformidades.length > 0 && (
        <div style={{ margin: "22px 10px" }}>
          <h4 style={{ color: "#b87c00", fontSize: 15 }}>Listagem de Não Conformidades</h4>
          {naoConformidades.map((nc, idx) => (
            <div key={idx} style={{
              margin: "12px 0",
              background: "#fffbe6",
              borderRadius: 7,
              padding: 10,
              boxShadow: "0 1px 3px #e9d59540",
              borderLeft: "5px solid #dab45a"
            }}>
              <b>Descrição:</b> {nc.descricao}<br />
              {nc.fotos.length > 0 && (
                <div style={{ margin: "8px 0" }}>
                  Fotos:{" "}
                  {nc.fotos.map((foto, fidx) => (
                    <button
                      key={fidx}
                      onClick={() => setImgPreviewNC(foto.url)}
                      style={{
                        border: "none", background: "none", cursor: "pointer", marginRight: 6
                      }}
                    >
                      <img src={foto.url} alt="" style={{ width: 40, height: 40, borderRadius: 5, border: "1px solid #e3bc64" }} />
                    </button>
                  ))}
                </div>
              )}
              {nc.video && (
                <div>
                  <button
                    onClick={() => setVideoPreviewNC(nc.video.url)}
                    style={{
                      border: "none", background: "none", color: "#a67403", textDecoration: "underline", cursor: "pointer"
                    }}
                  >
                    Ver vídeo
                  </button>
                </div>
              )}
              <button
                onClick={() => handleExcluirNC(idx)}
                style={{
                  marginTop: 6, background: "#e74c3c",
                  color: "#fff", border: "none", borderRadius: 6, padding: "3px 16px", fontSize: 13, cursor: "pointer"
                }}
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Popup imagem */}
      {imgPreviewNC && (
        <div
          onClick={() => setImgPreviewNC(null)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.7)", display: "flex",
            justifyContent: "center", alignItems: "center", zIndex: 2000, cursor: "pointer"
          }}>
          <img
            src={imgPreviewNC}
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
      {/* Popup vídeo */}
      {videoPreviewNC && (
        <div
          onClick={() => setVideoPreviewNC(null)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.7)", display: "flex",
            justifyContent: "center", alignItems: "center", zIndex: 2000, cursor: "pointer"
          }}>
          <video
            src={videoPreviewNC}
            controls
            autoPlay
            style={{
              maxWidth: "95vw",
              maxHeight: "90vh",
              borderRadius: 12,
              boxShadow: "0 2px 12px #222",
              background: "#222",
            }}
          />
        </div>
      )}
    </div>
  );
}
