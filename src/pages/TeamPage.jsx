import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import { Parallax, Reveal, SplitText } from '../components/common/Motion';
import { ArrowRight } from '../components/common/Icons';
import { team } from '../data/team';
import { servicesData } from '../data/servicesData';
import '../theme/team.css';

const NEW_MEMBERS = ['Leah', 'Catalina'];

const countFor = (name) => servicesData.filter((s) => (s.worker ?? '').includes(name)).length;

const TeamPage = () => (
  <div className="team-page">
    <SEOHead
      title="Nuestro Equipo"
      description={`Conoce a las ${team.length} especialistas de Naamá Studio: colorimetría, uñas, faciales, maquillaje y podología clínica en San Miguel.`}
      image="/img/equipo-1600.webp"
    />

    <header className="page-hero container">
      <p className="eyebrow">El equipo</p>
      <SplitText
        as="h1"
        className="page-hero__title"
        onMount
        delay={0.15}
        lines={['Las manos detrás', <em key="t">de tu cambio.</em>]}
      />
      <Reveal as="p" className="lead page-hero__lead" delay={0.4}>
        {team.length} especialistas, cada una experta en lo suyo. Elige con quién quieres atenderte o
        déjate recomendar.
      </Reveal>
    </header>

    <div className="container">
      <Reveal y={80}>
        <Parallax className="team-page__photo parallax" amount={8}>
          <Photo name="equipo" alt="De izquierda a derecha: Gaby, Viviana, Leah, Catalina y Valeria, en el patio de la casa" priority sizes="(min-width: 1440px) 1312px, 92vw" position="50% 45%" />
        </Parallax>
      </Reveal>
    </div>

    <section className="container section team-grid" aria-label="Especialistas">
      {team.map((p, i) => (
        <Reveal key={p.name} delay={(i % 3) * 0.08} y={50}>
          <article className="member">
            {p.photo ? (
              <Photo name={p.photo} alt={`${p.name}, ${p.role}`} className="member__photo" sizes="(min-width: 1100px) 30vw, (min-width: 700px) 45vw, 92vw" position="50% 20%" />
            ) : (
              <div className="member__monogram" style={{ '--tone': p.tone }} aria-hidden="true">
                <span>{p.name[0]}</span>
              </div>
            )}
            <div className="member__body">
              <div className="member__top">
                <h2 className="member__name">{p.name}</h2>
                {NEW_MEMBERS.includes(p.name) && <span className="member__badge">Nueva en el equipo</span>}
              </div>
              <p className="member__role">{p.role}</p>
              <ul className="member__tags">
                {p.specialties.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <Link to={`/servicios?especialista=${encodeURIComponent(p.name)}`} className="link-arrow">
                {countFor(p.name)} servicios <ArrowRight />
              </Link>
            </div>
          </article>
        </Reveal>
      ))}
    </section>

    <section className="team-life section on-ivory" aria-labelledby="vida-title">
      <div className="container team-life__grid">
        <div className="team-life__text">
          <p className="eyebrow">La vida en Naamá</p>
          <SplitText as="h2" id="vida-title" className="h2" lines={['Más que un equipo,', <em key="f">una familia.</em>]} />
          <Reveal as="p" className="lead">
            Celebramos juntas los aniversarios, las Fiestas Patrias y cada logro. Esa complicidad se
            nota en cómo te recibimos.
          </Reveal>
          <Reveal>
            <Link to="/reservar" className="btn">
              Reservar con nosotras <ArrowRight />
            </Link>
          </Reveal>
        </div>
        <Reveal className="team-life__a" y={60}>
          <Photo name="equipo-celebracion" alt="Parte del equipo celebrando con una torta de Naamá Studio" sizes="(min-width: 900px) 30vw, 80vw" />
        </Reveal>
        <Reveal className="team-life__b" delay={0.15} y={90}>
          <Photo name="equipo-fiestas" alt="El equipo celebrando Fiestas Patrias en el patio de la casa" sizes="(min-width: 900px) 26vw, 70vw" />
        </Reveal>
      </div>
    </section>
  </div>
);

export default TeamPage;
