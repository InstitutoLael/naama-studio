import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/shared/SEOHead';
import { SplitText } from '../components/common/Motion';
import { ArrowRight } from '../components/common/Icons';

const NotFound = () => (
  <div className="page-hero container" style={{ minHeight: '80vh' }}>
    <SEOHead title="Página no encontrada" />
    <p className="eyebrow">Error 404</p>
    <SplitText as="h1" className="page-hero__title" onMount delay={0.1} lines={['Esta página', <em key="n">se tomó una pausa.</em>]} />
    <p className="lead page-hero__lead">La dirección no existe o cambió. Te llevamos de vuelta.</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 40 }}>
      <Link to="/" className="btn">
        Ir al inicio <ArrowRight />
      </Link>
      <Link to="/servicios" className="btn btn--ghost">Ver servicios</Link>
    </div>
  </div>
);

export default NotFound;
