import React, { useState } from 'react';
import SEOHead from '../components/shared/SEOHead';
import GiftCardArte from '../components/common/GiftCardArte';
import { MinusIcon, PlusIcon, WhatsAppIcon } from '../components/common/Icons';
import { DISENOS, VIGENCIA_MESES, pesos } from '../lib/giftcard';
import { whatsappUrl } from '../data/site';
import '../theme/giftcards.css';

const MONTOS = [25000, 40000, 60000, 85000];
const MINIMO = 10000;
const PASO = 5000;

/** P07 · Gift cards. */
const GiftCardsPage = () => {
  const [diseno, setDiseno] = useState('burdeo');
  const [monto, setMonto] = useState(40000);
  const [para, setPara] = useState('');
  const [de, setDe] = useState('');
  const [mensaje, setMensaje] = useState('');

  const falta = [!para.trim() && 'para quién', !de.trim() && 'de quién', monto < MINIMO && `mínimo ${pesos(MINIMO)}`].filter(Boolean);
  const texto = `Hola 🤍 Quiero regalar una gift card de ${pesos(monto)} (diseño ${DISENOS[diseno].nombre}) para ${para.trim()}, de ${de.trim()}.${mensaje.trim() ? ` El mensaje: «${mensaje.trim()}».` : ''}`;

  const tarjeta = { diseno, monto, para: para.trim() || 'Camila', de: de.trim() || 'Diego' };

  return (
    <div className="regala pagina">
      <SEOHead title="Gift Cards" description="Regala una pausa: gift cards digitales de Naamá Studio, en 4 diseños, para belleza y bienestar en San Miguel." />

      <div className="container regala-grid">
        <div className="regala-izq">
          <h1 className="regala-titulo">
            <span className="gigante">Regala</span>
            <span className="firma">una pausa</span>
          </h1>
          <GiftCardArte g={tarjeta} className="regala-tarjeta" label={`Gift card ${DISENOS[diseno].nombre} de ${pesos(monto)}`} />
          <div className="regala-disenos" role="radiogroup" aria-label="Diseño">
            {Object.entries(DISENOS).map(([k, d]) => (
              <button key={k} role="radio" aria-checked={diseno === k} className="regala-diseno" onClick={() => setDiseno(k)}>
                <GiftCardArte g={{ diseno: k, monto, para: '', de: '' }} label={d.nombre} />
                <span>{d.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        <form className="regala-form tarjeta" onSubmit={(e) => e.preventDefault()}>
          <p className="eyebrow">Elige el monto</p>
          <div className="regala-monto">
            <button type="button" className="regala-mm" aria-label="Bajar $5.000" disabled={monto <= MINIMO} onClick={() => setMonto((m) => Math.max(MINIMO, m - PASO))}><MinusIcon /></button>
            <output aria-live="polite">{pesos(monto)}</output>
            <button type="button" className="regala-mm regala-mm--lleno" aria-label="Subir $5.000" onClick={() => setMonto((m) => m + PASO)}><PlusIcon /></button>
          </div>
          <div className="chips regala-chips">
            {MONTOS.map((a) => (
              <button type="button" key={a} className="chip" aria-pressed={monto === a} onClick={() => setMonto(a)}>{pesos(a)}</button>
            ))}
          </div>
          <p className="muted chico regala-centro">Mínimo {pesos(MINIMO)} · vigencia {VIGENCIA_MESES} meses</p>

          <div className="regala-dos">
            <div className="field">
              <label htmlFor="gc-para">Para</label>
              <input id="gc-para" className="campo" placeholder="Camila" value={para} onChange={(e) => setPara(e.target.value)} maxLength={30} />
            </div>
            <div className="field">
              <label htmlFor="gc-de">De</label>
              <input id="gc-de" className="campo" placeholder="Diego" value={de} onChange={(e) => setDe(e.target.value)} maxLength={30} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="gc-msg">Mensaje (opcional)</label>
            <textarea id="gc-msg" className="campo" rows={3} placeholder="Para que te regales una tarde tranquila." value={mensaje} onChange={(e) => setMensaje(e.target.value)} maxLength={140} />
          </div>

          <div className="asi-llega">
            <div className="asi-llega__cabeza"><span>Así le llega</span><span>por WhatsApp o correo</span></div>
            <strong>{para.trim() || 'Camila'}, te regalaron un momento para ti.</strong>
            {mensaje.trim() && (
              <blockquote className="tarjeta">
                <p className="nota">“{mensaje.trim()}”</p>
                <small>— {de.trim() || 'Diego'}</small>
              </blockquote>
            )}
          </div>

          {falta.length ? (
            <button type="button" className="btn btn--ancho" disabled>Falta: {falta.join(', ')}</button>
          ) : (
            <a href={whatsappUrl(texto)} target="_blank" rel="noopener noreferrer" className="btn btn--ancho">
              <WhatsAppIcon /> Solicitar por WhatsApp
            </a>
          )}
          <p className="muted chico regala-centro">Te confirmamos el pago y te enviamos la tarjeta lista para regalar.</p>
        </form>
      </div>
    </div>
  );
};

export default GiftCardsPage;
