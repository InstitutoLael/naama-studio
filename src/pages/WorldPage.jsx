import React, { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import ServiceRow from '../components/common/ServiceRow';
import { Reveal, SplitText } from '../components/common/Motion';
import { ArrowRight } from '../components/common/Icons';
import { legacyMundoIds, mundos, servicesForMundo } from '../data/categories';
import { servicesData } from '../data/servicesData';
import '../theme/services.css';
import '../theme/world.css';

const WorldPage = () => {
  const { mundoId } = useParams();
  const reduce = useReducedMotion();
  const index = mundos.findIndex((m) => m.id === mundoId);
  const mundo = mundos[index];

  const services = useMemo(() => (mundo ? servicesForMundo(servicesData, mundo) : []), [mundo]);
  const specialists = useMemo(
    () => [...new Set(services.flatMap((s) => (s.worker ?? '').split(',').map((w) => w.trim())).filter(Boolean))],
    [services],
  );

  if (!mundo) {
    if (legacyMundoIds[mundoId]) return <Navigate to={`/servicios/${legacyMundoIds[mundoId]}`} replace />;
    return <Navigate to="/servicios" replace />;
  }

  const others = mundos.filter((m) => m.id !== mundo.id);

  return (
    <div className="world">
      <SEOHead title={mundo.name} description={`${mundo.description} Precios y reservas en Naamá Studio, San Miguel.`} image={`/img/${mundo.photo}-960.webp`} />

      <header className="world-hero on-dark">
        <motion.div
          className="world-hero__media"
          initial={reduce ? false : { scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Photo name={mundo.photo} alt="" priority sizes="100vw" />
        </motion.div>
        <div className="world-hero__shade" />
        <div className="container world-hero__content">
          <Reveal as="p" className="eyebrow" delay={0.1} y={12}>
            Mundo 0{index + 1} · {services.length} servicios
          </Reveal>
          <SplitText as="h1" className="world-hero__title" onMount delay={0.2} lines={[mundo.name]} />
          <Reveal as="p" className="lead world-hero__lead" delay={0.45}>
            {mundo.description}
          </Reveal>
          <Reveal className="world-hero__actions" delay={0.6}>
            <Link to={`/reservar?mundo=${mundo.id}`} className="btn btn--gold">
              Reservar <ArrowRight />
            </Link>
          </Reveal>
        </div>
      </header>

      <section className="container world__body">
        <aside className="world__aside">
          <p className="eyebrow">Especialistas</p>
          <ul>
            {specialists.map((name) => (
              <li key={name}>
                <Link to={`/servicios?especialista=${encodeURIComponent(name)}`}>{name}</Link>
              </li>
            ))}
          </ul>
          <Link to="/servicios" className="link-arrow">
            Todos los servicios <ArrowRight />
          </Link>
        </aside>
        <ul className="srows">
          {services.map((s, i) => (
            <ServiceRow key={`${s.name}-${i}`} service={s} />
          ))}
        </ul>
      </section>

      <section className="world__others on-ivory section" aria-labelledby="otros">
        <div className="container">
          <p className="eyebrow" id="otros">Otros mundos</p>
          <div className="world__others-grid">
            {others.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.06} y={40}>
                <Link to={`/servicios/${m.id}`} className="world-card">
                  <Photo name={m.photo} alt="" sizes="(min-width: 900px) 19vw, 45vw" />
                  <span className="world-card__name">{m.name}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WorldPage;
