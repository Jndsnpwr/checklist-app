// src/components/Footer.js
import React from 'react';

function Footer({ visitaIniciada, visitaGeo, geoError }) {
  return (
    <footer style={{ background: "#faecd4", borderTop: "1px solid #dab45a", padding: "18px 12px", textAlign: "center", fontSize: 14, color: "#80632a", marginTop: "auto" }}>
      {visitaIniciada && (<div><b>Visita iniciada em:</b> {visitaIniciada.toLocaleString('pt-BR')}</div>)}
      {visitaGeo && (<div><b>Localização:</b> Lat: {visitaGeo.lat?.toFixed(5)}, Lon: {visitaGeo.lon?.toFixed(5)}</div>)}
      {geoError && (<div><span style={{ color: "#d17625" }}><b>{geoError}</b></span></div>)}
    </footer>
  );
}
export default Footer;
