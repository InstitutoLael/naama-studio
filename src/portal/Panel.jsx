import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '../components/common/Icons';
import { MODULOS, ROLES, puede } from './permisos';

const saludo = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
};

/** Panel principal: muestra los módulos que le tocan a cada persona. Lo que no le corresponde, no aparece. */
const Panel = ({ cuenta }) => {
  const visibles = MODULOS.filter((m) => !m.permiso || puede(cuenta, m.permiso));
  return (
    <div className="panel">
      <header className="panel__cabeza">
        <span className="eyebrow">{ROLES[cuenta.rol]?.nombre}</span>
        <h1 className="panel__titulo">
          {saludo()}, <em>{cuenta.nombre}.</em>
        </h1>
      </header>

      <ul className="modulos">
        {visibles.map((m, i) => (
          <li key={m.id}>
            {m.listo ? (
              <Link to={`/portal/${m.id}`} className="modulo">
                <span className="modulo__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="modulo__nombre">{m.nombre}</span>
                <span className="modulo__bajada">{m.bajada}</span>
                <ArrowRight className="modulo__flecha" />
              </Link>
            ) : (
              <div className="modulo is-pronto" aria-disabled="true">
                <span className="modulo__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="modulo__nombre">{m.nombre}</span>
                <span className="modulo__bajada">{m.bajada}</span>
                <span className="modulo__pronto">Pronto</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Panel;
