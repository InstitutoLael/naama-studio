import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from '../common/Logo';
import { ArrowRight, CloseIcon, InstagramIcon, WhatsAppIcon } from '../common/Icons';
import { SITE, whatsappUrl } from '../../data/site';
import { lockScroll } from '../../lib/smoothScroll';

export const NAV_LINKS = [
  { to: '/servicios', label: 'Servicios' },
  { to: '/equipo', label: 'Equipo' },
  { to: '/galeria', label: 'Galería' },
  { to: '/gift-cards', label: 'Gift Cards' },
  { to: '/empresas', label: 'Empresas' },
  { to: '/contacto', label: 'Contacto' },
];

// Rutas cuya portada es una foto oscura: la barra empieza transparente con texto claro.
const hasDarkHero = (path) => path === '/' || path.startsWith('/servicios/');

const EASE = [0.16, 1, 0.3, 1];

const Navbar = () => {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 240 && y > last + 2);
      if (y < last - 2) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Expone el estado de la barra para que otros elementos fijos (p. ej. filtros) se acomoden.
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

  const light = hasDarkHero(pathname) && !scrolled && !open;

  return (
    <>
      <header
        className={`nav ${light ? 'nav--light' : ''} ${scrolled ? 'nav--scrolled' : ''} ${hidden && !open ? 'nav--hidden' : ''} ${open ? 'nav--open' : ''}`}
      >
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
              Reservar
            </Link>
            <button
              className="nav__burger"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="menu"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
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
            className="menu on-dark"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="menu__inner container">
              <nav className="menu__links" aria-label="Menú móvil">
                {[{ to: '/', label: 'Inicio' }, ...NAV_LINKS].map((l, i) => (
                  <div className="menu__row" key={l.to}>
                    <motion.div
                      initial={{ y: '110%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.05 }}
                    >
                      <NavLink to={l.to} end className="menu__link">
                        <span className="menu__num">0{i + 1}</span>
                        {l.label}
                      </NavLink>
                    </motion.div>
                  </div>
                ))}
              </nav>

              <motion.div
                className="menu__foot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <Link to="/reservar" className="btn btn--gold">
                  Reservar mi hora <ArrowRight />
                </Link>
                <div className="menu__info">
                  <p>{SITE.address}</p>
                  <p>Lun – Vie 09–19 · Sáb 09–17</p>
                  <div className="menu__social">
                    <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                      <WhatsAppIcon />
                    </a>
                    <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                      <InstagramIcon />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
            <button className="menu__close visually-hidden" onClick={() => setOpen(false)}>
              <CloseIcon /> Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
