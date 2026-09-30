import React from 'react';
import { Link } from 'react-router-dom';
import { LogoMark } from '../common/Logo';
import { ArrowRight, ArrowUpRight, InstagramIcon, WhatsAppIcon } from '../common/Icons';
import { HOURS, SITE, whatsappUrl } from '../../data/site';
import { mundos } from '../../data/categories';
import { NAV_LINKS } from './Navbar';
import { scrollToTop } from '../../lib/smoothScroll';

const Footer = () => (
  <footer className="footer on-dark">
    <div className="container">
      <div className="footer__cta">
        <p className="eyebrow">Tu próxima pausa</p>
        <h2 className="footer__title">
          Reserva un momento <em>solo para ti.</em>
        </h2>
        <div className="footer__cta-actions">
          <Link to="/reservar" className="btn btn--gold">
            Reservar mi hora <ArrowRight />
          </Link>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn--ghost-light">
            <WhatsAppIcon /> Escribir por WhatsApp
          </a>
        </div>
      </div>

      <div className="footer__grid">
        <div className="footer__col">
          <h3 className="footer__label">Visítanos</h3>
          <p>{SITE.address}</p>
          <p>{SITE.city}</p>
          <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="footer__link footer__link--arrow">
            Cómo llegar <ArrowUpRight />
          </a>
        </div>

        <div className="footer__col">
          <h3 className="footer__label">Horario</h3>
          {HOURS.map((h) => (
            <p key={h.label} className="footer__hours">
              <span>{h.label}</span>
              <span>{h.value}</span>
            </p>
          ))}
        </div>

        <div className="footer__col">
          <h3 className="footer__label">Servicios</h3>
          {mundos.map((m) => (
            <Link key={m.id} to={`/servicios/${m.id}`} className="footer__link">
              {m.name}
            </Link>
          ))}
        </div>

        <div className="footer__col">
          <h3 className="footer__label">Estudio</h3>
          {NAV_LINKS.filter((l) => l.to !== '/servicios').map((l) => (
            <Link key={l.to} to={l.to} className="footer__link">
              {l.label}
            </Link>
          ))}
          <Link to="/reservar" className="footer__link">Reservar</Link>
        </div>

        <div className="footer__col">
          <h3 className="footer__label">Contacto</h3>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="footer__link">
            {SITE.phoneDisplay}
          </a>
          <a href={`mailto:${SITE.email}`} className="footer__link">{SITE.email}</a>
          <div className="footer__social">
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram de Naamá Studio">
              <InstagramIcon />
            </a>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de Naamá Studio">
              <WhatsAppIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="footer__wordmark" aria-hidden="true">
        <LogoMark className="footer__mark" />
        <span>Naamá</span>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} Naamá Studio SpA</span>
        <span>Belleza · Bienestar · Armonía</span>
        <button type="button" className="footer__top" onClick={() => scrollToTop(false)}>
          Volver arriba ↑
        </button>
      </div>
    </div>
  </footer>
);

export default Footer;
