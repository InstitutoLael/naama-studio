import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Instagram, Facebook, Calendar, ArrowUp } from 'lucide-react';
import Home from './pages/Home';
import WorldPage from './pages/WorldPage';
import StaffPage from './pages/StaffPage';
import EmpresasPage from './pages/EmpresasPage';
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

  // Reveal effect on scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
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
      <nav className={`main_nav ${scrolled ? 'nav_scrolled' : ''}`}>
        <div className="nav_container">
          <Link to="/" className="logo_link">
            <img src={Logo} alt="Naamá Studio" className="nav_logo" />
          </Link>
          <div className="nav_links">
            <Link to="/" className={`nav_item ${location.pathname === '/' ? 'active' : ''}`}>Inicio</Link>
            <Link to="/staff" className={`nav_item ${location.pathname === '/staff' ? 'active' : ''}`}>Consulta de Valores</Link>
            <Link to="/empresas" className={`nav_item ${location.pathname === '/empresas' ? 'active' : ''}`}>Empresas</Link>
            <a href="https://naamastudio.setmore.com/" target="_blank" rel="noopener noreferrer" className="nav_item nav_cta">Citar</a>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mundo/:mundoId" element={<WorldPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/empresas" element={<EmpresasPage />} />
        </Routes>
      </main>

      <a href="https://naamastudio.setmore.com/" className="sticky_booking" target="_blank" rel="noopener noreferrer">
        Agendar Cita
      </a>

      <footer className="footer">
        <div className="footer_grid">
          <div className="footer_brand">
            <img src={Logo} alt="Naamá Studio" className="footer_logo" />
            <p className="footer_text">
              Un estudio dedicado a la excelencia técnica y el descanso personal. 
              Ubicado en el corazón de San Miguel, Santiago.
            </p>
          </div>
          
          <div className="footer_contact">
            <span className="footer_label">Ubicación & Contacto</span>
            <ul className="footer_links">
              <li className="footer_text">Arcadia 1297, San Miguel</li>
              <li className="footer_text">Santiago, Chile</li>
              <li className="footer_text">+56 9 XXXX XXXX</li>
            </ul>
          </div>

          <div className="footer_social">
            <span className="footer_label">Presencia Digital</span>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="https://www.instagram.com/naamastudio_/" target="_blank" rel="noopener noreferrer" className="footer_link"><Instagram size={18} /></a>
              <a href="#" className="footer_link"><Facebook size={18} /></a>
            </div>
          </div>
        </div>
        
        <div className="footer_bottom">
          <p>&copy; 2025 Naamá Studio. Todos los derechos reservados.</p>
          <p>Hospitalidad & Estética</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
