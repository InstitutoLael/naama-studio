import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { mundos } from '../data/categories';
import SEOHead from '../components/shared/SEOHead';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import InstagramFeed from '../components/sections/InstagramFeed';
import { Gift, ArrowRight } from 'lucide-react';
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
        title="Naamá Studio · Belleza Honesta, Descanso Real"
        description="Un refugio de paz donde la tradición de una casa patrimonial se encuentra con la alta tecnología del bienestar. San Miguel, Santiago."
      />

      {/* ── HERO ── */}
      <section className="hero_section">
        <img
          src={SalonArch}
          alt="Interior de Naamá Studio"
          className="hero_bg_img"
          fetchpriority="high"
          width="1920"
          height="1080"
        />
        <div className="hero_overlay" />
        
        <div className="hero_content">
          <motion.span 
            className="hero_eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Beauty & Wellness House · San Miguel, Santiago
          </motion.span>
          
          <h1 className="hero_statement">
            <motion.div
              className="line_1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            >
              Tu momento
            </motion.div>
            <motion.div
              className="line_2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.8, ease: "easeOut" }}
            >
              de volver
            </motion.div>
            <motion.div
              className="line_3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
            >
              a ti.
            </motion.div>
          </h1>
          
          <motion.p 
            className="hero_subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            Servicios de belleza y bienestar en un espacio pensado
            para que te reconectes contigo misma.
          </motion.p>
          
          <motion.div 
            className="hero_actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <Link to="/reservar" className="btn_hero_primary">
              Reservar mi experiencia
            </Link>
            <Link to="/staff" className="btn_hero_secondary">
              Ver servicios →
            </Link>
          </motion.div>
        </div>

        <div className="hero_scroll_hint" aria-hidden="true">
          <span className="scroll_label">Descubre</span>
          <span className="scroll_line" />
        </div>

        <div className="hero_stats">
          180+ Clientas · 5 Especialistas · 4.9★ Google
        </div>
      </section>

      {/* ── VALORES EN 3 PILARES ── */}
      <section className="home_pillars">
        <div className="container pillars_grid">
          <div className="pillar_item reveal delay-1">
            <span className="pillar_num">01</span>
            <h3 className="pillar_title serif">Técnica sin Compromiso</h3>
            <p className="pillar_text">
              Insumos internacionales certificados y especialización constante en cada profesional del equipo.
            </p>
          </div>
          <div className="pillar_item reveal delay-2">
            <span className="pillar_num">02</span>
            <h3 className="pillar_title serif">Higiene de Grado Médico</h3>
            <p className="pillar_text">
              Esterilización en autoclave, insumos desechables y protocolos de bioseguridad en cada servicio.
            </p>
          </div>
          <div className="pillar_item reveal delay-3">
            <span className="pillar_num">03</span>
            <h3 className="pillar_title serif">Tiempo Exclusivo para Ti</h3>
            <p className="pillar_text">
              Bloques de atención personalizados. Sin apuros, sin esperas, con toda la atención en tu bienestar.
            </p>
          </div>
        </div>
      </section>

      {/* ── ECOSISTEMAS / MUNDOS ── */}
      <section className="home_worlds_section">
        <div className="section_header_boutique reveal">
          <div className="header_left">
            <span className="world_item_tag">Ingeniería Estética</span>
            <h2 className="serif worlds_heading">Ecosistemas del Cuidado</h2>
          </div>
          <p className="worlds_subtext">
            Cada sección es un universo técnico diseñado para tu restauración.
            Explora nuestros protocolos basados en la ciencia del bienestar.
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
                  <span className="mosaic_link_btn">Explorar</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ESENCIA / MANIFIESTO ── */}
      <section className="home_essence">
        <div className="container essence_inner reveal">
          <span className="essence_label">Nuestra Promesa</span>
          <h2 className="serif essence_title">
            La belleza es un acto<br />de servicio honesto.
          </h2>
          <p className="essence_text serif">
            "Creemos que el verdadero bienestar no necesita misticismo, necesita maestría.
            En Naamá Studio honramos tu tiempo y tu confianza con higiene impecable,
            productos honestos y manos que entienden la arquitectura de tu belleza."
          </p>
          <p className="essence_signature serif">
            Que al salir, te sientas más tú misma que cuando entraste.
            <br />
            <em className="text_gold">Dulce. Placentera. Renovada.</em>
          </p>
          <div className="essence_divider" />
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <TestimonialsSection />

      {/* ── AGENTE IA / WHATSAPP ── */}
      <section className="booking_teaser reveal">
        <div className="container teaser_inner">
          <div className="teaser_text_side">
            <span className="world_item_tag teaser_eyebrow">Hospitalidad 24/7</span>
            <h2 className="serif teaser_heading">
              ¿No sabes qué<br />necesitas hoy?
            </h2>
            <p className="teaser_body">
              Nuestra asistente técnica te guía por WhatsApp para diseñar
              tu sesión ideal. Sin compromiso, sin confusión.
            </p>
            <a
              href="https://wa.me/56979520623?text=Hola! Necesito asesoría para mi próxima sesión en Naamá Studio."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Consultar por WhatsApp"
              className="btn_light"
            >
              Consultar ahora
              <ArrowRight size={14} strokeWidth={1.5} />
            </a>
          </div>
          <div className="teaser_deco" aria-hidden="true">
            <span className="deco_num serif">N.</span>
          </div>
        </div>
      </section>

      {/* ── GIFT CARDS ── */}
      <section className="home_giftcard reveal">
        <div className="container giftcard_inner">
          <span className="world_item_tag">Experiencias que se Regalan</span>
          <h2 className="serif giftcard_heading">
            Gift Cards <span className="text_gold">Digitales</span>
          </h2>
          <p className="giftcard_desc">
            Regala una sesión de restauración a alguien especial.
            Personaliza el monto, el mensaje y el diseño de tu tarjeta al instante.
          </p>
          <Link to="/gift-cards" className="btn_primary" aria-label="Crear una Gift Card digital">
            <Gift size={15} strokeWidth={1.5} />
            Crear Gift Card
          </Link>
        </div>
      </section>

      {/* ── INSTAGRAM FEED ── */}
      <InstagramFeed />

      {/* ── B2B ── */}
      <section className="home_b2b reveal">
        <div className="container b2b_inner">
          <span className="world_item_tag">Hospitalidad Corporativa</span>
          <h2 className="serif b2b_heading">
            Bienestar para su <span className="text_walnut">Empresa</span>
          </h2>
          <p className="b2b_desc">
            Llevamos nuestra cultura de la pulcritud y el servicio de alto nivel
            al entorno corporativo. Jornadas de restauración para equipos
            que exigen excelencia.
          </p>
          <button
            className="btn_primary"
            onClick={() => navigate('/empresas')}
            aria-label="Solicitar información B2B"
          >
            Solicitar Dossier B2B
            <ArrowRight size={15} strokeWidth={1.5} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;