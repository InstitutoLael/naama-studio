import React, { useEffect } from 'react';
import MundoCard from '../components/UI/MundoCard';
import { mundos } from '../data/categories';
import SEOHead from '../components/SEOHead';
import { Sparkles, Quote, Award, ShieldCheck } from 'lucide-react';
import '../styles/Global.css';
import '../styles/Home.css';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home_container">
      <SEOHead 
        title="Experiencia de Lujo" 
        description="Bienvenida a Naamá Studio, la cumbre de la belleza y el bienestar en Santiago de Chile. El arte de ser tú." 
      />

      {/* Cinematic Hero */}
      <section className="hero">
        <div className="hero_bg"></div>
        <div className="hero_overlay_gradient"></div>
        <div className="hero_content">
          <div className="hero_badge reveal">Est. 2025 · Santiago</div>
          <span className="hero_subtitle reveal delay-1">Estética · Armonía · Plenitud</span>
          <h1 className="hero_title reveal delay-2">
            El Arte de <br />
            <span className="text-gold">Ser Única</span>
          </h1>
          <p className="hero_description reveal delay-3">
            Descubre un refugio de sofisticación donde la técnica magistral se encuentra con la paz absoluta. 
            No es solo belleza, es tu esencia elevada.
          </p>
          <div className="hero_actions reveal delay-3">
             <button className="premium_btn_gold">Ver Servicios</button>
             <button className="premium_btn_outline">Nuestra Historia</button>
          </div>
        </div>
        <div className="scroll_indicator">
           <div className="scroll_text">Deslizar</div>
           <div className="scroll_line"></div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="philosophy_section reveal">
        <div className="philosophy_grid">
          <div className="philosophy_image"></div>
          <div className="philosophy_content">
            <span className="section_label">Filosofía Naamá</span>
            <h2 className="serif">Belleza con <span className="text-gold">Propósito</span></h2>
            <p>
              En Naamá Studio, creemos que la belleza no es algo que se aplica, sino algo que se cultiva. 
              Cada tratamiento es un ritual de renovación, utilizando los productos más finos y las manos más expertas del país.
            </p>
            <div className="philosophy_stats">
              <div className="stat_item">
                < Award className="stat_icon" size={24} />
                <span>Excelencia Técnica</span>
              </div>
              <div className="stat_item">
                < ShieldCheck className="stat_icon" size={24} />
                <span>Cuidado Clínico</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Worlds Section */}
      <section className="mundos_section">
        <div className="section_header reveal">
          <h2 className="section_title serif">Los Mundos de Naamá</h2>
          <div className="section_divider"></div>
          <p className="hero_description">Siete universos diseñados para tu perfección técnica y paz interior.</p>
        </div>
        <div className="mundos_grid">
          {mundos.map((mundo, index) => (
            <div key={mundo.id} className={`reveal delay-${(index % 3) + 1}`}>
              <MundoCard mundo={mundo} />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials_section reveal">
        <Quote className="quote_icon" size={48} />
        <h2 className="serif testimonial_text">
          "Naamá no es solo un salón, es mi momento de paz en la ciudad. 
          La atención al detalle y el ambiente son simplemente de otro nivel."
        </h2>
        <span className="testimonial_author">— Clienta Exclusiva</span>
      </section>

      {/* Enterprise CTA */}
      <section className="enterprise_cta reveal">
        <div className="cta_content_wrapper">
          <h2 className="cta_title serif">Naamá <span className="text-gold">Empresas</span></h2>
          <div className="section_divider"></div>
          <p className="cta_description">
            Llevamos la excelencia de nuestro estudio a su corporación. 
            Jornadas de bienestar exclusivas diseñadas para equipos que exigen lo mejor.
          </p>
          <button className="premium_btn_gold">Solicitar Dossier</button>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .hero_overlay_gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 70% 30%, rgba(206, 181, 133, 0.05) 0%, transparent 70%);
          z-index: 1;
        }
        .hero_badge {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.4em;
          color: var(--gray-muted);
          margin-bottom: 1rem;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 15px;
          display: inline-block;
          border-radius: 100px;
        }
        .hero_actions { display: flex; gap: 20px; justify-content: center; }
        .premium_btn_gold {
          background: var(--gold-gradient);
          color: var(--onyx);
          padding: 18px 40px;
          border: none;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 0.7rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .premium_btn_gold:hover { transform: scale(1.05); filter: brightness(1.2); }
        .premium_btn_outline {
          background: transparent;
          color: var(--white-soft);
          padding: 18px 40px;
          border: 1px solid rgba(255,255,255,0.2);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 0.7rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .premium_btn_outline:hover { background: rgba(255,255,255,0.05); border-color: var(--white-soft); }

        .philosophy_section { padding: 150px 40px; max-width: 1400px; margin: 0 auto; }
        .philosophy_grid { display: grid; grid-template-columns: 1fr 1fr; gap: 100px; align-items: center; }
        .philosophy_image {
          height: 600px;
          background: url('/src/assets/hero-bg.png') no-repeat center/cover;
          border: var(--border-thin);
          position: relative;
        }
        .philosophy_image::after {
          content: '';
          position: absolute;
          inset: -20px;
          border: 1px solid rgba(206, 181, 133, 0.1);
          z-index: -1;
        }
        .section_label {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--champagne);
          text-transform: uppercase;
          letter-spacing: 0.5em;
          display: block;
          margin-bottom: 2rem;
        }
        .philosophy_content h2 { font-size: 4rem; margin-bottom: 2rem; }
        .philosophy_content p { color: var(--gray-muted); font-size: 1.1rem; line-height: 2; margin-bottom: 3rem; }
        .philosophy_stats { display: flex; gap: 40px; }
        .stat_item { display: flex; align-items: center; gap: 15px; color: var(--white-soft); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; }
        .stat_icon { color: var(--champagne); }

        .testimonials_section { padding: 150px 40px; text-align: center; background: var(--charcoal); border-top: var(--border-thin); border-bottom: var(--border-thin); }
        .quote_icon { color: var(--champagne); margin-bottom: 40px; opacity: 0.3; }
        .testimonial_text { font-size: 2.5rem; max-width: 1000px; margin: 0 auto 30px; font-style: italic; opacity: 0.9; }
        .testimonial_author { color: var(--champagne); font-weight: 800; text-transform: uppercase; letter-spacing: 0.3em; font-size: 0.7rem; }

        .cta_content_wrapper { max-width: 1200px; margin: 0 auto; background: var(--onyx); padding: 100px; border: var(--border-thin); position: relative; }
        .cta_content_wrapper::before { content: ''; position: absolute; inset: 10px; border: 1px solid rgba(255,255,255,0.02); pointer-events: none; }

        @media (max-width: 1024px) {
          .philosophy_grid { grid-template-columns: 1fr; gap: 60px; }
          .philosophy_image { height: 400px; }
          .testimonial_text { font-size: 1.5rem; }
        }
      `}} />
    </div>
  );
};

export default Home;
