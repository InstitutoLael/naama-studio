import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import '../styles/NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound_page">
      <SEOHead title="Página no encontrada" description="La página que buscas no existe." />
      <span className="notfound_label">Error 404</span>
      <h1 className="notfound_title serif">
        Esta página no existe.
      </h1>
      <p className="notfound_text">
        La dirección que buscas no fue encontrada. Quizás fue movida o el enlace es incorrecto.
      </p>
      <Link to="/" className="notfound_btn" aria-label="Volver al inicio de Naamá Studio">
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFound;
