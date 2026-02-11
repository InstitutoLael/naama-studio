import React from 'react';
import { Mail, MapPin } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { b2bPacks } from '../data/b2bPacks';
import '../styles/Global.css';
import '../styles/EmpresasPage.css';

const EmpresasPage = () => {
  return (
    <div className="empresas_page">
      <SEOHead 
        title="B2B & Bienestar Corporativo" 
        description="Servicios de restauración y cuidado técnico para equipos corporativos de alto rendimiento." 
      />

      <header className="empresas_hero reveal">
        <span className="empresas_label">Atención Corporativa</span>
        <h1 className="empresas_title serif">Ingeniería del Cuidado para su <span className="b2b_accent_text">Equipo</span></h1>
        <p className="world_description">
          Llevamos la excelencia de Naamá Studio al entorno profesional, diseñando jornadas de restauración técnica y descanso hospitalario a medida de su corporación.
        </p>
      </header>

      <main className="empresas_benefits container reveal delay-1">
        <div className="benefit_item">
          <span className="detail_label">Modalidad 01</span>
          <h3 className="benefit_title serif">Naamá en Salón</h3>
          <p className="benefit_desc">Reserva íntegra de nuestras instalaciones para jornadas de bienestar exclusivo. Packs de restauración técnica que incluyen cuidado capilar, podología y descanso visual en un entorno de pulcritud absoluta.</p>
        </div>
        
        <div className="benefit_item">
          <span className="detail_label">Modalidad 02</span>
          <h3 className="benefit_title serif">Naamá en Oficina</h3>
          <p className="benefit_desc">Desplazamos nuestra ingeniería del cuidado a sus dependencias. Montaje de estaciones técnicas de masaje clínico, diseño de mirada y tratamientos express para equipos de alta exigencia sin salir de su entorno seguro.</p>
        </div>

        <div className="benefit_item">
          <span className="detail_label">Modalidad 03</span>
          <h3 className="benefit_title serif">Packs de Honor</h3>
          <p className="benefit_desc">Gift cards corporativas físicas en acabado lino crudo. Un gesto de reconocimiento técnico que permite al colaborador elegir su propio protocolo de restauración en nuestro salón.</p>
        </div>
      </main>

      <section className="container section-padding reveal b2b_section_header">
        <span className="essence_label">Combinaciones de Valor</span>
        <h2 className="serif b2b_heading_large">Packs de Ingeniería <span className="b2b_accent_text">B2B</span></h2>
        
        <div className="b2b_packs_grid">
          {b2bPacks.map((pack) => (
            <div key={pack.id} className="b2b_pack_card">
              <div className="pack_status_badge">{pack.modality}</div>
              <h3 className="serif pack_name">{pack.name}</h3>
              <p className="pack_desc">{pack.description}</p>
              <div className="pack_services_list">
                 {pack.services.map(s => <span key={s} className="pack_service_tag">{s}</span>)}
              </div>
              <div className="pack_footer">
                 <div className="pack_price_box">
                    <span className="pack_label_tag">Inversión desde</span>
                    <span className="pack_price serif">${pack.price} <small className="pack_savings">(-{pack.savings})</small></span>
                 </div>
                 <button 
                  id={`btn_pack_${pack.id}`}
                  className="nav_cta_boutique b2b_pack_btn"
                  onClick={() => window.location.href = `mailto:naamastudiospa@gmail.com?subject=Interés en Pack B2B: ${pack.name}`}
                  aria-label={`Solicitar información sobre el Pack ${pack.name}`}
                 >
                   Solicitar Pack
                 </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container reveal b2b_cta_container">
        <div className="b2b_cta_section">
          <h2 className="cta_heading serif">Consulte nuestra propuesta B2B</h2>
          <p className="cta_sub">Diseñamos sesiones personalizadas según los objetivos de bienestar de su empresa.</p>
          
          <div className="b2b_contact_info">
            <div className="b2b_contact_row">
              <MapPin size={14} /> <span>San Miguel, Santiago</span>
            </div>
            <div className="b2b_contact_row">
              <Mail size={14} /> <span>naamastudiospa@gmail.com</span>
            </div>
          </div>

          <button 
            className="nav_cta_boutique b2b_cta_main"
            onClick={() => window.location.href = 'mailto:naamastudiospa@gmail.com'}
            aria-label="Solicitar información general para empresas"
          >
            Solicitar Información
          </button>
        </div>
      </section>
    </div>
  );
};

export default EmpresasPage;
