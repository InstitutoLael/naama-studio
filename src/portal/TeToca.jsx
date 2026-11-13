import React, { useCallback, useEffect, useState } from 'react';
import { BellRing, Cake } from 'lucide-react';
import { WhatsAppIcon } from '../components/common/Icons';
import { api, post } from './api';

const primerNombre = (n) => n.split(' ')[0];
const wa = (tel, texto) => `https://wa.me/${tel.replace('+', '')}?text=${encodeURIComponent(texto)}`;

const mensajeToca = (c) =>
  c.dormida
    ? `Hola ${primerNombre(c.nombre)}! 🌸 Te escribimos de Naamá Studio. Hace tiempo que no te vemos y te echamos de menos. ¿Te reservamos una hora esta semana para regalarte una pausa? 🤍`
    : `Hola ${primerNombre(c.nombre)}! 🌸 Te escribimos de Naamá Studio. Ya va siendo tiempo de tu ${c.servicio ? c.servicio.toLowerCase() : 'próxima visita'}. ¿Te reservamos una hora? 🤍`;
const mensajeCumple = (c) =>
  `¡Feliz cumpleaños, ${primerNombre(c.nombre)}! 🎂🌸 Todo el equipo de Naamá Studio te desea un día precioso. Cuando vengas este mes, te tenemos un regalito. 🤍`;

const cuando = (dias) => (dias === 0 ? 'hoy' : dias === 1 ? 'mañana' : `en ${dias} días`);

const TeToca = () => {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    api('te-toca')
      .then(setD)
      .catch((err) => setError(err.message));
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const avisar = async (c, tipo) => {
    await post(`te-toca/${c.id}`, { tipo }).catch(() => {});
    setTimeout(cargar, 1500);
  };

  const proximas = d?.toca.filter((c) => !c.dormida) ?? [];
  const dormidas = d?.toca.filter((c) => c.dormida) ?? [];

  const Lista = ({ lista, tipo }) => (
    <ul className="cuentas">
      {lista.map((c) => (
        <li key={c.id} className="pedido">
          <span className="pedido__texto">
            <strong>{c.nombre}</strong>
            <small>
              {tipo === 'cumple'
                ? `Cumple ${cuando(c.dias)}${c.saludada ? ' · ya saludada' : ''}`
                : `Vino hace ${c.dias} días${c.servicio ? ` · último: ${c.servicio}` : ''}`}
            </small>
          </span>
          {c.telefono && (
            <a
              className="chip is-active"
              href={wa(c.telefono, tipo === 'cumple' ? mensajeCumple(c) : mensajeToca(c))}
              target="_blank"
              rel="noreferrer"
              onClick={() => avisar(c, tipo)}
            >
              <WhatsAppIcon /> Escribir
            </a>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="panel">
      <header className="panel__cabeza">
        <span className="eyebrow">Para que vuelvan</span>
        <h1 className="panel__titulo">
          Te <em>toca</em>
        </h1>
      </header>
      {error && <p className="portal-error" role="alert">{error}</p>}
      {!d && !error && <p className="muted">Cargando…</p>}
      {d && (
        <>
          <p className="muted">
            El portal calcula cuándo le toca volver a cada clienta según lo último que se hizo (uñas cada 3 semanas, color cada 6, etc.). Al apretar «Escribir»
            se abre WhatsApp con el mensaje listo y la clienta sale de la lista hasta su próxima visita.
          </p>
          {d.cumples.length > 0 && (
            <section>
              <h2 className="seccion__titulo">
                <Cake size={16} /> Cumpleaños esta semana
              </h2>
              <Lista lista={d.cumples} tipo="cumple" />
            </section>
          )}
          <section>
            <h2 className="seccion__titulo">Les toca volver ({proximas.length})</h2>
            {proximas.length === 0 ? (
              <div className="vacio">
                <BellRing strokeWidth={1.2} />
                <p>
                  <strong>Nadie por ahora.</strong>
                  <br />
                  Mientras más visitas y servicios se anoten, mejor calcula.
                </p>
              </div>
            ) : (
              <Lista lista={proximas} tipo="toca" />
            )}
          </section>
          {dormidas.length > 0 && (
            <section>
              <h2 className="seccion__titulo">Dormidas: +60 días sin venir ({dormidas.length})</h2>
              <Lista lista={dormidas} tipo="toca" />
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default TeToca;
