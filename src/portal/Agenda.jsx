import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { WhatsAppIcon } from '../components/common/Icons';
import { api, post } from './api';
import Hoja from './Hoja';
import { CATALOGO, minutosDe } from './servicios';

const ABRE = 10 * 60; // 10:00
const CIERRA = 20 * 60; // 20:00
const PX = 1.4; // píxeles por minuto
const ESTADOS = [
  ['agendada', 'Agendada'],
  ['confirmada', 'Confirmada'],
  ['llego', 'Llegó'],
  ['no-vino', 'No vino'],
  ['cancelada', 'Cancelada'],
];
const aMin = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
const aHora = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const diaLargo = (f) => new Date(`${f}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
const moverDia = (f, n) => {
  const d = new Date(`${f}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const primer = (n) => n.split(' ')[0];
const DURACIONES = [30, 45, 60, 90, 120, 150, 180];

/** Mensaje bonito para recordarle la hora a la clienta (va por WhatsApp). */
export const mensajeRecordatorio = (c) => {
  const dia = new Date(`${c.fecha}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  return [
    `Hola ${primer(c.clienta)} 🌸`,
    '',
    'Te recordamos tu hora en *Naamá Studio*:',
    '',
    `🗓️ ${dia.charAt(0).toUpperCase() + dia.slice(1)}`,
    `🕐 ${c.hora} hrs`,
    `✨ ${c.servicio ? `${c.servicio} con ${primer(c.quien)}` : `con ${primer(c.quien)}`}`,
    '📍 Arcadia 1297, San Miguel (a pasos del metro El Llano)',
    '',
    'Si necesitas cambiarla, respóndenos por aquí. ¡Te esperamos para tu pausa! 🤍',
  ].join('\n');
};

const FormCita = ({ d, cita, inicial, onListo, onCerrar }) => {
  const [v, setV] = useState(() => ({
    cuentaId: cita?.cuentaId ?? inicial?.cuentaId ?? d.personas[0]?.id,
    fecha: cita?.fecha ?? d.fecha,
    hora: cita?.hora ?? inicial?.hora ?? '10:30',
    minutos: cita?.minutos ?? 60,
    clienta: cita?.clienta ?? '',
    telefono: cita?.telefono ?? '',
    servicio: cita?.servicio ?? '',
    nota: cita?.nota ?? '',
  }));
  const [error, setError] = useState('');
  const tocado = useRef(Boolean(cita));
  const cambia = (k) => (e) => {
    const val = e.target.value;
    setV((x) => {
      const n = { ...x, [k]: val };
      if (k === 'servicio' && !tocado.current) n.minutos = minutosDe(val);
      if (k === 'minutos') tocado.current = true;
      return n;
    });
  };
  const servicios = useMemo(() => CATALOGO.filter((c) => !c.salon).map((c) => c.nombre.replace(' (ganancia)', '')), []);
  const personas = d.puedeAgendarATodas ? d.personas : d.personas.filter((p) => p.id === d.yo);

  return (
    <Hoja titulo={cita ? `Cita de ${cita.clienta}` : 'Agendar'} onCerrar={onCerrar}>
      {cita && (
        <div className="chips chips--chicos" role="radiogroup" aria-label="Estado">
          {ESTADOS.map(([k, t]) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={cita.estado === k}
              className={`chip ${cita.estado === k ? 'is-active' : ''}`}
              onClick={async () => {
                await post(`agenda/${cita.id}`, { estado: k });
                onListo(`Cita: ${t.toLowerCase()}.`);
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      {cita?.alergias && (
        <p className="ficha-cli__alergia" role="note">
          <strong>Alergias o cuidados:</strong> {cita.alergias}
        </p>
      )}
      {cita?.faltas > 0 && <p className="muted">⚠ Esta clienta no vino {cita.faltas === 1 ? '1 vez' : `${cita.faltas} veces`} antes. Conviene confirmarle.</p>}
      {cita?.telefono && (
        <a
          className="btn"
          href={`https://wa.me/${cita.telefono.replace('+', '')}?text=${encodeURIComponent(mensajeRecordatorio(cita))}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => post(`agenda/${cita.id}`, { recordada: true }).catch(() => {})}
        >
          <WhatsAppIcon /> {cita.recordada ? 'Recordar de nuevo' : 'Recordarle la hora'}
        </a>
      )}
      <form
        className="hoja__form"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await post(cita ? `agenda/${cita.id}` : 'agenda', v);
            onListo(cita ? 'Cita actualizada.' : 'Agendada.');
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        <div className="field">
          <span className="field__titulo">¿Con quién?</span>
          <div className="chips" role="radiogroup" aria-label="Profesional">
            {personas.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={Number(v.cuentaId) === p.id}
                className={`chip ${Number(v.cuentaId) === p.id ? 'is-active' : ''}`}
                onClick={() => setV((x) => ({ ...x, cuentaId: p.id }))}
              >
                {primer(p.nombre)}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          <span>Clienta</span>
          <input className="input" value={v.clienta} onChange={cambia('clienta')} list="ag-clientas" autoComplete="off" required />
          <datalist id="ag-clientas">
            {(d.clientas ?? []).map((c) => (
              <option key={c.id} value={c.nombre} />
            ))}
          </datalist>
        </label>
        {d.puedeAgendarATodas && (
          <label className="field">
            <span>WhatsApp de la clienta (para el recordatorio)</span>
            <input className="input" type="tel" value={v.telefono} onChange={cambia('telefono')} placeholder="+56 9 …" />
          </label>
        )}
        <label className="field">
          <span>Servicio</span>
          <input className="input" value={v.servicio} onChange={cambia('servicio')} list="ag-servicios" autoComplete="off" placeholder="Ej.: Manos" />
          <datalist id="ag-servicios">
            {servicios.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </label>
        <div className="fila-campos">
          <label className="field">
            <span>Día</span>
            <input className="input" type="date" value={v.fecha} onChange={cambia('fecha')} min={d.hoy} required />
          </label>
          <label className="field">
            <span>Hora</span>
            <input className="input" type="time" value={v.hora} onChange={cambia('hora')} step={900} required />
          </label>
        </div>
        <label className="field">
          <span>Dura</span>
          <select className="input" value={v.minutos} onChange={cambia('minutos')}>
            {[...new Set([...DURACIONES, Number(v.minutos)])]
              .sort((a, b) => a - b)
              .map((m) => (
                <option key={m} value={m}>
                  {m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`}
                </option>
              ))}
          </select>
        </label>
        <label className="field">
          <span>Nota (opcional)</span>
          <input className="input" value={v.nota} onChange={cambia('nota')} placeholder="Ej.: pidió por WhatsApp, viene con su hija" />
        </label>
        {error && <p className="portal-error">{error}</p>}
        <div className="hoja__acciones">
          <button type="submit" className="btn">
            {cita ? 'Guardar cambios' : 'Agendar'}
          </button>
          {cita && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={async () => {
                if (!window.confirm('¿Borrar esta cita? (si la clienta canceló, mejor márcala «Cancelada»)')) return;
                await post(`agenda/${cita.id}`, { borrar: true });
                onListo('Cita borrada.');
              }}
            >
              <Trash2 size={16} /> Borrar
            </button>
          )}
        </div>
      </form>
    </Hoja>
  );
};

const Agenda = ({ cuenta }) => {
  const [d, setD] = useState(null);
  const [clientas, setClientas] = useState([]);
  const [error, setError] = useState('');
  const [hoja, setHoja] = useState(null);
  const [aviso, setAviso] = useState('');
  const avisoT = useRef();

  const cargar = useCallback(async (f) => {
    try {
      const r = await api(`agenda${f ? `?fecha=${f}` : ''}`);
      setD({ ...r, yo: cuenta.id });
    } catch (err) {
      setError(err.message);
    }
  }, [cuenta.id]);
  useEffect(() => {
    cargar();
    api('clientas')
      .then((r) => setClientas(r.clientas))
      .catch(() => {});
  }, [cargar]);

  const listo = (t) => {
    setHoja(null);
    setAviso(t);
    clearTimeout(avisoT.current);
    avisoT.current = setTimeout(() => setAviso(''), 3000);
    cargar(d.fecha);
  };

  const horas = [];
  for (let m = ABRE; m <= CIERRA; m += 60) horas.push(m);
  const datos = d ? { ...d, clientas } : null;
  const manana = d ? moverDia(d.hoy, 1) : null;

  return (
    <div className="panel">
      <header className="panel__cabeza">
        <span className="eyebrow">Horas por persona</span>
        <h1 className="panel__titulo">
          La <em>agenda</em>
        </h1>
      </header>
      {error && <p className="portal-error" role="alert">{error}</p>}
      {!d && !error && <p className="muted">Cargando…</p>}
      {d && (
        <>
          <section className="hoy">
            <div className="dia-nav">
              <button type="button" className="icono-boton" aria-label="Día anterior" onClick={() => cargar(moverDia(d.fecha, -1))}>
                <ChevronLeft />
              </button>
              <span className="dia-nav__texto">{d.fecha === d.hoy ? 'Hoy' : d.fecha === manana ? 'Mañana' : diaLargo(d.fecha)}</span>
              <button type="button" className="icono-boton" aria-label="Día siguiente" onClick={() => cargar(moverDia(d.fecha, 1))}>
                <ChevronRight />
              </button>
            </div>
            <div className="hoy__cifras">
              <div>
                <strong>{d.citas.filter((c) => !['cancelada', 'no-vino'].includes(c.estado)).length}</strong>
                <span>citas</span>
              </div>
              <div>
                <strong>{d.citas.filter((c) => c.cuentaId === cuenta.id && !['cancelada', 'no-vino'].includes(c.estado)).length}</strong>
                <span>tuyas</span>
              </div>
            </div>
            <button type="button" className="hoy__boton" onClick={() => setHoja({ inicial: { cuentaId: d.puedeAgendarATodas ? undefined : cuenta.id } })}>
              <Plus size={18} /> Agendar
            </button>
          </section>

          {d.fecha === manana && d.puedeAgendarATodas && d.citas.some((c) => c.telefono && c.estado === 'agendada') && (
            <div className="aviso-fijo">
              <p>
                <strong>Recordatorios de mañana:</strong> toca una cita y aprieta «Recordarle la hora». Faltan{' '}
                {d.citas.filter((c) => c.telefono && !c.recordada && !['cancelada', 'no-vino'].includes(c.estado)).length}.
              </p>
            </div>
          )}

          {(() => {
            const mias = d.citas.filter((c) => c.cuentaId === cuenta.id && c.estado !== 'cancelada');
            return mias.length > 0 ? (
              <section>
                <h2 className="seccion__titulo">Tus clientas {d.fecha === d.hoy ? 'de hoy' : 'ese día'}</h2>
                <ul className="cuentas">
                  {mias.map((c) => (
                    <li key={c.id}>
                      <button type="button" className={`pedido pedido--boton mi-cita is-${c.estado}`} onClick={() => setHoja({ cita: c })}>
                        <span className="mi-cita__hora">{c.hora}</span>
                        <span className="pedido__texto">
                          <strong>{c.clienta}</strong>
                          <small>
                            {c.servicio ?? 'Sin servicio'} · {c.minutos} min · {ESTADOS.find(([k]) => k === c.estado)?.[1]}
                          </small>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null;
          })()}

          <h2 className="seccion__titulo">Todo el equipo</h2>
          <div className="agenda" style={{ '--cols': d.personas.length }}>
            <div className="agenda__cabeza">
              <span />
              {d.personas.map((p) => (
                <span key={p.id} className={`agenda__persona ${p.dispo === 'no' ? 'is-no' : ''}`}>
                  {primer(p.nombre)}
                  <small>{p.dispo === 'no' ? 'no viene' : p.dispo === 'manana' ? 'solo AM' : p.dispo === 'tarde' ? 'solo PM' : p.dispo === 'todo' ? 'todo el día' : ''}</small>
                </span>
              ))}
            </div>
            <div className="agenda__cuerpo" style={{ height: (CIERRA - ABRE) * PX }}>
              <div className="agenda__horas">
                {horas.map((m) => (
                  <span key={m} style={{ top: (m - ABRE) * PX }}>
                    {aHora(m)}
                  </span>
                ))}
              </div>
              {d.personas.map((p) => (
                <div
                  key={p.id}
                  className={`agenda__col ${p.dispo === 'no' ? 'is-no' : ''}`}
                  role="button"
                  tabIndex={-1}
                  aria-label={`Agendar con ${p.nombre}`}
                  onClick={(e) => {
                    if (!d.puedeAgendarATodas && p.id !== cuenta.id) return;
                    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
                    const m = Math.max(ABRE, Math.min(CIERRA - 30, ABRE + Math.round(y / PX / 15) * 15));
                    setHoja({ inicial: { cuentaId: p.id, hora: aHora(m) } });
                  }}
                >
                  {horas.map((m) => (
                    <span key={m} className="agenda__linea" style={{ top: (m - ABRE) * PX }} />
                  ))}
                  {d.citas
                    .filter((c) => c.cuentaId === p.id)
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`agenda__cita is-${c.estado}`}
                        style={{ top: (aMin(c.hora) - ABRE) * PX, height: Math.max(26, c.minutos * PX - 3) }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setHoja({ cita: c });
                        }}
                      >
                        <strong>
                          {c.alergias ? '⚠ ' : ''}
                          {c.hora} {c.clienta}
                        </strong>
                        {c.servicio && <small>{c.servicio}</small>}
                      </button>
                    ))}
                </div>
              ))}
            </div>
          </div>
          <p className="muted">Toca un espacio vacío en la columna de una persona para agendar a esa hora. Cada una tiene su propia columna: dos pueden atender a la vez.</p>
        </>
      )}
      {aviso && (
        <p className="aviso" role="status">
          {aviso}
        </p>
      )}
      {hoja && <FormCita d={datos} cita={hoja.cita} inicial={hoja.inicial} onListo={listo} onCerrar={() => setHoja(null)} />}
    </div>
  );
};

export default Agenda;
