import React, { useState } from 'react';
import { Gift, Heart, Sparkles, Star, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEOHead from '../components/SEOHead';
import '../styles/Global.css';
import '../styles/GiftCardsPage.css';

const templates = [
  { 
    id: 'elegant', 
    name: 'Elegance', 
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #2B2B2B 0%, #4A4A4A 100%)',
    textColor: '#F4F1EA',
    accentColor: '#E5D3B3'
  },
  { 
    id: 'romance', 
    name: 'Romance', 
    icon: Heart,
    gradient: 'linear-gradient(135deg, #B08D79 0%, #D4A98A 50%, #E5D3B3 100%)',
    textColor: '#2B2B2B',
    accentColor: '#fff'
  },
  { 
    id: 'celebration', 
    name: 'Celebración', 
    icon: Star,
    gradient: 'linear-gradient(135deg, #F4F1EA 0%, #E5D3B3 100%)',
    textColor: '#2B2B2B',
    accentColor: '#B08D79'
  }
];

const amounts = [25000, 40000, 60000, 85000];

const GiftCardsPage = () => {
  const [step, setStep] = useState(1);
  const [card, setCard] = useState({
    template: templates[0],
    amount: 40000,
    customAmount: '',
    to: '',
    from: '',
    message: '',
  });
  const [showUnbox, setShowUnbox] = useState(false);

  const selectedAmount = card.customAmount ? parseInt(card.customAmount) : card.amount;

  const sendWhatsApp = () => {
    const msg = `*Solicitud de Gift Card - Naamá Studio*%0A%0A` +
      `*Diseño:* ${card.template.name}%0A` +
      `*Monto:* $${selectedAmount.toLocaleString('es-CL')}%0A` +
      `*Para:* ${card.to}%0A` +
      `*De:* ${card.from}%0A` +
      `*Mensaje:* ${card.message || 'Sin mensaje'}%0A%0A` +
      `_Solicitud enviada desde la Gift Card digital._`;
    window.open(`https://wa.me/56979520623?text=${msg}`, '_blank');
  };

  return (
    <div className="giftcards_page">
      <SEOHead 
        title="Gift Cards Digitales" 
        description="Regala una experiencia de restauración en Naamá Studio con nuestras Gift Cards personalizables." 
      />

      <header className="gc_header reveal">
        <span className="world_category_label">Regalos</span>
        <h1 className="gc_title serif">Gift Cards <span className="text_clay">Digitales</span></h1>
        <p className="world_description">
          Regala el descanso. Crea una gift card personalizada para alguien que merece una pausa.
        </p>
      </header>

      <div className="gc_builder container">
        {/* Step 1: Template */}
        {step === 1 && (
          <div className="gc_step reveal">
            <span className="gc_step_label">Paso 01 · Diseño</span>
            <h2 className="serif gc_step_title">Elige el diseño de tu tarjeta</h2>
            
            <div className="gc_templates_grid">
              {templates.map(t => (
                <button
                  key={t.id}
                  className={`gc_template_option ${card.template.id === t.id ? 'selected' : ''}`}
                  onClick={() => setCard({...card, template: t})}
                  aria-label={`Diseño ${t.name}`}
                >
                  <div className="gc_template_preview" style={{ background: t.gradient }}>
                    <t.icon size={24} color={t.accentColor} strokeWidth={1} />
                    <span style={{ color: t.textColor, fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>Naamá Studio</span>
                  </div>
                  <span className="gc_template_name">{t.name}</span>
                </button>
              ))}
            </div>

            <div className="gc_actions">
              <button className="next_btn" onClick={() => setStep(2)}>
                Siguiente <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Amount */}
        {step === 2 && (
          <div className="gc_step reveal">
            <span className="gc_step_label">Paso 02 · Monto</span>
            <h2 className="serif gc_step_title">¿Cuánto deseas regalar?</h2>
            
            <div className="gc_amounts_grid">
              {amounts.map(amt => (
                <button
                  key={amt}
                  className={`gc_amount_btn ${card.amount === amt && !card.customAmount ? 'selected' : ''}`}
                  onClick={() => setCard({...card, amount: amt, customAmount: ''})}
                  aria-label={`${amt.toLocaleString('es-CL')} pesos`}
                >
                  <span className="serif">${amt.toLocaleString('es-CL')}</span>
                </button>
              ))}
            </div>

            <div className="gc_custom_amount">
              <label htmlFor="customAmount" className="form_label">o ingresa un monto personalizado</label>
              <input
                id="customAmount"
                type="number"
                className="form_input"
                placeholder="Ej: 50000"
                value={card.customAmount}
                onChange={(e) => setCard({...card, customAmount: e.target.value})}
                min="10000"
              />
            </div>

            <div className="gc_actions gc_actions_between">
              <button className="back_btn" onClick={() => setStep(1)}>Atrás</button>
              <button className="next_btn" onClick={() => setStep(3)}>
                Siguiente <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Personalization */}
        {step === 3 && (
          <div className="gc_step reveal">
            <span className="gc_step_label">Paso 03 · Personalización</span>
            <h2 className="serif gc_step_title">Hazla especial</h2>
            
            <div className="gc_form_fields">
              <div className="form_group">
                <label htmlFor="gc_to" className="form_label">Para</label>
                <input
                  id="gc_to"
                  type="text"
                  className="form_input"
                  placeholder="Nombre de quien la recibe"
                  value={card.to}
                  onChange={(e) => setCard({...card, to: e.target.value})}
                  required
                />
              </div>
              <div className="form_group">
                <label htmlFor="gc_from" className="form_label">De</label>
                <input
                  id="gc_from"
                  type="text"
                  className="form_input"
                  placeholder="Tu nombre"
                  value={card.from}
                  onChange={(e) => setCard({...card, from: e.target.value})}
                  required
                />
              </div>
              <div className="form_group">
                <label htmlFor="gc_message" className="form_label">Mensaje (opcional)</label>
                <textarea
                  id="gc_message"
                  className="form_input gc_textarea"
                  placeholder="Escribe un mensaje especial..."
                  value={card.message}
                  onChange={(e) => setCard({...card, message: e.target.value})}
                />
              </div>
            </div>

            <div className="gc_actions gc_actions_between">
              <button className="back_btn" onClick={() => setStep(2)}>Atrás</button>
              <button className="next_btn" onClick={() => { setStep(4); setShowUnbox(true); }} disabled={!card.to || !card.from}>
                Ver Preview <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Preview & Send */}
        {step === 4 && (
          <div className="gc_step gc_preview_step reveal">
            <span className="gc_step_label">Paso 04 · Tu Gift Card</span>

            {/* Unboxing Animation */}
            <AnimatePresence>
              {showUnbox && (
                <motion.div 
                  className="gc_unbox_overlay"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="gc_unbox_envelope"
                    initial={{ scale: 0.8, y: 50, rotateX: 0 }}
                    animate={{ scale: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Gift size={60} strokeWidth={0.5} color="var(--accent-clay)" />
                    <motion.p 
                      className="serif" 
                      style={{ fontSize: '1.3rem', marginTop: '20px', color: 'var(--text-slate)' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Tu regalo está listo
                    </motion.p>
                    <motion.button 
                      className="gc_reveal_btn"
                      onClick={() => setShowUnbox(false)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                    >
                      Revelar Gift Card
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Card Preview */}
            {!showUnbox && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="gc_card_preview"
              >
                <div className="gc_card_face" style={{ background: card.template.gradient }}>
                  <div className="gc_card_header">
                    <card.template.icon size={20} color={card.template.accentColor} strokeWidth={1} />
                    <span style={{ color: card.template.textColor, fontFamily: 'var(--font-serif)', fontSize: '0.9rem' }}>Naamá Studio</span>
                  </div>
                  <div className="gc_card_body">
                    <span className="gc_card_amount serif" style={{ color: card.template.accentColor }}>
                      ${selectedAmount.toLocaleString('es-CL')}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: card.template.textColor, opacity: 0.7 }}>Gift Card Digital</p>
                  </div>
                  <div className="gc_card_footer">
                    <div>
                      <span style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: card.template.textColor, opacity: 0.5 }}>Para</span>
                      <p style={{ color: card.template.textColor, fontSize: '0.85rem' }}>{card.to}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: card.template.textColor, opacity: 0.5 }}>De</span>
                      <p style={{ color: card.template.textColor, fontSize: '0.85rem' }}>{card.from}</p>
                    </div>
                  </div>
                  {card.message && (
                    <p style={{ marginTop: '20px', fontSize: '0.8rem', fontStyle: 'italic', color: card.template.textColor, opacity: 0.6 }}>
                      "{card.message}"
                    </p>
                  )}
                </div>

                <div className="gc_preview_actions">
                  <button className="next_btn gc_send_btn" onClick={sendWhatsApp}>
                    <Check size={16} />
                    Solicitar por WhatsApp
                  </button>
                  <button className="back_btn" onClick={() => setStep(3)}>Editar</button>
                </div>
                <p className="gc_note">
                  Al solicitar, nuestro equipo te confirmará disponibilidad y forma de pago.
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCardsPage;
