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
          </div>

          <div className="footer_social">
            <span className="footer_label">Digital</span>
            <div className="footer_social_links">
              <a href="https://www.instagram.com/naamastudio_/" target="_blank" rel="noopener noreferrer" className="social_link" aria-label="Instagram de Naamá Studio">Instagram</a>
              <a href="https://wa.me/56979520623" target="_blank" rel="noopener noreferrer" className="social_link" aria-label="WhatsApp de Naamá Studio">WhatsApp Oficial</a>
              <a href="mailto:naamastudiospa@gmail.com" className="social_link" aria-label="Email de Naamá Studio">naamastudiospa@gmail.com</a>
            </div>
          </div>
        </div>
        
        <div className="footer_credits">
          <p>© 2025 Naamá Studio. Todos los derechos reservados.</p>
          <p>Hospitalidad & Técnica</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
