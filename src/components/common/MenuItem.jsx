import React, { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, PlusIcon } from './Icons';
import { aNumero, esRebaja, precioTexto } from '../../data/menuPrecios';

const hay = (v) => v && String(v).trim() !== '' && v !== '---';
const miles = (n) => `$${n.toLocaleString('es-CL')}`;
const LARGO_CORTO = { Corto: 'Corto', Medio: 'Medio', Largo: 'Largo', 'Extra largo': 'XL' };

/**
 * Un servicio en formato carta: nombre · línea punteada · precio.
 * Si tiene variantes por largo, muestra «desde» y una grilla con los cuatro largos.
 */
const MenuItem = ({ item }) => {
  const [abierto, setAbierto] = useState(false);
  const [elegido, setElegido] = useState(0);
  const id = useId();
  const variantes = item.variantes ?? [];
  const tieneDetalle = hay(item.desc) || hay(item.why);
  const v = variantes[elegido];
  const reservar = v ? v.nombre : item.name;

  return (
    <li className={`mitem ${abierto ? 'is-open' : ''} ${variantes.length ? 'has-largos' : ''}`}>
      <button
        type="button"
        className="mitem__head"
        onClick={() => setAbierto((o) => !o)}
        aria-expanded={abierto}
        aria-controls={id}
      >
        <span className="mitem__linea">
          <span className="mitem__nombre">{item.nombre}</span>
          <span className="mitem__puntos" aria-hidden="true" />
          <span className="mitem__precio">
            {variantes.length ? (
              <>
                <small>desde</small> {miles(item.desde)}
              </>
            ) : (
              <>
                {esRebaja(item.old, item.price) && <s>${item.old}</s>}
                {precioTexto(item.price)}
              </>
            )}
          </span>
        </span>
        <span className="mitem__meta">
          {!variantes.length && hay(item.time) && <span>{item.time}</span>}
          {variantes.length > 0 && <span>Según el largo del cabello</span>}
          {item.worker && <span>{item.worker}</span>}
          <PlusIcon className="mitem__icono" />
        </span>
      </button>

      {variantes.length > 0 && (
        <div className="mitem__largos" role="group" aria-label={`Precios de ${item.nombre} por largo`}>
          {variantes.map((x, i) => (
            <button
              type="button"
              key={x.largo}
              className={`largo ${abierto && i === elegido ? 'is-on' : ''}`}
              onClick={() => {
                setElegido(i);
                setAbierto(true);
              }}
            >
              <span className="largo__nombre">{LARGO_CORTO[x.largo]}</span>
              <span className="largo__precio">{aNumero(x.price) ? miles(aNumero(x.price)) : 'Consultar'}</span>
              {hay(x.time) && <span className="largo__tiempo">{x.time.replace(' horas', ' h').replace(' hora', ' h')}</span>}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            id={id}
            className="mitem__detalle"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mitem__detalle-in">
              {hay(item.desc) && <p>{item.desc}</p>}
              {hay(item.why) && <p className="mitem__why">{item.why}</p>}
              {!tieneDetalle && <p>Escríbenos y te contamos todo sobre este servicio.</p>}
              <Link to={`/reservar?servicio=${encodeURIComponent(reservar)}`} className="link-arrow">
                Reservar{v ? ` · ${v.largo.toLowerCase()}` : ''} <ArrowRight />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export default MenuItem;
