import React, { useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { servicesData } from '../data/servicesData';
import { mundos } from '../data/categories';
import ServiceCard from '../components/UI/ServiceCard';
import SEOHead from '../components/SEOHead';
import { ChevronLeft } from 'lucide-react';
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
      <div className="error_page">
        <SEOHead title="Error 404" description="Mundo no encontrado." />
        <h2 className="serif">Mundo no encontrado</h2>
        <Link to="/" className="gold_link">Volver al inicio</Link>
      </div>
    );
  }

  const bgStyle = {
    backgroundImage: `url(/src/assets/${mundo.image})`
  };

  return (
    <div className="world_container">
      <SEOHead title={mundo.name} description={mundo.description} />
      
      <header className="world_hero">
        <div className="world_hero_bg" style={bgStyle}></div>
        <div className="world_hero_overlay"></div>
        <div className="world_hero_content reveal">
          <Link to="/" className="back_btn">
            <ChevronLeft size={16} />
            <span>Volver</span>
          </Link>
          <h1 className="world_title serif">{mundo.name}</h1>
          <p className="world_desc">{mundo.description}</p>
        </div>
      </header>

      <main className="services_section">
        <div className="services_grid">
          {filteredServices.length > 0 ? (
            filteredServices.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))
          ) : (
            <div className="no_services_msg">
              <p>No hay servicios disponibles en este momento para esta categoría.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorldPage;
