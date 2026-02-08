import React from 'react';
import SEOHead from '../components/SEOHead';
import '../styles/Global.css';
import '../styles/StaffPage.css';

const specialists = [
  { name: "Allison", specialty: "Make-up & Hair Styling", initial: "A" },
  { name: "Cami", specialty: "Technical Color & Esthetics", initial: "C" },
  { name: "Valeria", specialty: "Master Alisados & Cutting", initial: "V" },
  { name: "Gaby", specialty: "Dermo-Nails & Depilation", initial: "G" },
  { name: "Vivy", specialty: "High-End Facials & Maderotherapy", initial: "V" }
];

const StaffPage = () => {
  return (
    <div className="staff_page">
      <SEOHead 
        title="Nuestro Equipo" 
        description="Conoce a los especialistas detrás de la ingeniería del cuidado en Naamá Studio." 
      />

      <header className="staff_header reveal">
        <span className="world_category_label">Protocolo de Equipo</span>
        <h1 className="staff_title serif">Hospitalidad Técnica</h1>
        <p className="staff_subtitle">
          Un equipo de especialistas dedicados a la ciencia del descanso y la excelencia estética. Cada inicial representa un legado de cuidado.
        </p>
      </header>
      
      <main className="staff_grid_editorial">
        {specialists.map((pro, index) => (
          <div key={index} className="staff_card_editorial reveal" style={{ transitionDelay: `${index * 0.1}s` }}>
            <div className="staff_placeholder_initial serif">
              {pro.initial}
            </div>
            <div className="staff_info_box">
              <h3 className="staff_full_name">{pro.name}</h3>
              <p className="staff_specialty">{pro.specialty}</p>
            </div>
          </div>
        ))}
      </main>

      <section className="container section-padding reveal" style={{ textAlign: 'center', marginTop: '100px' }}>
         <h2 className="serif" style={{ fontSize: '1.8rem' }}>La maestría no necesita filtros.</h2>
         <p style={{ opacity: 0.5, marginTop: '20px' }}>Solo técnica, silencio y hospitalidad.</p>
      </section>
    </div>
  );
};

export default StaffPage;
