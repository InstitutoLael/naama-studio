import React, { useState } from 'react';
import SEOHead from '../components/shared/SEOHead';
import Mapa3D from '../components/site/Mapa3D';
import { InstagramIcon, LayersIcon, NavigationIcon, PinIcon, WhatsAppIcon } from '../components/common/Icons';
import { SITE, horaChile, isOpenNow, whatsappUrl } from '../data/site';
import '../theme/contact.css';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const may = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Filas del horario: hoy va sola y destacada; el resto se agrupa (lunes a sábado 10:30–19:30).
const filasHorario = (hoy) => {
  const filas = [];
  let grupo = [];
  const cerrar = () => {
    if (!grupo.length) return;
    const n = grupo.length === 1 ? DIAS[grupo[0]] : grupo.length === 2 ? `${DIAS[grupo[0]]} y ${DIAS[grupo[1]]}` : `${DIAS[grupo[0]]} a ${DIAS[grupo[grupo.length - 1]]}`;
    filas.push({ n: may(n), v: '10:30 — 19:30' });
    grupo = [];
  };
  for (let d = 1; d <= 6; d++) {
    if (d === hoy) {
      cerrar();
      filas.push({ n: may(DIAS[d]), v: '10:30 — 19:30', hoy: true });
    } else grupo.push(d);
  }
  cerrar();
  filas.push({ n: 'Domingo', v: 'Cerrado', hoy: hoy === 0 });
  return filas;
};

/** P09 · Contacto: mapa 3D propio + mapa real de Google. */
const ContactPage = () => {
  const [abierto] = useState(() => isOpenNow());
  const [hoy] = useState(() => horaChile().dia);
  const [vista, setVista] = useState('3d');

  return (
    <div className="contacto pagina">
      <SEOHead title="Contacto" description="Visítanos en Arcadia 1297, San Miguel, a pasos del metro El Llano. Horario, WhatsApp, Instagram y cómo llegar a Naamá Studio." />

      <div className="container contacto-grid">
        <h1 className="contacto-titulo">
          <span className="gigante-titulo">Te esperamos</span>
          <span className="firma">en casa</span>
        </h1>

        <section className="contacto-mapa" aria-label="Mapa">
          <div className="mapa-marco">
            <span className="mapa-chip">Naamá · Arcadia 1297</span>
            <div className="mapa-vista" role="group" aria-label="Tipo de mapa">
              <button aria-pressed={vista === '3d'} onClick={() => setVista('3d')}>3D</button>
              <button aria-pressed={vista === 'real'} onClick={() => setVista('real')}><LayersIcon /> Mapa real</button>
            </div>
            {vista === '3d' ? (
              <>
                <Mapa3D />
                <span className="mapa-nota">Ilustración · no está a escala</span>
              </>
            ) : (
              <iframe className="mapa-real" title="Mapa de Google: Naamá Studio, Arcadia 1297" src={SITE.mapaEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            )}
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn--claro btn--sm mapa-abrir solo-pc"><PinIcon /> Abrir en Maps</a>
          </div>
          <div className="contacto-botones solo-cel">
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn"><PinIcon /> Abrir en Maps</a>
            <a href={SITE.comoLlegarUrl} target="_blank" rel="noopener noreferrer" className="btn btn--linea"><NavigationIcon /> Cómo llegar</a>
          </div>
        </section>

        <div className="contacto-datos">
          <div className="contacto-cols">
            <div>
              <h2>Ven a vernos</h2>
              <p>Arcadia 1297<br />San Miguel, Santiago</p>
              <p className="muted">{SITE.metro}</p>
            </div>
            <div>
              <h2>Escríbenos</h2>
              <p>
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">{SITE.phoneDisplay}</a>
                <br />
                <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">{SITE.instagramHandle}</a>
                <br />
                <a href={`mailto:${SITE.email}`} className="contacto-mail">{SITE.email}</a>
              </p>
            </div>
          </div>

          <div className="horario tarjeta">
            <div className="horario__cabeza">
              <h2>Horario</h2>
              <span className={`estado ${abierto ? 'estado--abierto' : ''}`}>{abierto ? 'Abierto ahora' : 'Cerrado ahora'}</span>
            </div>
            <dl>
              {filasHorario(hoy).map((f) => (
                <div key={f.n} className={f.hoy ? 'es-hoy' : ''}>
                  <dt>{f.n}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="contacto-acciones">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn--terracota"><WhatsAppIcon /> Escribir por WhatsApp</a>
            <a href={SITE.comoLlegarUrl} target="_blank" rel="noopener noreferrer" className="btn btn--linea solo-pc"><NavigationIcon /> Cómo llegar</a>
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="btn btn--linea solo-cel"><InstagramIcon /> Instagram</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
