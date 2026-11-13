import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { api } from './api';
import { MODULOS, ROLES, puede } from './permisos';
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

  const visibles = MODULOS.filter((m) => !m.permiso || puede(cuenta, m.permiso));
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
        <Link to="/portal/clientas" className="hoy__boton">
          <Plus size={18} strokeWidth={2} /> Anotar quién vino
        </Link>
      </section>

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
