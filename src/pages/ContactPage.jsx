import React, { useState } from 'react';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import { Reveal, SplitText } from '../components/common/Motion';
import { ArrowUpRight, InstagramIcon, WhatsAppIcon } from '../components/common/Icons';
import { HOURS, SITE, isOpenNow, whatsappUrl } from '../data/site';
import '../theme/contact.css';

const ContactPage = () => {
  const [open] = useState(() => isOpenNow());
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="contact">
      <SEOHead title="Contacto" description="Visítanos en Arcadia 1297, San Miguel, Santiago. Horarios, WhatsApp, Instagram y cómo llegar a Naamá Studio." />

      <header className="page-hero container">
        <p className="eyebrow">Contacto</p>
        <SplitText as="h1" className="page-hero__title" onMount delay={0.15} lines={['Te esperamos', <em key="c">en casa.</em>]} />
      </header>

      <section className="container contact__grid">
        <Reveal className="contact__photo" y={60}>
          <Photo name="salon-recepcion" alt="Recepción de Naamá Studio" priority sizes="(min-width: 1000px) 45vw, 92vw" />
        </Reveal>

        <div className="contact__info">
          <Reveal className="contact__block">
            <h2 className="contact__label">Dirección</h2>
            <p className="contact__big">{SITE.address}</p>
            <p className="muted">{SITE.city} · a pasos del metro San Miguel</p>
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-arrow">
              Cómo llegar <ArrowUpRight />
            </a>
          </Reveal>

          <Reveal className="contact__block" delay={0.08}>
            <h2 className="contact__label">
              Horario
              <span className={`status ${open ? 'is-open' : ''}`}>{open ? 'Abierto ahora' : 'Cerrado ahora'}</span>
            </h2>
            <dl className="contact__hours">
              {HOURS.map((h) => (
                <div key={h.label}>
                  <dt>{h.label}</dt>
                  <dd>{h.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal className="contact__block" delay={0.16}>
            <h2 className="contact__label">Escríbenos</h2>
            <div className="contact__actions">
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn">
                <WhatsAppIcon /> {SITE.phoneDisplay}
              </a>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                <InstagramIcon /> {SITE.instagramHandle}
              </a>
            </div>
            <a href={`mailto:${SITE.email}`} className="contact__mail">{SITE.email}</a>
          </Reveal>
        </div>
      </section>

      <section className="container contact__map-wrap">
        {showMap ? (
          <iframe
            title="Mapa: Naamá Studio, Arcadia 1297, San Miguel"
            src="https://maps.google.com/maps?q=Arcadia+1297,+San+Miguel,+Santiago,+Chile&z=16&output=embed"
            className="contact__map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <button className="contact__map contact__map--placeholder" onClick={() => setShowMap(true)}>
            <span className="h3">Ver mapa</span>
            <span className="muted">Arcadia 1297, San Miguel</span>
          </button>
        )}
      </section>
    </div>
  );
};

export default ContactPage;
