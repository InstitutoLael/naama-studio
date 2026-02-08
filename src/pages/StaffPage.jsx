import React, { useState, useMemo } from 'react';
import { servicesData } from '../data/servicesData';
import { Search } from 'lucide-react';
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
    <div className="staff_page container">
      <SEOHead 
        title="Consulta de Valores" 
        description="Portal de transparencia técnica y consulta de valores para el equipo Naamá Studio." 
      />

      <header className="staff_header reveal">
        <span className="world_category_label">Protocolo de Equipo</span>
        <h1 className="staff_title serif">Consulta de Valores</h1>
        <p className="staff_subtitle">
          Herramienta técnica de transparencia. Encuentra información sobre tratamientos, especialistas y tiempos de restauración de forma eficiente.
        </p>
      </header>
      
      <div className="staff_search_container reveal delay-1">
        <Search size={24} strokeWidth={1} style={{ marginRight: '20px', color: 'rgba(26,26,26,0.2)' }} />
        <input 
          type="text" 
          placeholder="Filtrar por tratamiento o especialista..." 
          className="staff_search_input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <main className="staff_results_list">
        {filteredServices.map((service, index) => (
          <div key={index} className="staff_item_row reveal">
            <div className="staff_item_main">
              <span className="staff_item_meta">{service.cat}</span>
              <h3 className="staff_item_name serif">{service.name}</h3>
              <div className="staff_item_meta">
                <span>Sesión: {service.time}</span>
                <span>·</span>
                <span>Técnico: {service.worker}</span>
              </div>
            </div>
            <div className="staff_item_price">${service.price}</div>
          </div>
        ))}

        {filteredServices.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.3 }}>
            <p className="serif" style={{ fontSize: '1.5rem' }}>No se han encontrado registros.</p>
          </div>
        )}
      </main>

      <div style={{ height: '100px' }}></div>
    </div>
  );
};

export default StaffPage;
