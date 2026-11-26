import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from '../common/Logo';
import Photo from '../common/Photo';
import { CloseIcon, InstagramIcon, WhatsAppIcon } from '../common/Icons';
import { SITE, HORARIO_CORTO, whatsappUrl } from '../../data/site';
import { mundos } from '../../data/categories';
import { lockScroll } from '../../lib/smoothScroll';

export const NAV_LINKS = [
  { to: '/servicios', label: 'Servicios' },
  { to: '/equipo', label: 'Equipo' },
  { to: '/galeria', label: 'Galería' },
  { to: '/gift-cards', label: 'Gift cards' },
  { to: '/empresas', label: 'Empresas' },
  { to: '/contacto', label: 'Contacto' },
];

// Páginas con fondo oscuro arriba: el encabezado va en claro.
const esOscura = (path) => path === '/galeria';
const EASE = [0.16, 1, 0.3, 1];

const Navbar = () => {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicios, setServicios] = useState(true);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 260 && y > last + 2);
      if (y < last - 2) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.dataset.nav = hidden && !open ? 'hidden' : 'shown';
  }, [hidden, open]);
  useEffect(() => {
    lockScroll(open);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
    };
  }, [open]);

  const oscuro = esOscura(pathname);

  return (
    <>
      <header className={`nav ${oscuro ? 'nav--oscuro' : ''} ${scrolled ? 'nav--scrolled' : ''} ${hidden && !open ? 'nav--hidden' : ''}`}>
        <div className="nav__inner container">
          <Link to="/" className="nav__logo" aria-label="Naamá Studio — Inicio">
            <Logo />
          </Link>
          <nav className="nav__links" aria-label="Principal">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className="nav__link">
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="nav__actions">
            <Link to="/reservar" className="btn btn--sm nav__cta">
              <span className="nav__cta-largo">Reservar mi hora</span>
              <span className="nav__cta-corto">Reservar</span>
            </Link>
            <button
              className="nav__burger"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="menu"
              aria-label="Abrir menú"
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <Photo name="casa-sala" alt="" className="menu__foto" sizes="100vw" />
            <div className="menu__velo" />
            <div className="menu__cabeza">
              <button className="menu__cerrar" onClick={() => setOpen(false)}>
                <CloseIcon /> Cerrar
              </button>
              <Link to="/" className="menu__logo" aria-label="Inicio">
                <Logo />
              </Link>
              <div className="menu__redes">
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <WhatsAppIcon />
                </a>
                <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <InstagramIcon />
                </a>
              </div>
            </div>

            <motion.nav
              className="menu__lista"
              aria-label="Menú"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            >
              <NavLink to="/" end className="menu__item">Inicio</NavLink>
              <div className="menu__grupo">
                <button className="menu__item menu__item--boton" aria-expanded={servicios} onClick={() => setServicios((s) => !s)}>
                  <span>
                    Servicios <sup>({mundos.length})</sup>
                  </span>
                  <span className="menu__signo" aria-hidden="true">{servicios ? '–' : '+'}</span>
                </button>
                {servicios && (
                  <div className="menu__mundos">
                    <Link to="/servicios">Todos los precios</Link>
                    {mundos.map((m) => (
                      <Link key={m.id} to={`/servicios/${m.id}`}>{m.name}</Link>
                    ))}
                  </div>
                )}
              </div>
              {[...NAV_LINKS.filter((l) => l.to !== '/servicios'), { to: '/preguntas', label: 'Preguntas' }].map((l) => (
                <NavLink key={l.to} to={l.to} className="menu__item">{l.label}</NavLink>
              ))}
            </motion.nav>

            <div className="menu__pie">
              <p>
                {SITE.address.replace(', ', ' · ')}
                <br />
                {HORARIO_CORTO}
              </p>
              <Link to="/reservar" className="btn btn--claro">Reservar</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
