import React from 'react';
import SEOHead from '../components/shared/SEOHead';
import Photo from '../components/common/Photo';
import { Reveal } from '../components/common/Motion';
import { b2bPacks } from '../data/b2bPacks';
import { SITE, whatsappUrl } from '../data/site';
import '../theme/empresas.css';

const FORMAS = [
  ['En el salón', 'Reservamos la casa para tu equipo: una jornada de cuidado capilar, uñas y bienestar lejos de la oficina.'],
  ['En tu oficina', 'Llevamos estaciones de masaje, diseño de cejas y manicure express a tus dependencias.'],
  ['Gift cards corporativas', 'Un reconocimiento que cada persona canjea por el servicio que prefiera, cuando quiera.'],
];
const FOTOS = ['salon-estaciones', 'casa-sala', 'salon-recepcion'];
const nombre = (p) => p.name.replace(/^Pack /, '');
const pedir = (p) => whatsappUrl(`Hola 🤍 Escribo de una empresa: me interesa el ${p.name.replace(/^Pack /, 'pack ')} para mi equipo. ¿Me pueden enviar una propuesta?`);
const PROPUESTA = whatsappUrl('Hola 🤍 Escribo de una empresa y me gustaría recibir una propuesta para mi equipo.');

/** P08 · Empresas. */
const EmpresasPage = () => (
  <div className="empresas pagina">
    <SEOHead title="Empresas" description="Jornadas de belleza y bienestar para equipos: en el salón, en tu oficina o con gift cards corporativas. Naamá Studio, San Miguel." />

    <section className="container empresas-hero">
      <div className="empresas-panel">
        <p className="eyebrow">Empresas</p>
        <h1>
          <span className="gigante">Un respiro</span>
          <span className="firma firma--blanca">para tu equipo</span>
        </h1>
        <p>Diseñamos jornadas de cuidado a la medida de tu empresa, para celebrar, reconocer o simplemente darle a tu equipo un respiro.</p>
        <div className="empresas-panel__botones">
          <a href={PROPUESTA} target="_blank" rel="noopener noreferrer" className="btn btn--claro">Pedir propuesta</a>
          <a href={`mailto:${SITE.email}?subject=Propuesta%20corporativa%20Naam%C3%A1%20Studio`} className="btn btn--linea-clara">Correo</a>
        </div>
      </div>
      <div className="empresas-collage">
        <Photo name="casa-sala" alt="La sala de espera de la casa" priority sizes="(min-width: 1024px) 22vw, 46vw" />
        <Photo name="salon-estaciones" alt="Estaciones de trabajo del salón" sizes="(min-width: 1024px) 22vw, 46vw" />
        <Photo name="unas-burdeo-oro" alt="Manicure burdeo con pan de oro" sizes="(min-width: 1024px) 22vw, 46vw" />
      </div>
    </section>

    <section className="container empresas-formas" aria-labelledby="formas">
      <h2 id="formas" className="titulo">Tres formas <b>de hacerlo</b></h2>
      <ol>
        {FORMAS.map(([t, d], i) => (
          <Reveal as="li" key={t} delay={i * 0.06} y={20}>
            <span className="empresas-num">0{i + 1}</span>
            <div><strong>{t}</strong><p>{d}</p></div>
          </Reveal>
        ))}
      </ol>
    </section>

    <section className="container empresas-packs" aria-labelledby="packs">
      <h2 id="packs" className="titulo">Compara <b>los packs</b></h2>
      <p className="muted chico">Valores referenciales. Armamos la propuesta según el tamaño de tu equipo.</p>

      <div className="comparar solo-cel" role="table" aria-label="Comparar packs">
        <div className="comparar__fila comparar__fila--cabeza" role="row">
          {b2bPacks.map((p) => (
            <div key={p.id} role="columnheader"><small>{p.modality}</small>{nombre(p)}</div>
          ))}
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="comparar__fila" role="row">
            {b2bPacks.map((p) => <div key={p.id} role="cell">{p.services[i]}</div>)}
          </div>
        ))}
        <div className="comparar__fila comparar__fila--precio" role="row">
          {b2bPacks.map((p) => <div key={p.id} role="cell"><small>desde</small>${p.price}</div>)}
        </div>
      </div>

      <div className="packs">
        {b2bPacks.map((p, i) => (
          <article key={p.id} className="pack tarjeta">
            <Photo name={FOTOS[i]} alt="" sizes="(min-width: 1024px) 30vw, 40vw" />
            <div className="pack__cuerpo">
              <p className="eyebrow eyebrow--terracota">{p.modality}</p>
              <h3>{nombre(p)}</h3>
              <p className="pack__desc">{p.description}</p>
              <ul className="pack__lista solo-pc">
                {p.services.map((s) => <li key={s}>{s}</li>)}
              </ul>
              <div className="pack__pie">
                <strong><small>desde</small> ${p.price}</strong>
                <a href={pedir(p)} target="_blank" rel="noopener noreferrer" className="link-sub solo-cel">Consultar</a>
                <a href={pedir(p)} target="_blank" rel="noopener noreferrer" className="btn btn--sm solo-pc">Consultar</a>
              </div>
            </div>
          </article>
        ))}
      </div>
      <a href={PROPUESTA} target="_blank" rel="noopener noreferrer" className="btn btn--ancho solo-cel">Pedir propuesta</a>
    </section>
  </div>
);

export default EmpresasPage;
