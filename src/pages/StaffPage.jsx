import React, { useState, useMemo } from 'react';
import { servicesData } from '../data/servicesData';
import { Search, Clock, User } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import '../styles/Global.css';
import '../styles/StaffPage.css';

const StaffPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = useMemo(() => {
    return servicesData.filter(s => {
      const search = searchTerm.toLowerCase();
      return s.name.toLowerCase().includes(search) || 
             s.worker.toLowerCase().includes(search) ||
             s.cat.toLowerCase().includes(search);
    });
  }, [searchTerm]);

  return (
    <div className="staff_container">
      <SEOHead 
        title="Consulta de Precios" 
        description="Herramienta interna de Naamá Studio para consulta rápida de valores y especialistas." 
      />

      <header className="staff_header reveal">
        <h1 className="serif">Consulta de Precios</h1>
        <p>
          Optimizado para el equipo Naamá. 
          Encuentra valores, tiempos de servicio y especialistas asignados de forma instantánea.
        </p>
        
        <div className="search_wrapper">
          <Search size={20} className="search_icon" />
          <input 
            type="text" 
            placeholder="Busca por servicio, categoría o profesional..." 
            className="staff_input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="staff_content">
        <span className="results_count reveal">
          Servicios encontrados: <strong>{filteredServices.length}</strong>
        </span>

        <div className="staff_services_list">
          {filteredServices.map((service, index) => (
            <div key={index} className="staff_item reveal">
              <div className="item_info">
                <span className="item_cat">{service.cat}</span>
                <h3 className="item_name serif">{service.name}</h3>
                <div className="item_worker">
                  <User size={12} style={{ marginRight: '5px' }} />
                  <span>Especialista: {service.worker}</span>
                </div>
              </div>
              <div className="item_pricing">
                <span className="item_price_val">${service.price}</span>
                <div className="item_time_val">
                  <Clock size={10} style={{ marginRight: '4px' }} />
                  <span>{service.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StaffPage;
