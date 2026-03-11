import React, { useState, useMemo } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { servicesData } from '../data/servicesData';
import { searchServices } from '../utils/searchUtils';
import ServiceCard from '../components/UI/ServiceCard';
import SEOHead from '../components/SEOHead';
import '../styles/Global.css';
import '../styles/StaffPage.css';

// ── Equipo actual de Naamá Studio ──
const specialists = [
  {
    name: "Valeria",
    specialty: "Master Colorista & Alisados",
    detail: "Mechas, balayage, babylights, tintes, alisados y cortes de alta peluquería."
  },
  {
    name: "Vivy",
    specialty: "Facial & Bienestar Corporal",
    detail: "Limpiezas faciales, tratamientos estéticos, masajes y terapias de bienestar."
  },
  {
    name: "Gaby",
    specialty: "Dermo-Nails & Cejas",
    detail: "Manicure, pedicure, depilación, lifting de pestañas y diseño de cejas."
  },
  {
    name: "Allison",
    specialty: "Make-up & Peinado",
    detail: "Maquillaje social y artístico, peinados para eventos y ocasiones especiales."
  },
  {
    name: "Michelle",
    specialty: "Podología Clínica",
    detail: "Podología básica y avanzada con esterilización de grado médico."
  }
];

const StaffPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = useMemo(() => {
    return searchServices(servicesData, searchTerm);
  }, [searchTerm]);

  const handleSpecialistClick = (name) => {
    setSearchTerm(name);
    setTimeout(() => {
      document.querySelector('.staff_search_section')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="staff_page">
      <SEOHead
        title="Equipo & Precios · Naamá Studio"
        description="Conoce al equipo de especialistas de Naamá Studio. Transparencia total en precios y servicios."
      />

      {/* ── HEADER ── */}
      <header className="staff_header reveal">
        <span className="world_category_label">Nuestro Equipo</span>
        <h1 className="staff_title serif">Hospitalidad Técnica</h1>
        <p className="staff_subtitle">
          Un equipo de especialistas dedicados a la excelencia estética y el bienestar real.
          Haz clic en cualquier especialista para ver sus servicios y precios.
        </p>
      </header>

      {/* ── GALERÍA DEL EQUIPO ── */}
      <main className="specialist_gallery container" aria-label="Equipo de especialistas">
        {specialists.map((pro, index) => (
          <div
            key={index}
            className="specialist_item reveal"
            style={{ transitionDelay: `${index * 0.08}s` }}
            onClick={() => handleSpecialistClick(pro.name)}
            role="button"
            tabIndex={0}
            aria-label={`Ver servicios de ${pro.name}`}
            onKeyDown={(e) => e.key === 'Enter' && handleSpecialistClick(pro.name)}
          >
            {/* Inicial decorativa */}
            <span className="specialist_initial serif" aria-hidden="true">
              {pro.name[0]}
            </span>
            <h3 className="specialist_name serif">{pro.name}</h3>
            <p className="specialist_role">{pro.specialty}</p>
            <p className="specialist_detail">{pro.detail}</p>
            <span className="specialist_view_btn" tabIndex={-1}>
              Ver servicios
              <ArrowRight size={12} strokeWidth={1.5} />
            </span>
          </div>
        ))}
      </main>

      {/* ── BUSCADOR DE SERVICIOS ── */}
      <section className="staff_search_section reveal" aria-label="Buscar servicios">
        <div className="section_header_boutique">
          <div className="header_left">
            <span className="world_item_tag">Transparencia Total</span>
            <h2 className="serif staff_search_heading">Consulta de Valores</h2>
          </div>
          <p className="search_section_sub">
            Busca por tratamiento o por el nombre de tu especialista.
          </p>
        </div>

        <div className="staff_search_bar_container">
          <div className="search_wrapper">
            <Search size={20} strokeWidth={1.2} className="search_icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Escribe un servicio o especialista..."
              className="staff_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar servicios o especialistas"
            />
            {searchTerm && (
              <button
                className="search_clear_btn"
                onClick={() => setSearchTerm('')}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="search_results_count">
              {filteredServices.length} {filteredServices.length === 1 ? 'resultado' : 'resultados'} para{' '}
              <em>"{searchTerm}"</em>
            </p>
          )}
        </div>

        <div className="services_grid_adaptive">
          <div className="services_grid" role="list">
            {filteredServices.length > 0 ? (
              filteredServices.map((service, index) => (
                <div
                  key={`${service.name}-${index}`}
                  className="service_card_wrapper"
                  role="listitem"
                >
                  <ServiceCard service={service} defaultExpanded={false} />
                </div>
              ))
            ) : (
              <div className="empty_selection" role="status">
                <span className="empty_icon serif" aria-hidden="true">∅</span>
                <p className="serif">Sin resultados para "{searchTerm}"</p>
                <button
                  className="empty_reset_btn"
                  onClick={() => setSearchTerm('')}
                >
                  Ver todos los servicios
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="container section-padding reveal text-center staff_footer_section">
        <span className="world_item_tag" style={{ display: 'block', marginBottom: '24px' }}>
          Reserva tu sesión
        </span>
        <h2 className="serif staff_footer_heading">
          La maestría no necesita filtros.
        </h2>
        <p className="staff_footer_text">
          Solo técnica, silencio y hospitalidad de alto nivel.
        </p>
        <a
          href="https://wa.me/56979520623?text=Hola! Vi los precios en la web y me gustaría agendar una sesión en Naamá Studio."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Agendar por WhatsApp"
          className="staff_footer_cta"
        >
          Agendar por WhatsApp
          <ArrowRight size={14} strokeWidth={1.5} />
        </a>
      </section>
    </div>
  );
};

export default StaffPage;