import React from 'react';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import { Parallax, Reveal, SplitText } from '../components/common/Motion';
import { ArrowRight, WhatsAppIcon } from '../components/common/Icons';
import { b2bPacks } from '../data/b2bPacks';
import { SITE, whatsappUrl } from '../data/site';
import '../theme/empresas.css';

const MODES = [
  {
    title: 'En el salón',
    text: 'Reservamos la casa para tu equipo: una jornada de cuidado capilar, uñas y bienestar lejos de la oficina.',
  },
  {
    title: 'En tu oficina',
    text: 'Llevamos estaciones de masaje, diseño de cejas y manicure express a tus dependencias.',
  },
  {
    title: 'Gift cards corporativas',
    text: 'Un reconocimiento que cada persona canjea por el servicio que prefiera, cuando quiera.',
  },
];

const EmpresasPage = () => (
  <div className="empresas">
    <SEOHead title="Empresas" description="Bienestar corporativo con Naamá Studio: jornadas en el salón o en tu oficina, packs y gift cards corporativas." />

    <header className="page-hero container empresas__hero">
      <div>
        <p className="eyebrow">Empresas</p>
        <SplitText as="h1" className="page-hero__title" onMount delay={0.15} lines={['Bienestar para', <em key="e">tu equipo.</em>]} />
        <Reveal as="p" className="lead page-hero__lead" delay={0.4}>
          Diseñamos jornadas de cuidado a la medida de tu empresa, para celebrar, reconocer o
          simplemente darle a tu equipo un respiro.
        </Reveal>
        <Reveal className="empresas__actions" delay={0.55}>
          <a
            href={whatsappUrl('Hola! Escribo de una empresa y me gustaría recibir la propuesta corporativa de Naamá Studio.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            <WhatsAppIcon /> Pedir propuesta
          </a>
          <a href={`mailto:${SITE.email}?subject=Propuesta%20corporativa%20Naam%C3%A1%20Studio`} className="btn btn--ghost">
            Escribir un correo
          </a>
        </Reveal>
      </div>
      <Reveal className="empresas__photo" y={60} delay={0.2}>
        <Parallax className="parallax empresas__parallax" amount={8}>
          <Photo name="salon-estaciones" alt="Estaciones de trabajo de Naamá Studio" priority sizes="(min-width: 1000px) 40vw, 92vw" />
        </Parallax>
      </Reveal>
    </header>

    <section className="section on-ivory">
      <div className="container">
        <div className="modes">
          {MODES.map((m, i) => (
            <Reveal key={m.title} className="mode" delay={i * 0.08}>
              <span className="mode__num">0{i + 1}</span>
              <h2 className="h3">{m.title}</h2>
              <p className="muted">{m.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    <section className="section container" aria-labelledby="packs-title">
      <div className="section-head section-head--split">
        <div>
          <p className="eyebrow">Packs</p>
          <SplitText as="h2" id="packs-title" className="h2" lines={['Combinaciones', <em key="p">pensadas para equipos.</em>]} />
        </div>
        <Reveal as="p" className="lead">Valores referenciales. Armamos la propuesta según el tamaño de tu equipo.</Reveal>
      </div>
      <div className="packs">
        {b2bPacks.map((p, i) => (
          <Reveal key={p.id} className="pack" delay={i * 0.08} y={50}>
            <span className="pack__mode">{p.modality}</span>
            <h3 className="pack__name">{p.name.replace('Pack ', '')}</h3>
            <p className="muted">{p.description}</p>
            <ul className="pack__list">
              {p.services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="pack__foot">
              <div>
                <small>Desde</small>
                <strong>${p.price}</strong>
              </div>
              <a
                href={whatsappUrl(`Hola! Me interesa el ${p.name} para mi empresa. ¿Me pueden enviar más información?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="link-arrow"
              >
                Consultar <ArrowRight />
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  </div>
);

export default EmpresasPage;
