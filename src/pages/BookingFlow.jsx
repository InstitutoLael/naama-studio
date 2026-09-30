import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import { ArrowRight, CheckIcon, SearchIcon, WhatsAppIcon } from '../components/common/Icons';
import { mundos, servicesForMundo } from '../data/categories';
import { servicesData } from '../data/servicesData';
import { team } from '../data/team';
import { whatsappUrl } from '../data/site';
import { scrollToTop } from '../lib/smoothScroll';
import '../theme/booking.css';

const STEPS = ['Servicio', 'Especialista', 'Día', 'Hora', 'Confirmar'];
const ANY = { name: 'Sin preferencia', role: 'Te asignamos a quien esté disponible' };
const EASE = [0.16, 1, 0.3, 1];

const normalize = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const pad = (n) => String(n).padStart(2, '0');
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Próximos días hábiles (lunes a sábado).
const upcomingDays = () => {
  const days = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  for (let i = 0; days.length < 38 && i < 60; i++) {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    if (day.getDay() !== 0) days.push(day);
  }
  return days;
};

// Horarios de inicio por día (se omite la hora de almuerzo).
const timesFor = (date) => {
  if (!date) return [];
  const day = date.getDay();
  if (day === 6) return ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00'];
  if (day === 5) return ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
  return ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
};

const fmtLong = (d) =>
  d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

const BookingFlow = () => {
  const [params] = useSearchParams();
  const preService = servicesData.find((s) => s.name === params.get('servicio')) ?? null;
  const preMundo =
    params.get('mundo') ??
    (preService ? mundos.find((m) => servicesForMundo([preService], m).length)?.id : mundos[0].id);

  const [step, setStep] = useState(preService ? 2 : 1);
  const [mundoId, setMundoId] = useState(preMundo);
  const [query, setQuery] = useState('');
  const [service, setService] = useState(preService);
  const [person, setPerson] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState('');
  const [name, setName] = useState('');

  const days = useMemo(upcomingDays, []);
  const mundo = mundos.find((m) => m.id === mundoId) ?? mundos[0];

  const list = useMemo(() => {
    const q = normalize(query.trim());
    const pool = q ? servicesData : servicesForMundo(servicesData, mundo);
    return q ? pool.filter((s) => normalize(`${s.name} ${s.cat}`).includes(q)) : pool;
  }, [mundo, query]);

  const people = useMemo(() => {
    if (!service?.worker) return team;
    const names = service.worker.split(',').map((w) => w.trim());
    const found = team.filter((t) => names.includes(t.name));
    return found.length ? found : team;
  }, [service]);

  const canNext = [!!service, !!person, !!date, !!time, true][step - 1];

  const go = (n) => {
    setStep(n);
    scrollToTop(false);
  };

  const message = () =>
    [
      'Hola Naamá Studio! Quiero reservar:',
      `• Servicio: ${service?.name}`,
      `• Especialista: ${person?.name}`,
      `• Día: ${date ? fmtLong(date) : ''}`,
      `• Hora: ${time}`,
      name && `• Nombre: ${name}`,
      '¡Muchas gracias!',
    ]
      .filter(Boolean)
      .join('\n');

  const summary = [
    { label: 'Servicio', value: service?.name, step: 1 },
    { label: 'Especialista', value: person?.name, step: 2 },
    { label: 'Día', value: date && fmtLong(date), step: 3 },
    { label: 'Hora', value: time, step: 4 },
  ];

  return (
    <div className="booking">
      <SEOHead title="Reservar" description="Elige tu servicio, especialista, día y hora, y confirma tu reserva por WhatsApp con Naamá Studio." />

      <div className="container booking__layout">
        <div className="booking__main">
          <p className="eyebrow">Reserva en 5 pasos</p>

          <ol className="steps" aria-label="Progreso">
            {STEPS.map((s, i) => (
              <li key={s} className={`steps__item ${i + 1 === step ? 'is-current' : ''} ${i + 1 < step ? 'is-done' : ''}`}>
                <span className="steps__dot">{i + 1 < step ? <CheckIcon /> : i + 1}</span>
                <span className="steps__label">{s}</span>
              </li>
            ))}
          </ol>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="step"
            >
              {step === 1 && (
                <>
                  <h1 className="step__title">¿Qué te <em>hacemos hoy?</em></h1>
                  <label className="catalog-search booking__search">
                    <SearchIcon />
                    <span className="visually-hidden">Buscar servicio</span>
                    <input type="search" placeholder="Buscar servicio…" value={query} onChange={(e) => setQuery(e.target.value)} />
                  </label>
                  {!query && (
                    <div className="booking__tabs" role="group" aria-label="Categorías">
                      {mundos.map((m) => (
                        <button key={m.id} className="chip" aria-pressed={m.id === mundoId} onClick={() => setMundoId(m.id)}>
                          {m.short}
                        </button>
                      ))}
                    </div>
                  )}
                  <ul className="options">
                    {list.map((s, i) => {
                      const selected = service?.name === s.name;
                      return (
                        <li key={`${s.name}-${i}`}>
                          <button
                            className={`option ${selected ? 'is-selected' : ''}`}
                            aria-pressed={selected}
                            onClick={() => {
                              setService(s);
                              setPerson(null);
                            }}
                          >
                            <span className="option__main">
                              <span className="option__name">{s.name}</span>
                              <span className="option__meta">{s.time}</span>
                            </span>
                            <span className="option__price">{s.price ? `$${s.price}` : 'Consultar'}</span>
                            <span className="option__check"><CheckIcon /></span>
                          </button>
                        </li>
                      );
                    })}
                    {list.length === 0 && <li className="muted">Sin resultados para “{query}”.</li>}
                  </ul>
                </>
              )}

              {step === 2 && (
                <>
                  <h1 className="step__title">¿Con <em>quién?</em></h1>
                  <div className="people">
                    {[ANY, ...people].map((p) => {
                      const selected = person?.name === p.name;
                      return (
                        <button
                          key={p.name}
                          className={`person ${selected ? 'is-selected' : ''}`}
                          aria-pressed={selected}
                          onClick={() => setPerson(p)}
                        >
                          <span className="person__mono" style={{ '--tone': p.tone ?? '#1c120c' }}>
                            {p.photo ? <Photo name={p.photo} alt="" sizes="52px" position="50% 20%" /> : p === ANY ? '✦' : p.name[0]}
                          </span>
                          <span className="person__name">{p.name}</span>
                          <span className="person__role">{p.role}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h1 className="step__title">¿Qué <em>día?</em></h1>
                  <p className="muted step__hint">Abrimos de lunes a sábado.</p>
                  <div className="days">
                    {days.map((d) => {
                      const selected = date && toKey(d) === toKey(date);
                      return (
                        <button
                          key={toKey(d)}
                          className={`day ${selected ? 'is-selected' : ''}`}
                          aria-pressed={selected}
                          aria-label={fmtLong(d)}
                          onClick={() => {
                            setDate(d);
                            setTime('');
                          }}
                        >
                          <span className="day__wd">{d.toLocaleDateString('es-CL', { weekday: 'short' }).replace('.', '')}</span>
                          <span className="day__n">{d.getDate()}</span>
                          <span className="day__m">{d.toLocaleDateString('es-CL', { month: 'short' }).replace('.', '')}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h1 className="step__title">¿A qué <em>hora?</em></h1>
                  <p className="muted step__hint">{date && fmtLong(date)}. Te confirmamos la disponibilidad por WhatsApp.</p>
                  <div className="times">
                    {timesFor(date).map((t) => (
                      <button key={t} className={`time ${time === t ? 'is-selected' : ''}`} aria-pressed={time === t} onClick={() => setTime(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 5 && (
                <>
                  <h1 className="step__title">Todo <em>listo.</em></h1>
                  <p className="muted step__hint">
                    Al confirmar se abrirá WhatsApp con tu solicitud. Te respondemos para confirmar la hora.
                  </p>
                  <div className="field booking__name">
                    <label htmlFor="nombre">Tu nombre (opcional)</label>
                    <input id="nombre" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
                  </div>
                  <a href={whatsappUrl(message())} target="_blank" rel="noopener noreferrer" className="btn btn--caramel booking__confirm">
                    <WhatsAppIcon /> Confirmar por WhatsApp
                  </a>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="booking__nav">
            {step > 1 ? (
              <button className="btn btn--ghost" onClick={() => go(step - 1)}>
                Volver
              </button>
            ) : <span />}
            {step < 5 && (
              <button className="btn" disabled={!canNext} onClick={() => go(step + 1)}>
                Continuar <ArrowRight />
              </button>
            )}
          </div>
        </div>

        <aside className="booking__summary on-dark" aria-label="Resumen de tu reserva">
          <p className="eyebrow">Tu reserva</p>
          <dl>
            {summary.map((row) => (
              <div key={row.label} className="summary__row">
                <dt>{row.label}</dt>
                <dd>
                  {row.value ? (
                    <button onClick={() => go(row.step)} className="summary__value">{row.value}</button>
                  ) : (
                    <span className="summary__empty">—</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className="summary__total">
            <span>Valor referencial</span>
            <strong>{service?.price ? `$${service.price}` : '—'}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BookingFlow;
