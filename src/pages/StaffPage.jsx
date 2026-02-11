import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { servicesData } from '../data/servicesData';
import { searchServices } from '../utils/searchUtils';
import ServiceCard from '../components/UI/ServiceCard';
import SEOHead from '../components/SEOHead';
import '../styles/Global.css';
import '../styles/StaffPage.css';

const specialists = [
  { name: "Allison", specialty: "Make-up & Hair Styling" },
  { name: "Cami", specialty: "Technical Color & Esthetics" },
  { name: "Valeria", specialty: "Master Alisados & Cutting" },
  { name: "Gaby", specialty: "Dermo-Nails & Depilation" },
  { name: "Vivy", specialty: "High-End Facials & Maderotherapy" }
];

const StaffPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = useMemo(() => {
    return searchServices(servicesData, searchTerm);
  }, [searchTerm]);

  return (
    <div className="staff_page">
      <SEOHead 
        title="Nuestro Equipo" 
        description="Conoce a los especialistas detrás de la ingeniería del cuidado en Naamá Studio." 
      />

      <header className="staff_header reveal">
        <span className="world_category_label">Protocolo de Equipo</span>
        <h1 className="staff_title serif">Hospitalidad Técnica</h1>
        <p className="staff_subtitle">
          Un equipo de especialistas dedicados a la ciencia del descanso y la excelencia estética. Cada inicial representa un legado de cuidado.
        </p>
      </header>
      
      <main className="specialist_gallery container">
        {specialists.map((pro, index) => (
          <div 
            key={index} 
            className="specialist_item reveal" 
            style={{ transitionDelay: `${index * 0.1}s` }}
            onClick={() => {
              setSearchTerm(pro.name);
              const searchSection = document.querySelector('.staff_search_section');
              if (searchSection) {
                searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Ver servicios de ${pro.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearchTerm(pro.name);
                document.querySelector('.staff_search_section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            <h3 className="specialist_name serif">{pro.name}</h3>
            <p className="specialist_role">{pro.specialty}</p>
            <button className="specialist_view_btn" tabIndex={-1}>Ver sus servicios</button>
          </div>
        ))}
      </main>

      <section className="staff_search_section reveal">
        <div className="section_header_boutique">
           <div className="header_left">
             <span className="world_item_tag">Transparencia Técnica</span>
             <h2 className="serif staff_search_heading">Consulta de Valores</h2>
           </div>
        </div>

        <div className="discovery_bar staff_search_bar_container">
          <div className="search_wrapper">
            <Search size={22} strokeWidth={1} className="search_icon" />
            <input 
              type="text" 
              placeholder="Escribe un tratamiento o especialista..." 
              className="staff_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar servicios o especialistas"
            />
          </div>
        </div>

        <div className="services_grid_adaptive">
          <div className="services_grid">
            {filteredServices.length > 0 ? (
              filteredServices.map((service, index) => (
                <div key={`${service.name}-${index}`} className="service_card_wrapper">
                  <ServiceCard service={service} defaultExpanded={false} />
                </div>
              ))
            ) : (
              <div className="empty_selection">
                <p className="serif">No se encontraron resultados para "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container section-padding reveal text-center staff_footer_section">
         <h2 className="serif staff_footer_heading">La maestría no necesita filtros.</h2>
         <p className="staff_footer_text">Solo técnica, silencio y hospitalidad.</p>
      </section>
    </div>
  );
};

export default StaffPage;
