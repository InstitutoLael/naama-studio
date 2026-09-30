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
import { team } from '../data/team';
import { testimonials } from '../data/testimonials';
import { SITE } from '../data/site';
import '../theme/home.css';

const EASE = [0.16, 1, 0.3, 1];
const NEW_MEMBERS = ['Leah', 'Catalina'];

const WORK = [
  { photo: 'unas-burdeo-oro', label: 'Uñas', title: 'Burdeo & pan de oro' },
  { photo: 'cabello-balayage', label: 'Color', title: 'Balayage miel' },
  { photo: 'unas-chocolate', label: 'Uñas', title: 'Chocolate & flores doradas' },
  { photo: 'cabello-castano', label: 'Cabello', title: 'Castaño espejo' },
  { photo: 'unas-cat-eye', label: 'Uñas', title: 'Cat eye rosa' },
  { photo: 'cabello-ondas', label: 'Color', title: 'Iluminación con ondas' },
  { photo: 'unas-glitter', label: 'Uñas', title: 'Nude glitter' },
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
          Beauty & Wellness House · San Miguel
        </Reveal>
        <SplitText
          as="h1"
          className="hero__title"
          onMount
          delay={delay + 0.1}
          lines={['Tu momento', 'de volver', <em key="a">a ti.</em>]}
        />
        <div className="hero__foot">
          <Reveal as="p" className="lead hero__lead" delay={delay + 0.5} y={20}>
            Belleza y bienestar en una casa patrimonial, hechos con calma, técnica y cariño.
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
          text="Somos una casa antigua de San Miguel convertida en refugio. Aquí la belleza se hace sin apuro: con técnica, silencio y un equipo que te recibe por tu nombre."
        />
        <Reveal className="essence__stats">
          <div>
            <strong>{team.length}</strong>
            <span>Especialistas</span>
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
          <Photo name="salon-rincon" alt="Rincón de espera con el letrero de Naamá Studio" sizes="(min-width: 900px) 40vw, 90vw" />
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

/* ── 07. Equipo ── */
const Team = () => (
  <section className="team-home section on-dark" aria-labelledby="equipo-title">
    <div className="container">
      <div className="section-head section-head--split">
        <div>
          <p className="eyebrow">El equipo</p>
          <SplitText
            as="h2"
            id="equipo-title"
            className="h2"
            lines={[`${team.length} especialistas,`, <em key="t">una misma forma de cuidar.</em>]}
          />
        </div>
        <Reveal as="p" className="lead">
          Colorimetría, uñas, faciales, maquillaje y podología clínica. Cada una experta en lo suyo,
          todas con la misma obsesión por el detalle.
        </Reveal>
      </div>

      <Reveal y={80}>
        <Parallax className="team-home__photo parallax" amount={8}>
          <Photo name="equipo" alt="De izquierda a derecha: Gaby, Viviana, Leah, Catalina y Valeria, en el patio de la casa" sizes="(min-width: 1440px) 1312px, 92vw" position="50% 45%" />
        </Parallax>
      </Reveal>

      <ul className="team-home__list">
        {team.map((p, i) => (
          <Reveal as="li" key={p.name} delay={i * 0.05} y={20}>
            <span className="team-home__name">
              {p.name}
              {NEW_MEMBERS.includes(p.name) && <small>Nueva</small>}
            </span>
            <span className="team-home__role">{p.role}</span>
          </Reveal>
        ))}
      </ul>

      <Reveal className="team-home__cta">
        <Link to="/equipo" className="btn btn--ghost">
          Conoce al equipo <ArrowRight />
        </Link>
      </Reveal>
    </div>
  </section>
);

/* ── 08. Testimonios ── */
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

/* ── 09. Regalos y empresas ── */
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
    <SEOHead />
    <Hero />
    <Essence />
    <ServicesIndex />
    <House />
    <Marquee />
    <Work />
    <Team />
    <Testimonials />
    <Extras />
  </div>
);

export default Home;
