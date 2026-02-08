import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mundos } from '../data/categories';
import SEOHead from '../components/SEOHead';
import { ArrowRight } from 'lucide-react';
import SalonArch from '../assets/salon-arch.png';
import '../styles/Global.css';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home_page">
      <SEOHead 
        title="Belleza Honesta · Descanso Real" 
        description="Gracia, Pulcritud y Descanso. La cuna de la ingeniería estética y hospitalaria en Santiago." 
      />

      {/* God Level Hero: Cinematic & Direct */}
      <section className="home_hero">
        <img src={SalonArch} alt="Naamá Studio Atmosphere" className="hero_video_bg" />
        <div className="hero_overlay"></div>
        <div className="hero_content">
          <span className="hero_promise reveal">Belleza Honesta · Descanso Real</span>
          <h1 className="hero_statement serif reveal delay-1">
            El arte de cuidar, <br />
            la belleza de descansar.
          </h1>
          <button 
            className="teaser_btn_gold reveal delay-2"
            onClick={() => navigate('/reservar')}
          >
            Comenzar Consulta
          </button>
        </div>
      </section>

      {/* The Essence: Minimalist & Hospital-Grade */}
      <section className="home_essence reveal">
        <div className="essence_content">
          <span className="essence_label">Nuestra Esencia</span>
          <p className="essence_text serif">
            Naamá procede de lo placentero y lo agradable. 
            Entendemos la estética como un acto de servicio técnico y hospitalario hacia tu persona.
          </p>
          <div style={{ height: '1px', background: 'var(--accent-clay)', width: '60px', margin: '0 auto' }}></div>
        </div>
      </section>

      {/* Experience Rail: Horizontal Swipe-ready */}
      <section className="home_worlds_section">
        <div className="section_header_boutique reveal">
          <div className="header_left">
            <span className="world_item_tag">Catálogo Editorial</span>
            <h2 className="serif" style={{ fontSize: '3.5rem' }}>Nuestros Mundos</h2>
          </div>
          <p style={{ maxWidth: '300px', fontSize: '0.85rem', color: 'rgba(43,43,43,0.5)', textAlign: 'right' }}>
            Cada mundo es un ecosistema de técnica y bienestar diseñado para tu restauración.
          </p>
        </div>

        <div className="worlds_rail">
          {mundos.map((mundo, index) => (
            <div 
              key={mundo.id} 
              className={`world_rail_item reveal delay-${(index % 3) + 1}`}
              onClick={() => navigate(`/mundo/${mundo.id}`)}
            >
              <div className="world_item_image_wrapper">
                <img src={`/src/assets/${mundo.image}`} alt={mundo.name} className="world_item_image" />
              </div>
              <div className="world_item_info">
                <span className="world_item_tag">Mundo 0{index + 1}</span>
                <h3 className="world_item_name serif">{mundo.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <div style={{ height: '1px', background: 'var(--accent-clay)', flex: 1 }}></div>
                   <ArrowRight size={20} strokeWidth={1} color="var(--accent-clay)" />
                </div>
              </div>
            </div>
          ))}
          {/* Decorative Spacer for end of rail */}
          <div style={{ minWidth: '60px' }}></div>
        </div>
      </section>

      {/* Intelligent Booking Teaser */}
      <section id="booking" className="booking_teaser reveal">
        <div className="teaser_content">
          <span className="world_item_tag" style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '30px' }}>Atención Técnica</span>
          <h2 className="serif" style={{ fontSize: '3.5rem', marginBottom: '30px' }}>Diseñamos tu espacio de <span style={{ color: 'var(--accent-sand)' }}>restauración</span>.</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto 40px' }}>
            Inicia tu proceso de reserva a través de nuestra consulta digital inteligente. 
            Priorizamos tu tiempo y tus objetivos estéticos.
          </p>
          <Link to="/reservar">
             <button className="teaser_btn_gold">Agendar Cita</button>
          </Link>
        </div>
      </section>

      {/* Instagram Feed Teaser */}
      <section className="home_instagram reveal">
        <div className="container">
          <span className="essence_label">Instagram</span>
          <h2 className="serif" style={{ fontSize: '3rem', marginBottom: '50px' }}>Síguenos en <span style={{ color: 'var(--accent-clay)' }}>@naamastudio_</span></h2>
          <div className="instagram_grid">
             <div className="insta_item"><img src={SalonArch} alt="Insta 1" /></div>
             <div className="insta_item"><img src={`/src/assets/hero-bg.png`} alt="Insta 2" /></div>
             <div className="insta_item"><img src={`/src/assets/labor-hands.png`} alt="Insta 3" /></div>
             <div className="insta_item"><img src={`/src/assets/mirada-bg.png`} alt="Insta 4" /></div>
          </div>
          <a href="https://www.instagram.com/naamastudio_/" target="_blank" rel="noopener noreferrer" className="nav_item" style={{ marginTop: '50px', display: 'inline-block', opacity: 1, borderBottom: '1px solid var(--accent-sand)' }}>
            Ver Perfil Oficial
          </a>
        </div>
      </section>

      {/* Diario / Blog Placeholder */}
      <section className="home_diario container">
        <div className="section_header_boutique reveal" style={{ padding: 0 }}>
          <div className="header_left">
            <span className="world_item_tag">Diario Naamá</span>
            <h2 className="serif" style={{ fontSize: '3rem' }}>Consejos & Técnica</h2>
          </div>
          <button className="nav_item" style={{ opacity: 1, borderBottom: '1px solid var(--accent-clay)' }}>Ver Todo</button>
        </div>
        
        <div className="diario_rail">
          <div className="diario_card reveal delay-1">
             <div className="diario_img_wrapper"><img src={SalonArch} alt="Diario 1" /></div>
             <div className="diario_info">
                <span className="world_item_tag">Cuidado Capilar</span>
                <h3 className="serif" style={{ fontSize: '1.8rem', margin: '20px 0' }}>La ciencia del brillo natural: Protocolo post-coloración.</h3>
                <span className="footer_text" style={{ fontSize: '0.8rem' }}>Marzo 12, 2025</span>
             </div>
          </div>
          <div className="diario_card reveal delay-2">
             <div className="diario_img_wrapper"><img src={SalonArch} alt="Diario 2" /></div>
             <div className="diario_info">
                <span className="world_item_tag">Estética Facial</span>
                <h3 className="serif" style={{ fontSize: '1.8rem', margin: '20px 0' }}>Reparación cutánea en ambientes urbanos: Lo que tu piel calla.</h3>
                <span className="footer_text" style={{ fontSize: '0.8rem' }}>Marzo 05, 2025</span>
             </div>
          </div>
        </div>
      </section>

      <section className="section-padding container reveal" style={{ textAlign: 'center' }}>
          <span className="essence_label">Hospitalidad B2B</span>
          <h2 className="serif" style={{ fontSize: '3rem', marginBottom: '40px' }}>Ingeniería del Cuidado para su <span style={{ color: 'var(--accent-clay)' }}>Empresa</span></h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 50px', color: 'rgba(43,43,43,0.6)', lineHeight: '1.8' }}>
            Llevamos nuestra cultura de la pulcritud y el servicio de alto nivel al entorno corporativo. 
            Jornadas de restauración diseñadas para equipos que exigen la excelencia.
          </p>
          <button 
            className="nav_cta_boutique" 
            style={{ padding: '20px 50px', fontSize: '0.7rem' }}
            onClick={() => navigate('/empresas')}
          >
            Solicitar Dossier B2B
          </button>
      </section>
    </div>
  );
};

export default Home;
