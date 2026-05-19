import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Home from './pages/Home';

// Lazy-load páginas pesadas para mejorar performance en móvil
const WorldPage = lazy(() => import('./pages/WorldPage'));
const StaffPage = lazy(() => import('./pages/StaffPage'));
const EmpresasPage = lazy(() => import('./pages/EmpresasPage'));
const BookingFlow = lazy(() => import('./pages/BookingFlow'));
const NuestraHistoria = lazy(() => import('./pages/NuestraHistoria')); // Existe pero no se muestra
const ContactPage = lazy(() => import('./pages/ContactPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const GiftCardsPage = lazy(() => import('./pages/GiftCardsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

import BottomNav from './components/layout/BottomNav';
import WhatsAppPopup from './components/layout/WhatsAppPopup';
import ScrollProgress from './components/ui/ScrollProgress';
import CustomCursor from './components/ui/CustomCursor';
import ThemeToggle from './components/ui/ThemeToggle';
import PageTransition from './components/shared/PageTransition';
import useReveal from './hooks/useReveal';
const Logo = '/naama-studio.png'; // Desde /public/ — nombre estable, sin hash de Vite
import './styles/Global.css';
import './styles/App.css';

// Scroll to top en cada cambio de ruta
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Hook global de animaciones premium para observar todos los .reveal en cambio de ruta
  useReveal(location.pathname);


  return (
    <div className="naama_app">
      <ScrollToTop />
      <ScrollProgress />
      <CustomCursor />

      {/* Navegación Desktop / Mobile Header */}
      <nav className={`main_nav ${scrolled ? 'nav_scrolled' : ''} ${menuOpen ? 'nav_menu_active' : ''}`} aria-label="Navegación principal">
        <div className="nav_container">
          <Link to="/" className="logo_link" aria-label="Ir al inicio de Naamá Studio">
            <img
              src={Logo}
              alt="Naamá Studio"
              className="nav_logo"
              fetchpriority="high"
              loading="eager"
              width="135"
              height="45"
            />
          </Link>
          
          {/* Enlaces Desktop */}
          <div className="nav_links desktop_only">
            <Link to="/" className={`nav_item ${location.pathname === '/' ? 'active' : ''}`}>Inicio</Link>
            <Link to="/staff" className={`nav_item ${location.pathname === '/staff' ? 'active' : ''}`}>Precios</Link>
            <Link to="/empresas" className={`nav_item ${location.pathname === '/empresas' ? 'active' : ''}`}>Empresas</Link>
            <Link to="/contacto" className={`nav_item ${location.pathname === '/contacto' ? 'active' : ''}`}>Contacto</Link>
            <ThemeToggle />
            <Link to="/reservar" className="nav_cta_boutique" aria-label="Agendar una sesión">Agendar</Link>
          </div>

          {/* Grupo de Control Mobile */}
          <div className="mobile_nav_control mobile_only">
            <ThemeToggle />
            <button 
              className={`hamburger_btn ${menuOpen ? 'active' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Menú Desplegable Responsivo overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            className="mobile_menu_overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.div 
              className="mobile_menu_panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile_menu_header">
                <span className="mobile_menu_brand serif">Naamá Studio</span>
                <button 
                  className="mobile_menu_close" 
                  onClick={() => setMenuOpen(false)}
                  aria-label="Cerrar menú"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="mobile_menu_links">
                <Link to="/" className={`mobile_menu_item ${location.pathname === '/' ? 'active' : ''}`}>
                  Inicio
                </Link>
                <Link to="/staff" className={`mobile_menu_item ${location.pathname === '/staff' ? 'active' : ''}`}>
                  Precios & Equipo
                </Link>
                <Link to="/empresas" className={`mobile_menu_item ${location.pathname === '/empresas' ? 'active' : ''}`}>
                  Empresas
                </Link>
                <Link to="/contacto" className={`mobile_menu_item ${location.pathname === '/contacto' ? 'active' : ''}`}>
                  Contacto
                </Link>
              </div>

              <div className="mobile_menu_footer">
                <Link to="/reservar" className="mobile_menu_cta btn_gold_solid" aria-label="Agendar experiencia">
                  Agendar Experiencia
                </Link>
                <div className="mobile_menu_info">
                  <p className="sch_text uppercase">Lunes a Sábado</p>
                  <p className="arena_text_muted">Arcadia 1297, San Miguel</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="main_content">
        <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-linen)' }} />}>
          <PageTransition>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/mundo/:mundoId" element={<WorldPage />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/empresas" element={<EmpresasPage />} />
              <Route path="/reservar" element={<BookingFlow />} />
              {/* NuestraHistoria: ruta activa pero sin acceso desde ningún menú */}
              <Route path="/nuestra-historia" element={<NuestraHistoria />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/galeria" element={<GalleryPage />} />
              <Route path="/gift-cards" element={<GiftCardsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </Suspense>
      </main>

      {/* Navegación Mobile (Bottom Nav) */}
      <BottomNav />

      {/* WhatsApp Popup */}
      <WhatsAppPopup />

      {/* Botones Flotantes */}
      <div className="floating_buttons">
        <a
          href="https://wa.me/56979520623?text=Hola! Me gustaría saber más sobre los servicios de Naamá Studio."
          target="_blank"
          rel="noopener noreferrer"
          className="float_btn float_whatsapp"
          aria-label="Escribir a Naamá Studio por WhatsApp"
          title="Escríbenos por WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
        <a
          href="https://www.instagram.com/naamastudio_/"
          target="_blank"
          rel="noopener noreferrer"
          className="float_btn float_instagram"
          aria-label="Ver Instagram de Naamá Studio"
          title="Síguenos en Instagram"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
      </div>

      <footer className="footer" role="contentinfo">
        <div className="footer_upper">
          {/* Columna 1 — Marca */}
          <div className="footer_brand_col">
            <h3 className="footer_brand_title serif">Naamá Studio</h3>
            <span className="footer_brand_subtitle">Beauty & Wellness House</span>
            <p className="footer_brand_tagline">"Tu bienestar, nuestra dedicación"</p>
            <div className="footer_brand_socials">
              <a 
                href="https://www.instagram.com/naamastudio_/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="brand_social_btn"
                aria-label="Instagram de Naamá Studio"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a 
                href="https://wa.me/56979520623" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="brand_social_btn"
                aria-label="WhatsApp de Naamá Studio"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.62.963 3.4 1.47 5.216 1.47 5.617 0 10.185-4.57 10.188-10.187.002-2.72-1.055-5.279-2.973-7.199-1.921-1.92-4.475-2.976-7.199-2.977-5.626 0-10.196 4.568-10.2 10.189-.001 1.897.501 3.75 1.455 5.378l-.961 3.51 3.593-.943zm11.13-7.794c-.302-.15-1.785-.882-2.057-.981-.273-.099-.471-.149-.669.149-.198.299-.768.98-.941 1.178-.173.198-.347.223-.649.074-.302-.15-1.272-.469-2.419-1.494-.893-.797-1.495-1.782-1.67-2.081-.174-.3-.018-.462.132-.61.135-.133.303-.35.454-.524.152-.173.202-.297.302-.497.1-.198.05-.371-.025-.521-.075-.15-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.785-.73 2.033-1.433.248-.704.248-1.306.173-1.433-.075-.127-.272-.201-.575-.351z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Columna 2 — Navegación */}
          <div className="footer_nav_col">
            <h4 className="footer_col_title">Explora</h4>
            <div className="footer_links_grid">
              <Link to="/" className="footer_nav_link">Inicio</Link>
              <Link to="/staff" className="footer_nav_link">Servicios</Link>
              <Link to="/galeria" className="footer_nav_link">Galería</Link>
              <Link to="/nuestra-historia" className="footer_nav_link">Nosotros</Link>
              <Link to="/contacto" className="footer_nav_link">Contacto</Link>
              <Link to="/reservar" className="footer_nav_link">Reservar</Link>
            </div>
          </div>

          {/* Columna 3 — Contacto */}
          <div className="footer_contact_col">
            <h4 className="footer_col_title">Encuéntranos</h4>
            <p className="footer_contact_text">Arcadia 1297, San Miguel, Santiago</p>
            <p className="footer_contact_text font_serif">+56 9 7952 0623</p>
            <p className="footer_contact_text email_small">naamastudiospa@gmail.com</p>
            <p className="footer_contact_text sch_text">Horario: Lun-Vie 09-19h · Sáb 09-17h</p>
          </div>
        </div>

        <div className="footer_separator" />

        <div className="footer_lower">
          <span className="footer_copyright">© 2026 Naamá Studio SpA · Todos los derechos reservados</span>
          <span className="footer_author">Desarrollado con ♥ por Instituto Lael</span>
        </div>
      </footer>
    </div>
  );
};

export default App;