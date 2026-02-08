import MundoCard from '../components/UI/MundoCard';
import { mundos } from '../data/categories';
import { Sparkles } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const Home = () => {
  return (
    <div className="home-page">
      <SEOHead title="Inicio" description="Bienvenida a Naamá Studio, tu refugio de belleza y armonía en San Miguel." />
      <header className="home-hero">
        <div className="hero-content animate-fade-in">
          <span className="hero-subtitle">BELLEZA, BIENESTAR & ARMONÍA</span>
          <h1 className="hero-title serif">Naamá Studio</h1>
          <p className="hero-description">
            Descubre un refugio de sofisticación donde la técnica se encuentra con la paz. 
            Inspirados por la excelencia, diseñados para tu plenitud.
          </p>
          <div className="hero-scroll">
            <Sparkles size={16} className="accent" />
            <span>Selecciona tu experiencia</span>
          </div>
        </div>
      </header>

      <section className="mundos-section">
        <div className=" mundos-grid">
          {mundos.map(mundo => (
            <MundoCard key={mundo.id} mundo={mundo} />
          ))}
        </div>
      </section>

      <section className="enterprise-teaser">
        <div className="teaser-content">
          <h2 className="serif">Naamá para Empresas</h2>
          <p>Llevamos el bienestar a tu equipo. Reserva el estudio de forma exclusiva para jornadas corporativas inolvidables.</p>
          <button className="gold-btn">Saber más</button>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .home-page { padding-top: 80px; }
        .home-hero {
          height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: radial-gradient(circle at center, #111 0%, #000 100%);
          position: relative;
        }
        .hero-subtitle {
          color: var(--accent-color);
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 6px;
          margin-bottom: 20px;
          display: block;
        }
        .hero-title {
          font-size: 5rem;
          font-weight: 300;
          margin-bottom: 30px;
          letter-spacing: -2px;
        }
        .hero-description {
          max-width: 600px;
          margin: 0 auto 40px;
          color: var(--text-secondary);
          line-height: 1.8;
          font-size: 1.1rem;
        }
        .hero-scroll {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #444;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-top: 60px;
        }

        .mundos-section { padding: 80px 20px; max-width: 1300px; margin: 0 auto; }
        .mundos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
        }

        .enterprise-teaser {
          padding: 100px 20px;
          background: #050505;
          text-align: center;
          border-top: 1px solid var(--border-color);
        }
        .teaser-content h2 { font-size: 2.5rem; margin-bottom: 20px; }
        .teaser-content p { color: var(--text-secondary); max-width: 500px; margin: 0 auto 30px; }
        .gold-btn {
          background: var(--accent-color);
          color: #000;
          padding: 12px 30px;
          border-radius: 4px;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 1px;
          transition: var(--transition);
        }
        .gold-btn:hover { background: #fff; transform: scale(1.05); }

        @media (max-width: 768px) {
          .hero-title { font-size: 3rem; }
          .mundos-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
};

export default Home;
