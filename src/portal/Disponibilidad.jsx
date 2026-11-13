import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api, post } from './api';

const OPCIONES = [
  { id: 'todo', texto: 'Todo el día', corto: 'Todo' },
  { id: 'manana', texto: 'Solo mañana', corto: 'AM' },
  { id: 'tarde', texto: 'Solo tarde', corto: 'PM' },
  { id: 'no', texto: 'No vengo', corto: 'No' },
];
const corto = (estado) => OPCIONES.find((o) => o.id === estado)?.corto ?? '·';
const diaSemana = (f) => new Date(`${f}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'short' }).replace('.', '');
const diaNum = (f) => new Date(`${f}T12:00:00`).getDate();
const diaLargo = (f) => new Date(`${f}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' });

const Disponibilidad = () => {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const avisoT = useRef();

  const cargar = useCallback(async () => {
    try {
      setD(await api('disponibilidad'));
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const marcar = async (fechas, estado) => {
    try {
      await post('disponibilidad', { fechas, estado });
      setAviso('Guardado.');
      clearTimeout(avisoT.current);
      avisoT.current = setTimeout(() => setAviso(''), 2000);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel">
      <header className="panel__cabeza">
        <span className="eyebrow">Próximas dos semanas</span>
        <h1 className="panel__titulo">
          Mi <em>disponibilidad</em>
        </h1>
      </header>
      {error && <p className="portal-error" role="alert">{error}</p>}
      {!d && !error && <p className="muted">Cargando…</p>}

      {d && (
        <>
          <section>
            <p className="muted">Toca cómo vienes cada día. Si un día no marcas nada, se entiende que no está confirmado.</p>
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => marcar(d.dias.slice(0, 6), 'todo')}>
              Marcar toda esta semana «Todo el día»
            </button>
            <ul className="cuentas dispo-lista">
              {d.dias.map((f) => {
                const actual = d.yo.marcas[f]?.estado;
                return (
                  <li key={f} className="dispo-dia">
                    <strong className="dispo-dia__fecha">{diaLargo(f)}</strong>
                    <div className="chips chips--chicos" role="radiogroup" aria-label={`Disponibilidad ${diaLargo(f)}`}>
                      {OPCIONES.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          role="radio"
                          aria-checked={actual === o.id}
                          className={`chip ${actual === o.id ? 'is-active' : ''} ${o.id === 'no' ? 'chip--no' : ''}`}
                          onClick={() => marcar([f], actual === o.id ? '' : o.id)}
                        >
                          {o.texto}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h2 className="seccion__titulo">El equipo</h2>
            <div className="dispo-tabla" role="table" aria-label="Disponibilidad del equipo">
              <div className="dispo-tabla__fila dispo-tabla__cabeza" role="row">
                <span role="columnheader" />
                {d.dias.map((f) => (
                  <span key={f} role="columnheader">
                    {diaSemana(f)}
                    <br />
                    {diaNum(f)}
                  </span>
                ))}
              </div>
              {d.equipo.map((p) => (
                <div key={p.id} className="dispo-tabla__fila" role="row">
                  <span role="rowheader" className="dispo-tabla__nombre">
                    {p.nombre.split(' ')[0]}
                  </span>
                  {d.dias.map((f) => {
                    const e = p.marcas[f]?.estado;
                    return (
                      <span key={f} role="cell" className={`dispo-celda dispo-celda--${e ?? 'nada'}`}>
                        {corto(e)}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="muted">Todo = todo el día · AM = mañana · PM = tarde · No = no viene · «·» = no ha marcado</p>
          </section>
        </>
      )}
      {aviso && (
        <p className="aviso" role="status">
          {aviso}
        </p>
      )}
    </div>
  );
};

export default Disponibilidad;
