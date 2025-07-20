// src/components/MediaPopup.js
import React from 'react';

function MediaPopup({ mediaUrl, mediaType, onClose }) {
  if (!mediaUrl) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, cursor: "pointer" }}>
      {mediaType === 'image' && (<img src={mediaUrl} alt="Mídia ampliada" style={{ maxWidth: "95vw", maxHeight: "90vh", borderRadius: 12 }} />)}
      {mediaType === 'video' && (<video src={mediaUrl} controls autoPlay style={{ maxWidth: "95vw", maxHeight: "90vh", borderRadius: 12, background: "#000" }} />)}
    </div>
  );
}

export default MediaPopup;
