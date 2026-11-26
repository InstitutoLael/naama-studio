import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Photo from '../common/Photo';
import { CalendarIcon, CloseIcon, InstagramIcon, WhatsAppIcon } from '../common/Icons';
import { SITE, whatsappUrl } from '../../data/site';

const CARAS = ['retrato-valeria', 'retrato-gaby', 'retrato-viviana'];

/** X03 · píldora con fotos del equipo; al tocarla se abre WhatsApp, Instagram y Reservar. */
const FloatingWhatsApp = () => {
  const [show, setShow] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    // Aparece al bajar 500 px y se esconde cerca del pie (que ya tiene sus botones).
    const onScroll = () => {
      const nearEnd = window.scrollY + window.innerHeight > document.documentElement.scrollHeight - 900;
      setShow(window.scrollY > 500 && !nearEnd);
      if (nearEnd) setAbierto(false);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!abierto) return undefined;
    const onKey = (e) => e.key === 'Escape' && setAbierto(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto]);

  return (
    <>
      <AnimatePresence>
        {abierto && (
          <motion.button
            className="wa__velo"
            aria-label="Cerrar"
            onClick={() => setAbierto(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div className={`wa ${show ? 'is-visible' : ''} ${abierto ? 'is-open' : ''}`}>
        <AnimatePresence>
          {abierto && (
            <motion.div
              className="wa__opciones"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25 }}
            >
              <Link to="/reservar" className="wa__opcion" onClick={() => setAbierto(false)}>
                <span className="wa__texto">Reservar mi hora</span>
                <span className="wa__circulo wa__circulo--cafe"><CalendarIcon /></span>
              </Link>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="wa__opcion">
                <span className="wa__texto">Instagram</span>
                <span className="wa__circulo wa__circulo--cafe"><InstagramIcon /></span>
              </a>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="wa__opcion">
                <span className="wa__texto">WhatsApp</span>
                <span className="wa__circulo"><WhatsAppIcon /></span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {abierto ? (
          <button className="wa__cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar opciones">
            <CloseIcon />
          </button>
        ) : (
          <button className="wa__pildora" onClick={() => setAbierto(true)} tabIndex={show ? 0 : -1} aria-label="¿Te ayudamos? Ver opciones de contacto">
            <span className="wa__caras" aria-hidden="true">
              {CARAS.map((c) => (
                <Photo key={c} name={c} alt="" sizes="40px" position="center 25%" className="wa__cara" />
              ))}
            </span>
            <span className="wa__msj">
              <strong>¿Te ayudamos?</strong>
              <small>Respondemos por WhatsApp</small>
            </span>
            <span className="wa__circulo"><WhatsAppIcon /></span>
          </button>
        )}
      </div>
    </>
  );
};

export default FloatingWhatsApp;
