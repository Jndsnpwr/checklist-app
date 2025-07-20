// src/components/ChecklistItem.js
import React, { useState, useRef } from 'react';
import MediaPopup from './MediaPopup';

function ChecklistItem({ itemKey, label, itemFotos, setFotos, onMediaCapture }) {
  const [popupMedia, setPopupMedia] = useState({ url: null, type: null });
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onMediaCapture();
    const fileURL = URL.createObjectURL(file);
    const fileData = { url: fileURL, nome: file.name, dataHora: new Date().toLocaleString('pt-BR') };
    setFotos((prevFotos) => ({ ...prevFotos, [itemKey]: [...prevFotos[itemKey], fileData] }));
    if (fileInputRef.current) { fileInputRef.current.value = ""; }
  };
  const handleExcluir = (idxToDelete) => {
    setFotos((prevFotos) => ({ ...prevFotos, [itemKey]: prevFotos[itemKey].filter((_, i) => i !== idxToDelete) }));
  };
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontWeight: 'bold', color: '#624710' }}>{label}:</label>
      <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'block', margin: '8px 0' }} />
      <div style={{ fontSize: 14, color: '#7d6836' }}>
        {itemFotos.map((foto, idx) => (
          <div key={idx} style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📷</span>
            <button type="button" style={{ background: 'none', border: 'none', color: '#957203', textDecoration: 'underline', cursor: 'pointer', padding: 0 }} onClick={() => setPopupMedia({ url: foto.url, type: 'image' })}>Ver foto {idx + 1}</button>
            <span>— {foto.dataHora}</span>
            <button type="button" style={{ background: '#fef0e2', border: '1px solid #dab45a', color: '#ad4100', marginLeft: 8, borderRadius: 6, fontSize: 13, padding: '2px 7px', cursor: 'pointer' }} onClick={() => handleExcluir(idx)}>Excluir</button>
          </div>
        ))}
      </div>
      <MediaPopup mediaUrl={popupMedia.url} mediaType={popupMedia.type} onClose={() => setPopupMedia({ url: null, type: null })} />
    </div>
  );
}
export default ChecklistItem;
