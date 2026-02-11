import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Shield, Leaf, Award } from 'lucide-react';
import AnimatedCounter from './UI/AnimatedCounter';
import '../styles/TestimonialsSection.css';

const testimonials = [
  {
    name: 'Camila R.',
    text: '"Desde que descubrí Naamá, no vuelvo a otro lado. El ambiente de paz y la técnica de las chicas es otro nivel."',
    service: 'Colorimetría & Corte'
  },
  {
    name: 'Valentina M.',
    text: '"Me hicieron sentir como en casa desde el primer momento. La depilación fue sin dolor y el resultado impecable."',
    service: 'Depilación & Cuidado'
  },
  {
    name: 'Francisca L.',
    text: '"El masaje térmico es una experiencia que todos deberían vivir. Sales renovada de verdad, no es exageración."',
    service: 'Terapia de Descanso'
  },
  {
    name: 'Andrea P.',
    text: '"Vine por un corte y me quedé por la experiencia completa. El silencio, los aromas, la dedicación... todo es distinto aquí."',
    service: 'Corte & Estilo'
  },
  {
    name: 'María José S.',
    text: '"Mis uñas nunca habían lucido tan bien. Gaby tiene una dedicación y pulcritud increíble. 100% recomendado."',
    service: 'Manicure Semipermanente'
  }
];

const badges = [
  { icon: Shield, label: 'Higiene Hospitalaria' },
  { icon: Leaf, label: 'Productos Honestos' },
  { icon: Award, label: 'Excelencia Técnica' }
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);

  const goTo = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const next = () => goTo((current + 1) % testimonials.length);
  const prev = () => goTo((current - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    intervalRef.current = setInterval(next, 6000);
    return () => clearInterval(intervalRef.current);
  }, [current]);

  return (
    <section className="testimonials_section reveal">
      {/* Stats Bar */}
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
      </div>

      {/* Testimonial Carousel */}
      <div className="testimonial_carousel">
        <span className="world_item_tag testimonial_label">Lo que Dicen Nuestras Clientas</span>
        
        <div className="testimonial_card" key={current}>
          <div className="stars_row">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="var(--accent-clay)" stroke="var(--accent-clay)" />
            ))}
          </div>
          <blockquote className="testimonial_text serif">
            {testimonials[current].text}
          </blockquote>
          <div className="testimonial_author">
            <span className="author_name">{testimonials[current].name}</span>
            <span className="author_service">{testimonials[current].service}</span>
          </div>
        </div>

        <div className="carousel_controls">
          <button onClick={prev} className="carousel_btn" aria-label="Testimonio anterior">
            <ChevronLeft size={20} strokeWidth={1} />
          </button>
          <div className="carousel_dots">
            {testimonials.map((_, i) => (
              <button 
                key={i} 
                className={`carousel_dot ${current === i ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Ver testimonio ${i + 1}`}
              />
            ))}
          </div>
          <button onClick={next} className="carousel_btn" aria-label="Testimonio siguiente">
            <ChevronRight size={20} strokeWidth={1} />
          </button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="trust_badges">
        {badges.map(({ icon: Icon, label }) => (
          <div key={label} className="badge_item">
            <Icon size={20} strokeWidth={1.5} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
