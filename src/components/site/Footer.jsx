import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import Photo from '../common/Photo';
import { InstagramIcon, PinIcon, WhatsAppIcon } from '../common/Icons';
import { SITE, whatsappUrl } from '../../data/site';
import { mundos } from '../../data/categories';

const ESTUDIO = [
  { to: '/equipo', label: 'Equipo' },
  { to: '/galeria', label: 'Galería' },
  { to: '/gift-cards', label: 'Gift cards' },
  { to: '/empresas', label: 'Empresas' },
  { to: '/contacto', label: 'Contacto' },
  { to: '/preguntas', label: 'Preguntas' },
  { to: '/reservar', label: 'Reservar' },
];

/** X02 · tarjeta café + 3 columnas + fachada con PAUSA. */
const Footer = () => (
  <footer className="pie">
    <div className="pie__arriba container">
      <div className="pie__tarjeta">
        <div className="pie__tarjeta-cabeza">
          <Logo className="pie__logo" />
          <div className="pie__iconos">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de Naamá Studio">
              <WhatsAppIcon />
            </a>
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram de Naamá Studio">
              <InstagramIcon />
            </a>
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver Naamá Studio en Google Maps">
              <PinIcon />
            </a>
          </div>
        </div>
        <p className="pie__frase">
          Tu próxima pausa, <span className="firma firma--clara">solo para ti</span>
        </p>
        <Link to="/reservar" className="btn btn--claro btn--ancho">Reservar mi hora</Link>
      </div>

      <div className="pie__columnas">
        <div>
          <p className="pie__label">Servicios</p>
          {mundos.map((m) => (
            <Link key={m.id} to={`/servicios/${m.id}`}>{m.short}</Link>
          ))}
        </div>
        <div>
          <p className="pie__label">Estudio</p>
          {ESTUDIO.map((l) => (
            <Link key={l.to} to={l.to}>{l.label}</Link>
          ))}
        </div>
        <div>
          <p className="pie__label">Visítanos</p>
          <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer">
            Arcadia 1297
            <br />
            San Miguel
          </a>
          <p className="pie__horario">
            Lun a sáb
            <br />
            10:30 a 19:30
          </p>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">{SITE.phoneDisplay}</a>
        </div>
      </div>
    </div>

    <div className="pie__fachada">
      <Photo name="casa-fachada" alt="La fachada roja de Naamá Studio en Arcadia 1297" sizes="100vw" position="center 40%" />
      <div className="pie__fachada-velo" />
      <div className="pie__fachada-top container">
        <span>© {new Date().getFullYear()} Naamá Studio</span>
        <span>Belleza · Bienestar · Armonía</span>
      </div>
      <p className="pie__pausa" aria-hidden="true">
        <span className="firma firma--blanca">te espera</span>
        <span className="gigante">Pausa</span>
      </p>
    </div>
  </footer>
);

export default Footer;
