import React from 'react';
import '../../styles/ServiceCard.css';

const ServiceCard = ({ service }) => {
  return (
    <div className="service_card">
      <div className="card_top">
        <div className="service_name_row">
          <h3 className="service_name_text">{service.name}</h3>
          <span className="service_price_text">${service.price}</span>
        </div>
        
        <div className="service_meta_data">
          <span className="meta_tag">{service.cat}</span>
          <span className="meta_tag">{service.time}</span>
          <span className="meta_tag">{service.worker}</span>
        </div>

        <p className="service_description_text">{service.desc}</p>
      </div>

      <div className="card_bottom">
        <span className="detail_label">Protocolo Técnico</span>
        <p className="detail_text">{service.why}</p>
      </div>
    </div>
  );
};

export default ServiceCard;
