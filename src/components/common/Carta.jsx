import React from 'react';
import { Link } from 'react-router-dom';
import Photo from './Photo';
import { aNumero, precioTexto } from '../../data/menuPrecios';
import { franjaDe } from '../../data/secciones';

const miles = (n) => `$${n.toLocaleString('es-CL')}`;
const corto = (t = '') => t.replace(/\s*horas?/, ' h').replace(/\s*min/, ' min');

/** Precio que se muestra en la fila. */
export const precioFila = (it) => {
  if (it.variantes?.length) return `desde ${miles(it.desde)}`;
  const p = precioTexto(it.price);
  return it.desdeTexto && aNumero(it.price) ? `desde ${p}` : p;
};

/** Debajo del nombre: duración o «según el largo». */
export const bajadaFila = (it) => {
  if (it.variantes?.length) return 'según el largo';
  if (/omniplex/i.test(it.nombre)) return 'se suma al color';
  return it.time ? corto(it.time) : '';
};

/** Tabla de largos (P02): CORTO / MEDIO / LARGO / XL. */
export const TablaLargos = ({ item }) => (
  <div className="largos tarjeta">
    <p className="largos__titulo">{item.nombre} · según el largo</p>
    <div className="largos__fila" style={{ gridTemplateColumns: `repeat(${item.variantes.length}, 1fr)` }}>
      {item.variantes.map((v) => (
        <div key={v.largo} className="largos__celda">
          <span className="largos__largo">{v.largo === 'Extra largo' ? 'XL' : v.largo}</span>
          <strong>{aNumero(v.price) ? miles(aNumero(v.price)) : 'Consultar'}</strong>
          <small>{corto(v.time)}</small>
        </div>
      ))}
    </div>
  </div>
);

/** Un grupo de la carta: franja de foto con palabra girada + filas. */
const GrupoCarta = ({ titulo, items, mundo, linkDe }) => {
  const { palabra, foto } = franjaDe(titulo, mundo);
  const conLargos = items.filter((it) => it.variantes?.length > 1);
  return (
    <section className="grupo" aria-label={titulo}>
      <div className="grupo__cuerpo">
        <div className="grupo__franja">
          <Photo name={foto} alt="" sizes="120px" />
          <span className="grupo__palabra gigante">{palabra}</span>
        </div>
        <ul className="grupo__filas">
          {items.map((it, i) => (
            <li key={`${it.nombre}-${i}`}>
              <Link to={linkDe(it)} className="fila">
                <span className="fila__nombre">
                  {it.nombre}
                  {bajadaFila(it) && <small>{bajadaFila(it)}</small>}
                </span>
                <span className="fila__precio">{precioFila(it)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {conLargos.map((it) => (
        <TablaLargos key={it.nombre} item={it} />
      ))}
    </section>
  );
};

export default GrupoCarta;
