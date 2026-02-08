import React, { useState } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import '../styles/BookingFlow.css';

const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    need: '',
    date: '',
    notes: ''
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const needs = [
    { id: 'cambio', title: 'Necesito un cambio visible.', desc: 'Prioridad: Transformación y nueva estética.' },
    { id: 'mantenimiento', title: 'Busco mantener mi estilo.', desc: 'Prioridad: Continuidad de estilo y pulcritud.' },
    { id: 'descanso', title: 'Solo necesito silencio y descanso.', desc: 'Prioridad: Relajación y desconexión total (Lujo).' }
  ];

  return (
    <div className="booking_flow_container">
      <SEOHead title="Consulta Digital" description="Inicia tu proceso de restauración técnica en Naamá Studio." />
      
      <div className="booking_card">
        <div className="step_indicator" style={{ width: `${(step / 4) * 100}%` }}></div>
        
        {step === 1 && (
          <div className="booking_step_content">
            <span className="booking_label">Preparamos tu llegada</span>
            <h2 className="booking_question serif">"Cuéntanos cómo te sientes hoy para que podamos servirte mejor."</h2>
            
            <div className="options_grid">
              {needs.map(n => (
                <button 
                  key={n.id} 
                  className={`option_btn ${formData.need === n.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, need: n.id })}
                >
                  <span className="option_title">{n.title}</span>
                  <span className="option_desc">{n.desc}</span>
                </button>
              ))}
            </div>
            
            <div className="booking_actions" style={{ justifyContent: 'flex-end' }}>
              <button className="next_btn" disabled={!formData.need} onClick={nextStep}>Siguiente</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="booking_step_content">
            <span className="booking_label">Paso 02 · El Momento</span>
            <h2 className="booking_question serif">¿Cuándo deseas tu <br /> <span style={{ color: 'var(--accent-clay)' }}>sesión</span>?</h2>
            
            <div className="booking_input_area">
              <input 
                type="date" 
                className="booking_input" 
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            
            <div className="booking_actions">
              <button className="back_btn" onClick={prevStep}>Atrás</button>
              <button className="next_btn" disabled={!formData.date} onClick={nextStep}>Siguiente</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="booking_step_content">
            <span className="booking_label">Paso 03 · Nota Técnica</span>
            <h2 className="booking_question serif">¿Alguna nota para <br /> tu <span style={{ color: 'var(--accent-clay)' }}>especialista</span>?</h2>
            
            <div className="booking_input_area">
              <textarea 
                className="booking_input" 
                style={{ height: '150px', resize: 'none' }}
                placeholder="Ej: Tengo poco tiempo / Quiero silencio total / Alergias..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            
            <div className="booking_actions">
              <button className="back_btn" onClick={prevStep}>Atrás</button>
              <button className="next_btn" onClick={nextStep}>Finalizar Consulta</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="booking_step_content" style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '20px', background: 'var(--bg-linen)', borderRadius: '100px', marginBottom: '40px', color: 'var(--accent-clay)' }}>
              <Check size={40} strokeWidth={1} />
            </div>
            <h2 className="serif" style={{ fontSize: '3rem', marginBottom: '20px' }}>Consulta <span style={{ color: 'var(--accent-clay)' }}>Completada</span></h2>
            <p style={{ color: 'rgba(43,43,43,0.5)', marginBottom: '50px', fontSize: '1.2rem' }}>
              "Tu espacio ha sido reservado. Todo estará listo para recibirte con la calma que mereces. Hasta pronto."
            </p>
            
            <a href="https://naamastudio.setmore.com/" target="_blank" rel="noopener noreferrer">
               <button className="next_btn" style={{ padding: '25px 60px' }}>Confirmar en Setmore</button>
            </a>
            
            <p style={{ marginTop: '40px', fontSize: '0.8rem', color: 'rgba(43,43,43,0.3)' }}>
               Te esperamos para servirte con excelencia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;
