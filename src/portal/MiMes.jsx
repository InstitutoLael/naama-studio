import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, NotebookPen, Plus, Trash2 } from 'lucide-react';
import { api, post } from './api';
import Hoja from './Hoja';
import { pesos } from './insumosBase';
import { CATALOGO } from './servicios';

const nombreMes = (m) => new Date(`${m}-15T12:00:00`).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
const moverMes = (m, n) => {
  const d = new Date(`${m}-15T12:00:00`);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 7);
};
const diaCorto = (f) => new Date(`${f}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' });
const hoyChile = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());

const Anotar = ({ onListo, onCerrar }) => {
  const [error, setError] = useState('');
  const nombres = useMemo(() => CATALOGO.filter((c) => !c.salon).map((c) => c.nombre.replace(' (ganancia)', '')), []);
  return (
    <Hoja titulo="¿Qué hiciste?" onCerrar={onCerrar}>
      <form
        className="hoja__form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            await post('mi-mes', { fecha: f.get('fecha'), clienta: f.get('clienta'), servicio: f.get('servicio'), monto: f.get('monto'), nota: f.get('nota') });
            onListo('Anotado en tu mes.');
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        <div className="field">
          <label htmlFor="mm-s">Servicio</label>
          <input id="mm-s" name="servicio" className="input" list="mm-servicios" placeholder="Ej.: Manos" autoComplete="off" required autoFocus />
          <datalist id="mm-servicios">
            {nombres.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label htmlFor="mm-c">Clienta</label>
          <input id="mm-c" name="clienta" className="input" placeholder="Nombre" />
        </div>
        <div className="fila-campos">
          <label className="field">
            <span>¿Cuánto pagó?</span>
            <input name="monto" className="input" inputMode="numeric" placeholder="$" />
          </label>
          <label className="field">
            <span>Día</span>
            <input name="fecha" type="date" className="input" defaultValue={hoyChile()} max={hoyChile()} />
          </label>
        </div>
        <div className="field">
          <label htmlFor="mm-n">Nota (opcional)</label>
          <input id="mm-n" name="nota" className="input" placeholder="Ej.: le hice diseño en 2 uñas" />
        </div>
        {error && <p className="portal-error" role="alert">{error}</p>}
        <button type="submit" className="btn">
          <Plus size={18} /> Anotar
        </button>
      </form>
    </Hoja>
  );
};

const MiMes = ({ cuenta }) => {
  const [mes, setMes] = useState(null);
  const [quien, setQuien] = useState(null);
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [hoja, setHoja] = useState(false);
  const [aviso, setAviso] = useState('');
  const avisoT = useRef();

  const cargar = useCallback(async (m, c) => {
    try {
      const q = new URLSearchParams();
      if (m) q.set('mes', m);
      if (c) q.set('cuenta', c);
      const r = await api(`mi-mes${q.toString() ? `?${q}` : ''}`);
      setD(r);
      setMes(r.mes);
      setQuien(r.persona.id);
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const mostrar = (t) => {
    setAviso(t);
    clearTimeout(avisoT.current);
    avisoT.current = setTimeout(() => setAviso(''), 3000);
  };
  const esYo = d && d.persona.id === cuenta.id;
  const filas = d?.cruce ? d.cruce.filas : d?.servicios ?? [];

  return (
    <div className="panel">
      <header className="panel__cabeza">
        <span className="eyebrow">{esYo ? 'Lo que anotas tú' : `Lo que anotó ${d?.persona.nombre ?? ''}`}</span>
        <h1 className="panel__titulo">
          {esYo ? 'Mi' : 'Su'} <em>mes</em>
        </h1>
      </header>
      {error && <p className="portal-error" role="alert">{error}</p>}
      {!d && !error && <p className="muted">Cargando…</p>}

      {d && (
        <>
          {d.revisa && (
            <div className="chips" role="radiogroup" aria-label="Ver el mes de">
              {d.equipo.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={quien === p.id}
                  className={`chip ${quien === p.id ? 'is-active' : ''}`}
                  onClick={() => cargar(mes, p.id)}
                >
                  {p.id === cuenta.id ? 'Yo' : p.nombre.split(' ')[0]}
                  {p.n ? ` · ${p.n}` : ''}
                </button>
              ))}
            </div>
          )}

          <section className="hoy">
            <div className="dia-nav">
              <button type="button" className="icono-boton" aria-label="Mes anterior" onClick={() => cargar(moverMes(mes, -1), quien)}>
                <ChevronLeft />
              </button>
              <span className="dia-nav__texto">{nombreMes(mes)}</span>
              <button type="button" className="icono-boton" aria-label="Mes siguiente" disabled={mes >= hoyChile().slice(0, 7)} onClick={() => cargar(moverMes(mes, 1), quien)}>
                <ChevronRight />
              </button>
            </div>
            <div className="hoy__cifras">
              <div>
                <strong>{d.servicios.length}</strong>
                <span>servicios anotados</span>
              </div>
              <div>
                <strong>{pesos(d.total)}</strong>
                <span>cobrado</span>
              </div>
            </div>
            {esYo && (
              <button type="button" className="hoy__boton" onClick={() => setHoja(true)}>
                <Plus size={18} /> Anotar lo que hice
              </button>
            )}
          </section>

          {esYo && !d.revisa && (
            <p className="muted">
              Esto es tu propio registro: no cambia la planilla. Administración lo revisa antes de pagar para que no se pierda ningún servicio.
            </p>
          )}

          {d.cruce && (
            <div className="aviso-fijo">
              <p>
                <strong>Revisión antes de pagar:</strong> {d.cruce.filas.filter((f) => f.coincide).length} coinciden con lo anotado por Administración ·{' '}
                {d.cruce.filas.filter((f) => !f.coincide).length} solo los anotó ella · {d.cruce.soloNuestros.length} solo los anotó Administración.
              </p>
            </div>
          )}
          {d.revisa && !d.persona.profesional && !esYo && <p className="muted">No reconozco a qué profesional de la planilla corresponde esta cuenta, así que no puedo cruzar.</p>}

          <section>
            <h2 className="seccion__titulo">{esYo ? 'Lo que anotaste' : 'Lo que anotó ella'}</h2>
            {filas.length === 0 ? (
              <div className="vacio">
                <NotebookPen strokeWidth={1.2} />
                <p>
                  <strong>Nada anotado en {nombreMes(mes)}.</strong>
                </p>
              </div>
            ) : (
              <ul className="cuentas">
                {filas.map((m) => (
                  <li key={m.id} className="pedido">
                    <span className="pedido__texto">
                      <strong>
                        {m.servicio}
                        {m.clienta ? ` · ${m.clienta}` : ''}
                      </strong>
                      <small>
                        {diaCorto(m.fecha)}
                        {m.monto ? ` · ${pesos(m.monto)}` : ''}
                        {m.nota ? ` · ${m.nota}` : ''}
                      </small>
                      {d.cruce && (
                        <small className={m.coincide ? 'ok' : 'alerta'}>
                          {m.coincide
                            ? `✓ Coincide con ${m.coincide.servicio} de ${m.coincide.clienta} (${pesos(m.coincide.monto)})`
                            : '⚠ No está en lo anotado por Administración'}
                        </small>
                      )}
                    </span>
                    {(esYo || d.revisa) && (
                      <button
                        type="button"
                        className="icono-boton"
                        aria-label="Borrar"
                        onClick={async () => {
                          if (!window.confirm('¿Borrar esto?')) return;
                          await post(`mi-mes/${m.id}`, { borrar: true });
                          mostrar('Borrado.');
                          cargar(mes, quien);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {d.cruce?.soloNuestros.length > 0 && (
            <section>
              <h2 className="seccion__titulo">Anotado por Administración y no por ella</h2>
              <ul className="cuentas">
                {d.cruce.soloNuestros.map((x) => (
                  <li key={x.id} className="pedido">
                    <span className="pedido__texto">
                      <strong>
                        {x.servicio} · {x.clienta}
                      </strong>
                      <small>
                        {diaCorto(x.fecha)} · {pesos(x.monto)}
                      </small>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {d && esYo && (
        <button type="button" className="fab" onClick={() => setHoja(true)} aria-label="Anotar lo que hice">
          <Plus />
        </button>
      )}
      {aviso && (
        <p className="aviso" role="status">
          {aviso}
        </p>
      )}
      {hoja && (
        <Anotar
          onListo={(t) => {
            setHoja(false);
            mostrar(t);
            cargar(mes, quien);
          }}
          onCerrar={() => setHoja(false)}
        />
      )}
    </div>
  );
};

export default MiMes;
