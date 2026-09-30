import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEOHead from '../components/shared/SEOHead';
import ServiceRow from '../components/common/ServiceRow';
import { Reveal, SplitText } from '../components/common/Motion';
import { ArrowRight, CloseIcon, SearchIcon } from '../components/common/Icons';
import { mundos, servicesForMundo } from '../data/categories';
import { servicesData } from '../data/servicesData';
import { team } from '../data/team';
import '../theme/services.css';

// Minúsculas y sin tildes, para que "unas" encuentre "uñas" y "depilacion" encuentre "depilación".
const normalize = (s = '') =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ñ/g, 'n');

const matches = (service, words) => {
  const haystack = normalize([service.name, service.desc, service.why, service.worker, service.cat].join(' '));
  return words.every((w) => haystack.includes(w));
};

const ServicesPage = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const mundoFilter = params.get('mundo') ?? 'todos';
  const person = params.get('especialista') ?? '';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const groups = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return mundos
      .filter((m) => mundoFilter === 'todos' || m.id === mundoFilter)
      .map((m) => ({
        mundo: m,
        items: servicesForMundo(servicesData, m).filter(
          (s) => matches(s, words) && (!person || (s.worker ?? '').includes(person)),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [query, mundoFilter, person]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  const reset = () => {
    setQuery('');
    setParams({}, { replace: true, preventScrollReset: true });
  };

  return (
    <div className="services-page">
      <SEOHead
        title="Servicios & Precios"
        description={`Los ${servicesData.length} servicios de Naamá Studio con precios y duración: cabello, color, uñas, cejas, pestañas, depilación, faciales, masajes y podología en San Miguel.`}
      />

      <header className="page-hero container">
        <p className="eyebrow">Servicios & precios</p>
        <SplitText
          as="h1"
          className="page-hero__title"
          onMount
          delay={0.15}
          lines={['Todo lo que hacemos,', <em key="p">con precios claros.</em>]}
        />
        <Reveal as="p" className="lead page-hero__lead" delay={0.4}>
          Busca por nombre, filtra por mundo o por especialista. Toca un servicio para ver en qué
          consiste y reservarlo.
        </Reveal>
      </header>

      <div className="catalog-bar">
        <div className="container catalog-bar__inner">
          <label className="catalog-search">
            <SearchIcon />
            <span className="visually-hidden">Buscar servicio</span>
            <input
              type="search"
              placeholder="Buscar: balayage, uñas, cejas…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Borrar búsqueda">
                <CloseIcon />
              </button>
            )}
          </label>

          <div className="catalog-filters" role="group" aria-label="Filtrar por mundo">
            <button className="chip" aria-pressed={mundoFilter === 'todos'} onClick={() => setParam('mundo', '')}>
              Todos
            </button>
            {mundos.map((m) => (
              <button
                key={m.id}
                className="chip"
                aria-pressed={mundoFilter === m.id}
                onClick={() => setParam('mundo', mundoFilter === m.id ? '' : m.id)}
              >
                {m.short}
              </button>
            ))}
          </div>

          <div className="catalog-people">
            <label htmlFor="especialista" className="visually-hidden">Especialista</label>
            <select
              id="especialista"
              className="catalog-select"
              value={person}
              onChange={(e) => setParam('especialista', e.target.value)}
            >
              <option value="">Todas las especialistas</option>
              {team.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} · {t.role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container catalog">
        <p className="catalog__count" aria-live="polite">
          {total} {total === 1 ? 'servicio' : 'servicios'}
          {(query || person || mundoFilter !== 'todos') && (
            <button className="catalog__reset" onClick={reset}>
              Limpiar filtros
            </button>
          )}
        </p>

        {groups.length === 0 && (
          <div className="catalog__empty">
            <p className="h3">No encontramos “{query}”.</p>
            <p className="muted">Prueba con otra palabra, o escríbenos y te orientamos.</p>
            <button className="btn btn--ghost" onClick={reset}>Ver todos los servicios</button>
          </div>
        )}

        {groups.map(({ mundo, items }) => (
          <section key={mundo.id} className="catalog__group" aria-labelledby={`g-${mundo.id}`}>
            <div className="catalog__group-head">
              <h2 id={`g-${mundo.id}`} className="h3">{mundo.name}</h2>
              <Link to={`/servicios/${mundo.id}`} className="link-arrow">
                Ver mundo <ArrowRight />
              </Link>
            </div>
            <ul className="srows">
              {items.map((s, i) => (
                <ServiceRow key={`${s.name}-${i}`} service={s} />
              ))}
            </ul>
          </section>
        ))}

        <p className="catalog__note">
          Los servicios marcados “Desde” pueden variar según el largo del cabello o la complejidad
          del diseño. Si tienes dudas, escríbenos por WhatsApp.
        </p>
      </div>
    </div>
  );
};

export default ServicesPage;
