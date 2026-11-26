import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarHeart, ChevronLeft, ChevronRight, Copy, Plus, Trash2 } from 'lucide-react';
import { WhatsAppIcon } from '../components/common/Icons';
import { api, post } from './api';
import Hoja from './Hoja';
import { CATALOGO, minutosDe } from './servicios';
import { servicesData } from '../data/servicesData';
import { duracionDeServicio } from '../data/menuPrecios';
import Photo from '../components/common/Photo';
import { team } from '../data/team';

const fotoDe = (nombre) => team.find((t) => t.name.toLowerCase() === String(nombre).split(' ')[0].toLowerCase())?.photo;

const duracion = (servicio) => Math.max(15, duracionDeServicio(servicesData, servicio) || minutosDe(servicio));

const ABRE = 10 * 60 + 30; // 10:30 (horario del salón)
const CIERRA = 19 * 60 + 30; // 19:30 (un color largo puede pasarse: se ve igual)
const PX = 1.4; // píxeles por minuto
const ESTADOS = [
  ['pedida', 'Pedida por la web'],
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
const HORAS_SALON = ['10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30'];
const DURACIONES = [30, 45, 60, 90, 120, 150, 180, 210, 240, 300, 360, 420, 480];

/** Mensaje bonito para recordarle la hora a la clienta (va por WhatsApp). */
export const mensajeRecordatorio = (c) => {
  const dia = new Date(`${c.fecha}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  const dia2 = dia.split(' de ')[0].replace(',', '');
  return `Hola ${primer(c.clienta)} 🤍 te recordamos tu hora en Naamá: ${dia2} a las ${c.hora}${c.servicio ? `, ${c.servicio.toLowerCase()}` : ''} con ${primer(c.quien)}. Arcadia 1297, San Miguel (a pasos del metro El Llano). Si necesitas cambiarla, respóndenos por aquí.`;
};

/** Reparte en carriles las citas que se cruzan (sobrecupo), para verlas lado a lado. */
const carriles = (citas) => {
  const orden = [...citas].sort((a, b) => aMin(a.hora) - aMin(b.hora));
  const fines = [];
  const conCarril = orden.map((c) => {
    const ini = aMin(c.hora);
    let carril = fines.findIndex((f) => f <= ini);
    if (carril === -1) carril = fines.length;
    fines[carril] = ini + c.minutos;
    return { c, carril, ini, fin: ini + c.minutos };
  });
  return conCarril.map((x) => {
    const cruzadas = conCarril.filter((y) => y.ini < x.fin && x.ini < y.fin);
    return { c: x.c, carril: x.carril, de: Math.max(...cruzadas.map((y) => y.carril)) + 1 };
  });
};

const FormCita = ({ d, cita, inicial, onListo, onCerrar, enLinea = false }) => {
  const [v, setV] = useState(() => ({
    cuentaId: cita?.cuentaId ?? inicial?.cuentaId ?? (d.personas.some((p) => p.id === d.yo) ? d.yo : d.personas[0]?.id),
    fecha: cita?.fecha ?? d.fecha,
    hora:
      cita?.hora ??
      inicial?.hora ??
      (() => {
        const quien = inicial?.cuentaId ?? (d.personas.some((p) => p.id === d.yo) ? d.yo : d.personas[0]?.id);
        return (
          HORAS_SALON.find((h) => !d.citas.some((c) => c.cuentaId === quien && !['cancelada', 'no-vino'].includes(c.estado) && aMin(c.hora) < aMin(h) + 60 && aMin(h) < aMin(c.hora) + c.minutos)) ??
          '10:30'
        );
      })(),
    minutos: cita?.minutos ?? (inicial?.servicio ? duracion(inicial.servicio) : 60),
    clienta: cita?.clienta ?? '',
    telefono: cita?.telefono ?? '',
    servicio: cita?.servicio ?? inicial?.servicio ?? '',
    nota: cita?.nota ?? '',
    sobrecupo: cita?.sobrecupo ?? false,
  }));
  const [error, setError] = useState('');
  const [choca, setChoca] = useState(false);
  const tocado = useRef(Boolean(cita));
  const cambia = (k) => (e) => {
    const val = e.target.value;
    setV((x) => {
      const n = { ...x, [k]: val };
      if (k === 'servicio' && !tocado.current) n.minutos = duracion(val);
      if (k === 'minutos') tocado.current = true;
      return n;
    });
  };
  const servicios = useMemo(
    () => [...new Set([...CATALOGO.filter((c) => !c.salon).map((c) => c.nombre.replace(' (ganancia)', '')), ...servicesData.map((x) => x.name)])],
    [],
  );
  const personas = d.personas;

  const envolver = (cuerpo) =>
    enLinea ? (
      <aside className="agendar-panel" aria-label="Agendar">
        <h2 className="agendar-panel__titulo">Agendar</h2>
        {cuerpo}
        <p className="nota-mano">o toca un espacio libre en la columna</p>
      </aside>
    ) : (
      <Hoja titulo={cita ? `Cita de ${cita.clienta}` : 'Agendar'} onCerrar={onCerrar}>
        {cuerpo}
      </Hoja>
    );
  return envolver(
    <>
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
            onListo(cita ? 'Cita actualizada.' : v.sobrecupo ? 'Agendada como sobrecupo.' : 'Agendada.');
          } catch (err) {
            setError(err.message);
            setChoca(err.choque);
          }
        }}
      >
        <div className="field">
          <span className="field__titulo">¿Con quién? (puede ser otra persona)</span>
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
        {d.verNumeros && (
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
            <input className="input" type="date" value={v.fecha} onChange={cambia('fecha')} required />
          </label>
          <label className="field">
            <span>Hora</span>
            <input className="input" type="time" value={v.hora} onChange={cambia('hora')} required />
          </label>
        </div>
        {v.fecha === d.fecha && (
          <div className="horas-libres" role="radiogroup" aria-label="Horas del día">
            {HORAS_SALON.map((h) => {
              const ini = aMin(h);
              const ocupada = d.citas.some(
                (c) => c.id !== cita?.id && c.cuentaId === Number(v.cuentaId) && !['cancelada', 'no-vino'].includes(c.estado) && aMin(c.hora) < ini + Number(v.minutos) && ini < aMin(c.hora) + c.minutos,
              );
              return (
                <button key={h} type="button" role="radio" aria-checked={v.hora === h} className={`hora-libre ${ocupada ? 'is-ocupada' : ''}`} onClick={() => setV((x) => ({ ...x, hora: h }))}>
                  <strong>{h}</strong>
                  <small>{v.hora === h ? 'elegida' : ocupada ? 'ocupada' : 'libre'}</small>
                </button>
              );
            })}
          </div>
        )}
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
        <button
          type="button"
          role="switch"
          aria-checked={v.sobrecupo}
          className={`sobrecupo ${v.sobrecupo ? 'is-on' : ''}`}
          onClick={() => setV((x) => ({ ...x, sobrecupo: !x.sobrecupo }))}
        >
          <span className="sobrecupo__switch" aria-hidden="true" />
          <span>
            <strong>Sobrecupo</strong>
            <small>Atiende a dos clientas a la vez (ej.: mientras una espera el color)</small>
          </span>
        </button>
        {error && <p className="portal-error">{error}</p>}
        {choca && !v.sobrecupo && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={async () => {
              const n = { ...v, sobrecupo: true };
              setV(n);
              try {
                await post(cita ? `agenda/${cita.id}` : 'agenda', n);
                onListo('Agendada como sobrecupo.');
              } catch (err) {
                setError(err.message);
                setChoca(false);
              }
            }}
          >
            Agendar igual, como sobrecupo
          </button>
        )}
        <div className="hoja__acciones">
          <button type="submit" className={`btn ${cita ? '' : 'btn--terracota'}`}>
            {cita ? 'Guardar cambios' : `Agendar ${v.hora} con ${primer(personas.find((p) => p.id === Number(v.cuentaId))?.nombre ?? '')}`}
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
    </>,
  );
};


/** Para ver las horas en el calendario del celu (y en su widget). */
const CalendarioCelu = () => {
  const [links, setLinks] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState('');
  useEffect(() => {
    if (abierto && !links) api('calendario').then(setLinks).catch(() => {});
  }, [abierto, links]);
  const esIphone = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);
  const webcal = (u) => u.replace(/^https?:/, 'webcal:');
  const google = (u) => `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(webcal(u))}`;
  const copiar = async (u, cual) => {
    try {
      await navigator.clipboard.writeText(u);
      setCopiado(cual);
      setTimeout(() => setCopiado(''), 2500);
    } catch {
      window.prompt('Copia este link:', u);
    }
  };
  const bloque = (u, cual, titulo) => (
    <div className="cal-celu__link">
      <strong>{titulo}</strong>
      <div className="cal-celu__botones">
        <a className="btn" href={esIphone ? webcal(u) : google(u)} target="_blank" rel="noreferrer">
          {esIphone ? 'Agregar al calendario' : 'Agregar a Google Calendar'}
        </a>
        <button type="button" className="btn btn--ghost" onClick={() => copiar(u, cual)}>
          <Copy size={15} /> {copiado === cual ? '¡Copiado!' : 'Copiar link'}
        </button>
      </div>
    </div>
  );
  return (
    <section className={`cal-celu ${abierto ? 'is-open' : ''}`}>
      <button type="button" className="cal-celu__cabeza" onClick={() => setAbierto((x) => !x)} aria-expanded={abierto}>
        <CalendarHeart strokeWidth={1.6} />
        <span>
          <strong>Ver mis horas en el calendario del celu</strong>
          <small>Y en el widget de calendario de la pantalla de inicio</small>
        </span>
      </button>
      {abierto && (
        <div className="cal-celu__cuerpo">
          {!links && <p className="muted">Preparando tu link…</p>}
          {links && bloque(links.propio, 'propio', 'Solo mis horas')}
          {links?.todas && bloque(links.todas, 'todas', 'Toda la agenda del salón')}
          {links && (
            <p className="muted cal-celu__nota">
              {esIphone
                ? 'Se agrega una vez y se actualiza solo. Después pon el widget de Calendario en la pantalla de inicio.'
                : 'Se agrega una vez (si el celu no deja, ábrelo en el computador con tu cuenta de Google). Google lo actualiza cada algunas horas, así que una hora recién agendada puede tardar: el aviso del portal llega al tiro. Después pon el widget de Google Calendar en la pantalla de inicio.'}{' '}
              Este link es solo tuyo: no lo compartas.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

const useEsCompu = () => {
  const [si, setSi] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const f = () => setSi(mq.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);
  return si;
};

const Agenda = ({ cuenta }) => {
  const esCompu = useEsCompu();
  const [panel, setPanel] = useState({ n: 0, inicial: {} });
  const [d, setD] = useState(null);
  const [ver, setVer] = useState('todas');
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
    const q = new URLSearchParams(window.location.search);
    const f = q.get('fecha');
    cargar(/^\d{4}-\d{2}-\d{2}$/.test(f ?? '') ? f : undefined);
    // Desde «Precios» o desde el atajo del ícono: abre el formulario de una.
    if (q.get('servicio') || q.get('nueva')) setHoja({ inicial: { servicio: q.get('servicio') ?? '' } });
    api('clientas')
      .then((r) => setClientas(r.clientas))
      .catch(() => {});
  }, [cargar]);

  const listo = (t) => {
    setHoja(null);
    setPanel((x) => ({ n: x.n + 1, inicial: {} }));
    setAviso(t);
    clearTimeout(avisoT.current);
    avisoT.current = setTimeout(() => setAviso(''), 3000);
    cargar(d.fecha);
  };

  // En computador el «Agendar» vive en el panel de la derecha.
  useEffect(() => {
    if (esCompu && hoja && !hoja.cita) {
      setPanel((x) => ({ n: x.n + 1, inicial: hoja.inicial ?? {} }));
      setHoja(null);
    }
  }, [esCompu, hoja]);

  const horas = [];
  for (let m = ABRE; m <= CIERRA; m += 60) horas.push(m);
  const datos = d ? { ...d, clientas } : null;
  const manana = d ? moverDia(d.hoy, 1) : null;
  const visibles = !d ? [] : ver === 'todas' ? d.personas : ver === 'mias' ? d.personas.filter((p) => p.id === cuenta.id) : d.personas.filter((p) => p.id === ver);

  return (
    <div className="panel agenda-pagina">
      {d && (
        <header className="agenda-hoy solo-compu">
          <h1>
            <span className="gigante">{d.fecha === d.hoy ? 'Hoy' : diaLargo(d.fecha).split(' ')[0].replace(',', '')}</span>
            <span className="firma">en la casa</span>
          </h1>
          <p>
            {diaLargo(d.fecha)} · {d.citas.filter((c) => !['cancelada', 'no-vino'].includes(c.estado)).length} citas
          </p>
        </header>
      )}
      <header className="panel__cabeza panel__cabeza--fila solo-celu">
        <div>
          <span className="eyebrow">Horas por persona</span>
          <h1 className="panel__titulo">
            La <em>agenda</em>
          </h1>
        </div>
        <button type="button" className="btn btn--sm" onClick={() => setHoja({ inicial: {} })}>
          <Plus size={16} /> Agendar
        </button>
      </header>
      {error && <p className="portal-error" role="alert">{error}</p>}
      {!d && !error && <p className="muted">Cargando…</p>}
      {d && (
        <>
          {(() => {
            const base = new Date(`${d.fecha}T12:00:00`);
            const lunes = new Date(base);
            lunes.setDate(base.getDate() - ((base.getDay() + 6) % 7));
            const dias = Array.from({ length: 6 }, (_, i) => {
              const x = new Date(lunes);
              x.setDate(lunes.getDate() + i);
              return x.toISOString().slice(0, 10);
            });
            return (
              <div className="semana">
                <button type="button" className="icono-boton" aria-label="Semana anterior" onClick={() => cargar(moverDia(dias[0], -7))}>
                  <ChevronLeft />
                </button>
                {dias.map((f) => {
                  const x = new Date(`${f}T12:00:00`);
                  return (
                    <button key={f} type="button" className={`semana__dia ${f === d.fecha ? 'is-on' : ''} ${f === d.hoy ? 'is-hoy' : ''}`} onClick={() => cargar(f)}>
                      <small>{'DLMMJVS'[x.getDay()]}</small>
                      <strong>{x.getDate()}</strong>
                    </button>
                  );
                })}
                <button type="button" className="icono-boton" aria-label="Semana siguiente" onClick={() => cargar(moverDia(dias[5], 2))}>
                  <ChevronRight />
                </button>
              </div>
            );
          })()}
          <p className="agenda__resumen">
            {d.fecha === d.hoy ? 'Hoy' : d.fecha === manana ? 'Mañana' : diaLargo(d.fecha)} ·{' '}
            {d.citas.filter((c) => !['cancelada', 'no-vino'].includes(c.estado)).length} citas ·{' '}
            {d.citas.filter((c) => c.cuentaId === cuenta.id && !['cancelada', 'no-vino'].includes(c.estado)).length} tuyas
          </p>
          <div className="chips agenda__filtros" role="group" aria-label="Ver">
            <button type="button" className="chip chip--suave" aria-pressed={ver === 'todas'} onClick={() => setVer('todas')}>Todo el equipo</button>
            <button type="button" className="chip" aria-pressed={ver === 'mias'} onClick={() => setVer('mias')}>Mis horas</button>
            {d.personas.map((p) => (
              <button key={p.id} type="button" className="chip" aria-pressed={ver === p.id} onClick={() => setVer(p.id)}>{primer(p.nombre)}</button>
            ))}
          </div>

          {d.fecha === manana && d.verNumeros && d.citas.some((c) => c.telefono && c.estado === 'agendada') && (
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

          <div className="agenda" style={{ '--cols': visibles.length || 1 }}>
            <div className="agenda__cabeza">
              <span />
              {visibles.map((p) => (
                <span key={p.id} className={`agenda__persona ${p.dispo === 'no' ? 'is-no' : ''}`}>
                  <span className="agenda__cara">
                    {fotoDe(p.nombre) ? <Photo name={fotoDe(p.nombre)} alt="" sizes="40px" position="center 25%" /> : primer(p.nombre).charAt(0)}
                  </span>
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
              {visibles.map((p) => (
                <div
                  key={p.id}
                  className={`agenda__col agenda__col--c${d.personas.indexOf(p) % 4} ${p.dispo === 'no' ? 'is-no' : ''}`}
                  role="button"
                  tabIndex={-1}
                  aria-label={`Agendar con ${p.nombre}`}
                  onClick={(e) => {
                    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
                    const m = Math.max(ABRE, Math.min(CIERRA - 30, ABRE + Math.round(y / PX / 15) * 15));
                    if (esCompu) setPanel((x) => ({ n: x.n + 1, inicial: { cuentaId: p.id, hora: aHora(m) } }));
                    else setHoja({ inicial: { cuentaId: p.id, hora: aHora(m) } });
                  }}
                >
                  {horas.map((m) => (
                    <span key={m} className="agenda__linea" style={{ top: (m - ABRE) * PX }} />
                  ))}
                  {p.dispo !== 'no' &&
                    HORAS_SALON.filter((h) => {
                      const ini = aMin(h);
                      return !d.citas.some((c) => c.cuentaId === p.id && !['cancelada', 'no-vino'].includes(c.estado) && aMin(c.hora) < ini + 60 && ini < aMin(c.hora) + c.minutos);
                    }).map((h) => (
                      <span key={h} className="agenda__libre" style={{ top: (aMin(h) - ABRE) * PX + 3, height: 60 * PX - 6 }}>
                        + libre
                      </span>
                    ))}
                  {carriles(d.citas.filter((c) => c.cuentaId === p.id)).map(({ c, carril, de }) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`agenda__cita is-${c.estado} ${c.sobrecupo ? 'is-sobrecupo' : ''}`}
                        style={{
                          top: (aMin(c.hora) - ABRE) * PX,
                          height: Math.max(26, c.minutos * PX - 3),
                          left: `calc(${(carril / de) * 100}% + 4px)`,
                          width: `calc(${100 / de}% - 8px)`,
                          right: 'auto',
                        }}
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
                        {c.sobrecupo && <em className="agenda__sobre">Sobrecupo</em>}
                      </button>
                    ))}
                </div>
              ))}
            </div>
          </div>
          <p className="nota-mano">toca un espacio vacío para agendar ↑</p>
          <p className="muted chico">Cada una tiene su propia columna: dos pueden atender a la vez. Horario del salón: 10:30 a 19:30.</p>
          <CalendarioCelu />
        </>
      )}
      {aviso && (
        <p className="aviso" role="status">
          {aviso}
        </p>
      )}
      {esCompu && datos && <FormCita key={panel.n} d={datos} inicial={panel.inicial} enLinea onListo={listo} onCerrar={() => setPanel((x) => ({ n: x.n + 1, inicial: {} }))} />}
      {hoja && datos && (!esCompu || hoja.cita) && <FormCita d={datos} cita={hoja.cita} inicial={hoja.inicial} onListo={listo} onCerrar={() => setHoja(null)} />}
    </div>
  );
};

export default Agenda;
