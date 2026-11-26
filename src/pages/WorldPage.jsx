import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import { agrupar, aNumero, enSecciones } from '../data/menuPrecios';
import { bajadaFila, precioFila } from '../components/common/Carta';
import { ArrowLeft, ArrowRight, CheckIcon, PlusIcon, WhatsAppIcon } from '../components/common/Icons';
import { legacyMundoIds, mundos, servicesForMundo } from '../data/categories';
import { servicesData } from '../data/servicesData';
import { team } from '../data/team';
import { whatsappUrl } from '../data/site';
import { usePreciosVivos } from '../data/preciosVivos';
import '../theme/services.css';
import '../theme/world.css';

const miles = (n) => `$${n.toLocaleString('es-CL')}`;
const hace = (s, nombre) => (s.worker ?? '').split(',').map((w) => w.trim()).includes(nombre);
const LARGO_CORTO = { 'Extra largo': 'XL' };

/** P03 · Cada servicio (un mundo). */
const WorldPage = () => {
  const version = usePreciosVivos();
  const { mundoId } = useParams();
  const [params] = useSearchParams();
  const index = mundos.findIndex((m) => m.id === mundoId);
  const mundo = mundos[index];

  const services = useMemo(() => (mundo ? servicesForMundo(servicesData, mundo) : []), [mundo, version]);
  const equipo = useMemo(() => team.filter((t) => services.some((s) => hace(s, t.name))), [services]);

  const [con, setCon] = useState(params.get('con') ?? '');
  const items = useMemo(() => agrupar(services.filter((s) => !con || hace(s, con))), [services, con]);
  const secciones = useMemo(() => (mundo ? enSecciones(mundo.id, items) : []), [mundo, items]);
  const [tab, setTab] = useState(null);
  const [elegido, setElegido] = useState(null); // { item, largo }

  // Viene desde la carta con ?servicio=
  useEffect(() => {
    const pedido = params.get('servicio');
    if (!pedido) return;
    for (const sec of secciones) {
      const it = sec.items.find((x) => (x.original ?? x.nombre) === pedido || x.nombre === pedido || x.variantes?.some((v) => v.nombre === pedido));
      if (it) {
        setTab(sec.titulo);
        const v = it.variantes?.find((x) => x.nombre === pedido);
        setElegido({ item: it, largo: v?.largo ?? it.variantes?.[0]?.largo ?? null });
        return;
      }
    }
  }, [params, secciones]);

  if (!mundo) {
    if (legacyMundoIds[mundoId]) return <Navigate to={`/servicios/${legacyMundoIds[mundoId]}`} replace />;
    return <Navigate to="/servicios" replace />;
  }

  const seccion = secciones.find((s) => s.titulo === tab) ?? secciones[0];
  const persona = team.find((t) => t.name === con);
  const variante = elegido?.item.variantes?.find((v) => v.largo === elegido.largo);
  const precio = variante ? miles(aNumero(variante.price)) : elegido ? precioFila(elegido.item) : null;
  const nombreReserva = variante?.nombre ?? elegido?.item.original ?? elegido?.item.nombre;
  const reservar = elegido
    ? `/reservar?servicio=${encodeURIComponent(nombreReserva)}${con ? `&con=${encodeURIComponent(con)}` : ''}`
    : null;

  const elegir = (it) => {
    if ((elegido?.item.original ?? elegido?.item.nombre) === (it.original ?? it.nombre)) setElegido(null);
    else setElegido({ item: it, largo: it.variantes?.length ? (it.variantes[1] ?? it.variantes[0]).largo : null });
  };

  const quien = (
      <div className="mundo-quien">
        <h2 className="mundo-sub">Elige con quién</h2>
        <div className="quien-circulos" role="group" aria-label="Especialista">
          <button className="quien" aria-pressed={!con} onClick={() => setCon('')}>
            <span className="quien__libre">Libre</span>
            <span>Sin pref.</span>
          </button>
          {equipo.map((t) => (
            <button key={t.name} className="quien" aria-pressed={con === t.name} onClick={() => setCon(t.name)}>
              <Photo name={t.photo} alt="" sizes="64px" position="center 25%" />
              <span>{t.name}</span>
            </button>
          ))}
        </div>
        {persona && (
          <div className="quien-tarjeta tarjeta">
            <Photo name={persona.photo} alt="" sizes="64px" position="center 25%" />
            <div>
              <strong>{persona.name}</strong>
              <small>
                {persona.role} · {services.filter((s) => hace(s, persona.name)).length} servicios
              </small>
            </div>
            <span className="quien-tarjeta__tag">Elegida</span>
          </div>
        )}
      </div>
  );

  const largo = elegido?.item.variantes?.length > 1 && (
        <div className="largo-selector tarjeta">
          <p className="largos__titulo">{elegido.item.nombre} · elige tu largo</p>
          <div className="largo-selector__fila">
            {elegido.item.variantes.map((v) => (
              <button
                key={v.largo}
                className="largo-op"
                aria-pressed={elegido.largo === v.largo}
                onClick={() => setElegido({ ...elegido, largo: v.largo })}
              >
                <span>{LARGO_CORTO[v.largo] ?? v.largo}</span>
                <strong>{aNumero(v.price) ? miles(aNumero(v.price)) : 'Consultar'}</strong>
              </button>
            ))}
          </div>
        </div>
  );

  const barra = (
      <div className="barra-fija mundo-barra">
        <div className="barra-fija__dato">
          <small>
            {elegido
              ? [elegido.item.nombre, elegido.largo?.toLowerCase(), con || 'sin preferencia'].filter(Boolean).join(' · ')
              : 'Elige un servicio de la lista'}
          </small>
          <strong>{precio ?? '—'}</strong>
        </div>
        {reservar ? (
          <Link to={reservar} className="btn btn--claro btn--sm">Elegir día <ArrowRight /></Link>
        ) : (
          <span className="btn btn--sm" aria-disabled="true">Elegir día</span>
        )}
      </div>
  );

  return (
    <div className="mundo pagina">
      <SEOHead title={mundo.name} description={`${mundo.description} Precios y reservas en Naamá Studio, San Miguel.`} image={`/img/${mundo.photo}-960.webp`} />

      <div className="container mundo-top">
        <Link to="/servicios" className="circulo-btn" aria-label="Volver a servicios"><ArrowLeft /></Link>
        <p>{mundo.name}</p>
        <a href={whatsappUrl(`Hola! Tengo una consulta sobre ${mundo.name}.`)} target="_blank" rel="noopener noreferrer" className="circulo-btn" aria-label="Preguntar por WhatsApp">
          <WhatsAppIcon />
        </a>
      </div>

      <div className="container mundo-grid">
        <div className="mundo-col">
          <div className="mundo-ficha tarjeta">
            <Photo name={mundo.photo} alt="" sizes="96px" />
            <div>
              <p className="eyebrow eyebrow--terracota">Mundo 0{index + 1}</p>
              <h1>{mundo.name}</h1>
              <p className="muted">
                {services.length} servicios · {equipo.length} {equipo.length === 1 ? 'especialista' : 'especialistas'}
              </p>
            </div>
          </div>
          <p className="mundo-bajada muted">{mundo.description}</p>

          <div className="solo-celular">{quien}</div>

          <h2 className="mundo-sub">Servicios</h2>
          <div className="chips" role="tablist" aria-label="Grupos">
            {secciones.map((s) => (
              <button
                key={s.titulo}
                role="tab"
                className="chip chip--pestana"
                aria-selected={seccion?.titulo === s.titulo}
                aria-pressed={seccion?.titulo === s.titulo}
                onClick={() => setTab(s.titulo)}
              >
                {s.titulo}
              </button>
            ))}
          </div>

          {!secciones.length && <p className="muted">{con} no hace servicios de este mundo. Elige «Libre» u otra especialista.</p>}

          <ul className="mundo-filas">
            {seccion?.items.map((it, i) => {
              const on = (elegido?.item.original ?? elegido?.item.nombre) === (it.original ?? it.nombre);
              return (
                <li key={`${it.nombre}-${i}`}>
                  <button className="fila fila--boton" aria-pressed={on} onClick={() => elegir(it)}>
                    <span className="fila__nombre">
                      {it.nombre}
                      {bajadaFila(it) && <small>{bajadaFila(it)}</small>}
                    </span>
                    <span className="fila__precio">{precioFila(it)}</span>
                    <span className={`fila__mas ${on ? 'is-on' : ''}`} aria-hidden="true">{on ? <CheckIcon /> : <PlusIcon />}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="solo-celular mundo-panel-cel">
            {largo}
            {barra}
          </div>
        </div>

        <aside className="mundo-panel tarjeta solo-computador">{quien}{largo}{barra}</aside>
      </div>
    </div>
  );
};

export default WorldPage;
