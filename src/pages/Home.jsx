import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import { Parallax, Reveal, ScrollWords, SplitText } from '../components/common/Motion';
import { ArrowRight } from '../components/common/Icons';
import { introDelay } from '../components/site/Preloader';
import { mundos, servicesForMundo } from '../data/categories';
import { servicesData } from '../data/servicesData';
import { FAQ } from '../data/faq';
import { testimonials } from '../data/testimonials';
import { HOURS, SITE, whatsappUrl } from '../data/site';
import '../theme/home.css';

const EASE = [0.16, 1, 0.3, 1];

const WORK = [
  { photo: 'unas-violeta', label: 'Uñas', title: 'Violeta galaxia & cristal rojo' },
  { photo: 'unas-violeta-corazon', label: 'Uñas', title: 'Violeta con relieve' },
  { photo: 'unas-serpiente', label: 'Uñas', title: 'Rosa holográfico & serpiente' },
  { photo: 'cabello-balayage', label: 'Color', title: 'Balayage miel' },
  { photo: 'unas-burdeo-oro', label: 'Uñas', title: 'Burdeo & pan de oro' },
  { photo: 'cabello-castano', label: 'Cabello', title: 'Castaño espejo' },
  { photo: 'unas-chocolate', label: 'Uñas', title: 'Chocolate & flores doradas' },
  { photo: 'cabello-ondas', label: 'Color', title: 'Iluminación con ondas' },
];

/* ── 01. Portada ── */
const Hero = () => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [delay] = useState(introDelay);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="hero on-dark" aria-label="Portada">
      <motion.div className="hero__media" style={{ y: reduce ? 0 : y }}>
        <motion.div
          className="hero__zoom"
          initial={reduce ? false : { scale: 1.18 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: EASE, delay: delay - 0.2 }}
        >
          <Photo
            name="salon-recepcion"
            alt="Recepción de Naamá Studio con el logo iluminado"
            priority
            sizes="100vw"
            position="50% 60%"
          />
        </motion.div>
      </motion.div>
      <div className="hero__shade" />

      <motion.div className="hero__content container" style={{ opacity: reduce ? 1 : fade }}>
        <Reveal as="p" className="eyebrow" delay={delay} y={16}>
          Salón de belleza y bienestar · San Miguel
        </Reveal>
        <SplitText
          as="h1"
          className="hero__title"
          onMount
          delay={delay + 0.1}
          lines={['Tu pausa', <em key="a">te espera.</em>]}
        />
        <div className="hero__foot">
          <Reveal as="p" className="lead hero__lead" delay={delay + 0.5} y={20}>
            Un salón de belleza y bienestar en una casa patrimonial de San Miguel. Cabello, color, uñas, rostro y masajes, hechos con calma y detalle.
          </Reveal>
          <Reveal className="hero__actions" delay={delay + 0.65} y={20}>
            <Link to="/reservar" className="btn btn--caramel">
              Reservar mi hora <ArrowRight />
            </Link>
            <Link to="/servicios" className="btn btn--ghost-light">
              Ver servicios
            </Link>
          </Reveal>
        </div>
      </motion.div>

      <div className="hero__scroll" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  );
};

/* ── 02. Esencia ── */
const Essence = () => (
  <section className="essence section" aria-labelledby="esencia-title">
    <div className="container essence__grid">
      <div className="essence__text">
        <p className="eyebrow" id="esencia-title">Nuestra esencia</p>
        <ScrollWords
          className="essence__statement"
          text="No vendemos servicios, custodiamos pausas. En una casa patrimonial de San Miguel, la belleza se hace sin apuro: con técnica, calma y un trato que te recibe por tu nombre."
        />
        <Reveal className="essence__stats">
          <div>
            <strong>1</strong>
            <span>Casa patrimonial</span>
          </div>
          <div>
            <strong>{servicesData.length}</strong>
            <span>Servicios</span>
          </div>
          <div>
            <strong>6</strong>
            <span>Mundos de cuidado</span>
          </div>
        </Reveal>
      </div>
      <Reveal className="essence__media" y={60}>
        <Parallax className="essence__photo parallax" amount={10}>
          <Photo name="casa-sala" alt="Sala de espera de Naamá Studio con piso de madera y puertas antiguas" sizes="(min-width: 900px) 40vw, 90vw" />
        </Parallax>
        <p className="essence__caption">La sala de espera, con luz de tarde.</p>
      </Reveal>
    </div>
  </section>
);

/* ── 03. Índice de servicios con imagen que sigue al cursor ── */
const ServicesIndex = () => {
  const [active, setActive] = useState(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 160, damping: 22, mass: 0.6 });

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  return (
    <section className="sindex section on-ivory" aria-labelledby="servicios-title">
      <div className="container">
        <div className="section-head section-head--split">
          <div>
            <p className="eyebrow">Servicios</p>
            <SplitText
              as="h2"
              className="h2"
              lines={['Seis formas', <em key="c">de cuidarte.</em>]}
            />
          </div>
          <Reveal>
            <p className="lead">
              Del color a la podología clínica: todo lo que necesitas en un solo lugar, con precios
              transparentes.
            </p>
            <Link to="/servicios" className="link-arrow sindex__all">
              Ver todos los precios <ArrowRight />
            </Link>
          </Reveal>
        </div>

        <div className="sindex__wrap" onMouseMove={onMove} onMouseLeave={() => setActive(null)}>
        <ul className="sindex__list">
          {mundos.map((m, i) => (
            <Reveal as="li" key={m.id} delay={i * 0.05} y={24}>
              <Link
                to={`/servicios/${m.id}`}
                className="sindex__row"
                onMouseEnter={() => setActive(m.id)}
                onFocus={() => setActive(m.id)}
              >
                <span className="sindex__num">0{i + 1}</span>
                <Photo name={m.photo} alt="" className="sindex__thumb" sizes="96px" />
                <span className="sindex__name">{m.name}</span>
                <span className="sindex__desc">{m.description}</span>
                <span className="sindex__count">{servicesForMundo(servicesData, m).length} servicios</span>
                <ArrowRight className="sindex__arrow" />
              </Link>
            </Reveal>
          ))}
        </ul>

          <motion.div className="sindex__preview" style={{ x: sx, y: sy }} aria-hidden="true">
            <AnimatePresence>
              {active && (
                <motion.div
                  key={active}
                  className="sindex__preview-inner"
                  initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <Photo name={mundos.find((m) => m.id === active).photo} alt="" sizes="320px" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ── 04. La casa ── */
const House = () => (
  <section className="house section" aria-labelledby="casa-title">
    <div className="container house__grid">
      <Reveal className="house__main" y={60}>
        <Parallax className="house__photo parallax" amount={8}>
          <Photo name="salon-estaciones" alt="Estaciones de peluquería con techo de madera" sizes="(min-width: 900px) 55vw, 100vw" />
        </Parallax>
      </Reveal>
      <div className="house__text">
        <p className="eyebrow">La casa</p>
        <SplitText
          as="h2"
          id="casa-title"
          className="h2"
          lines={['Techos de madera,', 'puertas antiguas', <em key="l">y luz natural.</em>]}
        />
        <Reveal as="p" className="lead">
          Cada rincón de Naamá está pensado para bajar el ritmo: estaciones amplias, un patio con
          plantas y una recepción que te espera con aroma y buena música.
        </Reveal>
        <Reveal className="house__small" y={60}>
          <Photo name="salon-tocador" alt="Tocador de maquillaje junto a la puerta patrimonial" sizes="(min-width: 900px) 22vw, 60vw" />
        </Reveal>
      </div>
    </div>
  </section>
);

/* ── 05. Cinta de palabras ── */
const Marquee = () => {
  const words = ['Cabello', 'Color', 'Uñas', 'Cejas', 'Pestañas', 'Faciales', 'Masajes', 'Podología'];
  const row = (
    <span className="marquee__row">
      {words.map((w) => (
        <React.Fragment key={w}>
          <span>{w}</span>
          <span className="marquee__mark">✦</span>
        </React.Fragment>
      ))}
    </span>
  );
  return (
    <div className="marquee on-dark" aria-hidden="true">
      <div className="marquee__track">
        {row}
        {row}
      </div>
    </div>
  );
};

/* ── 06. Trabajos: carrusel horizontal nativo ── */
const Work = () => {
  const track = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };
  const move = (dir) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.7, behavior: 'smooth' });

  return (
    <section className="work section" aria-labelledby="trabajo-title">
      <div className="container work__head">
        <div>
          <p className="eyebrow">Nuestro trabajo</p>
          <SplitText as="h2" id="trabajo-title" className="h2" lines={['Hecho a mano,', <em key="w">detalle a detalle.</em>]} />
        </div>
        <div className="work__controls">
          <button className="work__arrow work__arrow--prev" onClick={() => move(-1)} disabled={edge.start} aria-label="Anteriores">
            <ArrowRight />
          </button>
          <button className="work__arrow" onClick={() => move(1)} disabled={edge.end} aria-label="Siguientes">
            <ArrowRight />
          </button>
        </div>
      </div>
      <div ref={track} className="work__track" onScroll={update}>
        {WORK.map((w, i) => (
          <Reveal as="figure" className="work__item" key={w.photo} delay={Math.min(i, 4) * 0.08} y={50}>
            <Photo name={w.photo} alt={`${w.title} — trabajo de Naamá Studio`} sizes="(min-width: 900px) 28vw, 72vw" />
            <figcaption>
              <span>{w.label}</span>
              {w.title}
            </figcaption>
          </Reveal>
        ))}
        <Link to="/galeria" className="work__more">
          <span>Ver toda la galería</span>
          <ArrowRight />
        </Link>
      </div>
    </section>
  );
};

/* ── 07. Eventos a domicilio ── */
const Events = () => (
  <section className="events section on-dark" aria-labelledby="eventos-title">
    <div className="container events__grid">
      <div className="events__text">
        <p className="eyebrow">Matrimonios & eventos</p>
        <SplitText as="h2" id="eventos-title" className="h2" lines={['Vamos', <em key="e">a donde estés.</em>]} />
        <Reveal as="p" className="lead">
          Peinado y maquillaje para novias, madrinas y toda la familia, en tu casa o en el lugar del
          evento. Con la misma calma y detalle que en Naamá.
        </Reveal>
        <Reveal className="events__actions">
          <a
            href={whatsappUrl('Hola Naamá! Quiero cotizar peinado y maquillaje para un evento.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--caramel"
          >
            Cotizar mi evento <ArrowRight />
          </a>
        </Reveal>
      </div>
      <div className="events__photos">
        <Reveal className="events__main" y={60}>
          <Parallax className="events__photo parallax" amount={8}>
            <Photo name="evento-ondas" alt="Peinado en ondas hecho por Naamá Studio para un matrimonio" sizes="(min-width: 900px) 34vw, 70vw" position="50% 30%" />
          </Parallax>
        </Reveal>
        <Reveal className="events__second" y={90}>
          <Photo name="evento-familia" alt="Familia preparada por Naamá Studio para un matrimonio" sizes="(min-width: 900px) 22vw, 46vw" position="50% 55%" />
        </Reveal>
      </div>
    </div>
  </section>
);

/* ── 08. Visítanos ── */
const Visit = () => (
  <section className="visit" aria-labelledby="visita-title">
    <div className="visit__media">
      <Photo name="casa-fachada" alt="Fachada terracota de Naamá Studio en Arcadia 1297, San Miguel" sizes="100vw" position="62% 55%" />
    </div>
    <div className="visit__shade" />
    <div className="container visit__content on-dark">
      <p className="eyebrow">Visítanos</p>
      <SplitText as="h2" id="visita-title" className="h2" lines={['La casa', <em key="v">de la fachada terracota.</em>]} />
      <Reveal className="visit__info">
        <div>
          <span className="visit__label">Dirección</span>
          <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer">{SITE.address}, Santiago</a>
        </div>
        <div>
          <span className="visit__label">Horario</span>
          {HOURS.map((h) => (
            <span key={h.label}>{h.label}: {h.value}</span>
          ))}
        </div>
        <div>
          <span className="visit__label">Agenda</span>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">WhatsApp {SITE.phoneDisplay}</a>
        </div>
      </Reveal>
      <Reveal className="visit__actions">
        <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn--caramel">
          Cómo llegar <ArrowRight />
        </a>
        <Link to="/equipo" className="btn btn--ghost-light">Conoce al equipo</Link>
      </Reveal>
    </div>
  </section>
);

/* ── 09. Testimonios ── */
const Testimonials = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % testimonials.length), 7000);
    return () => clearInterval(t);
  }, [i]);
  const t = testimonials[i];

  return (
    <section className="quotes section" aria-labelledby="quotes-title">
      <div className="container quotes__inner">
        <p className="eyebrow" id="quotes-title">Mensajes de nuestras clientas</p>
        <div className="quotes__stage" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <blockquote className="quotes__text">“{t.quote}”</blockquote>
              <figcaption className="quotes__who">
                <strong>{t.name}</strong> · {t.service}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        <div className="quotes__controls">
          {testimonials.map((q, n) => (
            <button
              key={q.name}
              className={`quotes__dot ${n === i ? 'is-active' : ''}`}
              onClick={() => setI(n)}
              aria-label={`Ver comentario de ${q.name}`}
              aria-current={n === i}
            />
          ))}
        </div>
        <a href={SITE.reviewsUrl} target="_blank" rel="noopener noreferrer" className="link-arrow">
          Ver reseñas en Google <ArrowRight />
        </a>
      </div>
    </section>
  );
};

/* ── 10. Preguntas frecuentes ── */
const Faq = () => (
  <section className="faq section on-ivory" aria-labelledby="faq-title">
    <div className="container faq__grid">
      <div>
        <p className="eyebrow">Preguntas frecuentes</p>
        <SplitText as="h2" id="faq-title" className="h2" lines={['Antes de', <em key="f">tu visita.</em>]} />
      </div>
      <div className="faq__list">
        {FAQ.map((f) => (
          <details key={f.q} className="faq__item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

/* ── 11. Regalos y empresas ── */
const Extras = () => (
  <section className="extras section on-ivory" aria-label="Gift cards y empresas">
    <div className="container extras__grid">
      {[
        {
          to: '/gift-cards',
          photo: 'unas-glitter',
          eyebrow: 'Gift Cards',
          title: <>Regala una <em>pausa.</em></>,
          text: 'Diseña una gift card digital con el monto y mensaje que quieras.',
          cta: 'Crear gift card',
        },
        {
          to: '/empresas',
          photo: 'equipo-celebracion',
          eyebrow: 'Empresas',
          title: <>Bienestar para <em>tu equipo.</em></>,
          text: 'Jornadas de cuidado en el salón o en tu oficina, y gift cards corporativas.',
          cta: 'Ver propuesta',
        },
      ].map((c, i) => (
        <Reveal key={c.to} delay={i * 0.1} y={60}>
          <Link to={c.to} className="extra-card">
            <Photo name={c.photo} alt="" className="extra-card__photo" sizes="(min-width: 900px) 45vw, 92vw" />
            <div className="extra-card__body">
              <p className="eyebrow">{c.eyebrow}</p>
              <h3 className="h3">{c.title}</h3>
              <p className="muted">{c.text}</p>
              <span className="link-arrow">
                {c.cta} <ArrowRight />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  </section>
);

const Home = () => (
  <div className="home">
    <SEOHead faq={FAQ} />
    <Hero />
    <Essence />
    <ServicesIndex />
    <House />
    <Marquee />
    <Work />
    <Events />
    <Visit />
    <Testimonials />
    <Faq />
    <Extras />
  </div>
);

export default Home;
