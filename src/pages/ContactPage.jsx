import React, { useState, useMemo } from 'react';
import { MapPin, Clock, Phone, Send, ChevronDown } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import '../styles/Global.css';
import '../styles/ContactPage.css';

const faqs = [
  {
    q: '¿Necesito agendar cita previa?',
    a: 'Sí, recomendamos agendar con anticipación para garantizar tu espacio y especialista de preferencia. Puedes hacerlo directamente por WhatsApp o a través de nuestra plataforma de reservas.'
  },
  {
    q: '¿Puedo llegar sin cita?',
    a: 'Dependiendo de la disponibilidad del día, podemos atenderte como walk-in. Sin embargo, las clientas con cita siempre tienen prioridad.'
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos efectivo, débito, crédito (Visa, Mastercard) y transferencia electrónica.'
  },
  {
    q: '¿Tienen estacionamiento?',
    a: 'No contamos con estacionamiento propio, pero hay estacionamiento público disponible en las calles aledañas a Arcadia 1297.'
  },
  {
    q: '¿Pueden atender eventos corporativos?',
    a: 'Sí, contamos con packs B2B para empresas. Visita nuestra sección de Empresas o contáctanos directamente para diseñar una jornada a medida.'
  },
  {
    q: '¿Trabajan con productos veganos o cruelty-free?',
    a: 'Sí, priorizamos productos de alta calidad que respeten estándares éticos. Consulta con tu especialista sobre las líneas disponibles para tu tratamiento.'
  }
];

const schedule = [
  { day: 'Lunes a Viernes', hours: '09:00 – 19:00' },
  { day: 'Sábado',          hours: '09:00 – 17:00' },
  { day: 'Domingo',         hours: 'Cerrado' }
];

const ContactPage = () => {
  const [form, setForm]       = useState({ name: '', phone: '', message: '' });
  const [openFaq, setOpenFaq] = useState(null);

  const isOpen = useMemo(() => {
    const now  = new Date();
    const day  = now.getDay();
    const time = now.getHours() * 60 + now.getMinutes();
    if (day === 0) return false;
    if (day === 6) return time >= 540 && time < 1020;
    return time >= 540 && time < 1140;
  }, []);

  const sendWhatsApp = (e) => {
    e.preventDefault();
    const msg =
      `*Consulta desde Web — Naamá Studio*%0A%0A` +
      `*Nombre:* ${form.name}%0A` +
      `*Teléfono:* ${form.phone}%0A` +
      `*Mensaje:* ${form.message}%0A%0A` +
      `_Enviado desde la página de contacto._`;
    window.open(`https://wa.me/56979520623?text=${msg}`, '_blank');
  };

  return (
    <div className="contact_page">
      <SEOHead
        title="Contacto · Naamá Studio"
        description="Escríbenos, visítanos o agenda directamente. Arcadia 1297, San Miguel, Santiago."
      />

      {/* ── HEADER ── */}
      <header className="contact_header reveal">
        <span className="world_category_label">Contacto</span>
        <h1 className="contact_title serif">
          Estamos para <span className="text_gold">Servirte</span>
        </h1>
        <p className="world_description">
          Escríbenos, visítanos o agenda directamente con nuestro equipo de hospitalidad.
        </p>
      </header>

      {/* ── GRID: FORM + INFO ── */}
      <div className="contact_grid container">

        {/* Formulario */}
        <form className="contact_form reveal delay-1" onSubmit={sendWhatsApp} noValidate>
          <div className="form_group">
            <label htmlFor="contact_name" className="form_label">Nombre</label>
            <input
              id="contact_name"
              type="text"
              className="form_input"
              placeholder="Tu nombre completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              aria-required="true"
            />
          </div>
          <div className="form_group">
            <label htmlFor="contact_phone" className="form_label">Teléfono</label>
            <input
              id="contact_phone"
              type="tel"
              className="form_input"
              placeholder="+56 9 XXXX XXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              aria-required="true"
            />
          </div>
          <div className="form_group">
            <label htmlFor="contact_message" className="form_label">Mensaje</label>
            <textarea
              id="contact_message"
              className="form_input form_textarea"
              placeholder="¿En qué podemos ayudarte?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              aria-required="true"
            />
          </div>
          <button
            type="submit"
            className="contact_submit_btn"
            aria-label="Enviar consulta por WhatsApp"
          >
            <Send size={15} strokeWidth={1.5} />
            Enviar por WhatsApp
          </button>
        </form>

        {/* Info lateral */}
        <aside className="contact_info reveal delay-2">

          {/* Estado: abierto / cerrado */}
          <div className="contact_status_card">
            <div className={`status_indicator ${isOpen ? 'open' : 'closed'}`}>
              <span className="status_dot" />
              <span className="status_text">
                {isOpen ? 'Abierto Ahora' : 'Cerrado Ahora'}
              </span>
            </div>
          </div>

          {/* Horarios */}
          <div className="contact_info_block">
            <div className="info_icon_row">
              <Clock size={15} strokeWidth={1.5} />
              <span className="info_block_label">Horarios</span>
            </div>
            {schedule.map((s) => (
              <div key={s.day} className="schedule_row">
                <span className="schedule_day">{s.day}</span>
                <span className={`schedule_hours ${s.hours === 'Cerrado' ? 'schedule_closed' : ''}`}>
                  {s.hours}
                </span>
              </div>
            ))}
          </div>

          {/* Ubicación */}
          <div className="contact_info_block">
            <div className="info_icon_row">
              <MapPin size={15} strokeWidth={1.5} />
              <span className="info_block_label">Ubicación</span>
            </div>
            <p className="info_text">Arcadia 1297, San Miguel</p>
            <p className="info_text">Santiago, Chile</p>
          </div>

          {/* Canales */}
          <div className="contact_info_block">
            <div className="info_icon_row">
              <Phone size={15} strokeWidth={1.5} />
              <span className="info_block_label">Contacto Directo</span>
            </div>
            <a
              href="https://wa.me/56979520623"
              target="_blank"
              rel="noopener noreferrer"
              className="info_link"
            >
              WhatsApp · +56 9 7952 0623
            </a>
            <a
              href="https://www.instagram.com/naamastudio_/"
              target="_blank"
              rel="noopener noreferrer"
              className="info_link"
            >
              Instagram · @naamastudio_
            </a>
            <a href="mailto:naamastudiospa@gmail.com" className="info_link">
              naamastudiospa@gmail.com
            </a>
          </div>
        </aside>
      </div>

      {/* ── MAPA ── */}
      <section className="contact_map_section reveal" aria-label="Mapa de ubicación">
        <iframe
          title="Naamá Studio — Arcadia 1297, San Miguel, Santiago"
          src="https://maps.google.com/maps?q=Arcadia+1297,+San+Miguel,+Santiago,+Chile&t=&z=16&ie=UTF8&iwloc=&output=embed"
          className="contact_map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="map_cta_row">
          <a
            href="https://www.google.com/maps/search/Arcadia+1297,+San+Miguel,+Santiago,+Chile"
            target="_blank"
            rel="noopener noreferrer"
            className="contact_submit_btn map_directions_btn"
            aria-label="Abrir en Google Maps"
          >
            <MapPin size={15} strokeWidth={1.5} />
            ¿Cómo llegar? — Abrir en Google Maps
          </a>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="contact_faq container reveal" aria-label="Preguntas frecuentes">
        <div className="section_header_boutique">
          <div className="header_left">
            <span className="world_item_tag">Preguntas Frecuentes</span>
            <h2 className="serif faq_title">Respuestas Rápidas</h2>
          </div>
        </div>

        <div className="faq_list" role="list">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`faq_item ${openFaq === i ? 'open' : ''}`}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              role="button"
              tabIndex={0}
              aria-expanded={openFaq === i}
              onKeyDown={(e) => e.key === 'Enter' && setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="faq_question">
                <span className="serif">{faq.q}</span>
                <ChevronDown
                  size={17}
                  strokeWidth={1.5}
                  className={`faq_chevron ${openFaq === i ? 'rotated' : ''}`}
                  aria-hidden="true"
                />
              </div>
              <div className={`faq_answer_wrapper ${openFaq === i ? 'visible' : ''}`}>
                <p className="faq_answer">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ContactPage;