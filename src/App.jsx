import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Search, User, Clock, Info, CheckCircle, Sparkles, Scissors, Heart, MapPin } from 'lucide-react';
import Home from './pages/Home';
import WorldPage from './pages/WorldPage';
import StaffPage from './pages/StaffPage';
import EmpresasPage from './pages/EmpresasPage';

const App = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="naama-app">
      <nav className={`main-nav ${!isHome ? 'nav-scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <h2 className="serif">NAAMÁ</h2>
          </Link>
          <div className="nav-links">
            <Link to="/staff" className="nav-link">Staff</Link>
            <Link to="/empresas" className="nav-link highlight">Empresas</Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mundo/:mundoId" element={<WorldPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/empresas" element={<EmpresasPage />} />
      </Routes>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4 className="accent">NAAMÁ STUDIO</h4>
            <p className="footer-text">Belleza, Bienestar & Armonía</p>
          </div>
          <div className="footer-section">
            <h4 className="accent">Ubicación</h4>
            <p className="footer-text"><MapPin size={14} inline /> Arcadia 1297, San Miguel, Santiago</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Naamá Studio. Todos los derechos reservados.</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .naama-app { min-height: 100vh; display: flex; flex-direction: column; }
        .main-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: var(--transition); padding: 30px 0; }
        .nav-scrolled { background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); padding: 15px 0; border-bottom: 1px solid var(--border-color); }
        .nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
        .nav-logo h2 { color: var(--text-primary); letter-spacing: 4px; font-size: 1.5rem; }
        .nav-links { display: flex; gap: 30px; align-items: center; }
        .nav-link { color: var(--text-primary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; transition: var(--transition); }
        .nav-link:hover { color: var(--accent-color); }
        .nav-link.highlight { background: var(--accent-color); color: #000; padding: 8px 16px; border-radius: 4px; }
        .nav-link.highlight:hover { background: #fff; }

        .footer { background: #050505; border-top: 1px solid var(--border-color); padding: 60px 20px 20px; margin-top: auto; }
        .footer-content { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; }
        .accent { color: var(--accent-color); margin-bottom: 15px; font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase; }
        .footer-text { color: var(--text-secondary); font-size: 0.85rem; line-height: 1.6; }
        .footer-bottom { max-width: 1200px; margin: 40px auto 0; padding-top: 20px; border-top: 1px solid #111; text-align: center; color: #444; font-size: 0.75rem; }
      `}} />
    </div>
  );
};

export default App;
