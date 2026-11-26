import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import { ArrowLeft, ArrowRight, CalendarIcon, CheckIcon, ClockIcon, PinIcon, SearchIcon, WhatsAppIcon } from '../components/common/Icons';
import { mundos, servicesForMundo } from '../data/categories';
import { servicesData } from '../data/servicesData';
import { team } from '../data/team';
import { HORARIO_CORTO, SITE, horaChile, whatsappUrl } from '../data/site';
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

const aMin = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));

/** ¿Esa persona está tomada a esa hora? (según la agenda y su disponibilidad del día) */
const tomada = (p, h, minutos) => {
  if (!p) return false;
  const ini = aMin(h);
  if (p.dispo === 'no') return true;
  if (p.dispo === 'manana' && ini >= 14 * 60) return true;
  if (p.dispo === 'tarde' && ini < 14 * 60) return true;
  return p.ocupadas.some(([hh, m]) => aMin(hh) < ini + minutos && ini < aMin(hh) + m);
};

/** Bloque de color con ícono (X11): lleno, domingo, cargando, sin WhatsApp. */
const Estado = ({ tono, Icono, titulo, children }) => (
  <div className={`estado-bloque estado-bloque--${tono}`} role="status">
    <Icono />
    <div>
      <strong>{titulo}</strong>
      <p>{children}</p>
    </div>
  </div>
);

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
  const [agenda, setAgenda] = useState(null); // { estado: 'cargando' | 'ok' | 'error', personas }
  const [sinWhatsApp, setSinWhatsApp] = useState(false);
  const vigilante = useRef();

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

  // Horas libres reales del día elegido (portal → agenda del salón)
  useEffect(() => {
    if (!dia) return undefined;
    let vivo = true;
    setAgenda({ estado: 'cargando' });
    fetch(`/api/portal/publico/horas?fecha=${clave(dia)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((r) => vivo && setAgenda({ estado: 'ok', personas: r.personas }))
      .catch(() => vivo && setAgenda({ estado: 'error' }));
    return () => {
      vivo = false;
    };
  }, [dia]);

  const minutosServicio = useMemo(() => {
    const t = String(servicio?.time ?? '');
    const h = /([\d.,]+)\s*h/.exec(t);
    const m = /(\d+)\s*min/.exec(t);
    return Math.max(30, Math.round((h ? parseFloat(h[1].replace(',', '.')) * 60 : 0) + (m ? Number(m[1]) : 0)) || 60);
  }, [servicio]);

  /** Una hora está ocupada si la persona elegida está tomada; con «Libre», si todas las que hacen el servicio lo están. */
  const ocupada = (h) => {
    if (agenda?.estado !== 'ok') return false;
    // En el portal algunas usan su apodo (Vivy = Viviana): basta con que empiecen igual.
    const base = (x) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const de = (n) => agenda.personas.find((p) => base(p.nombre) === base(n)) ?? agenda.personas.find((p) => base(p.nombre).slice(0, 3) === base(n).slice(0, 3));
    if (persona && !persona.libre) return tomada(de(persona.name), h, minutosServicio);
    const candidatas = (servicio ? personas : team).map((t) => de(t.name)).filter(Boolean);
    return candidatas.length > 0 && candidatas.every((p) => tomada(p, h, minutosServicio));
  };
  const diaLleno = !!dia && agenda?.estado === 'ok' && HORAS.every(ocupada);
  const siguienteDia = dia ? dias.find((d) => d > dia) : null;
  const esDomingo = horaChile().dia === 0;

  // Si la hora elegida queda ocupada al cambiar de persona, se suelta.
  useEffect(() => {
    if (hora && ocupada(hora)) setHora('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agenda, persona]);

  // Con la foto arriba (paso 1, celular) el encabezado va en claro.
  useEffect(() => {
    document.documentElement.dataset.fotoArriba = paso === 1 ? '1' : '';
    return () => {
      document.documentElement.dataset.fotoArriba = '';
    };
  }, [paso]);

  // En computador, que el servicio elegido quede a la vista en su lista.
  useEffect(() => {
    const el = document.querySelector('.col-servicio .opcion[aria-pressed="true"]');
    const lista = el?.closest('.opciones');
    if (el && lista && lista.scrollHeight > lista.clientHeight) lista.scrollTop = el.offsetTop - 40;
  }, [mundoId]);

  const confirmar = () => {
    // Si a los 2,5 s la página sigue a la vista, WhatsApp no se abrió.
    clearTimeout(vigilante.current);
    setSinWhatsApp(false);
    const oculto = () => {
      if (document.visibilityState === 'hidden') clearTimeout(vigilante.current);
    };
    document.addEventListener('visibilitychange', oculto, { once: true });
    vigilante.current = setTimeout(() => {
      if (document.visibilityState === 'visible' && document.hasFocus()) setSinWhatsApp(true);
    }, 2500);
  };

  const quien = persona?.libre ? 'Sin preferencia' : persona?.name;
  const precio = servicio ? precioTexto(servicio.price) : '—';
  const falta = !servicio ? 'Elige un servicio' : !dia ? 'Elige el día' : !hora ? 'Elige la hora' : null;
  const activa = !servicio ? 1 : !dia || !hora ? 3 : 4;

  const diaTexto = dia ? dia.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric' }).replace(',', '') : '';
  const mensaje = `Hola 🤍 Me gustaría reservar ${servicio?.name ?? ''}${persona && !persona.libre ? ` con ${persona.name}` : ''}${dia ? ` el ${diaTexto}` : ''}${hora ? ` a las ${hora}` : ''}.${nombre.trim() ? ` Gracias, ${nombre.trim()}.` : ' Gracias.'}`;

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
          <Photo name="unas-burdeo-floral" alt="" priority sizes="100vw" />
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

      <div className="container reservar-pc-cabeza solo-pc">
        <h1 className="titulo">Reserva <b>tu pausa</b></h1>
        <div className="chips" role="group" aria-label="Mundo">
          {mundos.map((m) => (
            <button key={m.id} className="chip" aria-pressed={m.id === mundoId} onClick={() => { setMundoId(m.id); setBusca(''); }}>{m.short}</button>
          ))}
        </div>
      </div>

      <div className="container reservar-grid">
        <div className="solo-cel">{progreso}</div>

        {/* 1 · Servicio */}
        <section className={`reservar-col col-servicio ${activa === 1 ? 'is-activa' : ''}`} aria-labelledby="t-servicio">
          <h2 id="t-servicio" className="reservar-sub"><span className="solo-pc">1 · Servicio · {mundo.short}</span><span className="solo-cel">¿Qué te hacemos?</span></h2>
          <div className="mundo-fotos solo-cel" role="group" aria-label="Mundos">
            {mundos.map((m) => (
              <button key={m.id} className="mundo-foto" aria-pressed={m.id === mundoId} onClick={() => { setMundoId(m.id); setBusca(''); }}>
                <Photo name={m.photo} alt="" sizes="(min-width: 1024px) 120px, 45vw" />
                <span>{m.short}</span>
              </button>
            ))}
          </div>
          <label className="buscador-caja solo-cel">
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

        {/* 2 · Con quién */}
        <section className="reservar-col col-quien" aria-labelledby="t-quien">
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

          <h2 id="t-quien" className="reservar-sub"><span className="solo-pc">2 · </span>Con quién</h2>
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

        </section>

        {/* 3 · Día y hora */}
        <section className={`reservar-col col-cuando ${activa === 3 ? 'is-activa' : ''}`} aria-labelledby="t-cuando">
          <h2 id="t-cuando" className="reservar-sub"><span className="solo-pc">3 · Día y hora</span><span className="solo-cel">Día</span></h2>
          {esDomingo && (
            <Estado tono="tinta" Icono={ClockIcon} titulo="Domingo cerrado">
              Atendemos de lunes a sábado, 10:30 a 19:30. Puedes dejar tu hora pedida para la semana.
            </Estado>
          )}
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

          <h3 className="reservar-sub solo-cel">Hora</h3>
          {!dia && <p className="muted chico">Primero elige el día.</p>}
          {dia && agenda?.estado === 'cargando' && (
            <Estado tono="blanco" Icono={ClockIcon} titulo="Cargando horas">Buscando las horas libres…</Estado>
          )}
          {diaLleno && (
            <Estado tono="rosa" Icono={CalendarIcon} titulo="Sin horas libres">
              Ese día está lleno{persona && !persona.libre ? ` para ${persona.name}` : ''}.{' '}
              {siguienteDia ? `Prueba el ${fechaLarga(siguienteDia)}` : 'Prueba otro día'} o escríbenos.
            </Estado>
          )}
          {dia && agenda?.estado !== 'cargando' && !diaLleno && (
            <div className="horas" role="group" aria-label="Hora">
              {HORAS.map((h) => {
                const tomadaH = ocupada(h);
                return (
                  <button key={h} className={`hora ${tomadaH ? 'is-ocupada' : ''}`} aria-pressed={hora === h} disabled={tomadaH} onClick={() => setHora(h)}>
                    {h}
                    {tomadaH && <small>ocupada</small>}
                  </button>
                );
              })}
            </div>
          )}
          <p className="muted chico">{agenda?.estado === 'ok' ? 'Las horas tachadas ya están tomadas. ' : ''}Te confirmamos la hora por WhatsApp.</p>

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
        <section className="reservar-col col-ticket solo-cel" aria-labelledby="t-listo">
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
            <a href={whatsappUrl(mensaje)} target="_blank" rel="noopener noreferrer" className="btn btn--ancho" onClick={confirmar}>
              <WhatsAppIcon /> Confirmar por WhatsApp
            </a>
          )}
          {sinWhatsApp && <SinWhatsApp mensaje={mensaje} />}

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

        {/* 4 · Resumen oscuro (computador) */}
        <aside className={`reservar-col col-resumen solo-pc ${activa === 4 ? 'is-activa' : ''}`} aria-label="Resumen">
          <h2><span className="gigante">Todo</span><span className="firma firma--clara">listo</span></h2>
          <dl>
            <div><dt>Servicio</dt><dd>{servicio?.name ?? '—'}</dd></div>
            <div><dt>Con</dt><dd>{quien ?? '—'}</dd></div>
            <div><dt>Día</dt><dd>{dia ? conMayuscula(diaTexto) : '—'}</dd></div>
            <div><dt>Hora</dt><dd>{hora || '—'}</dd></div>
            <div><dt>Valor</dt><dd>{precio}</dd></div>
          </dl>
          <input className="campo" placeholder="Tu nombre (opcional)" aria-label="Tu nombre (opcional)" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="given-name" />
          {falta ? (
            <button className="btn btn--claro btn--ancho" disabled>Falta: {falta.replace('Elige ', '')}</button>
          ) : (
            <a href={whatsappUrl(mensaje)} target="_blank" rel="noopener noreferrer" className="btn btn--claro btn--ancho" onClick={confirmar}>
              <WhatsAppIcon /> Confirmar
            </a>
          )}
          {sinWhatsApp && <SinWhatsApp mensaje={mensaje} />}
        </aside>
      </div>
    </div>
  );
};

/** Si WhatsApp no se abrió: rosa, con el número y el mensaje para copiar. */
const SinWhatsApp = ({ mensaje }) => {
  const [copiado, setCopiado] = useState(false);
  return (
    <Estado tono="rosa" Icono={WhatsAppIcon} titulo="No se pudo abrir WhatsApp">
      Copia el mensaje y escríbenos al {SITE.phoneDisplay}.{' '}
      <button
        type="button"
        className="link-sub"
        onClick={() => {
          navigator.clipboard?.writeText(mensaje).then(() => setCopiado(true)).catch(() => {});
        }}
      >
        {copiado ? 'Copiado' : 'Copiar mensaje'}
      </button>
    </Estado>
  );
};

export default BookingFlow;
