import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import { Reveal } from '../components/common/Motion';
import { ArrowRight, CalendarIcon, PersonIcon, SearchIcon } from '../components/common/Icons';
import { HORARIO_LARGO, whatsappUrl } from '../data/site';
import { testimonials } from '../data/testimonials';
import { totalServicios } from '../data/categories';
import '../theme/home.css';

/** P01 · Inicio. */
const Home = () => (
  <div className="inicio">
    <SEOHead />

    {/* D11 · computador: título fino con la palabra clave en negrita, foto en arco y collage de 2 fotos */}
    <section className="inicio-pc container solo-pc">
      <div className="inicio-pc__texto">
        <h1 className="titulo">
          Una casa para <b>volver a ti</b>
        </h1>
        <p>Un salón de belleza y bienestar en una casa patrimonial de San Miguel. Cabello, color, uñas, rostro y masajes, hechos con calma y detalle.</p>
        <div className="inicio-pc__botones">
          <Link to="/reservar" className="btn btn--terracota">Reservar mi hora</Link>
          <Link to="/servicios" className="btn btn--linea">Ver precios</Link>
        </div>
      </div>
      <div className="inicio-pc__fotos">
        <Photo name="cabello-balayage" alt="Balayage miel hecho en Naamá" priority sizes="22vw" className="inicio-pc__arco" position="center 30%" />
        <Photo name="unas-violeta" alt="Uñas violeta galaxia" priority sizes="22vw" />
        <Photo name="casa-fachada" alt="La fachada roja de Naamá Studio en Arcadia 1297" priority sizes="22vw" position="40% center" />
      </div>
    </section>

    {/* NAAMÁ + fotos partidas */}
    <section className="inicio-hero container solo-cel">
      <h1 className="inicio-hero__nombre gigante">Naamá</h1>
      <div className="inicio-hero__fotos">
        <Photo name="casa-fachada" alt="La fachada roja de Naamá Studio en Arcadia 1297" priority sizes="(min-width: 900px) 34vw, 50vw" position="30% center" />
        <Photo name="cabello-balayage" alt="Balayage miel hecho en Naamá" priority sizes="(min-width: 900px) 34vw, 50vw" position="center 30%" />
        <p className="inicio-hero__firma firma firma--blanca">
          tu pausa <span>te espera</span>
        </p>
      </div>
      <div className="inicio-hero__entrada">
        <p className="inicio-hero__eyebrow">[ Salón de belleza y bienestar ]</p>
        <p className="inicio-hero__texto">
          Un salón de belleza y bienestar en una casa patrimonial de San Miguel. Cabello, color, uñas, rostro y masajes,
          hechos con calma y detalle.
        </p>
        <div className="inicio-hero__botones">
          <Link to="/reservar" className="btn">Reservar mi hora <ArrowRight /></Link>
          <Link to="/servicios" className="btn btn--linea">Servicios</Link>
        </div>
      </div>
    </section>

    {/* Fotos con palabras */}
    <section className="inicio-palabras container" aria-label="Lo que hacemos">
      <div className="inicio-palabras__fila">
        {[
          ['Cabello', 'cabello-ondas', '/servicios/cabello'],
          ['Uñas', 'unas-burdeo-oro', '/servicios/unas'],
          ['Pausa', 'casa-puerta', '/servicios/bienestar'],
        ].map(([palabra, foto, to]) => (
          <Link key={palabra} to={to} className="inicio-palabras__item">
            <Photo name={foto} alt="" sizes="(min-width: 900px) 22vw, 33vw" />
            <span className="gigante">{palabra}</span>
          </Link>
        ))}
      </div>
      <Link to="/servicios" className="link-linea inicio-palabras__link">
        Ver los 6 mundos y precios · {totalServicios} servicios
      </Link>
    </section>

    {/* Reserva en 3 pasos */}
    <section className="inicio-pasos">
      <div className="container inicio-pasos__in">
        <p className="eyebrow">Reserva en 3 pasos</p>
        <ol className="inicio-pasos__lista">
          {[
            [SearchIcon, '1. Servicio'],
            [PersonIcon, '2. Especialista'],
            [CalendarIcon, '3. Día y hora'],
          ].map(([Icono, txt]) => (
            <li key={txt}>
              <span className="inicio-pasos__icono"><Icono /></span>
              {txt}
            </li>
          ))}
        </ol>
        <Link to="/reservar" className="btn">Reservar mi hora</Link>
      </div>
    </section>

    {/* Esencia partida */}
    <section className="inicio-esencia">
      <div className="inicio-esencia__texto">
        <p className="eyebrow eyebrow--terracota">Nuestra esencia</p>
        <h2>
          No vendemos servicios, <span className="firma">custodiamos pausas.</span>
        </h2>
        <p className="muted">
          Una casa patrimonial de San Miguel: techos de madera, puertas antiguas y luz natural. La belleza se hace sin
          apuro.
        </p>
      </div>
      <Photo name="casa-sala" alt="La sala de espera de Naamá, con piso de madera y techos altos" sizes="(min-width: 900px) 50vw, 50vw" />
    </section>

    {/* Hecho a mano, arcos */}
    <section className="inicio-mano container">
      <Reveal className="inicio-mano__titulo">
        <h2 className="gigante">Hecho a mano</h2>
        <p className="firma">detalle a detalle</p>
      </Reveal>
      <div className="inicio-mano__arcos">
        <Photo name="unas-violeta" alt="Uñas violeta galaxia hechas en Naamá" sizes="(min-width: 900px) 26vw, 46vw" className="arco" />
        <Photo name="cabello-rubio" alt="Rubio perla hecho en Naamá" sizes="(min-width: 900px) 26vw, 46vw" className="arco arco--bajo" />
      </div>
      <Link to="/galeria" className="link-linea">Ver toda la galería</Link>
    </section>

    {/* Testimonio + eventos */}
    <section className="inicio-voces container">
      <figure className="inicio-testimonio tarjeta">
        <span className="inicio-testimonio__comilla" aria-hidden="true">“</span>
        <blockquote>“{testimonials[0].quote}”</blockquote>
        <figcaption>
          {testimonials[0].name} · {testimonials[0].service}
        </figcaption>
      </figure>

      <div className="inicio-eventos">
        <div className="inicio-eventos__texto">
          <p className="eyebrow">Matrimonios &amp; eventos</p>
          <h2 className="gigante">Vamos</h2>
          <p className="firma">a donde estés</p>
          <p className="muted">
            Peinado y maquillaje para novias, madrinas y toda la familia, en tu casa o en el lugar del evento.
          </p>
        </div>
        <Photo name="evento-ondas" alt="Ondas para un matrimonio" sizes="(min-width: 900px) 20vw, 40vw" className="inicio-eventos__foto" />
        <a
          href={whatsappUrl('Hola 🤍 Quiero cotizar peinado y maquillaje para un evento.')}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--linea btn--ancho inicio-eventos__btn"
        >
          Cotizar mi evento
        </a>
      </div>
    </section>

    {/* Visítanos */}
    <section className="inicio-visita container">
      <p className="eyebrow">[ Visítanos ]</p>
      <h2 className="gigante">Arcadia 1297</h2>
      <p className="firma">San Miguel</p>
      <p className="inicio-visita__horario">{HORARIO_LARGO} · Domingo cerrado</p>
      <Link to="/reservar" className="btn">Reservar mi hora <ArrowRight /></Link>
    </section>
  </div>
);

export default Home;
