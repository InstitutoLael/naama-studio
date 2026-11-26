import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import { ArrowLeft, ArrowRight, CheckIcon, ClockIcon, PinIcon, SearchIcon, WhatsAppIcon } from '../components/common/Icons';
import { mundos, servicesForMundo } from '../data/categories';
import { servicesData } from '../data/servicesData';
import { team } from '../data/team';
import { HORARIO_CORTO, SITE, whatsappUrl } from '../data/site';
import { scrollToTop } from '../lib/smoothScroll';
import { usePreciosVivos } from '../data/preciosVivos';
import { precioTexto } from '../data/menuPrecios';
import '../theme/booking.css';

const PASOS = ['Servicio', 'Especialista', 'Día y hora', 'Confirmar'];
const LIBRE = { name: 'Sin preferencia', libre: true };
const HORAS = ['10:30', '11:30', '12:30', '14:30', '15:30', '16:30', '17:30', '18:30'];

const normalizar = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const pad = (n) => String(n).padStart(2, '0');
const clave = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const proximosDias = () => {
  const dias = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  for (let i = 0; dias.length < 30 && i < 45; i++) {
    const dia = new Date(d);
    dia.setDate(d.getDate() + i);
    if (dia.getDay() !== 0) dias.push(dia);
  }
  return dias;
};
const corto = (d, op) => d.toLocaleDateString('es-CL', op).replace('.', '');
const fechaLarga = (d) => d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' }).replace('.', '');
const conMayuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** P04 · Reservar en 4 pasos (en computador, 3 columnas con el ticket fijo). */
const BookingFlow = () => {
  const version = usePreciosVivos();
  const [params] = useSearchParams();
  const pedido = servicesData.find((s) => s.name === params.get('servicio')) ?? null;
  const mundoInicial =
    params.get('mundo') ?? (pedido ? mundos.find((m) => servicesForMundo([pedido], m).length)?.id : mundos[0].id);

  const [paso, setPaso] = useState(pedido ? 2 : 1);
  const [mundoId, setMundoId] = useState(mundoInicial);
  const [busca, setBusca] = useState('');
  const [servicio, setServicio] = useState(pedido);
  const [persona, setPersona] = useState(() => team.find((t) => t.name === params.get('con')) ?? (pedido ? LIBRE : null));
  const [dia, setDia] = useState(null);
  const [hora, setHora] = useState('');
  const [nombre, setNombre] = useState('');

  const dias = useMemo(proximosDias, []);
  const mundo = mundos.find((m) => m.id === mundoId) ?? mundos[0];

  const lista = useMemo(() => {
    const q = normalizar(busca.trim());
    const base = servicesForMundo(servicesData, mundo);
    return q ? base.filter((s) => normalizar(`${s.name} ${s.cat}`).includes(q)) : base;
  }, [mundo, busca, version]);

  const personas = useMemo(() => {
    const nombres = (servicio?.worker ?? '').split(',').map((w) => w.trim());
    return team.filter((t) => nombres.includes(t.name));
  }, [servicio, version]);

  const ir = (n) => {
    setPaso(n);
    scrollToTop(false);
  };
  const elegirServicio = (s) => {
    setServicio(s);
    if (persona && !persona.libre && !(s.worker ?? '').includes(persona.name)) setPersona(LIBRE);
    if (!persona) setPersona(LIBRE);
  };

  const quien = persona?.libre ? 'Sin preferencia' : persona?.name;
  const precio = servicio ? precioTexto(servicio.price) : '—';
  const falta = !servicio ? 'Elige un servicio' : !dia ? 'Elige el día' : !hora ? 'Elige la hora' : null;

  const mensaje = [
    'Hola Naamá Studio! Quiero reservar:',
    `• Servicio: ${servicio?.name}`,
    `• Especialista: ${quien ?? 'Sin preferencia'}`,
    dia && `• Día: ${fechaLarga(dia)}`,
    hora && `• Hora: ${hora}`,
    nombre.trim() && `• Nombre: ${nombre.trim()}`,
    '¡Muchas gracias!',
  ]
    .filter(Boolean)
    .join('\n');

  const progreso = (
    <ol className="pasos" aria-label="Progreso">
      {PASOS.map((p, i) => {
        const actualI = paso === 1 ? 0 : paso === 4 ? 3 : 2;
        const hecho = i < actualI;
        const actual = i === actualI;
        return (
          <li key={p} className={`pasos__item ${actual ? 'is-actual' : ''} ${hecho ? 'is-hecho' : ''}`}>
            <span className="pasos__punto">{hecho ? <CheckIcon /> : i + 1}</span>
            <span>{p}</span>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className={`reservar pagina reservar--paso-${paso}`}>
      <SEOHead title="Reservar" description="Elige tu servicio, especialista, día y hora, y confirma tu reserva por WhatsApp con Naamá Studio." />

      {/* Paso 1 · cabecera con foto (solo celular) */}
      {paso === 1 && (
        <header className="reservar-hero solo-cel">
          <Photo name="unas-burdeo-floral" alt="" sizes="100vw" />
          <div className="reservar-hero__texto">
            <p className="gigante">Reserva</p>
            <p className="firma firma--blanca">tu pausa</p>
          </div>
        </header>
      )}
      {paso !== 1 && (
        <div className="container reservar-top solo-cel">
          <button className="circulo-btn" onClick={() => ir(paso === 4 ? 2 : 1)} aria-label="Volver"><ArrowLeft /></button>
          <p>{paso === 4 ? `Paso 4 de 4` : 'Reservar'}</p>
          <span />
        </div>
      )}

      <div className="container reservar-grid">
        <div className="solo-cel">{progreso}</div>

        {/* 1 · Servicio */}
        <section className="reservar-col col-servicio" aria-labelledby="t-servicio">
          <h1 id="t-servicio" className="reservar-sub"><span className="solo-pc">1 · </span>¿Qué te hacemos?</h1>
          <div className="mundo-fotos" role="group" aria-label="Mundos">
            {mundos.map((m) => (
              <button key={m.id} className="mundo-foto" aria-pressed={m.id === mundoId} onClick={() => { setMundoId(m.id); setBusca(''); }}>
                <Photo name={m.photo} alt="" sizes="(min-width: 1024px) 120px, 45vw" />
                <span>{m.short}</span>
              </button>
            ))}
          </div>
          <label className="buscador-caja">
            <SearchIcon />
            <span className="visually-hidden">Buscar servicio</span>
            <input type="search" placeholder={`Buscar en ${mundo.short.toLowerCase()}…`} value={busca} onChange={(e) => setBusca(e.target.value)} />
          </label>
          <ul className="opciones">
            {lista.map((s, i) => {
              const on = servicio?.name === s.name;
              return (
                <li key={`${s.name}-${i}`}>
                  <button className="opcion" aria-pressed={on} onClick={() => elegirServicio(s)}>
                    <span className="opcion__nombre">
                      {s.name}
                      <small>{s.time}</small>
                    </span>
                    <strong>{precioTexto(s.price)}</strong>
                    <span className="opcion__radio" aria-hidden="true">{on && <CheckIcon />}</span>
                  </button>
                </li>
              );
            })}
            {!lista.length && <li className="muted">No encontramos «{busca}» en {mundo.short}.</li>}
          </ul>
          <div className="barra-fija solo-cel">
            <div className="barra-fija__dato">
              <small>{servicio?.name ?? 'Elige un servicio de la lista'}</small>
              <strong>{precio}</strong>
            </div>
            <button className="btn btn--claro btn--sm" disabled={!servicio} onClick={() => ir(2)}>
              {servicio ? <>Continuar <ArrowRight /></> : 'Falta servicio'}
            </button>
          </div>
        </section>

        {/* 2–3 · Con quién, día y hora */}
        <section className="reservar-col col-cuando" aria-labelledby="t-cuando">
          <h2 id="t-cuando" className="visually-hidden">Especialista, día y hora</h2>
          {servicio && (
            <div className="elegido tarjeta solo-cel">
              <Photo name={mundo.photo} alt="" sizes="64px" />
              <div>
                <strong>{servicio.name}</strong>
                <small>{precio} · {servicio.time}</small>
                <button className="chip chip--suave chip--mini" onClick={() => ir(1)}>Cambiar</button>
              </div>
            </div>
          )}

          <h3 className="reservar-sub"><span className="solo-pc">2 · </span>Con quién</h3>
          <div className="quien-circulos" role="group" aria-label="Especialista">
            <button className="quien" aria-pressed={!!persona?.libre} onClick={() => setPersona(LIBRE)}>
              <span className="quien__libre">Libre</span>
              <span>Sin preferencia</span>
            </button>
            {(servicio ? personas : team).map((t) => (
              <button key={t.name} className="quien" aria-pressed={persona?.name === t.name} onClick={() => setPersona(t)}>
                <Photo name={t.photo} alt="" sizes="64px" position="center 25%" />
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          <h3 className="reservar-sub"><span className="solo-pc">3 · </span>Día</h3>
          <div className="dias" role="group" aria-label="Día">
            {dias.map((d) => (
              <button
                key={clave(d)}
                className="dia"
                aria-pressed={!!dia && clave(d) === clave(dia)}
                aria-label={fechaLarga(d)}
                onClick={() => { setDia(d); setHora(''); }}
              >
                <small>{corto(d, { weekday: 'short' })}</small>
                <strong>{d.getDate()}</strong>
                <small>{corto(d, { month: 'short' })}</small>
              </button>
            ))}
          </div>

          <h3 className="reservar-sub">Hora</h3>
          {dia ? (
            <div className="horas" role="group" aria-label="Hora">
              {HORAS.map((h) => (
                <button key={h} className="hora" aria-pressed={hora === h} onClick={() => setHora(h)}>{h}</button>
              ))}
            </div>
          ) : (
            <p className="muted chico">Primero elige el día.</p>
          )}
          <p className="muted chico">Te confirmamos la disponibilidad por WhatsApp.</p>

          <div className="barra-fija solo-cel">
            <div className="barra-fija__dato">
              <small>{[dia && corto(dia, { weekday: 'short', day: 'numeric', month: 'short' }), hora, quien].filter(Boolean).join(' · ') || servicio?.name}</small>
              <strong>{precio}</strong>
            </div>
            <button className="btn btn--claro btn--sm" disabled={!!falta} onClick={() => ir(4)}>
              {falta ? falta : <>Continuar <ArrowRight /></>}
            </button>
          </div>
        </section>

        {/* 4 · Ticket */}
        <section className="reservar-col col-ticket" aria-labelledby="t-listo">
          <div className="ticket-cabeza">
            <h2 id="t-listo"><span className="gigante">Todo</span><span className="firma">listo</span></h2>
            <p className="muted chico">Al confirmar se abre WhatsApp con tu solicitud. Te respondemos para confirmar la hora.</p>
          </div>

          <div className="ticket tarjeta">
            <div className="ticket__arriba">
              {persona && !persona.libre ? <Photo name={persona.photo} alt="" sizes="56px" position="center 25%" /> : <span className="ticket__libre">N</span>}
              <div>
                <strong>{servicio?.name ?? 'Sin servicio todavía'}</strong>
                <small>con {persona && !persona.libre ? persona.name : 'quien esté libre'}{servicio ? ` · ${servicio.time}` : ''}</small>
              </div>
            </div>
            <dl className="ticket__datos">
              <div><dt>Día</dt><dd>{dia ? conMayuscula(fechaLarga(dia)) : '—'}</dd></div>
              <div><dt>Hora</dt><dd>{hora || '—'}</dd></div>
              <div><dt>Dónde</dt><dd>Arcadia 1297</dd></div>
              <div><dt>Valor</dt><dd>{precio}</dd></div>
            </dl>
            <div className="ticket__cambiar solo-cel">
              <button className="link-sub" onClick={() => ir(1)}>Cambiar servicio</button>
              <button className="link-sub" onClick={() => ir(2)}>Cambiar especialista</button>
              <button className="link-sub" onClick={() => ir(2)}>Cambiar día u hora</button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="nombre">Tu nombre (opcional)</label>
            <input id="nombre" className="campo" placeholder="Ej.: Camila" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="given-name" />
          </div>

          {falta ? (
            <button className="btn btn--ancho" disabled>Falta: {falta.replace('Elige ', '')}</button>
          ) : (
            <a href={whatsappUrl(mensaje)} target="_blank" rel="noopener noreferrer" className="btn btn--ancho">
              <WhatsAppIcon /> Confirmar por WhatsApp
            </a>
          )}

          <div className="antes">
            <h3 className="reservar-sub">Antes de venir</h3>
            <div className="antes__cajas">
              <div className="tarjeta"><WhatsAppIcon /><strong>Confirmamos</strong><small>por WhatsApp</small></div>
              <a className="tarjeta" href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer"><PinIcon /><strong>Arcadia 1297</strong><small>San Miguel</small></a>
              <div className="tarjeta"><ClockIcon /><strong>{HORARIO_CORTO.split(' ')[0]}</strong><small>10:30 a 19:30</small></div>
            </div>
            <Link to="/contacto" className="link-sub chico">Cómo llegar</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookingFlow;
