import React, { useMemo, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { servicesData } from '../data/servicesData';
import { mundos } from '../data/categories';
import SEOHead from '../components/shared/SEOHead';
import { ArrowLeft, ChevronDown } from 'lucide-react';

import HeroBg from '../assets/hero-bg.png';
import MiradaBg from '../assets/mirada-bg.png';
import NailsBg from '../assets/nails-bg.png';
import WellnessBg from '../assets/wellness-bg.png';
import SalonArch from '../assets/salon-arch.png';
import LaborHands from '../assets/labor-hands.png';

import '../styles/Global.css';
import '../styles/WorldPage.css';

const mundoImages = {
  'capilar': SalonArch,
  'color': LaborHands,
  'tratamientos': MiradaBg,
  'bienestar': WellnessBg,
  'manos-pies': NailsBg,
  'clinico': HeroBg
};

const colorMap = {
  "Valeria": "#3E4A3B",
  "Vivy": "#C17A5A",
  "Gaby": "#B79A5B",
  "Allison": "#2A3228",
  "Michelle": "#4A5A60"
};

const ServiceRow = ({ service, index }) => {
  const [expanded, setExpanded] = useState(false);
  const badgeColor = colorMap[service.worker] || "var(--accent-walnut)";

  return (
    <div className={`service_row_wrap reveal delay-${(index % 4) + 1} ${expanded ? 'expanded' : ''}`}>
      <div className="service_row" onClick={() => setExpanded(!expanded)}>
        <span className="sr_index">{(index + 1).toString().padStart(2, '0')}</span>
        <div className="sr_name_group">
          <span className="sr_name">{service.name}</span>
          {service.worker && (
            <span className="sr_badge" style={{ backgroundColor: badgeColor }}>
              {service.worker}
            </span>
          )}
        </div>
        <span className="sr_duration">{service.time}</span>
        <span className="sr_price">${service.price || 'Consultar'}</span>
        <button className={`sr_expand_btn ${expanded ? 'rotated' : ''}`} aria-hidden="true">
          <ChevronDown size={16} strokeWidth={1.5} />
        </button>
      </div>
      
      <div className={`sr_detail ${expanded ? 'open' : ''}`}>
        <div className="sr_detail_inner">
          <p className="sr_desc">{service.desc}</p>
          {service.why && <p className="sr_why">{service.why}</p>}
          <a 
            href={`https://wa.me/56979520623?text=Hola! Me interesa agendar el servicio: ${service.name}`} 
            target="_blank" rel="noopener noreferrer" 
            className="sr_cta_btn"
          >
            Agendar este servicio → WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

const WorldPage = () => {
  const { mundoId } = useParams();
  
  const mundo = useMemo(() => mundos.find(m => m.id === mundoId), [mundoId]);
  
  const filteredServices = useMemo(() => {
    if (!mundo) return [];
    return servicesData.filter(service => mundo.categories.includes(service.cat));
  }, [mundo]);

  const relatedWorlds = useMemo(() => {
    return mundos.filter(m => m.id !== mundoId).slice(0, 3);
  }, [mundoId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mundoId]);

  if (!mundo) {
    return (
      <div className="world_page container world_not_found_container">
        <SEOHead title="Error 404" description="Mundo no encontrado." />
        <Link to="/" className="world_back_link" aria-label="Volver al inicio">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
        <h2 className="serif world_not_found_title">Mundo no encontrado</h2>
      </div>
    );
  }

  const bgImage = mundoImages[mundo.id];
  const worldIndex = mundos.findIndex(m => m.id === mundo.id) + 1;

  return (
    <div className="world_page">
      <SEOHead title={mundo.name} description={mundo.description} />
      
      <header className="world_hero" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="world_hero_overlay" />
        <div className="world_hero_content reveal">
          <span className="world_eyebrow">ECOSISTEMA 0{worldIndex}</span>
          <h1 className="world_hero_title serif">{mundo.name}</h1>
          <p className="world_hero_desc">{mundo.description}</p>
          <a 
            href="https://wa.me/56979520623?text=Hola! Quiero agendar una sesión en Naamá Studio." 
            target="_blank" rel="noopener noreferrer" 
            className="btn_world_hero"
          >
            Reservar este servicio
          </a>
        </div>
      </header>

      <main className="world_main container">
        <div className="services_list">
          {filteredServices.length > 0 ? (
            filteredServices.map((service, index) => (
              <ServiceRow key={`${service.name}-${index}`} service={service} index={index} />
            ))
          ) : (
            <div className="empty_selection">
              <p className="serif">No se encontraron servicios bajo esta selección.</p>
            </div>
          )}
        </div>
      </main>

      <section className="related_worlds_section container reveal">
        <h3 className="related_title serif">También en Naamá Studio</h3>
        <div className="related_grid">
          {relatedWorlds.map((rel, idx) => (
            <Link key={rel.id} to={`/mundo/${rel.id}`} className={`related_card delay-${(idx % 3) + 1}`}>
              <img src={mundoImages[rel.id]} alt={rel.name} className="related_img" loading="lazy" />
              <div className="related_overlay" />
              <div className="related_content">
                <span className="related_tag">ECOSISTEMA 0{mundos.findIndex(m => m.id === rel.id) + 1}</span>
                <h4 className="related_name serif">{rel.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WorldPage;
