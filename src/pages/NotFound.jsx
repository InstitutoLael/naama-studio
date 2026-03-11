import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/shared/SEOHead';
import '../styles/NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound_page">
      <SEOHead title="Página no encontrada" description="La página que buscas no existe en Naamá Studio." />
      <span className="notfound_label">Error 404</span>
      <h1 className="notfound_title serif">
        Esta página no existe.
      </h1>
      <p className="notfound_text">
        La dirección que buscas no fue encontrada. Quizás fue movida o el enlace es incorrecto.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', marginTop: '2rem' }}>
        <Link to="/" className="notfound_btn" aria-label="Volver al inicio de Naamá Studio">
          Volver al Inicio
        </Link>
        <a
          href="https://wa.me/56979520623?text=Hola! Estaba navegando en la web y encontré un error. ¿Me pueden ayudar?"
          target="_blank"
          rel="noopener noreferrer"
          className="notfound_btn"
          style={{ background: '#25D366', color: '#fff', border: 'none' }}
          aria-label="Contactar por WhatsApp"
        >
          📲 Contactar por WhatsApp
        </a>
        <a
          href="https://www.instagram.com/naamastudio_/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.9rem', opacity: 0.7, color: 'inherit' }}
          aria-label="Ver Instagram de Naamá Studio"
        >
          O visítanos en @naamastudio_ →
        </a>
      </div>
    </div>
  );
};

export default NotFound;
