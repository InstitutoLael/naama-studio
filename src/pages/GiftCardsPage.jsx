import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import SEOHead from '../components/shared/SEOHead';
import { Reveal, SplitText } from '../components/common/Motion';
import { LogoMark } from '../components/common/Logo';
import { WhatsAppIcon } from '../components/common/Icons';
import { whatsappUrl } from '../data/site';
import '../theme/giftcards.css';

const DESIGNS = [
  { id: 'bosque', name: 'Bosque', className: 'gc--bosque' },
  { id: 'marfil', name: 'Marfil', className: 'gc--marfil' },
  { id: 'burdeo', name: 'Burdeo', className: 'gc--burdeo' },
];
const AMOUNTS = [25000, 40000, 60000, 85000];
const clp = (n) => `$${Number(n || 0).toLocaleString('es-CL')}`;

/** Tarjeta con leve inclinación 3D al mover el cursor. */
const Card = ({ design, amount, to, from, message }) => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 150, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 150, damping: 18 });
  const shine = useTransform(mx, [0, 1], ['0%', '100%']);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <div className="gc-stage" onMouseMove={reduce ? undefined : onMove} onMouseLeave={reset}>
      <motion.div ref={ref} className={`gc ${design.className}`} style={{ rotateX: rx, rotateY: ry }}>
        <motion.span className="gc__shine" style={{ '--x': shine }} aria-hidden="true" />
        <div className="gc__top">
          <LogoMark className="gc__mark" />
          <span className="gc__brand">Naamá Studio</span>
        </div>
        <div className="gc__amount">{clp(amount)}</div>
        <p className="gc__msg">{message || 'Un momento para ti.'}</p>
        <div className="gc__bottom">
          <span><small>Para</small>{to || '—'}</span>
          <span><small>De</small>{from || '—'}</span>
        </div>
      </motion.div>
    </div>
  );
};

const GiftCardsPage = () => {
  const [design, setDesign] = useState(DESIGNS[0]);
  const [amount, setAmount] = useState(40000);
  const [custom, setCustom] = useState('');
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [message, setMessage] = useState('');

  const value = custom ? parseInt(custom, 10) || 0 : amount;
  const ready = to.trim() && from.trim() && value >= 10000;

  const text = [
    'Hola Naamá Studio! Quiero una Gift Card:',
    `• Diseño: ${design.name}`,
    `• Monto: ${clp(value)}`,
    `• Para: ${to}`,
    `• De: ${from}`,
    message && `• Mensaje: ${message}`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="giftcards">
      <SEOHead title="Gift Cards" description="Regala una experiencia de belleza y bienestar en Naamá Studio con una gift card personalizada." />

      <header className="page-hero container">
        <p className="eyebrow">Gift Cards</p>
        <SplitText as="h1" className="page-hero__title" onMount delay={0.15} lines={['Regala una', <em key="g">pausa.</em>]} />
        <Reveal as="p" className="lead page-hero__lead" delay={0.4}>
          Diseña tu tarjeta, elige el monto y escribe tu mensaje. Te la enviamos lista para regalar.
        </Reveal>
      </header>

      <section className="container gc-builder">
        <div className="gc-builder__preview">
          <Card design={design} amount={value} to={to} from={from} message={message} />
        </div>

        <form className="gc-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>01 · Diseño</legend>
            <div className="gc-swatches">
              {DESIGNS.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  className={`gc-swatch ${d.className} ${d.id === design.id ? 'is-active' : ''}`}
                  onClick={() => setDesign(d)}
                  aria-pressed={d.id === design.id}
                >
                  <span className="visually-hidden">{d.name}</span>
                </button>
              ))}
              <span className="gc-swatches__name">{design.name}</span>
            </div>
          </fieldset>

          <fieldset>
            <legend>02 · Monto</legend>
            <div className="gc-amounts">
              {AMOUNTS.map((a) => (
                <button
                  type="button"
                  key={a}
                  className="chip"
                  aria-pressed={!custom && amount === a}
                  onClick={() => {
                    setAmount(a);
                    setCustom('');
                  }}
                >
                  {clp(a)}
                </button>
              ))}
            </div>
            <div className="field">
              <label htmlFor="gc-custom">Otro monto (mínimo $10.000)</label>
              <input id="gc-custom" className="input" inputMode="numeric" placeholder="Ej: 50000" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))} />
            </div>
          </fieldset>

          <fieldset>
            <legend>03 · Dedicatoria</legend>
            <div className="gc-two">
              <div className="field">
                <label htmlFor="gc-to">Para</label>
                <input id="gc-to" className="input" value={to} onChange={(e) => setTo(e.target.value)} maxLength={40} />
              </div>
              <div className="field">
                <label htmlFor="gc-from">De</label>
                <input id="gc-from" className="input" value={from} onChange={(e) => setFrom(e.target.value)} maxLength={40} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="gc-msg">Mensaje (opcional)</label>
              <textarea id="gc-msg" className="input" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={140} />
            </div>
          </fieldset>

          <a
            href={ready ? whatsappUrl(text) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn--gold gc-form__send ${ready ? '' : 'is-disabled'}`}
            aria-disabled={!ready}
          >
            <WhatsAppIcon /> Solicitar por WhatsApp
          </a>
          <p className="gc-form__note">Te confirmamos el pago y te enviamos la tarjeta lista para regalar.</p>
        </form>
      </section>
    </div>
  );
};

export default GiftCardsPage;
