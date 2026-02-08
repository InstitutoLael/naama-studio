import React from 'react';
import { Clock, Info } from 'lucide-react';

const ServiceCard = ({ service }) => {
  return (
    <div className="service-card animate-fade-in">
      <div className="service-header">
        <span className="service-cat">{service.cat}</span>
        <h3 className="service-name serif">{service.name}</h3>
        <div className="service-meta">
          <span className="meta-item"><Clock size={12} /> {service.time}</span>
          <span className="meta-item">👤 {service.worker}</span>
        </div>
      </div>

      <div className="service-pricing">
        {service.old !== "---" && <span className="price-old">${service.old}</span>}
        <span className="price-new">${service.price}</span>
      </div>

      <div className="service-details">
        <div className="detail-section">
          <span className="detail-label">Descripción</span>
          <p className="detail-text">{service.desc}</p>
        </div>
        <div className="naama-value">
          <span className="value-label">Valor Naamá</span>
          <p className="value-text">{service.why}</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .service-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 25px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: var(--transition);
        }
        .service-card:hover { border-color: #333; transform: scale(1.02); }
        
        .service-cat {
          color: var(--accent-color);
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }
        .service-name { font-size: 1.4rem; margin-bottom: 12px; color: #fff; }
        .service-meta { display: flex; gap: 15px; margin-bottom: 20px; }
        .meta-item { color: #666; font-size: 0.7rem; font-weight: 600; display: flex; align-items: center; gap: 5px; }

        .service-pricing { margin-bottom: 20px; }
        .price-old { text-decoration: line-through; color: #444; font-size: 0.8rem; display: block; }
        .price-new { font-size: 1.5rem; font-weight: 800; color: #fff; }

        .detail-section { margin-bottom: 15px; }
        .detail-label { font-size: 0.65rem; font-weight: 700; color: #444; text-transform: uppercase; display: block; margin-bottom: 5px; }
        .detail-text { color: #888; font-size: 0.8rem; line-height: 1.5; }

        .naama-value {
          background: #0f0f0f;
          padding: 15px;
          border-radius: 8px;
          border-left: 2px solid var(--accent-color);
        }
        .value-label { color: var(--accent-color); font-weight: 800; font-size: 0.6rem; text-transform: uppercase; display: block; margin-bottom: 5px; }
        .value-text { font-size: 0.75rem; color: #ccc; line-height: 1.4; font-style: italic; }
      `}} />
    </div>
  );
};

export default ServiceCard;
