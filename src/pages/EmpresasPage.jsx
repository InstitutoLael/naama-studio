import React from 'react';
import { Mail, MapPin } from 'lucide-react';
import SEOHead from '../components/SEOHead';
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
        <h1 className="empresas_title serif">Ingeniería del Cuidado para su <span style={{ color: 'var(--accent-clay)' }}>Equipo</span></h1>
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

      <section className="container reveal" style={{ marginBottom: '150px' }}>
        <div className="b2b_cta_section">
          <h2 className="cta_heading serif">Consulte nuestra propuesta B2B</h2>
          <p className="cta_sub">Diseñamos sesiones personalizadas según los objetivos de bienestar de su empresa.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px', color: 'rgba(43,43,43,0.4)', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={14} /> <span>San Miguel, Santiago</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={14} /> <span>naamastudiospa@gmail.com</span>
            </div>
          </div>

          <button 
            className="nav_cta_boutique" 
            style={{ 
              padding: '22px 50px', 
              border: 'none', 
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              fontSize: '0.7rem',
              fontWeight: '800'
            }}
            onClick={() => window.location.href = 'mailto:naamastudiospa@gmail.com'}
          >
            Solicitar Información
          </button>
        </div>
      </section>
    </div>
  );
};

export default EmpresasPage;
