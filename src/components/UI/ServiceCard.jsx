import React from 'react';
import { Clock, User } from 'lucide-react';
import '../../styles/ServiceCard.css';

const ServiceCard = ({ service }) => {
  return (
    <div className="service_card reveal">
      <div className="service_card_top">
        <span className="service_category">{service.cat}</span>
        <h3 className="service_name serif">{service.name}</h3>
        
        <div className="service_meta">
          <div className="meta_item">
            <Clock size={14} strokeWidth={1.5} />
            <span>{service.time}</span>
          </div>
          <div className="meta_item">
            <User size={14} strokeWidth={1.5} />
            <span>{service.worker}</span>
          </div>
        </div>

        <div className="service_pricing">
          {service.old !== "---" && <span className="price_old">${service.old}</span>}
          <div className="price_new">${service.price}</div>
        </div>

        <p className="service_description">{service.desc}</p>
      </div>

      <div className="naama_experience">
        <span className="experience_label">El Valor Naamá</span>
        <p className="experience_text">{service.why}</p>
      </div>
    </div>
  );
};

export default ServiceCard;
