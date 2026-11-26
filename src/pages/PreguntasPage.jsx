import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/shared/SEOHead';
import { WhatsAppIcon } from '../components/common/Icons';
import { FAQ } from '../data/faq';
import { whatsappUrl } from '../data/site';

const COLORES = ['arcilla', 'blanco', 'rosa', 'blanco'];

/** P17 · Preguntas frecuentes y políticas. */
const PreguntasPage = () => (
  <div className="dudas pagina">
    <SEOHead title="Preguntas frecuentes" description="Horario, reservas, pagos, gift cards y cómo llegar a Naamá Studio en San Miguel." faq={FAQ} />
    <div className="container dudas__cuerpo">
      <h1 className="dudas__titulo">
        <span className="gigante">Dudas</span>
        <span className="firma">resueltas</span>
      </h1>
      <div className="dudas__lista">
        {FAQ.map((f, i) => (
          <article key={f.q} className={`duda duda--${COLORES[i % COLORES.length]}`}>
            <h2>{f.q}</h2>
            <p>{f.a}</p>
          </article>
        ))}
      </div>
      <div className="dudas__pie">
        <p>¿Otra duda?</p>
        <a href={whatsappUrl('Hola 🤍 tengo una duda:')} target="_blank" rel="noopener noreferrer" className="btn btn--terracota">
          <WhatsAppIcon /> Escríbenos
        </a>
        <Link to="/reservar" className="btn btn--linea">Reservar mi hora</Link>
      </div>
    </div>
  </div>
);

export default PreguntasPage;
