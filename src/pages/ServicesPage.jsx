import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import GrupoCarta from '../components/common/Carta';
import { agrupar, enSecciones } from '../data/menuPrecios';
import { ArrowRight, CloseIcon, SearchIcon } from '../components/common/Icons';
import { mundos, servicesForMundo, totalServicios } from '../data/categories';
import { servicesData } from '../data/servicesData';
import { usePreciosVivos } from '../data/preciosVivos';
import '../theme/services.css';

const normalize = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ñ/g, 'n');
const matches = (service, words) => {
  const haystack = normalize([service.name, service.desc, service.worker, service.cat].join(' '));
  return words.every((w) => haystack.includes(w));
};

/** Al tocar un servicio: a su mundo con el servicio ya elegido. */
const linkDe = (mundo) => (it) => `/servicios/${mundo.id}?servicio=${encodeURIComponent(it.original ?? it.nombre)}`;

/** P02 · Servicios y precios. */
const ServicesPage = () => {
  const versionPrecios = usePreciosVivos();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const mundoFilter = params.get('mundo') ?? 'todos';

  const elegirMundo = (id) => {
    const next = new URLSearchParams(params);
    if (id && id !== mundoFilter) next.set('mundo', id);
    else next.delete('mundo');
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const grupos = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return mundos
      .filter((m) => mundoFilter === 'todos' || m.id === mundoFilter)
      .map((m) => {
        const items = agrupar(servicesForMundo(servicesData, m).filter((s) => matches(s, words)));
        return { mundo: m, secciones: enSecciones(m.id, items) };
      })
      .filter((g) => g.secciones.length > 0);
  }, [query, mundoFilter, versionPrecios]);

  return (
    <div className="precios-pagina">
      <SEOHead
        title="Servicios & Precios"
        description={`Los ${totalServicios} servicios de Naamá Studio con precios y duración: cabello, color, uñas, cejas, pestañas, depilación, faciales, masajes y podología en San Miguel.`}
      />

      <header className="precios-hero">
        <Photo name="casa-sala" alt="" priority sizes="100vw" />
        <div className="precios-hero__velo" />
        <div className="precios-hero__texto container">
          <h1 className="gigante">Precios</h1>
          <p className="firma firma--clara">claros</p>
        </div>
        <div className="precios-hero__pie container">
          <span>{totalServicios} servicios</span>
          <span>Toca uno para reservarlo</span>
        </div>
      </header>

      <div className="container precios-filtros">
        <div className="mundos-circulos" role="group" aria-label="Elegir mundo">
          {mundos.map((m) => (
            <button key={m.id} className="mundo-circulo" aria-pressed={mundoFilter === m.id} onClick={() => elegirMundo(m.id)}>
              <Photo name={m.photo} alt="" sizes="80px" />
              <span>{m.short}</span>
            </button>
          ))}
        </div>
        <label className="buscador-linea">
          <SearchIcon />
          <span className="visually-hidden">Buscar servicio</span>
          <input type="search" placeholder="Busca: balayage, uñas, cejas…" value={query} onChange={(e) => setQuery(e.target.value)} />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Borrar búsqueda">
              <CloseIcon />
            </button>
          )}
        </label>
      </div>

      <div className="container precios-lista">
        {grupos.length === 0 && (
          <div className="precios-vacio tarjeta">
            <p className="nota">no encontramos «{query}»</p>
            <p className="muted">Prueba con otra palabra o escríbenos por WhatsApp.</p>
            <button
              className="btn btn--linea"
              onClick={() => {
                setQuery('');
                elegirMundo('');
              }}
            >
              Ver todos
            </button>
          </div>
        )}

        {grupos.map(({ mundo, secciones }) => (
          <div key={mundo.id} className="precios-mundo">
            {mundoFilter === 'todos' && (
              <div className="precios-mundo__cabeza">
                <h2 className="titulo">
                  {mundo.name.split(' ')[0]} <b>{mundo.name.split(' ').slice(1).join(' ')}</b>
                </h2>
                <Link to={`/servicios/${mundo.id}`} className="link-linea">
                  Ver el mundo <ArrowRight />
                </Link>
              </div>
            )}
            <div className="precios-grupos">
              {secciones.map((sec) => (
                <GrupoCarta key={sec.titulo} titulo={sec.titulo} items={sec.items} mundo={mundo} linkDe={linkDe(mundo)} />
              ))}
            </div>
          </div>
        ))}

        <div className="precios-cierre">
          <p>Arcadia 1297, San Miguel · Atendemos sin reserva también</p>
          <Link to="/reservar" className="btn">Reservar un servicio <ArrowRight /></Link>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
