import React, { useMemo, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { servicesData } from '../data/servicesData';
import { fuzzyMatch } from '../utils/searchUtils';
import { mundos } from '../data/categories';
import ServiceCard from '../components/UI/ServiceCard';
import SEOHead from '../components/SEOHead';
import { ArrowLeft, Search } from 'lucide-react';
import '../styles/Global.css';
import '../styles/WorldPage.css';

const WorldPage = () => {
  const { mundoId } = useParams();
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const mundo = useMemo(() => mundos.find(m => m.id === mundoId), [mundoId]);
  
  const categories = useMemo(() => {
    if (!mundo) return [];
    return ['Todos', ...new Set(servicesData.filter(s => mundo.categories.includes(s.cat)).map(s => s.cat))];
  }, [mundo]);

  const filteredServices = useMemo(() => {
    if (!mundo) return [];
    let services = servicesData.filter(service => mundo.categories.includes(service.cat));
    
    if (activeTab !== 'Todos') {
      services = services.filter(s => s.cat === activeTab);
    }
    
    if (searchTerm) {
      services = services.filter(s => {
        const searchableText = `${s.name} ${s.worker} ${s.cat}`.toLowerCase();
        return fuzzyMatch(searchTerm, searchableText);
      });
    }
    
    return services;
  }, [mundo, activeTab, searchTerm]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveTab('Todos');
    setSearchTerm('');
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

  return (
    <div className="world_page">
      <SEOHead title={mundo.name} description={mundo.description} />
      
      <header className="world_header reveal">
        <span className="world_category_label">Catálogo Técnico</span>
        <h1 className="world_title serif">{mundo.name}</h1>
        <p className="world_description">{mundo.description}</p>
        
        <div className="discovery_bar">
          <div className="search_wrapper">
            <Search size={18} strokeWidth={1} className="search_icon" />
            <input 
              type="text" 
              placeholder="Staff Search: Nombre o técnico..." 
              className="staff_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar servicios en este mundo"
            />
          </div>
          
          <div className="category_tabs_wrapper">
            <div className="tabs_rail" role="tablist" aria-label="Categorías de servicios">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`tab_btn ${activeTab === cat ? 'active' : ''}`}
                  onClick={() => setActiveTab(cat)}
                  role="tab"
                  aria-selected={activeTab === cat}
                  aria-controls={`panel-${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="services_grid_adaptive">
        {/* Desktop/Tablet View: Search + Tabs + Grid */}
        <div className="desktop_catalog_view">
          <div className="services_grid" role="tabpanel" id={`panel-${activeTab}`}>
            {filteredServices.length > 0 ? (
              filteredServices.map((service, index) => (
                <div key={`${service.name}-${index}`} className="service_card_wrapper">
                  <ServiceCard service={service} />
                </div>
              ))
            ) : (
              <div className="empty_selection">
                <p className="serif">No se encontraron servicios bajo esta selección.</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile View: Accordion-first architecture */}
        <div className="mobile_catalog_view">
           {categories.filter(c => c !== 'Todos').map((cat) => {
             const catServices = filteredServices.filter(s => s.cat === cat);
             if (catServices.length === 0 && searchTerm) return null;
             
             return (
               <details key={cat} className="category_accordion reveal">
                 <summary className="accordion_header serif">
                   <span>{cat}</span>
                   <span className="count_badge">{catServices.length}</span>
                 </summary>
                 <div className="accordion_content">
                   {catServices.map((service, idx) => (
                     <ServiceCard key={`${service.name}-${idx}`} service={service} />
                   ))}
                 </div>
               </details>
             );
           })}
        </div>
      </main>

      <section className="container section-padding reveal world_session_section">
         <p className="text-uppercase world_session_text">Próxima Sesión</p>
         <h2 className="serif world_session_title">Recupera tu tiempo de descanso.</h2>
         <Link to="/" className="nav_item world_gallery_link">
            Volver a la Galería
         </Link>
      </section>
    </div>
  );
};

export default WorldPage;
