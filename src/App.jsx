import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import WorldPage from './pages/WorldPage';
import StaffPage from './pages/StaffPage';
import EmpresasPage from './pages/EmpresasPage';
import BookingFlow from './pages/BookingFlow';
import NuestraHistoria from './pages/NuestraHistoria';
import ContactPage from './pages/ContactPage';
import GalleryPage from './pages/GalleryPage';
import GiftCardsPage from './pages/GiftCardsPage';
import NotFound from './pages/NotFound';
import BottomNav from './components/UI/BottomNav';
import ScrollProgress from './components/UI/ScrollProgress';
import CustomCursor from './components/UI/CustomCursor';
import ThemeToggle from './components/UI/ThemeToggle';
import PageTransition from './components/PageTransition';
import Logo from './assets/naama-studio.png';
import './styles/Global.css';
import './styles/App.css';

// Scroll to top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reveal effect on scroll (Blur-in elevation)
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, observerOptions);

    // Slight delay to let DOM render after page transition
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('[class*="reveal"]');
      elements.forEach(el => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);

  return (
    <div className="naama_app">
      <ScrollToTop />
      <ScrollProgress />
      <CustomCursor />
      
      {/* Desktop Navigation */}
      <nav className={`main_nav ${scrolled ? 'nav_scrolled' : ''}`} aria-label="Navegación principal">
        <div className="nav_container">
          <Link to="/" className="logo_link" aria-label="Ir al inicio de Naamá Studio">
            <img src={Logo} alt="Naamá Studio" className="nav_logo" />
          </Link>
          <div className="nav_links">
            <Link to="/" className={`nav_item ${location.pathname === '/' ? 'active' : ''}`}>Inicio</Link>
            <Link to="/staff" className={`nav_item ${location.pathname === '/staff' ? 'active' : ''}`}>Precios</Link>
            <Link to="/galeria" className={`nav_item ${location.pathname === '/galeria' ? 'active' : ''}`}>Galería</Link>
            <Link to="/empresas" className={`nav_item ${location.pathname === '/empresas' ? 'active' : ''}`}>Empresas</Link>
            <Link to="/contacto" className={`nav_item ${location.pathname === '/contacto' ? 'active' : ''}`}>Contacto</Link>
            <ThemeToggle />
            <Link to="/reservar" className="nav_cta_boutique" aria-label="Agendar una sesión">Agendar</Link>
          </div>
        </div>
      </nav>

      <main className="main_content">
        <PageTransition>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/mundo/:mundoId" element={<WorldPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/empresas" element={<EmpresasPage />} />
            <Route path="/reservar" element={<BookingFlow />} />
            <Route path="/nuestra-historia" element={<NuestraHistoria />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/galeria" element={<GalleryPage />} />
            <Route path="/gift-cards" element={<GiftCardsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </main>

      {/* Mobile Navigation (Ergonomic Bottom Nav) */}
      <BottomNav />

      {/* Botones Flotantes: WhatsApp e Instagram */}
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
        <div className="footer_grid">
          <div className="footer_brand">
            <img src={Logo} alt="Naamá Studio" className="footer_logo" />
            <p className="footer_text">
              Naamá Studio: El arte de cuidar, la belleza de descansar. 
              Excelencia técnica en el corazón de San Miguel.
            </p>
          </div>
          
          <div className="footer_nav_col">
            <span className="footer_label">Navegar</span>
            <Link to="/staff" className="footer_link">Precios & Staff</Link>
            <Link to="/galeria" className="footer_link">Galería</Link>
            <Link to="/gift-cards" className="footer_link">Gift Cards</Link>
            <Link to="/empresas" className="footer_link">Empresas</Link>
            <Link to="/nuestra-historia" className="footer_link">Nuestra Historia</Link>
            <Link to="/contacto" className="footer_link">Contacto</Link>
          </div>

          <div className="footer_location">
            <span className="footer_label">Presencia</span>
            <p className="footer_text">Arcadia 1297, San Miguel</p>
            <p className="footer_text">SCL, Chile</p>
            <span className="footer_label" style={{ marginTop: '20px' }}>Horarios</span>
            <p className="footer_text" style={{ fontSize: '0.8rem' }}>Lun – Vie: 09:00 – 19:00</p>
            <p className="footer_text" style={{ fontSize: '0.8rem' }}>Sábado: 09:00 – 17:00</p>
            <p className="footer_text" style={{ fontSize: '0.8rem' }}>Domingo: Cerrado</p>
          </div>

          <div className="footer_social">
            <span className="footer_label">Digital</span>
            <div className="footer_social_links">
              <a href="https://www.instagram.com/naamastudio_/" target="_blank" rel="noopener noreferrer" className="social_link" aria-label="Instagram de Naamá Studio">Instagram @naamastudio_</a>
              <a href="https://wa.me/56979520623" target="_blank" rel="noopener noreferrer" className="social_link" aria-label="WhatsApp de Naamá Studio">WhatsApp +56 9 7952 0623</a>
              <a href="mailto:naamastudiospa@gmail.com" className="social_link" aria-label="Email de Naamá Studio">naamastudiospa@gmail.com</a>
            </div>
          </div>
        </div>
        
        <div className="footer_credits">
          <p>© 2026 Naamá Studio. Todos los derechos reservados.</p>
          <p>Hospitalidad & Técnica</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
