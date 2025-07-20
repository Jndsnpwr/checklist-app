// src/components/NaoConformidadeForm.js
import React, { useState, useRef } from 'react';
import MediaPopup from './MediaPopup';

const initialState = { descricao: "", grau: "Crítico", foto: null, fotoUrl: null, video: null, videoUrl: null };

function NaoConformidadeForm({ onAdd }) {
  const [novaNC, setNovaNC] = useState(initialState);
  const [erro, setErro] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popupMedia, setPopupMedia] = useState({ url: null, type: null });
  const fotoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'foto') { setNovaNC(prev => ({ ...prev, foto: file, fotoUrl: url })); }
    else { setNovaNC(prev => ({ ...prev, video: file, videoUrl: url })); }
  };

  const handleAdicionar = async () => {
    if (!novaNC.descricao.trim()) { setErro("A descrição é obrigatória."); return; }
    if (!novaNC.foto) { setErro("A foto é obrigatória."); return; }
    if (!novaNC.video) { setErro("O vídeo é obrigatório."); return; }
    setErro("");
    setIsSubmitting(true);
    await onAdd(novaNC);
    setNovaNC(initialState);
    if (fotoInputRef.current) fotoInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    setIsSubmitting(false);
  };

  return (
    <div style={{ marginTop: 36, marginBottom: 12 }}>
      <h3 style={{ color: "#4B2E05", margin: "12px 0 6px 0" }}>Registrar Não Conformidade</h3>
      <div style={{ background: "#fce9c8", borderRadius: 10, padding: 12, boxShadow: "0 1px 3px #d5c8ad40" }}>
        <label style={{ fontWeight: "bold", color: "#624710" }}>Descrição:</label>
        <textarea value={novaNC.descricao} onChange={(e) => setNovaNC(p => ({ ...p, descricao: e.target.value }))} rows={2} style={{ width: "100%", boxSizing: 'border-box', padding: 5, borderRadius: 5, margin: "6px 0", border: "1px solid #dab45a", fontSize: 15, resize: "vertical" }} placeholder="Descreva a não conformidade..." />
        <div style={{ margin: "8px 0 6px 0" }}>
          <label style={{ fontWeight: "bold", color: "#624710" }}>Grau:</label>
          <select value={novaNC.grau} onChange={(e) => setNovaNC(p => ({ ...p, grau: e.target.value }))} style={{ marginLeft: 10, padding: "3px 10px", borderRadius: 6, border: "1px solid #dab45a", fontSize: 15 }}>
            <option>Crítico</option><option>Médio</option><option>Leve</option>
          </select>
        </div>
        <div style={{ margin: "8px 0" }}>
          <label style={{ fontWeight: "bold", color: "#624710" }}>Foto <span style={{ color: "#e74c3c" }}>*</span>:</label>
          <input type="file" accept="image/*" capture="environment" ref={fotoInputRef} onChange={(e) => handleFileChange(e, 'foto')} style={{ display: "block", margin: "8px 0" }} />
          {novaNC.fotoUrl && <button type="button" style={{ background: "none", border: "none", color: "#957203", textDecoration: "underline", cursor: "pointer", padding: 0 }} onClick={() => setPopupMedia({ url: novaNC.fotoUrl, type: 'image' })}>Ver foto</button>}
        </div>
        <div style={{ margin: "8px 0" }}>
          <label style={{ fontWeight: "bold", color: "#624710" }}>Vídeo <span style={{ color: "#e74c3c" }}>*</span>:</label>
          <input type="file" accept="video/*" capture="environment" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} style={{ display: "block", margin: "8px 0" }} />
          {novaNC.videoUrl && <button type="button" style={{ background: "none", border: "none", color: "#957203", textDecoration: "underline", cursor: "pointer", padding: 0 }} onClick={() => setPopupMedia({ url: novaNC.videoUrl, type: 'video' })}>Ver vídeo</button>}
        </div>
        {erro && <div style={{ color: "#e74c3c", marginBottom: 8, fontWeight: 'bold' }}>{erro}</div>}
        <button type="button" onClick={handleAdicionar} disabled={isSubmitting} style={{ background: "#dab45a", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 7, fontWeight: "bold", cursor: "pointer", marginTop: 10, fontSize: 15, opacity: isSubmitting ? 0.6 : 1 }}>
          {isSubmitting ? 'Adicionando...' : 'Adicionar Não Conformidade'}
        </button>
      </div>
      <MediaPopup mediaUrl={popupMedia.url} mediaType={popupMedia.type} onClose={() => setPopupMedia({ url: null, type: null })} />
    </div>
  );
}
export default NaoConformidadeForm;
