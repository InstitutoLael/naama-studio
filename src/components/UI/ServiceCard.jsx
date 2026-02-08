import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import '../../styles/ServiceCard.css';

const ServiceCard = ({ service, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`service_card ${isExpanded ? 'expanded' : ''}`} onClick={() => setIsExpanded(!isExpanded)}>
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
          <p className="service_description_text">{service.desc}</p>
          <div className="protocol_box">
            <span className="detail_label">Protocolo Técnico</span>
            <p className="detail_text">{service.why}</p>
          </div>
        </div>
      )}

      <div className="expand_hint">
        {isExpanded ? <ChevronUp size={16} strokeWidth={1} /> : <ChevronDown size={16} strokeWidth={1} />}
      </div>
    </div>
  );
};

export default ServiceCard;
