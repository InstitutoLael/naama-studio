import React from 'react';
import { CheckCircle, Users, Coffee, Sparkles, MapPin } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const EmpresasPage = () => {
  return (
    <div className="empresas-page animate-fade-in">
      <SEOHead title="Empresas" description="Servicios exclusivos de bienestar corporativo y Wellness Days en Naamá Studio." />
      <header className="empresas-hero">
        <div className="hero-content">
          <span className="accent-label">BIENESTAR CORPORATIVO</span>
          <h1 className="serif">Naamá para Empresas</h1>
          <p className="hero-p">Transforma el entorno laboral con experiencias de relajación y autocuidado exclusivas para tu equipo.</p>
        </div>
      </header>

      <main className="empresas-content">
        <section className="value-proposition">
          <div className="prop-grid">
            <div className="prop-card">
              <Users className="accent" size={32} />
              <h3 className="serif">Exclusividad Total</h3>
              <p>Cerramos nuestro estudio exclusivamente para tu empresa, garantizando privacidad y una atención 100% personalizada.</p>
            </div>
            <div className="prop-card">
              <Coffee className="accent" size={32} />
              <h3 className="serif">Wellness Day</h3>
              <p>Diseñamos jornadas de medio día o día completo con circuitos de masajes, tratamientos faciales y catering saludable.</p>
            </div>
            <div className="prop-card">
              <Sparkles className="accent" size={32} />
              <h3 className="serif">Productividad & Armonía</h3>
              <p>Un equipo relajado es un equipo más creativo y eficiente. Invierte en la salud mental y física de tus colaboradores.</p>
            </div>
          </div>
        </section>

        <section className="contact-cta">
          <div className="cta-box">
            <h2 className="serif">Diseñemos tu jornada</h2>
            <p>Escríbenos para coordinar una reunión y personalizar los servicios según las necesidades de tu empresa.</p>
            <div className="cta-info">
              <p>📍 Arcadia 1297, San Miguel</p>
              <p>📧 contacto@naamastudio.cl</p>
            </div>
            <button className="gold-button-large">Contactar Ahora</button>
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .empresas-page { padding-top: 100px; }
        .empresas-hero { 
          height: 60vh; 
          background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1600') no-repeat center/cover;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #fff;
        }
        .accent-label { color: var(--accent-color); font-weight: 800; font-size: 0.75rem; letter-spacing: 4px; margin-bottom: 20px; display: block; }
        .empresas-hero h1 { font-size: 4rem; margin-bottom: 20px; }
        .hero-p { max-width: 600px; margin: 0 auto; color: #ccc; font-size: 1.2rem; }

        .empresas-content { max-width: 1200px; margin: 80px auto; padding: 0 20px; }
        .prop-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
        .prop-card { background: var(--card-bg); padding: 40px; border-radius: 20px; border: 1px solid var(--border-color); text-align: center; }
        .prop-card .accent { margin-bottom: 20px; }
        .prop-card h3 { font-size: 1.5rem; margin-bottom: 15px; }
        .prop-card p { color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem; }

        .contact-cta { margin-top: 100px; }
        .cta-box { background: #111; padding: 80px 40px; border-radius: 30px; text-align: center; border: 1px solid var(--accent-color); }
        .cta-box h2 { font-size: 3rem; margin-bottom: 20px; }
        .cta-box p { color: #888; margin-bottom: 30px; }
        .cta-info { margin-bottom: 40px; display: flex; flex-direction: column; gap: 10px; color: var(--accent-color); font-weight: 700; }
        .gold-button-large { 
          background: var(--accent-color); 
          color: #000; 
          padding: 18px 50px; 
          border-radius: 50px; 
          font-weight: 800; 
          font-size: 1rem; 
          text-transform: uppercase; 
          letter-spacing: 2px;
          transition: var(--transition);
        }
        .gold-button-large:hover { background: #fff; transform: scale(1.05); }

        @media (max-width: 768px) {
          .empresas-hero h1 { font-size: 2.5rem; }
          .cta-box { padding: 40px 20px; }
        }
      `}} />
    </div>
  );
};

export default EmpresasPage;
