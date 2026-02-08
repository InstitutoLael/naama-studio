import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mundos } from '../data/categories';
import SEOHead from '../components/SEOHead';
import { ArrowRight } from 'lucide-react';
import SalonArch from '../assets/salon-arch.png';
import '../styles/Global.css';
import '../styles/Home.css';

const Home = () => {
  const [activeMundo, setActiveMundo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home_page">
      <SEOHead 
        title="El Arte de Cuidar" 
        description="Gracia, Pulcritud y Descanso. Experiencia de bienestar premium en Santiago." 
      />

      {/* Gallery Hero */}
      <section className="home_hero">
        <h1 className="hero_statement serif reveal">
          El arte de cuidar, <br />
          la belleza de descansar.
        </h1>
        <div className="hero_portrait_wrapper reveal delay-2">
          <img 
            src={SalonArch} 
            alt="Naamá Studio Atmosphere" 
            className="hero_portrait" 
          />
        </div>
      </section>

      {/* The Essence */}
      <section className="home_essence reveal">
        <div className="essence_content">
          <span className="essence_title">Nuestra Esencia</span>
          <p className="essence_text serif">
            Naamá procede de lo placentero y lo agradable. 
            Entendemos la estética como un acto de servicio técnico y hospitalario hacia tu persona.
          </p>
          <div className="section_divider" style={{ background: 'var(--sand-beige)', width: '40px', margin: '40px auto' }}></div>
        </div>
      </section>

      {/* Technical Services List */}
      <section className="home_services_section container">
        <div className="services_layout">
          <div className="services_list">
            <span className="footer_label" style={{ marginBottom: '40px', display: 'block' }}>Nuestros Mundos</span>
            {mundos.map((mundo, index) => (
              <div 
                key={mundo.id} 
                className="service_list_item reveal"
                onMouseEnter={() => setActiveMundo(mundo.id)}
                onMouseLeave={() => setActiveMundo(null)}
                onClick={() => navigate(`/mundo/${mundo.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="service_number">0{index + 1}</span>
                  <span>{mundo.name}</span>
                </div>
                <ArrowRight size={24} strokeWidth={1} style={{ opacity: activeMundo === mundo.id ? 1 : 0, transition: '0.3s' }} />
              </div>
            ))}
          </div>

          <div className="services_visual_container reveal delay-2">
            {mundos.map((mundo) => (
              <img 
                key={mundo.id}
                src={`/src/assets/${mundo.image}`} 
                alt={mundo.name}
                className={`service_preview_img ${activeMundo === mundo.id ? 'active' : ''}`}
              />
            ))}
            {/* Default image when nothing is hovered */}
            <img 
              src={SalonArch} 
              alt="Naamá Default"
              className={`service_preview_img ${!activeMundo ? 'active' : ''}`}
            />
          </div>
        </div>
      </section>

      <section className="section-padding container reveal" style={{ textAlign: 'center' }}>
          <h2 className="serif" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Atención a Empresas</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 40px', color: 'rgba(26,26,26,0.6)' }}>
            Llevamos nuestra ingeniería del bienestar al entorno corporativo con jornadas de restauración y cuidado para equipos de alto rendimiento.
          </p>
          <button 
            className="premium_btn" 
            style={{ 
              background: 'var(--carbon-black)', 
              color: '#fff', 
              padding: '20px 40px', 
              border: 'none', 
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontSize: '0.7rem'
            }}
            onClick={() => navigate('/empresas')}
          >
            Explorar Servicios B2B
          </button>
      </section>
    </div>
  );
};

export default Home;
