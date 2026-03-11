import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ArrowRight, X } from 'lucide-react';
import { servicesData } from '../data/servicesData';
import ServiceCard from '../components/UI/ServiceCard';
import SEOHead from '../components/SEOHead';
import '../styles/Global.css';
import '../styles/StaffPage.css';

const specialists = [
  {
    name: "Valeria",
    initial: "V",
    specialty: "Colorista & Alisados",
    services: ["Balayage", "Babylights", "Alisado Brasileño", "Botox Capilar", "Tintes & Mechas", "Cortes"]
  },
  {
    name: "Vivy",
    initial: "V",
    specialty: "Facial & Bienestar",
    services: ["Limpiezas Faciales", "Masajes", "Maderoterapia", "Tratamientos Capilares"]
  },
  {
    name: "Gaby",
    initial: "G",
    specialty: "Nails & Cejas",
    services: ["Manicure", "Pedicure", "Depilación", "Lifting de Pestañas", "Diseño de Cejas"]
  },
  {
    name: "Allison",
    initial: "A",
    specialty: "Make-up & Peinados",
    services: ["Maquillaje Social", "Maquillaje Artístico", "Peinados para Eventos"]
  },
  {
    name: "Michelle",
    initial: "M",
    specialty: "Podología Clínica",
    services: ["Podología Básica", "Podología Avanzada", "Esterilización Clínica"]
  }
];

// ── Normaliza texto: minúsculas + sin tildes + sin caracteres especiales ──
// Así "balayage", "Balayage", "Balayagé" y errores tipográficos comunes todos matchean
const normalize = (str = '') =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/[^a-z0-9\s]/g, ' ')    // reemplaza símbolos por espacio
    .trim();

// ── Búsqueda flexible: busca en nombre, descripción, worker, categoría ──
// Divide el término en palabras y exige que TODAS aparezcan en al menos uno de los campos
const smartSearch = (services, term) => {
  // Sin término → devuelve TODOS
  if (!term || !term.trim()) return services;

  const words = normalize(term).split(/\s+/).filter(Boolean);

  return services.filter((service) => {
    // Campos donde buscar
    const haystack = normalize(
      [
        service.name        ?? '',
        service.description ?? '',
        service.worker      ?? '',
        service.category    ?? '',
        service.subcategory ?? '',
        // tags extra si existen
        ...(service.tags    ?? []),
      ].join(' ')
    );

    // Todas las palabras del término deben aparecer en el haystack
    return words.every((word) => haystack.includes(word));
  });
};

const StaffPage = () => {
  const [searchTerm, setSearchTerm]             = useState('');
  const [activeSpecialist, setActiveSpecialist] = useState(null);
  const [mounted, setMounted]                   = useState(false);
  const searchRef                               = useRef(null);

  // ── Fix bug de pantalla en blanco ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      document.querySelectorAll('.staff_page [class*="reveal"]').forEach((el) => {
        el.classList.add('reveal-visible');
      });
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // ── Búsqueda: sin término = TODOS los servicios ──
  const filteredServices = useMemo(
    () => smartSearch(servicesData, searchTerm),
    [searchTerm]
  );

  const handleSpecialistClick = (name) => {
    const next = activeSpecialist === name ? null : name;
    setActiveSpecialist(next);
    setSearchTerm(next ?? '');
    if (next) {
      setTimeout(() => {
        searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActiveSpecialist(null);
  };

  return (
    <div className={`staff_page ${mounted ? 'staff_mounted' : ''}`}>
      <SEOHead
        title="Equipo & Precios · Naamá Studio"
        description="Conoce al equipo de especialistas de Naamá Studio. Transparencia total en servicios y precios."
      />

      {/* ── HERO ── */}
      <header className="staff_hero">
        <div className="staff_hero_inner">
          <span className="world_category_label">Nuestro Equipo</span>
          <h1 className="staff_title serif">
            Cinco especialistas.<br />
            <em>Un solo estándar.</em>
          </h1>
          <p className="staff_subtitle">
            Técnica certificada, hospitalidad de alto nivel y dedicación absoluta
            al arte del cuidado personal. Selecciona a tu especialista para
            explorar sus servicios y precios.
          </p>
        </div>
        <span className="staff_hero_deco serif" aria-hidden="true">N.</span>
      </header>

      {/* ── TARJETAS DEL EQUIPO ── */}
      <section className="staff_team_section" aria-label="Equipo de especialistas">
        <div className="staff_team_grid container">
          {specialists.map((pro, index) => (
            <button
              key={pro.name}
              className={`specialist_card ${activeSpecialist === pro.name ? 'active' : ''}`}
              style={{ animationDelay: `${index * 0.07}s` }}
              onClick={() => handleSpecialistClick(pro.name)}
              aria-label={`${activeSpecialist === pro.name ? 'Ocultar' : 'Ver'} servicios de ${pro.name}`}
              aria-pressed={activeSpecialist === pro.name}
            >
              <span className="card_index" aria-hidden="true">0{index + 1}</span>

              <div className="card_initial_wrap" aria-hidden="true">
                <span className="card_initial serif">{pro.initial}</span>
              </div>

              <div className="card_body">
                <h3 className="card_name serif">{pro.name}</h3>
                <p className="card_specialty">{pro.specialty}</p>
                <ul className="card_services_list">
                  {pro.services.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="card_footer_row">
                <span className="card_cta_label">
                  {activeSpecialist === pro.name ? 'Ocultar' : 'Ver precios'}
                </span>
                <ArrowRight
                  size={13}
                  strokeWidth={1.5}
                  className={`card_arrow_icon ${activeSpecialist === pro.name ? 'rotated' : ''}`}
                  aria-hidden="true"
                />
              </div>

              {activeSpecialist === pro.name && (
                <span className="card_active_bar" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── CATÁLOGO / BUSCADOR ── */}
      <section
        className="staff_catalog"
        ref={searchRef}
        aria-label="Catálogo de servicios y precios"
      >
        {/* Encabezado */}
        <div className="catalog_head container">
          <div>
            <span className="world_item_tag">Transparencia Total</span>
            <h2 className="serif catalog_title">Servicios & Precios</h2>
          </div>
          <p className="catalog_desc">
            Busca por nombre, tratamiento, especialista o categoría.
            <br />
            <span className="catalog_desc_hint">
              {servicesData.length} servicios disponibles
            </span>
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="catalog_searchbar container">
          <div className={`searchbar_inner ${searchTerm ? 'has_value' : ''}`}>
            <Search size={18} strokeWidth={1.2} className="sb_icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Ej: balayage, manicure, Valeria, masaje..."
              className="sb_input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setActiveSpecialist(null);
              }}
              aria-label="Buscar servicios o especialistas"
            />
            {searchTerm && (
              <button
                className="sb_clear"
                onClick={clearSearch}
                aria-label="Limpiar búsqueda"
              >
                <X size={15} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Contador de resultados */}
          <div className="sb_meta">
            {searchTerm ? (
              <p className="sb_count" aria-live="polite">
                <strong>{filteredServices.length}</strong>{' '}
                {filteredServices.length === 1 ? 'resultado' : 'resultados'}
                {activeSpecialist
                  ? ` para ${activeSpecialist}`
                  : ` para "${searchTerm}"`}
              </p>
            ) : (
              <p className="sb_count_all" aria-live="polite">
                Mostrando todos los <strong>{filteredServices.length}</strong> servicios
              </p>
            )}
          </div>
        </div>

        {/* Grid de resultados */}
        <div className="catalog_results">
          <div className="catalog_grid" role="list">
            {filteredServices.length > 0 ? (
              filteredServices.map((service, i) => (
                <div
                  key={`${service.name}-${i}`}
                  className="catalog_cell"
                  role="listitem"
                >
                  <ServiceCard service={service} defaultExpanded={false} />
                </div>
              ))
            ) : (
              <div className="catalog_empty" role="status">
                <span className="empty_glyph serif" aria-hidden="true">∅</span>
                <p className="serif">Sin resultados para "{searchTerm}"</p>
                <p className="empty_hint">
                  Intenta con otro término — por ej. "depil", "tinte", "faciales"
                </p>
                <button className="empty_reset_btn" onClick={clearSearch}>
                  Ver todos los servicios
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="staff_cta_bottom container text-center">
        <span className="world_item_tag" style={{ display: 'block', marginBottom: '20px' }}>
          ¿Lista para tu sesión?
        </span>
        <h2 className="serif staff_cta_heading">
          La maestría no necesita filtros.
        </h2>
        <p className="staff_cta_text">Solo técnica, silencio y hospitalidad de alto nivel.</p>
        <a
          href="https://wa.me/56979520623?text=Hola! Vi los precios en la web y me gustaría agendar una sesión en Naamá Studio."
          target="_blank"
          rel="noopener noreferrer"
          className="staff_cta_btn"
          aria-label="Agendar por WhatsApp"
        >
          Agendar por WhatsApp
          <ArrowRight size={14} strokeWidth={1.5} />
        </a>
      </section>
    </div>
  );
};

export default StaffPage;