import React, { useEffect, useState } from 'react';
import { WhatsAppIcon } from '../common/Icons';
import { whatsappUrl } from '../../data/site';

/** Botón discreto de WhatsApp. */
const FloatingWhatsApp = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Visible tras bajar un poco; se oculta al llegar al footer, que ya tiene sus propios botones.
    const onScroll = () => {
      const nearEnd = window.scrollY + window.innerHeight > document.documentElement.scrollHeight - 900;
      setShow(window.scrollY > 500 && !nearEnd);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={`wa-float ${show ? 'is-visible' : ''}`}
      aria-label="Escríbenos por WhatsApp"
      tabIndex={show ? 0 : -1}
    >
      <WhatsAppIcon />
      <span className="wa-float__label">¿Dudas? Escríbenos</span>
    </a>
  );
};

export default FloatingWhatsApp;
