import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
          <span className="hero_promise reveal">Naamá Studio</span>
          <h1 className="hero_statement serif reveal delay-1">
            Gracia. Pausa. <br />
            Restauración.
          </h1>
          <p className="hero_subtitle serif reveal delay-1" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px', color: 'rgba(43,43,43,0.7)', lineHeight: '1.4' }}>
            "En un mundo que corre, nosotros nos detenemos. Naamá es el retorno a la dignidad del cuidado personal: sin prisas, sin artificios y con absoluta excelencia técnica."
          </p>
          <button 
            className="teaser_btn_gold reveal delay-2"
            onClick={() => navigate('/reservar')}
          >
            Comienza tu Descanso
          </button>
        </div>
      </section>

      {/* Nuestros Mundos: Technical Gallery View */}
      <section className="home_worlds_section">
        <div className="section_header_boutique reveal">
          <div className="header_left">
            <span className="world_item_tag">Ingeniería Estética</span>
            <h2 className="serif" style={{ fontSize: '3.5rem' }}>Ecosistemas del Cuidado</h2>
          </div>
          <p style={{ maxWidth: '400px', fontSize: '0.9rem', color: 'rgba(43,43,43,0.5)', textAlign: 'right', lineHeight: '1.6' }}>
            Cada sección es un ecosistema técnico diseñado para tu restauración. <br />
            Explora nuestros protocolos basados en la ciencia del descanso.
          </p>
        </div>

        <div className="worlds_gallery_grid container">
          {mundos.map((mundo, index) => (
            <div 
              key={mundo.id} 
              className={`world_gallery_item reveal delay-${(index % 3) + 1}`}
              onClick={() => navigate(`/mundo/${mundo.id}`)}
            >
              <div className="world_gallery_img_box">
                <img src={mundo.image} alt={mundo.name} className="world_gallery_img" />
                <div className="world_gallery_info_overlay">
                  <span className="mosaic_tag">Protocolo 0{index + 1}</span>
                  <h3 className="mosaic_title serif">{mundo.name}</h3>
                  <button className="mosaic_link_btn">Explorar Capas de Cuidado</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Essence: Minimalist & Hospital-Grade */}
      <section className="home_essence reveal">
        <div className="container">
          <span className="essence_label">La Promesa de Valor</span>
          <h2 className="serif" style={{ fontSize: '3rem', marginBottom: '40px' }}>La Belleza es un Acto de Servicio.</h2>
          <p className="essence_text serif">
            "Creemos que el verdadero bienestar no necesita misticismo, necesita maestría. En Naamá Studio, honramos tu tiempo y tu confianza con higiene impecable, productos honestos y manos que entienden la arquitectura de tu belleza."
          </p>
          <p className="essence_text serif" style={{ fontSize: '1.5rem', marginTop: '-30px', opacity: 0.9 }}>
            Nuestro estándar es simple: que al salir, te sientas más tú misma que cuando entraste. <br />
            <span style={{ color: 'var(--accent-clay)' }}>Dulce. Placentera. Renovada.</span>
          </p>
          <div style={{ height: '1px', background: 'var(--accent-clay)', width: '60px', margin: '0 auto' }}></div>
        </div>
      </section>

      {/* AI Agent Booking Teaser */}
      <section id="booking" className="booking_teaser reveal">
        <div className="teaser_content">
          <span className="world_item_tag" style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '30px' }}>Hospitalidad 24/7</span>
          <h2 className="serif" style={{ fontSize: '3.5rem', marginBottom: '30px' }}>Habla con nuestra <span style={{ color: 'var(--accent-sand)' }}>Agente IA</span>.</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0 auto 40px' }}>
            ¿No sabes qué servicio necesitas? Nuestra asistente técnica te guiará por WhatsApp para diseñar tu sesión ideal.
          </p>
          <a href="https://wa.me/56979520623?text=Hola! Necesito asesoría técnica para mi próxima sesión en Naamá Studio." target="_blank" rel="noopener noreferrer">
             <button className="teaser_btn_gold">Consultar Agente IA</button>
          </a>
        </div>
      </section>

      {/* Instagram Feed Teaser */}
      <section className="home_instagram reveal">
        <div className="container">
          <span className="essence_label">Instagram</span>
          <h2 className="serif" style={{ fontSize: '3rem', marginBottom: '50px' }}>Síguenos en <span style={{ color: 'var(--accent-clay)' }}>@naamastudio_</span></h2>
          <div className="instagram_grid">
             <div className="insta_item"><img src="/assets/salon-arch.png" alt="Naamá Studio Atmosphere" /></div>
             <div className="insta_item"><img src="/assets/labor-hands.png" alt="Técnica y Maestría" /></div>
             <div className="insta_item"><img src="/assets/mirada-bg.png" alt="Detalle Terapéutico" /></div>
             <div className="insta_item"><img src="/assets/hero-bg.png" alt="Excelencia Naamá" /></div>
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
                <span className="world_item_tag">Filosofía Naamá</span>
                <h3 className="serif" style={{ fontSize: '1.8rem', margin: '20px 0' }}>Por qué el silencio es el mejor cosmético: La filosofía detrás de nuestro salón.</h3>
                <span className="footer_text" style={{ fontSize: '0.8rem' }}>Marzo 12, 2025</span>
             </div>
          </div>
          <div className="diario_card reveal delay-2">
             <div className="diario_img_wrapper"><img src={SalonArch} alt="Diario 2" /></div>
             <div className="diario_info">
                <span className="world_item_tag">Ciencia & Bienestar</span>
                <h3 className="serif" style={{ fontSize: '1.8rem', margin: '20px 0' }}>La verdad sobre la hidratación: Ciencia vs. Mitos.</h3>
                <span className="footer_text" style={{ fontSize: '0.8rem' }}>Marzo 05, 2025</span>
             </div>
          </div>
          <div className="diario_card reveal delay-3">
             <div className="diario_img_wrapper"><img src={SalonArch} alt="Diario 3" /></div>
             <div className="diario_info">
                <span className="world_item_tag">Guía de Técnica</span>
                <h3 className="serif" style={{ fontSize: '1.8rem', margin: '20px 0' }}>Guía de mantenimiento en casa: Prolongando la gracia de tu corte.</h3>
                <span className="footer_text" style={{ fontSize: '0.8rem' }}>Marzo 01, 2025</span>
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
