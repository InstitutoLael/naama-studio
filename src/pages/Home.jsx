import React, { useEffect } from 'react';
import MundoCard from '../components/UI/MundoCard';
import { mundos } from '../data/categories';
import SEOHead from '../components/SEOHead';
import '../styles/Global.css';
import '../styles/Home.css';

const Home = () => {
  useEffect(() => {
    // Reveal animation on scroll could be added here
  }, []);

  return (
    <div className="home_container">
      <SEOHead 
        title="Clase Mundial" 
        description="Bienvenida a Naamá Studio, la cumbre de la belleza y el bienestar en Santiago de Chile." 
      />

      <section className="hero">
        <div className="hero_bg"></div>
        <div className="hero_content">
          <span className="hero_subtitle reveal delay-1">Estética · Armonía · Plenitud</span>
          <h1 className="hero_title reveal delay-2">
            El Arte de <br />
            <span className="text-gold">Ser Tú</span>
          </h1>
          <p className="hero_description reveal delay-3">
            Descubre un refugio de sofisticación donde cada detalle ha sido diseñado para elevar tu esencia.
          </p>
          <div className="reveal delay-3">
             <button className="premium_btn">Reservar Experiencia</button>
          </div>
        </div>
        <div className="scroll_indicator">
           <span>Explorar</span>
           <div className="scroll_line"></div>
        </div>
      </section>

      <section className="mundos_section">
        <div className="section_header reveal">
          <h2 className="section_title serif">Los Mundos de Naamá</h2>
          <div className="section_divider"></div>
          <p className="hero_description">Siete universos dedicados a tu perfección técnica y paz interior.</p>
        </div>
        <div className="mundos_grid">
          {mundos.map((mundo, index) => (
            <div key={mundo.id} className={`reveal delay-${(index % 3) + 1}`}>
              <MundoCard mundo={mundo} />
            </div>
          ))}
        </div>
      </section>

      <section className="enterprise_cta reveal">
        <h2 className="cta_title serif">Naamá para Empresas</h2>
        <div className="section_divider"></div>
        <p className="cta_description">
          Llevamos la excelencia de nuestro estudio a tu corporación. 
          Jornadas de bienestar exclusivas diseñadas para equipos de alto rendimiento.
        </p>
        <button className="premium_btn">Consultar Servicios B2B</button>
      </section>
    </div>
  );
};

export default Home;
