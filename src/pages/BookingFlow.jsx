import React, { useState, useMemo, useEffect } from 'react';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { servicesData } from '../data/servicesData';
import { mundos } from '../data/categories';
import SEOHead from '../components/shared/SEOHead';
import '../styles/Global.css';
import '../styles/BookingFlow.css';

const specialists = [
  { name: "Valeria", role: "Colorista & Alisados", color: "#3E4A3B", initial: "V" },
  { name: "Vivy", role: "Facial & Bienestar", color: "#C17A5A", initial: "V" },
  { name: "Gaby", role: "Nails & Cejas", color: "#B79A5B", initial: "G" },
  { name: "Allison", role: "Make-up & Peinados", color: "#2A3228", initial: "A" },
  { name: "Michelle", role: "Podología Clínica", color: "#4A5A60", initial: "M" }
];

const BookingFlow = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [slideDirection, setSlideDirection] = useState('slide_in');
  
  const [selectedMundo, setSelectedMundo] = useState('capilar');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const [dateError, setDateError] = useState('');

  const steps = ["Servicio", "Especialista", "Fecha", "Hora", "Confirmar"];

  // Step 1 Filtering
  const activeWorld = useMemo(() => {
    return mundos.find(m => m.id === selectedMundo);
  }, [selectedMundo]);

  const filteredServices = useMemo(() => {
    if (!activeWorld) return [];
    return servicesData.filter(s => activeWorld.categories.includes(s.cat));
  }, [activeWorld]);

  // Step 2 Filtering
  const availableSpecialists = useMemo(() => {
    if (!selectedService) return [];
    const workerField = selectedService.worker || "";
    if (!workerField) return specialists;
    const workers = workerField.split(',').map(w => w.trim().toLowerCase());
    const filtered = specialists.filter(spec => workers.includes(spec.name.toLowerCase()));
    return filtered.length > 0 ? filtered : specialists;
  }, [selectedService]);

  // Step 3 Date helpers
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMaxDateString = () => {
    const max = new Date();
    max.setMonth(max.getMonth() + 3);
    const year = max.getFullYear();
    const month = String(max.getMonth() + 1).padStart(2, '0');
    const day = String(max.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (value) => {
    setDateError('');
    if (!value) {
      setSelectedDate('');
      return;
    }
    const selected = new Date(value + 'T12:00:00');
    if (selected.getDay() === 0) {
      setDateError('El salón no abre los domingos. Por favor, selecciona otro día.');
      setSelectedDate(value);
      return;
    }
    setSelectedDate(value);
  };

  // Step 4 Hours helper
  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];
    const dateObj = new Date(selectedDate + 'T12:00:00');
    const day = dateObj.getDay();
    if (day === 5) {
      // Viernes: hasta 18:00
      return ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
    }
    if (day === 6) {
      // Sábado: hasta 16:00
      return ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00"];
    }
    // Lunes a Jueves: Lun-Vie hasta 19:00
    return ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
  }, [selectedDate]);

  const handleNext = () => {
    setSlideDirection('slide_left');
    setTimeout(() => {
      setActiveStep(prev => prev + 1);
      setSlideDirection('slide_in');
    }, 250);
  };

  const handleBack = () => {
    setSlideDirection('slide_right');
    setTimeout(() => {
      setActiveStep(prev => prev - 1);
      setSlideDirection('slide_in');
    }, 250);
  };

  const canContinue = useMemo(() => {
    if (activeStep === 1) return selectedService !== null;
    if (activeStep === 2) return selectedSpecialist !== null;
    if (activeStep === 3) return selectedDate !== '' && !dateError;
    if (activeStep === 4) return selectedTime !== '';
    return true;
  }, [activeStep, selectedService, selectedSpecialist, selectedDate, selectedTime, dateError]);

  const sendWhatsApp = () => {
    const mensaje = `Hola Naamá Studio ■ Quiero reservar:
■ Servicio: ${selectedService.name}
■ Especialista: ${selectedSpecialist.name}
■ Fecha: ${selectedDate}
■ Hora: ${selectedTime}
¡Muchas gracias!`;
    window.open(`https://wa.me/56979520623?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeStep]);

  return (
    <div className="booking_page container">
      <SEOHead title="Reserva tu Experiencia" description="Flujo de agendamiento premium Naamá Studio." />
      
      {/* ── BARRA DE PROGRESO ── */}
      <div className="progress_bar_container">
        <div className="progress_line_bg" />
        <div className="progress_line" style={{ width: `${(activeStep - 1) / 4 * 100}%` }} />
        <div className="progress_nodes">
          {steps.map((st, i) => {
            const stepNum = i + 1;
            let nodeClass = "future";
            if (stepNum === activeStep) nodeClass = "active";
            else if (stepNum < activeStep) nodeClass = "completed";
            
            return (
              <div key={st} className={`progress_node ${nodeClass}`}>
                <span className="node_circle">
                  {nodeClass === "completed" ? <Check size={12} strokeWidth={3} /> : stepNum}
                </span>
                <span className="node_label">{st}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CONTENIDO DEL FLUJO CON ANIMACIÓN ── */}
      <div className={`booking_flow_card ${slideDirection}`}>
        
        {/* PASO 1: SERVICIO */}
        {activeStep === 1 && (
          <div className="booking_step">
            <h2 className="booking_step_title serif">¿Qué experiencia buscas hoy?</h2>
            <p className="booking_step_sub">Puedes filtrar por categoría o buscar directamente.</p>
            
            {/* World Filters */}
            <div className="world_filter_pills">
              {mundos.map(m => (
                <button
                  key={m.id}
                  className={`world_pill ${selectedMundo === m.id ? 'active' : ''}`}
                  onClick={() => setSelectedMundo(m.id)}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {/* List of Services */}
            <div className="booking_services_list">
              {filteredServices.map((service, index) => {
                const isSelected = selectedService?.name === service.name;
                return (
                  <div
                    key={`${service.name}-${index}`}
                    className={`booking_service_row ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedService(service)}
                  >
                    <span className="bs_index">{(index + 1).toString().padStart(2, '0')}</span>
                    <div className="bs_name_group">
                      <span className="bs_name">{service.name}</span>
                      <span className="bs_category">{service.cat}</span>
                    </div>
                    <span className="bs_duration">{service.time}</span>
                    <span className="bs_price">${service.price || 'Consultar'}</span>
                    <div className="bs_select_indicator">
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 2: ESPECIALISTA */}
        {activeStep === 2 && (
          <div className="booking_step">
            <h2 className="booking_step_title serif">¿Con quién quieres tu experiencia?</h2>
            <p className="booking_step_sub">Elige una de nuestras especialistas calificadas.</p>
            
            <div className="booking_specialists_grid">
              {/* Opción Sorpréndeme */}
              <div 
                className={`booking_spec_card auto_spec ${selectedSpecialist?.name === "Sin preferencia" ? 'selected' : ''}`}
                onClick={() => setSelectedSpecialist({ name: "Sin preferencia", role: "Te asignaremos la especialista disponible", color: "var(--accent-walnut)" })}
              >
                <div className="spec_card_top" style={{ backgroundColor: '#1A1A1A' }}>
                  <span className="spec_initial">?</span>
                </div>
                <div className="spec_card_bottom">
                  <h4 className="spec_name serif">Sin preferencia</h4>
                  <p className="spec_role">Sorpréndeme</p>
                  <span className="spec_badge_available">Disponible</span>
                </div>
              </div>

              {/* Especialistas Filtrados */}
              {availableSpecialists.map(spec => {
                const isSelected = selectedSpecialist?.name === spec.name;
                return (
                  <div 
                    key={spec.name}
                    className={`booking_spec_card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedSpecialist(spec)}
                  >
                    <div className="spec_card_top" style={{ backgroundColor: spec.color }}>
                      <span className="spec_initial">{spec.initial}</span>
                    </div>
                    <div className="spec_card_bottom">
                      <h4 className="spec_name serif">{spec.name}</h4>
                      <p className="spec_role">{spec.role}</p>
                      <span className="spec_badge_available">Disponible</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 3: FECHA */}
        {activeStep === 3 && (
          <div className="booking_step date_step_layout">
            <h2 className="booking_step_title serif">¿Cuándo viene tu momento?</h2>
            <p className="booking_step_sub">Selecciona un día en los próximos 3 meses.</p>
            
            <div className="date_input_wrapper">
              <input 
                type="date"
                className={`premium_date_input ${dateError ? 'error' : ''}`}
                min={getTodayString()}
                max={getMaxDateString()}
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
              />
              {dateError && <p className="premium_date_error">{dateError}</p>}
            </div>
          </div>
        )}

        {/* PASO 4: HORA */}
        {activeStep === 4 && (
          <div className="booking_step">
            <h2 className="booking_step_title serif">¿A qué hora te acomodamos?</h2>
            <p className="booking_step_sub">Horarios disponibles para el día seleccionado.</p>
            
            <div className="time_pills_grid">
              {availableTimes.map(time => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    className={`time_pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 5: CONFIRMACIÓN */}
        {activeStep === 5 && (
          <div className="booking_step confirmation_layout">
            <h2 className="booking_step_title serif">Tu experiencia está lista.</h2>
            <p className="booking_step_sub">Revisa los detalles antes de solicitar tu cita.</p>
            
            <div className="booking_summary_card">
              <div className="summary_row">
                <span className="summary_label">Servicio</span>
                <span className="summary_value serif">{selectedService?.name}</span>
              </div>
              <div className="summary_row">
                <span className="summary_label">Especialista</span>
                <span className="summary_value serif">{selectedSpecialist?.name}</span>
              </div>
              <div className="summary_row">
                <span className="summary_label">Fecha</span>
                <span className="summary_value serif">{selectedDate}</span>
              </div>
              <div className="summary_row">
                <span className="summary_label">Hora</span>
                <span className="summary_value serif">{selectedTime}</span>
              </div>
              <div className="summary_divider" />
              <div className="summary_row total_row">
                <span className="summary_label">Total Estimado</span>
                <span className="summary_value total_price">${selectedService?.price || 'Consultar'}</span>
              </div>
              
              <p className="summary_notice">
                Tu reserva se confirma por WhatsApp en menos de 1 hora.
              </p>
            </div>

            <button 
              className="btn_whatsapp_confirm"
              onClick={sendWhatsApp}
            >
              Confirmar por WhatsApp
            </button>
          </div>
        )}

      </div>

      {/* ── BOTONES DE NAVEGACIÓN ── */}
      <div className="booking_navigation">
        {activeStep > 1 ? (
          <button className="nav_btn_back" onClick={handleBack}>
            <ArrowLeft size={16} /> Volver
          </button>
        ) : (
          <div />
        )}
        
        {activeStep < 5 && (
          <button 
            className="nav_btn_continue" 
            onClick={handleNext}
            disabled={!canContinue}
          >
            Continuar <ArrowRight size={16} />
          </button>
        )}
      </div>

    </div>
  );
};

export default BookingFlow;
