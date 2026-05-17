import React, { useMemo, useEffect } from 'react';
import { MapPin, Clock } from 'lucide-react';
import SEOHead from '../components/shared/SEOHead';
import '../styles/Global.css';
import '../styles/ContactPage.css';

const ContactPage = () => {
  const isOpen = useMemo(() => {
    const now  = new Date();
    const day  = now.getDay();
    const time = now.getHours() * 60 + now.getMinutes();
    if (day === 0) return false;
    if (day === 6) return time >= 540 && time < 1020;
    return time >= 540 && time < 1140;
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="contact_page">
      <SEOHead
        title="Contacto · Naamá Studio"
        description="Escríbenos, visítanos o agenda directamente. Arcadia 1297, San Miguel, Santiago."
      />

      {/* ── SECCIÓN 1: INFO PREMIUM ── */}
      <section className="contact_premium_info">
        <div className="container contact_info_inner">
          <span className="contact_eyebrow">VISÍTANOS</span>
          <h1 className="contact_title serif">Te esperamos.</h1>
          
          <div className="contact_info_grid">
            {/* Columna 1 */}
            <div className="contact_col">
              <div className="info_block">
                <div className="info_icon_row">
                  <MapPin size={18} strokeWidth={1.5} />
                  <span className="info_label">Dirección</span>
                </div>
                <p className="info_text_main">Arcadia 1297, San Miguel, Santiago</p>
                <p className="info_text_muted">A pasos del metro San Miguel</p>
              </div>

              <div className="info_block">
                <div className="info_icon_row">
                  <Clock size={18} strokeWidth={1.5} />
                  <span className="info_label">Horarios</span>
                </div>
                <div className="schedule_grid">
                  <span className="sch_day">Lunes a Viernes</span>
                  <span className="sch_hours">09:00 — 19:00</span>
                  <span className="sch_day">Sábado</span>
                  <span className="sch_hours">09:00 — 17:00</span>
                  <span className="sch_day">Domingo</span>
                  <span className="sch_hours sch_closed">Cerrado</span>
                </div>
                
                <div className={`status_badge ${isOpen ? 'open' : 'closed'}`}>
                  <span className="status_dot" />
                  {isOpen ? 'Abierto ahora' : 'Cerrado ahora'}
                </div>
              </div>
            </div>

            {/* Columna 2 */}
            <div className="contact_col">
              <div className="info_block">
                <p className="info_text_main mb-12">WhatsApp: +56 9 7952 0623</p>
                <a 
                  href="https://wa.me/56979520623" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn_gold_solid"
                >
                  Escribir por WhatsApp
                </a>
              </div>

              <div className="info_block">
                <p className="info_text_main mb-12">Instagram: @naamastudio_</p>
                <a 
                  href="https://www.instagram.com/naamastudio_" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn_outline"
                >
                  Seguirnos en Instagram
                </a>
              </div>

              <div className="info_block">
                <p className="info_text_muted small_mail">naamastudiospa@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 2: MAPA ── */}
      <section className="contact_map_section">
        <div className="map_overlay_card">
          <p className="map_overlay_text">Arcadia 1297, San Miguel · Metro San Miguel L2</p>
          <a 
            href="https://maps.google.com/maps?q=Arcadia+1297+San+Miguel+Santiago"
            target="_blank"
            rel="noopener noreferrer"
            className="btn_map_directions"
          >
            Cómo llegar
          </a>
        </div>
        <iframe
          title="Naamá Studio — Arcadia 1297, San Miguel, Santiago"
          src="https://maps.google.com/maps?q=Arcadia+1297,+San+Miguel,+Santiago,+Chile&t=&z=16&ie=UTF8&iwloc=&output=embed"
          className="contact_iframe"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </section>
    </div>
  );
};

export default ContactPage;