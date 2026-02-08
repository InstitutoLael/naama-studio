import React from 'react';
import { Users, Coffee, Sparkles, MapPin, Mail } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import '../styles/Global.css';
import '../styles/EmpresasPage.css';

const EmpresasPage = () => {
  return (
    <div className="empresas_container">
      <SEOHead 
        title="Empresas & Bienestar" 
        description="Servicios exclusivos de bienestar corporativo y jornadas de desconexión para equipos de alto nivel." 
      />

      <header className="empresas_hero reveal">
        <div className="empresas_hero_bg"></div>
        <div className="empresas_hero_content">
          <span className="tagline">Bienestar Corporativo</span>
          <h1 className="serif">Elevamos el Espíritu de tu <span className="text-gold">Equipo</span></h1>
          <p className="hero_description">
            Transforma la productividad en plenitud. Naamá para Empresas ofrece experiencias de autocuidado diseñadas para el mundo profesional.
          </p>
        </div>
      </header>

      <main className="empresas_main">
        <section className="benefits_grid">
          <div className="benefit_card reveal delay-1">
            <Users className="benefit_icon" size={40} strokeWidth={1} />
            <h3 className="serif">Uso Exclusivo</h3>
            <p>El estudio se reserva íntegramente para su corporación, garantizando privacidad absoluta y atención boutique.</p>
          </div>
          
          <div className="benefit_card reveal delay-2">
            <Coffee className="benefit_icon" size={40} strokeWidth={1} />
            <h3 className="serif">Jornada de Desconexión</h3>
            <p>Circuitos personalizados que incluyen masajes de descarga, tratamientos faciales y catering de autor.</p>
          </div>

          <div className="benefit_card reveal delay-3">
            <Sparkles className="benefit_icon" size={40} strokeWidth={1} />
            <h3 className="serif">Cultura Wellness</h3>
            <p>Fomente el sentido de pertenencia y bienestar. Un equipo cuidado es un equipo inspirador.</p>
          </div>
        </section>

        <section className="cta_section reveal">
          <h2 className="serif">Hablemos de su Equipo</h2>
          <p className="hero_description">
            Coordinemos una propuesta a la medida de los objetivos de su empresa.
          </p>
          
          <div className="cta_info_list">
            <div className="cta_info_item">
              <MapPin size={14} style={{ marginRight: '8px' }} />
              <span>San Miguel, Santiago</span>
            </div>
            <div className="cta_info_item">
              <Mail size={14} style={{ marginRight: '8px' }} />
              <span>contacto@naamastudio.cl</span>
            </div>
          </div>
          
          <button className="premium_btn">Solicitar Dossier B2B</button>
        </section>
      </main>
    </div>
  );
};

export default EmpresasPage;
