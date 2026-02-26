import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import '../../styles/WhatsAppPopup.css';

const WhatsAppPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Si la usuaria ya lo cerró o ya hizo clic antes, no lo mostramos de nuevo
    const dismissed = localStorage.getItem('naama_wa_popup_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Mostramos el popup después de 6 segundos de que la usuaria esté en la página
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('naama_wa_popup_dismissed', 'true');
  };

  const handleSubscribe = () => {
    // Redirige a WhatsApp con un mensaje predefinido para unirse a la lista VIP
    window.open('https://wa.me/56979520623?text=Hola! Quiero unirme a la lista VIP de Naamá Studio para recibir promociones y novedades. 💖', '_blank');
    handleDismiss(); // Lo cerramos para que no moleste más
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="wa_popup_overlay">
      <div className="wa_popup_card">
        <button className="wa_popup_close" onClick={handleDismiss} aria-label="Cerrar">
          <X size={18} strokeWidth={2} />
        </button>
        
        <div className="wa_popup_header">
          <div className="wa_popup_icon">
            <Bell size={24} strokeWidth={1.5} />
            <div className="pulse_ring"></div>
          </div>
          <h3 className="serif">Lista VIP Naamá</h3>
        </div>
        
        <p className="wa_popup_text">
          ¿Quieres recibir <strong>promociones exclusivas</strong> y alertas de disponibilidad por WhatsApp antes que nadie?
        </p>
        
        <div className="wa_popup_actions">
          <button className="wa_popup_btn_primary" onClick={handleSubscribe}>
            📲 ¡Sí, quiero unirme!
          </button>
          <button className="wa_popup_btn_text" onClick={handleDismiss}>
            Quizás más tarde
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPopup;
