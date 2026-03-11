import React, { useState } from 'react';
import { ChevronDown, Clock, User, Tag, TrendingDown } from 'lucide-react';
import './ServiceCard.css';

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
        className="svc_main"
        onClick={() => hasExtra && setExpanded(!expanded)}
        role={hasExtra ? 'button' : undefined}
        tabIndex={hasExtra ? 0 : undefined}
        aria-expanded={hasExtra ? expanded : undefined}
        onKeyDown={(e) => hasExtra && e.key === 'Enter' && setExpanded(!expanded)}
      >
        {/* Nombre + categoría */}
        <div className="svc_name_col">
          <h3 className="svc_name serif">{service.name}</h3>
          {service.cat && (
            <span className="svc_cat">{service.cat}</span>
          )}
        </div>

        {/* Meta: duración + worker */}
        <div className="svc_meta_col">
          {service.time && (
            <span className="svc_meta_item">
              <Clock size={11} strokeWidth={1.5} aria-hidden="true" />
              {service.time}
            </span>
          )}
          {service.worker && (
            <span className="svc_meta_item">
              <User size={11} strokeWidth={1.5} aria-hidden="true" />
              {service.worker}
            </span>
          )}
        </div>

        {/* Precio + chevron */}
        <div className="svc_price_col">
          <div className="svc_price_wrap">
            {hasOldPrice && (
              <span className="svc_old_price">${service.old}</span>
            )}
            <span className="svc_price">
              {service.price
                ? `$${service.price}`
                : <span className="svc_price_consult">Consultar</span>
              }
            </span>
          </div>
          {hasExtra && (
            <ChevronDown
              size={15}
              strokeWidth={1.5}
              className={`svc_chevron ${expanded ? 'rotated' : ''}`}
              aria-hidden="true"
            />
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