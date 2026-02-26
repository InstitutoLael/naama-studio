import React, { useState } from 'react';
import { Check } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import '../styles/BookingFlow.css';

const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    need: '',
    specialist: '',
    date: '',
    notes: ''
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const needs = [
    { id: 'cambio', title: 'Necesito un cambio visible.', desc: 'Transformación y nueva estética.' },
    { id: 'mantenimiento', title: 'Busco mantener mi estilo.', desc: 'Continuidad de estilo y pulcritud.' },
    { id: 'descanso', title: 'Solo necesito silencio y descanso.', desc: 'Relajación y desconexión total.' }
  ];

  const specialists = [
    { id: 'allison', name: 'Allison', specialty: 'Make-up & Hair Styling' },
    { id: 'valeria', name: 'Valeria', specialty: 'Master Alisados & Cutting' },
    { id: 'gaby', name: 'Gaby', specialty: 'Dermo-Nails & Depilación' },
    { id: 'vivy', name: 'Vivy', specialty: 'Faciales & Maderoterapia' },
    { id: 'sin_preferencia', name: 'Sin preferencia', specialty: 'Cualquier especialista disponible' },
  ];

  const sendWhatsApp = () => {
    const needLabel = needs.find(n => n.id === formData.need)?.title || formData.need;
    const specialistLabel = specialists.find(s => s.id === formData.specialist)?.name || formData.specialist;
    const message = `*Nueva Consulta Digital - Naamá Studio*%0A%0A` +
      `*Preferencia:* ${needLabel}%0A` +
      `*Especialista:* ${specialistLabel}%0A` +
      `*Fecha sugerida:* ${formData.date}%0A` +
      `*Notas:* ${formData.notes || 'Sin notas'}%0A%0A` +
      `_Enviado desde el sistema de reserva digital._`;
    
    window.open(`https://wa.me/56979520623?text=${message}`, '_blank');
  };

  return (
    <div className="booking_flow_container">
      <SEOHead title="Consulta Digital" description="Inicia tu proceso de restauración técnica en Naamá Studio." />
      
      <div className="booking_card">
        <div className="step_indicator" style={{ width: `${(step / 5) * 100}%` }}></div>
        
        {/* Paso 1: Necesidad */}
        {step === 1 && (
          <div className="booking_step_content">
            <span className="booking_label">Paso 01 · El Origen</span>
            <h2 className="booking_question serif">"Cuéntanos cómo te sientes hoy para que podamos servirte mejor."</h2>
            
            <div className="options_grid">
              {needs.map(n => (
                <button 
                  key={n.id} 
                  className={`option_btn ${formData.need === n.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, need: n.id })}
                  aria-pressed={formData.need === n.id}
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

        {/* Paso 2: Especialista */}
        {step === 2 && (
          <div className="booking_step_content">
            <span className="booking_label">Paso 02 · Tu Especialista</span>
            <h2 className="booking_question serif">¿Con quién te gustaría <span className="booking_highlight">atenderte</span>?</h2>
            
            <div className="options_grid">
              {specialists.map(s => (
                <button 
                  key={s.id} 
                  className={`option_btn ${formData.specialist === s.id ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, specialist: s.id })}
                  aria-pressed={formData.specialist === s.id}
                >
                  <span className="option_title">{s.name}</span>
                  <span className="option_desc">{s.specialty}</span>
                </button>
              ))}
            </div>

            <div className="booking_actions">
              <button className="back_btn" onClick={prevStep}>Atrás</button>
              <button className="next_btn" disabled={!formData.specialist} onClick={nextStep}>Siguiente</button>
            </div>
          </div>
        )}

        {/* Paso 3: Fecha */}
        {step === 3 && (
          <div className="booking_step_content">
            <span className="booking_label">Paso 03 · El Momento</span>
            <h2 className="booking_question serif">¿Cuándo deseas tu <br /> <span className="booking_highlight">sesión</span>?</h2>
            
            <div className="booking_input_area">
              <input 
                type="date" 
                className="booking_input" 
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                aria-label="Fecha deseada para la sesión"
              />
            </div>
            
            <div className="booking_actions">
              <button className="back_btn" onClick={prevStep}>Atrás</button>
              <button className="next_btn" disabled={!formData.date} onClick={nextStep}>Siguiente</button>
            </div>
          </div>
        )}

        {/* Paso 4: Notas */}
        {step === 4 && (
          <div className="booking_step_content">
            <span className="booking_label">Paso 04 · Nota Técnica</span>
            <h2 className="booking_question serif">¿Alguna nota para <br /> tu <span className="booking_highlight">especialista</span>?</h2>
            
            <div className="booking_input_area">
              <textarea 
                className="booking_input booking_textarea" 
                placeholder="Ej: Tengo poco tiempo / Quiero silencio total / Alergias..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                aria-label="Notas adicionales para el especialista"
              />
            </div>
            
            <div className="booking_actions">
              <button className="back_btn" onClick={prevStep}>Atrás</button>
              <button className="next_btn" onClick={nextStep}>Finalizar Consulta</button>
            </div>
          </div>
        )}

        {/* Paso 5: Confirmación */}
        {step === 5 && (
          <div className="booking_step_content booking_completion_wrapper">
            <div className="booking_icon_box">
              <Check size={40} strokeWidth={1} />
            </div>
            <h2 className="serif booking_completion_title">¡Todo <span className="booking_highlight">Listo</span>!</h2>
            <p className="booking_completion_sub">
              Tu espacio está siendo preparado. Envíanos tu consulta por WhatsApp y te confirmamos disponibilidad.
            </p>
            
            <div className="booking_actions_vertical">
               <button className="next_btn booking_whatsapp_btn" onClick={sendWhatsApp}>
                 📲 Confirmar por WhatsApp
               </button>
               <a 
                 href="https://www.instagram.com/naamastudio_/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="booking_instagram_link"
               >
                 Ver trabajos en Instagram
               </a>
            </div>
            
            <p className="booking_completion_footer">
               Gracias por confiar en nuestra ingeniería del cuidado. 🌸
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;
