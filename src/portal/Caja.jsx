import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
import { api, post } from './api';
import { pesos } from './insumosBase';

const diaLargo = (f) => new Date(`${f}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
const diaCorto = (f) => new Date(`${f}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
const moverDia = (f, n) => {
  const d = new Date(`${f}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Una línea de la comparación: lo anotado contra lo que de verdad entró. */
const Linea = ({ titulo, anotado, real, detalle }) => {
  const dif = real == null ? null : real - anotado;
  const ok = dif != null && Math.abs(dif) < 100;
  return (
    <li className="caja-linea">
      <span className="caja-linea__texto">
        <strong>{titulo}</strong>
        <small>
          Anotado {pesos(anotado)}
          {real != null ? ` · Entró ${pesos(real)}` : ''}
          {detalle ? ` · ${detalle}` : ''}
        </small>
      </span>
      {dif == null ? (
        <span className="etiqueta">—</span>
      ) : ok ? (
        <span className="etiqueta etiqueta--ok">Cuadra</span>
      ) : (
        <span className="etiqueta etiqueta--alerta">
          {dif > 0 ? 'Sobran ' : 'Faltan '}
          {pesos(Math.abs(dif))}
        </span>
      )}
    </li>
  );
};

const Caja = () => {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [efectivo, setEfectivo] = useState('');
  const [nota, setNota] = useState('');
  const [aviso, setAviso] = useState('');
  const avisoT = useRef();

  const cargar = useCallback(async (f) => {
    try {
      const r = await api(`caja${f ? `?fecha=${f}` : ''}`);
      setD(r);
      setEfectivo(r.cierre?.efectivo != null ? String(r.cierre.efectivo) : '');
      setNota(r.cierre?.nota ?? '');
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const contado = Number(String(efectivo).replace(/\D/g, '')) || 0;

  return (
    <div className="panel">
      <header className="panel__cabeza">
        <span className="eyebrow">Al final del día</span>
        <h1 className="panel__titulo">
          Cierre de <em>caja</em>
        </h1>
      </header>

      {error && <p className="portal-error" role="alert">{error}</p>}
      {!d && !error && <p className="muted">Cargando…</p>}

      {d && (
        <>
          <section className="hoy">
            <div className="dia-nav">
              <button type="button" className="icono-boton" aria-label="Día anterior" onClick={() => cargar(moverDia(d.fecha, -1))}>
                <ChevronLeft />
              </button>
              <span className="dia-nav__texto">{d.fecha === d.hoy ? 'Hoy' : diaLargo(d.fecha)}</span>
              <button type="button" className="icono-boton" aria-label="Día siguiente" disabled={d.fecha >= d.hoy} onClick={() => cargar(moverDia(d.fecha, 1))}>
                <ChevronRight />
              </button>
            </div>
            <div className="hoy__cifras">
              <div>
                <strong>{d.servicios}</strong>
                <span>servicios anotados</span>
              </div>
              <div>
                <strong>{pesos(d.total)}</strong>
                <span>total anotado</span>
              </div>
            </div>
            {d.cierre && (
              <p className="plata-heroe__detalle">
                {d.cierre.cuadra ? '✓ Caja cerrada y cuadrada' : '⚠ Caja cerrada con diferencias'} · por {d.cierre.por}
              </p>
            )}
          </section>

          <section>
            <h2 className="seccion__titulo">¿Cuadra?</h2>
            {d.errorMP && <p className="portal-error">{d.errorMP}</p>}
            <ul className="cuentas">
              <Linea
                titulo="Máquina (Mercado Pago)"
                anotado={d.anotado['Mercado Pago']}
                real={d.mp?.maquina ?? null}
                detalle={d.mp ? `${d.mp.maquinaPagos} pagos · comisión ${pesos(d.mp.comision)}` : 'sin conexión a MP'}
              />
              <Linea
                titulo="Transferencias"
                anotado={d.anotado.Transferencia}
                real={d.mp?.transferencias ?? null}
                detalle={d.mp ? `${d.mp.transferenciasPagos} a la cuenta MP` : ''}
              />
              <Linea titulo="Efectivo" anotado={d.anotado.Efectivo} real={efectivo === '' ? null : contado} detalle={efectivo === '' ? 'cuenta la plata del cajón' : 'contado'} />
            </ul>
            <p className="muted">
              Si «Faltan» en la máquina o transferencias, falta anotar un servicio. Si «Sobran», hay algo anotado de más o pagaron algo que no se anotó como servicio
              (ej.: transferencias que no son de clientas).
            </p>
          </section>

          <section>
            <h2 className="seccion__titulo">Cerrar el día</h2>
            <form
              className="hoja__form"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const r = await post('caja', { fecha: d.fecha, efectivo: contado, nota });
                  setAviso(r.cierre.cuadra ? 'Caja cerrada. ¡Todo cuadra!' : 'Caja cerrada con diferencias (quedó anotado).');
                  clearTimeout(avisoT.current);
                  avisoT.current = setTimeout(() => setAviso(''), 4000);
                  cargar(d.fecha);
                } catch (err) {
                  setError(err.message);
                }
              }}
            >
              <div className="field">
                <label htmlFor="cj-e">Efectivo contado en el cajón</label>
                <input
                  id="cj-e"
                  className="input pesada__input"
                  inputMode="numeric"
                  placeholder="$"
                  value={efectivo === '' ? '' : contado.toLocaleString('es-CL')}
                  onChange={(e) => setEfectivo(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="field">
                <label htmlFor="cj-n">Nota (opcional)</label>
                <input id="cj-n" className="input" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej.: se pagó el gas en efectivo" />
              </div>
              <button type="submit" className="btn">
                <Check size={18} /> {d.cierre ? 'Actualizar cierre' : 'Cerrar caja'}
              </button>
            </form>
          </section>

          {d.anteriores.length > 0 && (
            <section>
              <h2 className="seccion__titulo">Cierres anteriores</h2>
              <ul className="cuentas">
                {d.anteriores.map((c) => (
                  <li key={c.fecha}>
                    <button type="button" className="pedido pedido--boton" onClick={() => cargar(c.fecha)}>
                      <Receipt size={18} strokeWidth={1.6} />
                      <span className="pedido__texto">
                        <strong>{diaCorto(c.fecha)}</strong>
                        <small>
                          {pesos(c.total)} · {c.cuadra ? 'cuadró' : 'con diferencias'} · {c.por}
                        </small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
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

export default Caja;
