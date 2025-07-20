// src/components/ChecklistNaoConformidades.js
import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";

// Importações do Firebase
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Estilos CSS (sem alteração)
const checklistStyleTag = `
  .checklist-background { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); min-height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #e0e0e0; }
  .checklist-container { max-width: 480px; margin: 0 auto; padding: 20px; box-sizing: border-box; }
  .checklist-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; }
  .checklist-header .title-block h2 { margin: 0; font-size: 18px; font-weight: 600; }
  .checklist-header .title-block p { margin: 0; font-size: 13px; color: #b0c4de; }
  .checklist-header .back-button { background: rgba(255, 255, 255, 0.1); border: none; color: #fff; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.3s ease; }
  .checklist-header .back-button:hover { background: rgba(255, 255, 255, 0.2); }
  .form-card, .list-card { background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(255, 255, 255, 0.1); }
  .form-card h3 { margin-top: 0; color: #e0e0e0; }
  .form-card p { color: #b0c4de; font-size: 14px; }
  .form-card textarea { width: 100%; background: #0d1117; border: 1px solid #30363d; color: #e0e0e0; border-radius: 8px; padding: 10px; font-size: 15px; resize: vertical; box-sizing: border-box; margin-bottom: 15px; }
  .action-button { background: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.3s ease; }
  .action-button:hover { background: #2980b9; }
  .secondary-button { background: rgba(255, 255, 255, 0.1); color: #e0e0e0; }
  .secondary-button:hover { background: rgba(255, 255, 255, 0.2); }
  .danger-button { background: rgba(255, 138, 128, 0.1); color: #ff8a80; }
  .danger-button:hover { background: rgba(255, 138, 128, 0.2); }
  .send-button { background: #27ae60; width: 100%; margin-top: 20px; }
  .send-button:hover { background: #2ecc71; }
  .media-preview-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
  .media-thumbnail { position: relative; }
  .media-thumbnail img, .media-thumbnail .video-placeholder { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #30363d; }
  .media-thumbnail .video-placeholder { display: flex; align-items: center; justify-content: center; font-size: 24px; background: #0d1117; }
  .delete-media-btn { position: absolute; top: -8px; right: -8px; background: #e74c3c; color: white; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
`;

export default function ChecklistNaoConformidades({ usuarioLogado, onVoltar }) {
  // Estados
  const [naoConformidades, setNaoConformidades] = useState([]);
  const [descricaoNC, setDescricaoNC] = useState("");
  const [fotosNC, setFotosNC] = useState([]);
  const [videosNC, setVideosNC] = useState([]);
  const [imgPreviewNC, setImgPreviewNC] = useState(null);
  const [videoPreviewNC, setVideoPreviewNC] = useState(null);
  const [showWebcamFoto, setShowWebcamFoto] = useState(false);
  const [showWebcamVideo, setShowWebcamVideo] = useState(false);
  const [erroNC, setErroNC] = useState("");
  const [enviando, setEnviando] = useState(false);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const [videoChunks, setVideoChunks] = useState([]);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = checklistStyleTag;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Funções de Foto (sem alteração)
  const handleTirarFoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setFotosNC(prev => [...prev, { url: imageSrc, name: `Foto ${prev.length + 1}` }]);
    }
    setShowWebcamFoto(false);
  };
  const handleExcluirFoto = (idx) => {
    setFotosNC(prev => prev.filter((_, i) => i !== idx));
  };

  // Funções de Vídeo (Lógica original restaurada e aprimorada)
  const startRecording = () => {
    if (webcamRef.current && webcamRef.current.stream) {
      setRecording(true);
      setRecordingTime(0);
      setVideoChunks([]); // Limpa chunks de gravações anteriores

      // Inicia o contador de tempo
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Usa a API nativa, como no seu código original
      mediaRecorderRef.current = new window.MediaRecorder(webcamRef.current.stream, {
        mimeType: 'video/webm'
      });

      // Ponto-chave 1: Coleta os "pedaços" do vídeo enquanto grava
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setVideoChunks((prev) => prev.concat(event.data));
        }
      };

      // Ponto-chave 2: Monta o vídeo QUANDO a gravação para
      mediaRecorderRef.current.onstop = () => {
        // Usa os chunks coletados para criar o vídeo final
        const blob = new Blob(videoChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideosNC(prev => [...prev, { url, blob, name: `Video_${Date.now()}.webm` }]);
        
        // Limpa tudo para a próxima gravação
        clearInterval(recordingIntervalRef.current);
        clearTimeout(recordingTimeoutRef.current);
        setRecording(false);
        setShowWebcamVideo(false);
        setVideoChunks([]); // Limpa os chunks após usar
      };

      mediaRecorderRef.current.start();

      // Limite de 30 segundos
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, 30000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleExcluirVideo = (idx) => {
    setVideosNC(prev => prev.filter((_, i) => i !== idx));
  };

  // Funções de Adicionar e Enviar (sem alteração)
  const handleAddNC = () => {
    setErroNC("");
    if (!descricaoNC.trim()) return setErroNC("A descrição é obrigatória.");
    if (fotosNC.length === 0 && videosNC.length === 0) return setErroNC("Adicione pelo menos uma foto ou vídeo.");
    setNaoConformidades(prev => [...prev, { descricao: descricaoNC, fotos: fotosNC, videos: videosNC }]);
    setDescricaoNC("");
    setFotosNC([]);
    setVideosNC([]);
  };
  const handleExcluirNC = (idx) => {
    setNaoConformidades(prev => prev.filter((_, i) => i !== idx));
  };
  const handleEnviarRegistros = async () => {
    if (naoConformidades.length === 0) return alert("Adicione pelo menos uma não conformidade.");
    if (!window.confirm(`Deseja enviar ${naoConformidades.length} registro(s)?`)) return;
    setEnviando(true);
    setErroNC("");
    const storage = getStorage();
    try {
      const registrosProcessados = [];
      for (const nc of naoConformidades) {
        const timestamp = new Date().getTime();
        const urlsFotos = [];
        for (let i = 0; i < nc.fotos.length; i++) {
          const fotoRef = ref(storage, `nao-conformidades/${usuarioLogado.id}/${timestamp}_foto_${i}.jpg`);
          await uploadString(fotoRef, nc.fotos[i].url, 'data_url');
          urlsFotos.push(await getDownloadURL(fotoRef));
        }
        const urlsVideos = [];
        for (let i = 0; i < nc.videos.length; i++) {
          const videoRef = ref(storage, `nao-conformidades/${usuarioLogado.id}/${timestamp}_video_${i}.webm`);
          await uploadBytes(videoRef, nc.videos[i].blob);
          urlsVideos.push(await getDownloadURL(videoRef));
        }
        registrosProcessados.push({ descricao: nc.descricao, fotos: urlsFotos, videos: urlsVideos });
      }
      await addDoc(collection(db, "relatoriosNaoConformidade"), {
        supervisorId: usuarioLogado.id,
        supervisorNome: usuarioLogado.nome,
        data: serverTimestamp(),
        registros: registrosProcessados,
      });
      alert("Registros enviados com sucesso!");
      setNaoConformidades([]);
      onVoltar();
    } catch (error) {
      console.error("Erro ao enviar:", error);
      setErroNC("Ocorreu um erro ao enviar os registros.");
    } finally {
      setEnviando(false);
    }
  };

  // JSX (sem alteração)
  return (
    <div className="checklist-background">
      <div className="checklist-container">
        {enviando && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, color: 'white', flexDirection: 'column' }}>
            <h2>Enviando Registros...</h2>
            <p>Por favor, aguarde.</p>
          </div>
        )}
        <header className="checklist-header">
          <div className="title-block">
            <h2>Não Conformidades</h2>
            <p>Supervisor: {usuarioLogado.nome}</p>
          </div>
          <button onClick={onVoltar} className="back-button">Voltar</button>
        </header>

        <div className="form-card">
          <h3>⚠️ Registrar Nova Ocorrência</h3>
          <p>Descreva o problema e anexe mídias (fotos e/ou vídeos de até 30s).</p>
          <textarea placeholder="Descreva a não conformidade..." value={descricaoNC} onChange={e => setDescricaoNC(e.target.value)} rows={4} />
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button type="button" className="action-button" onClick={() => setShowWebcamFoto(true)}>📷 Tirar Foto</button>
            <button type="button" className="action-button" onClick={() => setShowWebcamVideo(true)}>📹 Gravar Vídeo</button>
          </div>

          {showWebcamFoto && (
            <div className="form-card">
              <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: "100%", borderRadius: 10, marginBottom: 10 }} videoConstraints={{ facingMode: "environment" }} playsInline={true} />
              <button type="button" className="action-button" onClick={handleTirarFoto}>Capturar</button>
              <button type="button" className="action-button secondary-button" style={{ marginLeft: 10 }} onClick={() => setShowWebcamFoto(false)}>Cancelar</button>
            </div>
          )}
          {showWebcamVideo && (
            <div className="form-card">
              <Webcam audio={true} ref={webcamRef} videoConstraints={{ facingMode: "environment" }} style={{ width: "100%", borderRadius: 10, marginBottom: 10 }} playsInline={true} />
              {!recording ? (
                <button type="button" className="action-button" onClick={startRecording}>Iniciar Gravação</button>
              ) : (
                <button type="button" className="action-button danger-button" onClick={stopRecording}>
                  Parar Gravação ({recordingTime}s / 30s)
                </button>
              )}
              <button type="button" className="action-button secondary-button" style={{ marginLeft: 10 }} onClick={() => { setShowWebcamVideo(false); stopRecording(); }}>Cancelar</button>
            </div>
          )}

          <div className="media-preview-grid">
            {fotosNC.map((foto, idx) => (
              <div key={`foto-${idx}`} className="media-thumbnail">
                <img src={foto.url} alt={foto.name} onClick={() => setImgPreviewNC(foto.url)} style={{cursor: 'pointer'}} />
                <button onClick={() => handleExcluirFoto(idx)} className="delete-media-btn">×</button>
              </div>
            ))}
            {videosNC.map((video, idx) => (
              <div key={`video-${idx}`} className="media-thumbnail">
                <div className="video-placeholder" onClick={() => setVideoPreviewNC(video.url)} style={{cursor: 'pointer'}}>📹</div>
                <button onClick={() => handleExcluirVideo(idx)} className="delete-media-btn">×</button>
              </div>
            ))}
          </div>
          
          {erroNC && <p style={{ color: '#ff8a80', marginTop: '15px' }}>{erroNC}</p>}
          <button type="button" className="action-button" style={{ width: '100%', marginTop: '20px' }} onClick={handleAddNC}>Adicionar à Lista</button>
        </div>

        {naoConformidades.length > 0 && (
          <div className="list-card">
            <h3>Registros a Enviar ({naoConformidades.length})</h3>
            {naoConformidades.map((nc, idx) => (
              <div key={idx} style={{ padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{margin: '0 0 10px 0'}}>{nc.descricao}</p>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontSize: 12, color: '#b0c4de'}}>{nc.fotos.length} foto(s), {nc.videos.length} vídeo(s)</span>
                  <button onClick={() => handleExcluirNC(idx)} className="action-button danger-button">Excluir</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={handleEnviarRegistros} className="action-button send-button">✔️ Enviar Todos os Registros</button>
          </div>
        )}

        {imgPreviewNC && (<div onClick={() => setImgPreviewNC(null)} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, cursor: "pointer" }}><img src={imgPreviewNC} alt="Foto ampliada" style={{ maxWidth: "95vw", maxHeight: "90vh", borderRadius: 12 }} /></div>)}
        {videoPreviewNC && (<div onClick={() => setVideoPreviewNC(null)} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, cursor: "pointer" }}><video src={videoPreviewNC} controls autoPlay style={{ maxWidth: "95vw", maxHeight: "90vh", borderRadius: 12 }} /></div>)}
      </div>
    </div>
  );
}
