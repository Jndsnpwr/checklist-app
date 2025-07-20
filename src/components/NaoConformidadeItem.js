// src/components/NaoConformidadeItem.js
import React, { useState } from 'react';
import MediaPopup from './MediaPopup';

const grauCores = { Crítico: "#e74c3c", Médio: "#f39c12", Leve: "#27ae60" };

function NaoConformidadeItem({ nc }) {
  const [popupMedia, setPopupMedia] = useState({ url: null, type: null });
  return (
    <>
      <div style={{ background: "#fff6e4", borderRadius: 10, padding: 10, marginBottom: 10, borderLeft: `5px solid ${grauCores[nc.grau]}` }}>
        <div style={{ marginBottom: 4 }}><b>Descrição:</b> {nc.descricao}</div>
        <div><b>Grau:</b> <span style={{ color: grauCores[nc.grau], fontWeight: "bold" }}>{nc.grau}</span></div>
        <div><b>Data/Hora:</b> {nc.dataHora}</div>
        {nc.fotoUrl && <div><button type="button" style={{ background: 'none', border: 'none', color: '#957203', textDecoration: 'underline', cursor: 'pointer', padding: 0, marginTop: 2 }} onClick={() => setPopupMedia({ url: nc.fotoUrl, type: 'image' })}>Ver foto</button></div>}
        {nc.videoUrl && <div><button type="button" style={{ background: 'none', border: 'none', color: '#957203', textDecoration: 'underline', cursor: 'pointer', padding: 0, marginTop: 2 }} onClick={() => setPopupMedia({ url: nc.videoUrl, type: 'video' })}>Ver vídeo</button></div>}
      </div>
      <MediaPopup mediaUrl={popupMedia.url} mediaType={popupMedia.type} onClose={() => setPopupMedia({ url: null, type: null })} />
    </>
  );
}
export default NaoConformidadeItem;
