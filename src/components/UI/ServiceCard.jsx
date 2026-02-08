import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import '../../styles/ServiceCard.css';

const ServiceCard = ({ service, defaultExpanded = false }) => {
  const hasDetails = service.why || service.desc;
  const [isExpanded, setIsExpanded] = useState(defaultExpanded && hasDetails);

  const toggleExpand = () => {
    if (hasDetails) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div 
      className={`service_card ${isExpanded ? 'expanded' : ''} ${!hasDetails ? 'no_expand' : ''}`} 
      onClick={toggleExpand}
    >
      <div className="card_top">
        <div className="service_name_row">
          <h3 className="service_name_text serif">{service.name}</h3>
          <span className="service_price_text">${service.price}</span>
        </div>
        
        <div className="service_meta_data">
          <span className="meta_tag">{service.time}</span>
          <span>·</span>
          <span className="meta_tag">{service.worker}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="card_expanded_content reveal">
          <div className="expanded_technical_grid">
             <div className="technical_info_item">
                <span className="detail_label">Protocolo Técnico</span>
                <p className="detail_text">{service.why}</p>
             </div>
             <div className="technical_meta_item">
                <div className="meta_item_block">
                   <span className="detail_label">Inversión de Tiempo</span>
                   <p className="meta_value serif">{service.time}</p>
                </div>
                <div className="meta_item_block">
                   <span className="detail_label">Especialista</span>
                   <p className="meta_value serif">{service.worker}</p>
                </div>
             </div>
          </div>
          <div className="service_description_block">
            <span className="detail_label">Descripción</span>
            <p className="service_description_text">{service.desc}</p>
          </div>
          
          <div className="card_cta_row">
            <button 
              className="service_booking_btn"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://wa.me/56979520623?text=Hola, me interesa el servicio: *${service.name}*`, '_blank');
              }}
            >
              Consultar Disponibilidad
            </button>
          </div>
        </div>
      )}

      {hasDetails && (
        <div className="expand_hint">
          {isExpanded ? <ChevronUp size={14} strokeWidth={1} /> : <ChevronDown size={14} strokeWidth={1} />}
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
