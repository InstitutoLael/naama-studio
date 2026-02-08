import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { MapPin, Mail, Instagram, Facebook } from 'lucide-react';
import Home from './pages/Home';
import WorldPage from './pages/WorldPage';
import StaffPage from './pages/StaffPage';
import EmpresasPage from './pages/EmpresasPage';
import './styles/Global.css';
import './styles/App.css';

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

  return (
    <div className="naama_app">
      <nav className={`main_nav ${scrolled ? 'nav_scrolled' : ''}`}>
        <div className="nav_container">
          <Link to="/" className="logo serif">NAAMÁ</Link>
          <div className="nav_links">
            <Link to="/" className={`nav_item ${location.pathname === '/' ? 'active' : ''}`}>Inicio</Link>
            <Link to="/staff" className={`nav_item ${location.pathname === '/staff' ? 'active' : ''}`}>Precios</Link>
            <Link to="/empresas" className={`nav_item ${location.pathname === '/empresas' ? 'active' : ''}`}>Empresas</Link>
            <a href="#contacto" className="nav_item nav_cta">Citar</a>
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

      <footer className="footer" id="contacto">
        <div className="footer_grid">
          <div className="footer_brand">
            <h2 className="serif">NAAMÁ STUDIO</h2>
            <p className="footer_text">
              La cumbre de la belleza y el bienestar en Santiago. 
              Un espacio diseñado para la plenitud y la perfección técnica.
            </p>
          </div>
          
          <div className="footer_contact">
            <span className="footer_label">Ubicación</span>
            <p className="footer_text">
              <MapPin size={14} style={{ marginRight: '8px' }} />
              Arcadia 1297, San Miguel, Santiago
            </p>
            <p className="footer_text" style={{ marginTop: '10px' }}>
              <Mail size={14} style={{ marginRight: '8px' }} />
              contacto@naamastudio.cl
            </p>
          </div>

          <div className="footer_social">
            <span className="footer_label">Síguenos</span>
            <div className="nav_links" style={{ display: 'flex' }}>
              <a href="#" className="footer_link"><Instagram size={20} /></a>
              <a href="#" className="footer_link"><Facebook size={20} /></a>
            </div>
          </div>
        </div>
        
        <div className="footer_bottom">
          <p>&copy; 2025 Naamá Studio. Todos los derechos reservados.</p>
          <p>Handcrafted for Vivy & Gaby</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
