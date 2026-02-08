import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { servicesData } from '../data/servicesData';
import { mundos } from '../data/categories';
import ServiceCard from '../components/UI/ServiceCard';
import { ChevronLeft, Sparkles } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const WorldPage = () => {
  const { mundoId } = useParams();
  
  const mundo = useMemo(() => mundos.find(m => m.id === mundoId), [mundoId]);
  
  const filteredServices = useMemo(() => {
    if (!mundo) return [];
    return servicesData.filter(service => mundo.categories.includes(service.cat));
  }, [mundo]);

  if (!mundo) {
    return (
      <div className="error-page" style={{ paddingTop: '100px', textAlign: 'center' }}>
        <SEOHead title="Error 404" description="Mundo no encontrado." />
        <h2 className="serif">Mundo no encontrado</h2>
        <Link to="/" className="gold-link" style={{ color: 'var(--accent-color)' }}>Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="world-page animate-fade-in">
      <SEOHead title={mundo.name} description={mundo.description} />
      <header className="world-header">
        <div className="header-container">
          <Link to="/" className="back-link"><ChevronLeft size={16} /> Volver</Link>
          <div className="world-title-wrapper">
            <h1 className="serif">{mundo.name}</h1>
            <p>{mundo.description}</p>
          </div>
        </div>
      </header>

      <main className="world-content">
        <div className="services-grid">
          {filteredServices.length > 0 ? (
            filteredServices.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))
          ) : (
            <div className="no-services">
              <p>No hay servicios disponibles en este momento para esta categoría.</p>
            </div>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .world-page { padding-top: 100px; min-height: 100vh; }
        .world-header { background: #050505; border-bottom: 1px solid var(--border-color); padding: 40px 20px; }
        .header-container { max-width: 1200px; margin: 0 auto; }
        .back-link { display: flex; align-items: center; gap: 5px; color: var(--accent-color); font-size: 0.8rem; text-transform: uppercase; font-weight: 700; margin-bottom: 30px; }
        
        .world-title-wrapper h1 { font-size: 3.5rem; margin-bottom: 10px; }
        .world-title-wrapper p { color: var(--text-secondary); font-size: 1.1rem; max-width: 600px; }

        .world-content { max-width: 1200px; margin: 60px auto; padding: 0 20px; }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 30px;
        }
        .no-services { text-align: center; padding: 100px 0; color: var(--text-secondary); }

        @media (max-width: 768px) {
          .world-title-wrapper h1 { font-size: 2.5rem; }
        }
      `}} />
    </div>
  );
};

export default WorldPage;
