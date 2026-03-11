import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Shield, Leaf, Award } from 'lucide-react';
import AnimatedCounter from '../ui/AnimatedCounter';
import '../../styles/TestimonialsSection.css';

// ── Reseñas propias (no Google) ──
const ownTestimonials = [
  {
    name: 'Valentina M.',
    text: '"Desde que descubrí Naamá, no vuelvo a otro lado. El ambiente de paz y la técnica de las chicas es otro nivel."',
    service: 'Colorimetría & Corte',
    source: 'web'
  },
  {
    name: 'Francisca L.',
    text: '"Me hicieron sentir como en casa desde el primer momento. La depilación fue sin dolor y el resultado impecable."',
    service: 'Depilación & Cuidado',
    source: 'web'
  },
  {
    name: 'Andrea P.',
    text: '"El masaje térmico es una experiencia que todos deberían vivir. Sales renovada de verdad, no es exageración."',
    service: 'Terapia de Descanso',
    source: 'web'
  },
  {
    name: 'María José S.',
    text: '"Vine por un corte y me quedé por la experiencia completa. El silencio, los aromas, la dedicación... todo es distinto aquí."',
    service: 'Corte & Estilo',
    source: 'web'
  },
  {
    name: 'Catalina V.',
    text: '"Mis uñas nunca habían lucido tan bien. Gaby tiene una dedicación y pulcritud increíble. 100% recomendado."',
    service: 'Manicure Semipermanente',
    source: 'web'
  }
];

// ── Reseñas de Google Maps (actualizadas manualmente desde el panel) ──
// Para automatizarlas: conectar Google Places API en backend
const googleTestimonials = [
  {
    name: 'Patricia G.',
    text: '"Excelente atención. El lugar es acogedor y las especialistas súper profesionales. Volvería mil veces."',
    service: 'Limpieza Facial',
    source: 'google',
    rating: 5
  },
  {
    name: 'Daniela R.',
    text: '"Fui por primera vez y quedé encantada. Michelle es increíble en podología, muy delicada y precisa."',
    service: 'Podología Clínica',
    source: 'google',
    rating: 5
  },
  {
    name: 'Sofía T.',
    text: '"El ambiente es precioso, como un refugio de paz en medio de la ciudad. Valeria me hizo el mejor balayage de mi vida."',
    service: 'Balayage',
    source: 'google',
    rating: 5
  }
];

const allTestimonials = [...ownTestimonials, ...googleTestimonials];

const badges = [
  { icon: Shield, label: 'Higiene Hospitalaria' },
  { icon: Leaf,   label: 'Productos Honestos'  },
  { icon: Award,  label: 'Excelencia Técnica'  }
];

// Ícono de Google (SVG oficial)
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const TestimonialsSection = () => {
  const [current, setCurrent]             = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef                       = useRef(null);

  const goTo = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const next = () => goTo((current + 1) % allTestimonials.length);
  const prev = () => goTo((current - 1 + allTestimonials.length) % allTestimonials.length);

  useEffect(() => {
    intervalRef.current = setInterval(next, 6500);
    return () => clearInterval(intervalRef.current);
  }, [current]);

  const t = allTestimonials[current];

  return (
    <section className="testimonials_section reveal">

      {/* ── STATS ── */}
      <div className="stats_bar">
        <div className="stat_item">
          <AnimatedCounter end={180} suffix="+" className="stat_number serif" />
          <span className="stat_label">Clientas Mensuales</span>
        </div>
        <div className="stat_divider" />
        <div className="stat_item">
          <AnimatedCounter end={5} className="stat_number serif" />
          <span className="stat_label">Especialistas</span>
        </div>
        <div className="stat_divider" />
        <div className="stat_item">
          <AnimatedCounter end={6} className="stat_number serif" />
          <span className="stat_label">Ecosistemas del Cuidado</span>
        </div>
        <div className="stat_divider" />
        <div className="stat_item">
          <AnimatedCounter end={4.9} suffix="★" decimals={1} className="stat_number serif" />
          <span className="stat_label">Nota en Google</span>
        </div>
      </div>

      {/* ── CARRUSEL DE TESTIMONIOS ── */}
      <div className="testimonial_carousel">
        <span className="world_item_tag testimonial_label">
          Lo que dicen nuestras clientas
        </span>

        <div className={`testimonial_card ${isTransitioning ? 'fading' : ''}`}>
          {/* Estrellas */}
          <div className="stars_row" aria-label="5 estrellas">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} fill="var(--accent-gold)" stroke="var(--accent-gold)" />
            ))}
          </div>

          {/* Texto */}
          <blockquote className="testimonial_text serif">
            {t.text}
          </blockquote>

          {/* Autor + fuente */}
          <div className="testimonial_author">
            <div className="author_info">
              <span className="author_name">{t.name}</span>
              <span className="author_service">{t.service}</span>
            </div>
            {t.source === 'google' && (
              <a
                href="https://www.google.com/maps/search/Naama+Studio+San+Miguel"
                target="_blank"
                rel="noopener noreferrer"
                className="google_badge"
                aria-label="Ver en Google Maps"
                title="Reseña verificada en Google"
              >
                <GoogleIcon />
                <span>Google</span>
              </a>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="carousel_controls">
          <button onClick={prev} className="carousel_btn" aria-label="Testimonio anterior">
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <div className="carousel_dots" role="tablist">
            {allTestimonials.map((_, i) => (
              <button
                key={i}
                className={`carousel_dot ${current === i ? 'active' : ''} ${allTestimonials[i].source === 'google' ? 'dot_google' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Ver testimonio ${i + 1}`}
                role="tab"
                aria-selected={current === i}
              />
            ))}
          </div>
          <button onClick={next} className="carousel_btn" aria-label="Testimonio siguiente">
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Link directo a Google Reviews */}
        <a
          href="https://www.google.com/maps/search/Naama+Studio+San+Miguel"
          target="_blank"
          rel="noopener noreferrer"
          className="google_reviews_link"
          aria-label="Ver todas las reseñas en Google"
        >
          <GoogleIcon />
          Ver todas las reseñas en Google Maps
        </a>
      </div>

      {/* ── BADGES DE CONFIANZA ── */}
      <div className="trust_badges">
        {badges.map(({ icon: Icon, label }) => (
          <div key={label} className="badge_item">
            <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;