import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Instagram, Facebook, Calendar, ArrowUp } from 'lucide-react';
import Home from './pages/Home';
import WorldPage from './pages/WorldPage';
import StaffPage from './pages/StaffPage';
import EmpresasPage from './pages/EmpresasPage';
import BookingFlow from './pages/BookingFlow';
import BottomNav from './components/UI/BottomNav';
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
    window.addEventListener('scroll', handleScroll);
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

    const elements = document.querySelectorAll('[class*="reveal"]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <div className="naama_app">
      <ScrollToTop />
      
      {/* Desktop Navigation */}
      <nav className={`main_nav ${scrolled ? 'nav_scrolled' : ''}`}>
        <div className="nav_container">
          <Link to="/" className="logo_link">
            <img src={Logo} alt="Naamá Studio" className="nav_logo" />
          </Link>
          <div className="nav_links">
            <Link to="/" className={`nav_item ${location.pathname === '/' ? 'active' : ''}`}>Inicio</Link>
            <Link to="/staff" className={`nav_item ${location.pathname === '/staff' ? 'active' : ''}`}>Precios</Link>
            <Link to="/empresas" className={`nav_item ${location.pathname === '/empresas' ? 'active' : ''}`}>Empresas</Link>
            <Link to="/reservar" className="nav_cta_boutique">Agendar</Link>
          </div>
        </div>
      </nav>

      <main className="main_content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mundo/:mundoId" element={<WorldPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/empresas" element={<EmpresasPage />} />
          <Route path="/reservar" element={<BookingFlow />} />
        </Routes>
      </main>

      {/* Mobile Navigation (Ergonomic Bottom Nav) */}
      <BottomNav />

      <footer className="footer">
        <div className="footer_grid">
          <div className="footer_brand">
            <img src={Logo} alt="Naamá Studio" className="footer_logo" />
            <p className="footer_text">
              Naamá Studio: El arte de cuidar, la belleza de descansar. 
              Excelencia técnica en el corazón de San Miguel.
            </p>
          </div>
          
          <div className="footer_location">
            <span className="footer_label">Presencia</span>
            <p className="footer_text">Arcadia 1297, San Miguel</p>
            <p className="footer_text">SCL, Chile</p>
          </div>

          <div className="footer_social">
            <span className="footer_label">Digital</span>
            <div className="footer_social_links">
              <a href="https://www.instagram.com/naamastudio_/" target="_blank" rel="noopener noreferrer" className="social_link">Instagram</a>
              <a href="#" className="social_link">WhatsApp</a>
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
