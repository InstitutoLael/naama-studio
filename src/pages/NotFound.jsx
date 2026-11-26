import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';

/** P10 · Página de error. */
const NotFound = () => (
  <div className="error404 pagina">
    <SEOHead title="Página no encontrada" />
    <div className="container error404__cabeza">
      <h1 className="error404__numero" aria-label="Error 404">
        <span aria-hidden="true">4</span>
        <span className="error404__cero" aria-hidden="true"><Photo name="unas-violeta" alt="" priority sizes="140px" /></span>
        <span aria-hidden="true">4</span>
      </h1>
      <p className="firma">se tomó una pausa</p>
    </div>
    <section className="error404__casa">
      <Photo name="casa-sala" alt="" sizes="100vw" />
      <div className="error404__texto">
        <h2>Esta página se tomó una pausa.</h2>
        <p>La dirección no existe o cambió. Te llevamos de vuelta.</p>
        <div className="error404__botones">
          <Link to="/" className="btn btn--claro btn--sm">Ir al inicio</Link>
          <Link to="/servicios" className="btn btn--linea-clara btn--sm">Ver servicios</Link>
        </div>
      </div>
    </section>
  </div>
);

export default NotFound;
