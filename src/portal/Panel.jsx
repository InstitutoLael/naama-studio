import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, CalendarClock, Cake, ChevronRight, ListChecks, Plus } from 'lucide-react';
import { activarAvisos, avisosActivos, motivoSinAvisos } from './avisos';
import { api } from './api';
import { MODULOS, ROLES, puede, puedeModulo } from './permisos';
import { ICONO_MODULO } from './iconos';

const saludo = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
};

const hoyLargo = () =>
  new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Santiago' });

/** Inicio del portal: saludo, resumen del día y accesos. Lo que no le corresponde a la persona, no aparece. */
const Panel = ({ cuenta }) => {
  const [resumen, setResumen] = useState(null);
  const [cumples, setCumples] = useState([]);
  const [tareas, setTareas] = useState(null);
  const [citas, setCitas] = useState(null);
  const [avisos, setAvisos] = useState('cargando');
  const [errorAvisos, setErrorAvisos] = useState('');

  useEffect(() => {
    avisosActivos()
      .then((si) => setAvisos(si ? 'activos' : 'apagados'))
      .catch(() => setAvisos('apagados'));
  }, []);

  useEffect(() => {
    api('cumpleanos')
      .then((r) => setCumples(r.cumples))
      .catch(() => {});
    api('tareas')
      .then((r) => setTareas(r.mias))
      .catch(() => {});
    api('agenda/nuevas')
      .then(setCitas)
      .catch(() => {});
  }, []);

  useEffect(() => {
    api('clientas')
      .then((r) => {
        const cs = r.clientas;
        setResumen({
          total: cs.length,
          hoy: cs.filter((c) => c.diasSinVenir === 0).length,
          lejos: cs.filter((c) => c.diasSinVenir !== null && c.diasSinVenir >= 60).length,
        });
      })
      .catch(() => setResumen(null));
  }, []);

  const visibles = MODULOS.filter((m) => puedeModulo(cuenta, m));
  const listos = visibles.filter((m) => m.listo);
  const pronto = visibles.filter((m) => !m.listo);

  return (
    <div className="pantalla">
      <header className="saludo">
        <p className="saludo__fecha">{hoyLargo()}</p>
        <h1 className="saludo__titulo">
          {saludo()}, <em>{cuenta.nombre}</em>
        </h1>
        <span className="pildora">{ROLES[cuenta.rol]?.nombre}</span>
      </header>

      <section className="hoy" aria-label="Resumen de hoy">
        <div className="hoy__cifras">
          <div>
            <strong>{resumen ? resumen.hoy : '–'}</strong>
            <span>vinieron hoy</span>
          </div>
          <div>
            <strong>{resumen ? resumen.total : '–'}</strong>
            <span>clientas</span>
          </div>
          <div>
            <strong>{resumen ? resumen.lejos : '–'}</strong>
            <span>+60 días sin venir</span>
          </div>
        </div>
        {puede(cuenta, 'servicios') ? (
          <Link to="/portal/servicios" className="hoy__boton">
            <Plus size={18} strokeWidth={2} /> Anotar servicio
          </Link>
        ) : (
          <Link to="/portal/mi-mes" className="hoy__boton">
            <Plus size={18} strokeWidth={2} /> Anotar lo que hice
          </Link>
        )}
      </section>

      {avisos === 'apagados' && (
        <section className="avisos-activar">
          <BellRing strokeWidth={1.6} />
          <div>
            <strong>Activa los avisos en este celular</strong>
            <p>Te llega un aviso cuando te agendan una hora o hay una clienta nueva el día que vienes.</p>
            {motivoSinAvisos() && <small>{motivoSinAvisos()}</small>}
            {errorAvisos && <small className="alerta-texto">{errorAvisos}</small>}
          </div>
          {!motivoSinAvisos() && (
            <button
              type="button"
              className="btn btn--sm"
              onClick={async () => {
                setErrorAvisos('');
                try {
                  await activarAvisos();
                  setAvisos('activos');
                } catch (err) {
                  setErrorAvisos(err.message);
                }
              }}
            >
              Activar
            </button>
          )}
        </section>
      )}

      {(cumples.length > 0 || tareas?.length > 0 || citas?.hoy > 0 || citas?.nuevas?.length > 0) && (
        <section className="avisos-hoy">
          {(citas?.hoy > 0 || citas?.nuevas?.length > 0) && (
            <Link to="/portal/agenda" className={`aviso-hoy ${citas.nuevas.length ? 'is-nuevo' : ''}`}>
              <CalendarClock strokeWidth={1.6} />
              <span>
                <strong>
                  {citas.nuevas.length
                    ? `¡Te agendaron ${citas.nuevas.length === 1 ? 'una hora nueva' : `${citas.nuevas.length} horas nuevas`}!`
                    : `Hoy tienes ${citas.hoy} ${citas.hoy === 1 ? 'clienta' : 'clientas'}`}
                </strong>
                <small>
                  {citas.nuevas
                    .slice(0, 3)
                    .map((c) => `${c.clienta} · ${new Date(`${c.fecha}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' })} ${c.hora}`)
                    .join(' · ')}
                </small>
              </span>
              <ChevronRight strokeWidth={1.6} />
            </Link>
          )}
          {tareas?.length > 0 && (
            <Link to="/portal/aseo" className="aviso-hoy">
              <ListChecks strokeWidth={1.6} />
              <span>
                <strong>
                  Te toca hoy: {tareas.filter((t) => !t.hecha).length ? `${tareas.filter((t) => !t.hecha).length} tareas` : '¡todo listo!'}
                </strong>
                <small>{tareas.filter((t) => !t.hecha).map((t) => t.texto).slice(0, 2).join(' · ')}</small>
              </span>
              <ChevronRight strokeWidth={1.6} />
            </Link>
          )}
          {cumples.length > 0 && (
            <div className="aviso-hoy">
              <Cake strokeWidth={1.6} />
              <span>
                <strong>Cumpleaños esta semana</strong>
                <small>
                  {cumples
                    .map((c) => `${c.nombre.split(' ')[0]} (${c.dias === 0 ? 'hoy' : c.dias === 1 ? 'mañana' : `en ${c.dias} días`})`)
                    .join(' · ')}
                </small>
              </span>
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="seccion__titulo">Accesos</h2>
        <ul className="accesos">
          {listos.map((m) => {
            const Icono = ICONO_MODULO[m.id];
            return (
              <li key={m.id}>
                <Link to={`/portal/${m.id}`} className="acceso-tile">
                  <span className="acceso-tile__icono">{Icono && <Icono strokeWidth={1.6} />}</span>
                  <span className="acceso-tile__texto">
                    <strong>{m.id === 'cuentas' ? 'Equipo y cuentas' : m.nombre}</strong>
                    <small>{m.bajada}</small>
                  </span>
                  <ChevronRight className="acceso-tile__flecha" strokeWidth={1.6} />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {pronto.length > 0 && (
        <section>
          <h2 className="seccion__titulo">Muy pronto</h2>
          <ul className="pronto">
            {pronto.map((m) => {
              const Icono = ICONO_MODULO[m.id];
              return (
                <li key={m.id}>
                  {Icono && <Icono strokeWidth={1.6} />} {m.nombre}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
};

export default Panel;
