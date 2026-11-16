import React, { useState } from 'react';

const hoyChile = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());
const mover = (f, n) => {
  const d = new Date(`${f}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const largo = (f) => new Date(`${f}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * Elegir el día con botones grandes (Hoy · Ayer · Antes de ayer · Otro día),
 * pensado para anotar cosas de días anteriores sin pelear con el calendario del celu.
 */
const ElegirDia = ({ valor, onCambio, futuro = false, etiqueta = '¿Qué día fue?' }) => {
  const hoy = hoyChile();
  const rapidos = futuro
    ? [
        ['Hoy', hoy],
        ['Mañana', mover(hoy, 1)],
        ['Pasado mañana', mover(hoy, 2)],
      ]
    : [
        ['Hoy', hoy],
        ['Ayer', mover(hoy, -1)],
        ['Antes de ayer', mover(hoy, -2)],
      ];
  const [otro, setOtro] = useState(!rapidos.some(([, f]) => f === valor));
  return (
    <div className="field elegir-dia">
      <span className="field__titulo">{etiqueta}</span>
      <div className="elegir-dia__chips" role="group" aria-label={etiqueta}>
        {rapidos.map(([t, f]) => (
          <button
            key={t}
            type="button"
            className={`chip ${!otro && valor === f ? 'is-active' : ''}`}
            onClick={() => {
              setOtro(false);
              onCambio(f);
            }}
          >
            {t}
          </button>
        ))}
        <button type="button" className={`chip ${otro ? 'is-active' : ''}`} onClick={() => setOtro(true)}>
          Otro día
        </button>
      </div>
      {otro && <input className="input" type="date" value={valor} onChange={(e) => e.target.value && onCambio(e.target.value)} />}
      <small className="elegir-dia__texto">{largo(valor)}</small>
    </div>
  );
};

export default ElegirDia;
