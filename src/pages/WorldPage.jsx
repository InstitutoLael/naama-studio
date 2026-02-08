import React, { useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { servicesData } from '../data/servicesData';
import { mundos } from '../data/categories';
import ServiceCard from '../components/UI/ServiceCard';
import SEOHead from '../components/SEOHead';
import { ArrowLeft } from 'lucide-react';
import '../styles/Global.css';
import '../styles/WorldPage.css';

const WorldPage = () => {
  const { mundoId } = useParams();
  
  const mundo = useMemo(() => mundos.find(m => m.id === mundoId), [mundoId]);
  
  const filteredServices = useMemo(() => {
    if (!mundo) return [];
    return servicesData.filter(service => mundo.categories.includes(service.cat));
  }, [mundo]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mundoId]);

  if (!mundo) {
    return (
      <div className="world_page container">
        <SEOHead title="Error 404" description="Mundo no encontrado." />
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '100px' }}>
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
        <h2 className="serif" style={{ marginTop: '40px' }}>Mundo no encontrado</h2>
      </div>
    );
  }

  return (
    <div className="world_page">
      <SEOHead title={mundo.name} description={mundo.description} />
      
      <header className="world_header reveal">
        <span className="world_category_label">Ingeniería del Cuidado</span>
        <h1 className="world_title serif">{mundo.name}</h1>
        <p className="world_description">{mundo.description}</p>
        <div className="section_divider" style={{ background: 'var(--sand-beige)', width: '40px', marginTop: '40px' }}></div>
      </header>

      <main className="services_grid">
        {filteredServices.length > 0 ? (
          filteredServices.map((service, index) => (
            <div key={index} className="service_card_wrapper reveal">
              <ServiceCard service={service} />
            </div>
          ))
        ) : (
          <div className="container" style={{ padding: '60px 0', opacity: 0.5 }}>
            <p>No hay servicios disponibles bajo esta categoría en este momento.</p>
          </div>
        )}
      </main>

      <section className="container section-padding reveal" style={{ textAlign: 'center' }}>
         <p className="text-uppercase" style={{ marginBottom: '20px', opacity: 0.4 }}>Próxima Sesión</p>
         <h2 className="serif" style={{ fontSize: '2rem' }}>Recupera tu tiempo de descanso.</h2>
         <Link to="/" className="nav_item" style={{ marginTop: '30px', display: 'inline-block', opacity: 1, borderBottom: '1px solid var(--sand-beige)' }}>
            Volver a la Galería
         </Link>
      </section>
    </div>
  );
};

export default WorldPage;
