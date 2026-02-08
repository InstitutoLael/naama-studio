import React, { useState, useMemo } from 'react';
import { servicesData } from '../data/servicesData';
import { Search, ChevronRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const StaffPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const workers = useMemo(() => {
    const workerSet = new Set();
    servicesData.forEach(s => {
      s.worker.split(',').forEach(w => workerSet.add(w.trim()));
    });
    return Array.from(workerSet).sort();
  }, []);

  const filteredServices = useMemo(() => {
    return servicesData.filter(s => {
      const match = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    s.worker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.cat.toLowerCase().includes(searchTerm.toLowerCase());
      return match;
    });
  }, [searchTerm]);

  return (
    <div className="staff-page animate-fade-in">
      <SEOHead title="Buscador de Precios" description="Consulta rápida de precios y servicios para el equipo de Naamá Studio." />
      <header className="staff-header">
        <div className="header-container">
          <h1 className="serif">Buscador Consultoría</h1>
          <p>Herramienta interna para consulta rápida de precios y servicios por profesional.</p>
          
          <div className="search-bar-wrapper">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Busca por servicio, precio o trabajadora..." 
              className="staff-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="staff-content">
        <div className="staff-info-banner">
          <p>Resultados encontrados: <strong>{filteredServices.length}</strong></p>
        </div>

        <div className="services-list">
          {filteredServices.map((service, index) => (
            <div key={index} className="staff-service-item">
              <div className="item-main">
                <span className="item-cat">{service.cat}</span>
                <h3 className="item-name serif">{service.name}</h3>
                <span className="item-worker">👤 {service.worker}</span>
              </div>
              <div className="item-price">
                <span className="price-value">${service.price}</span>
                <span className="item-time">🕒 {service.time}</span>
              </div>
              <div className="item-why">
                <p>{service.why}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .staff-page { padding-top: 100px; min-height: 100vh; }
        .staff-header { background: #000; border-bottom: 1px solid var(--border-color); padding: 60px 20px 40px; text-align: center; }
        .header-container { max-width: 800px; margin: 0 auto; }
        .staff-header h1 { font-size: 3rem; color: var(--accent-color); margin-bottom: 10px; }
        .staff-header p { color: #666; margin-bottom: 40px; }

        .search-bar-wrapper { position: relative; max-width: 600px; margin: 0 auto; }
        .search-icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: #444; }
        .staff-search-input {
          width: 100%;
          background: #111;
          border: 1px solid #333;
          border-radius: 50px;
          padding: 18px 20px 18px 55px;
          color: #fff;
          font-size: 1rem;
          transition: var(--transition);
        }
        .staff-search-input:focus { border-color: var(--accent-color); outline: none; background: #000; }

        .staff-content { max-width: 1000px; margin: 40px auto; padding: 0 20px; }
        .staff-info-banner { margin-bottom: 20px; color: #444; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }

        .services-list { display: flex; flex-direction: column; gap: 15px; }
        .staff-service-item {
          background: #080808;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 20px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: center;
        }
        .item-cat { font-size: 0.6rem; color: var(--accent-color); font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px; }
        .item-name { font-size: 1.2rem; margin-bottom: 5px; }
        .item-worker { font-size: 0.75rem; color: #666; font-weight: 600; }
        
        .item-price { text-align: right; }
        .price-value { font-size: 1.5rem; font-weight: 800; color: #fff; display: block; }
        .item-time { font-size: 0.7rem; color: #444; }

        .item-why { grid-column: 1 / -1; border-top: 1px solid #111; padding-top: 15px; color: #888; font-size: 0.8rem; font-style: italic; }

        @media (max-width: 600px) {
          .staff-service-item { grid-template-columns: 1fr; text-align: left; }
          .item-price { text-align: left; border-top: 1px solid #111; padding-top: 15px; }
        }
      `}} />
    </div>
  );
};

export default StaffPage;
