// src/services/emailService.js
import emailjs from '@emailjs/browser';
import { emailJsConfig } from '../config';

export const enviarEmailNaoConformidadeCritica = (nc, visitaGeo) => {
  const templateParams = {
    descricao: nc.descricao,
    grau: nc.grau,
    dataHora: nc.dataHora,
    lat: visitaGeo?.lat ? visitaGeo.lat.toFixed(5) : "Não obtida",
    lon: visitaGeo?.lon ? visitaGeo.lon.toFixed(5) : "Não obtida",
    fotoUrl: nc.fotoUrl,
    videoUrl: nc.videoUrl,
    emailDestino: "jandson@redesaoroque.com.br"
  };
  return emailjs.send(
    emailJsConfig.serviceId,
    emailJsConfig.templateId,
    templateParams,
    emailJsConfig.publicKey
  );
};
