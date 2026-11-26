import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import { Reveal } from '../components/common/Motion';
import { ArrowRight } from '../components/common/Icons';
import { team } from '../data/team';
import '../theme/team.css';

// Podóloga: cuando llegue su nombre y foto, se completa aquí (photo = nombre en photos.json).
const PODOLOGA = { name: 'Michelle', role: 'Podología clínica', photo: null };

/** P05 · Equipo. */
const TeamPage = () => (
  <div className="equipo pagina">
    <SEOHead
      title="Nuestro Equipo"
      description="Conoce a las especialistas de Naamá Studio: colorimetría, cabello, uñas, faciales, maquillaje y podología en San Miguel."
      image="/img/equipo-1600.webp"
    />

    <header className="container equipo-cabeza">
      <p className="eyebrow">Equipo · {team.length + 1} especialistas</p>
      <h1 className="titulo">Las manos <b>detrás de tu cambio</b></h1>
      <p className="muted">Cada una experta en lo suyo. Elige con quién quieres atenderte o déjate recomendar.</p>
    </header>

    <section className="container equipo-grilla" aria-label="Especialistas">
      {team.map((p, i) => (
        <Reveal key={p.name} delay={(i % 3) * 0.06} y={30} sinAnimar={i < 2}>
          <article className="retrato">
            <Photo name={p.photo} alt={`${p.name}, ${p.role}`} priority={i < 2} sizes="(min-width: 1024px) 16vw, 46vw" position="50% 22%" />
            <h2>{p.name}</h2>
            <p>{p.role}</p>
            <Link to={`/reservar?con=${encodeURIComponent(p.name)}`} className="btn btn--sm">
              Reservar <ArrowRight />
            </Link>
          </article>
        </Reveal>
      ))}
      <Reveal delay={0.1} y={30}>
        <article className="retrato">
          {PODOLOGA.photo ? (
            <Photo name={PODOLOGA.photo} alt={`${PODOLOGA.name}, podóloga`} sizes="(min-width: 1024px) 16vw, 46vw" position="50% 22%" />
          ) : (
            <div className="retrato__vacio" aria-hidden="true">
              <span>{PODOLOGA.name.charAt(0)}</span>
            </div>
          )}
          <h2>{PODOLOGA.name ?? 'Podología'}</h2>
          <p>{PODOLOGA.role}</p>
          <Link to="/servicios/podologia" className="btn btn--sm">
            Reservar <ArrowRight />
          </Link>
        </article>
      </Reveal>
    </section>

    <section className="container equipo-familia" aria-labelledby="familia">
      <div className="equipo-familia__foto">
        <Photo name="equipo-celebracion" alt="Parte del equipo celebrando con una torta de Naamá Studio" sizes="(min-width: 1024px) 60vw, 92vw" />
        <h2 id="familia">
          <span className="gigante">Familia</span>
          <span className="firma firma--blanca">más que un equipo</span>
        </h2>
      </div>
      <div className="equipo-familia__texto">
        <p>Celebramos juntas los aniversarios, las Fiestas Patrias y cada logro. Esa complicidad se nota en cómo te recibimos.</p>
        <Link to="/reservar" className="btn btn--linea btn--ancho-cel">Reservar con nosotras</Link>
      </div>
    </section>
  </div>
);

export default TeamPage;
