import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mundos } from '../data/categories';
import SEOHead from '../components/SEOHead';
import TestimonialsSection from '../components/TestimonialsSection';
import InstagramFeed from '../components/InstagramFeed';
import { ArrowRight, Gift } from 'lucide-react';
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
        <img 
          src={SalonArch} 
          alt="Naamá Studio Atmosphere" 
          className="hero_video_bg" 
          fetchpriority="high"
          width="1920"
          height="1080"
        />
        <div className="hero_overlay"></div>
        <div className="hero_content">
          <span className="hero_promise reveal">Naamá Studio</span>
          <h1 className="hero_statement serif reveal delay-1">
            Gracia. Pausa. <br />
            Restauración.
          </h1>
          <p className="hero_subtitle serif reveal delay-1">
            "En un mundo que corre, nosotros nos detenemos. Naamá es el retorno a la dignidad del cuidado personal: sin prisas, sin artificios y con absoluta excelencia técnica."
          </p>
          <button 
            className="teaser_btn_gold reveal delay-2"
            onClick={() => navigate('/reservar')}
            aria-label="Agendar una sesión de descanso"
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
            <h2 className="serif worlds_heading">Ecosistemas del Cuidado</h2>
          </div>
          <p className="worlds_subtext">
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
              role="button"
              tabIndex={0}
              aria-label={`Explorar ${mundo.name}`}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/mundo/${mundo.id}`)}
            >
              <div className="world_gallery_img_box">
                <img 
                  src={mundo.image} 
                  alt={mundo.name} 
                  className="world_gallery_img" 
                  loading="lazy"
                  width="600"
                  height="750"
                />
                <div className="world_gallery_info_overlay">
                  <span className="mosaic_tag">Protocolo 0{index + 1}</span>
                  <h3 className="mosaic_title serif">{mundo.name}</h3>
                  <span className="mosaic_link_btn">Explorar Capas de Cuidado</span>
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
          <h2 className="serif essence_title">La Belleza es un Acto de Servicio.</h2>
          <p className="essence_text serif">
            "Creemos que el verdadero bienestar no necesita misticismo, necesita maestría. En Naamá Studio, honramos tu tiempo y tu confianza con higiene impecable, productos honestos y manos que entienden la arquitectura de tu belleza."
          </p>
          <p className="essence_text serif essence_text_secondary">
            Nuestro estándar es simple: que al salir, te sientas más tú misma que cuando entraste. <br />
            <span className="text_clay">Dulce. Placentera. Renovada.</span>
          </p>
          <div className="essence_divider"></div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* AI Agent Booking Teaser */}
      <section id="booking" className="booking_teaser reveal">
        <div className="teaser_content">
          <span className="world_item_tag teaser_tag">Hospitalidad 24/7</span>
          <h2 className="serif teaser_heading">Habla con nuestra <span className="text_sand">Agente IA</span>.</h2>
          <p className="teaser_text">
            ¿No sabes qué servicio necesitas? Nuestra asistente técnica te guiará por WhatsApp para diseñar tu sesión ideal.
          </p>
          <a 
            href="https://wa.me/56979520623?text=Hola! Necesito asesoría técnica para mi próxima sesión en Naamá Studio." 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Consultar con la Agente IA de Naamá por WhatsApp"
          >
            <button className="teaser_btn_gold">Consultar Agente IA</button>
          </a>
        </div>
      </section>

      {/* Gift Cards CTA */}
      <section className="home_giftcard reveal">
        <div className="container giftcard_content">
          <div className="giftcard_text_side">
            <span className="world_item_tag">Experiencias que se Regalan</span>
            <h2 className="serif giftcard_heading">Gift Cards <span className="text_clay">Digitales</span></h2>
            <p className="giftcard_desc">
              Regala una sesión de restauración a alguien especial. Personaliza el monto, el mensaje y el diseño de tu tarjeta.
            </p>
            <Link to="/gift-cards" className="giftcard_cta" aria-label="Crear una Gift Card digital">
              <Gift size={16} strokeWidth={1.5} />
              Crear Gift Card
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram Feed Teaser (API with Fallback) */}
      <InstagramFeed />

      {/* B2B CTA */}
      <section className="section-padding container reveal text-center">
          <span className="essence_label">Hospitalidad B2B</span>
          <h2 className="serif b2b_heading">Ingeniería del Cuidado para su <span className="text_clay">Empresa</span></h2>
          <p className="b2b_desc">
            Llevamos nuestra cultura de la pulcritud y el servicio de alto nivel al entorno corporativo. 
            Jornadas de restauración diseñadas para equipos que exigen la excelencia.
          </p>
          <button 
            className="nav_cta_boutique b2b_cta" 
            onClick={() => navigate('/empresas')}
            aria-label="Solicitar información B2B para empresas"
          >
            Solicitar Dossier B2B
          </button>
      </section>
    </div>
  );
};

export default Home;
