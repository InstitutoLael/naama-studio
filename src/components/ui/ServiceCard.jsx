import React, { useState } from 'react';
import { ChevronDown, Clock, User, Tag, TrendingDown } from 'lucide-react';
import '../../styles/ServiceCard.css';

/**
 * ServiceCard — Naamá Studio
 * Campos del servicio:
 *   name    → Nombre del servicio
 *   worker  → Especialista(s)
 *   cat     → Categoría
 *   price   → Precio actual
 *   old     → Precio anterior (si existe y no es "---")
 *   time    → Duración
 *   desc    → Descripción corta
 *   why     → Por qué elegirlo (texto extra)
 */
const ServiceCard = ({ service, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const hasOldPrice = service.old && service.old !== '---' && service.old !== '';
  const hasDesc     = service.desc && service.desc.trim() !== '';
  const hasWhy      = service.why  && service.why.trim()  !== '';
  const hasExtra    = hasDesc || hasWhy;

  return (
    <article
      className={`svc_card ${expanded ? 'svc_expanded' : ''}`}
      aria-label={`Servicio: ${service.name}`}
    >
      {/* ── FILA PRINCIPAL (siempre visible) ── */}
      <div
        className="svc_main premium_horizontal"
        onClick={() => hasExtra && setExpanded(!expanded)}
        role={hasExtra ? 'button' : undefined}
        tabIndex={hasExtra ? 0 : undefined}
        aria-expanded={hasExtra ? expanded : undefined}
        onKeyDown={(e) => hasExtra && e.key === 'Enter' && setExpanded(!expanded)}
      >
        <div className="svc_left_col">
          <h3 className="svc_name serif">{service.name}</h3>
          <div className="svc_meta_badges">
            {service.cat && <span className="svc_badge_cat">{service.cat}</span>}
            {service.time && (
              <span className="svc_badge_time">
                <Clock size={10} strokeWidth={1.5} aria-hidden="true" />
                {service.time}
              </span>
            )}
          </div>
        </div>

        <div className="svc_right_col">
          <div className="svc_price_wrap">
            {hasOldPrice && <span className="svc_old_price">${service.old}</span>}
            <span className="svc_price serif">
              {service.price ? `$${service.price}` : <span className="svc_price_consult">Consultar</span>}
            </span>
          </div>
          {hasExtra && (
            <button className={`svc_expand_btn ${expanded ? 'rotated' : ''}`} aria-hidden="true">
              <ChevronDown size={18} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* ── DETALLE EXPANDIDO ── */}
      {hasExtra && (
        <div className={`svc_detail ${expanded ? 'svc_detail_open' : ''}`}>
          <div className="svc_detail_inner">
            {hasDesc && (
              <div className="svc_detail_block">
                <span className="svc_detail_label">
                  <Tag size={10} strokeWidth={1.5} aria-hidden="true" />
                  Descripción
                </span>
                <p className="svc_detail_text">{service.desc}</p>
              </div>
            )}
            {hasWhy && (
              <div className="svc_detail_block">
                <span className="svc_detail_label">
                  <TrendingDown size={10} strokeWidth={1.5} aria-hidden="true" />
                  ¿Por qué elegirlo?
                </span>
                <p className="svc_detail_text svc_detail_why">{service.why}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default ServiceCard;