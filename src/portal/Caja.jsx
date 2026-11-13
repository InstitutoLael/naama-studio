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

/** Una línea: lo que sumó Vivy contra lo que de verdad entró (Mercado Pago) y lo anotado en el portal. */
const Linea = ({ titulo, contado, real, anotado, detalle }) => {
  const base = real ?? (anotado || null);
  const dif = contado == null || base == null ? null : contado - base;
  const ok = dif != null && Math.abs(dif) < 100;
  return (
    <li className="caja-linea">
      <span className="caja-linea__texto">
        <strong>{titulo}</strong>
        <small>
          {contado != null ? `Sumado ${pesos(contado)}` : 'Falta sumar'}
          {real != null ? ` · Entró a MP ${pesos(real)}` : ''}
          {anotado ? ` · Anotado ${pesos(anotado)}` : ''}
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

const Monto = ({ id, label, valor, onCambio, ayuda }) => (
  <div className="field">
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      className="input pesada__input"
      inputMode="numeric"
      placeholder="$"
      value={valor === '' ? '' : Number(valor).toLocaleString('es-CL')}
      onChange={(e) => onCambio(e.target.value.replace(/\D/g, ''))}
    />
    {ayuda && <small className="muted">{ayuda}</small>}
  </div>
);

const Caja = () => {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [efectivo, setEfectivo] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [transfer, setTransfer] = useState('');
  const [nota, setNota] = useState('');
  const [aviso, setAviso] = useState('');
  const avisoT = useRef();

  const cargar = useCallback(async (f) => {
    try {
      const r = await api(`caja${f ? `?fecha=${f}` : ''}`);
      setD(r);
      setEfectivo(r.cierre?.efectivo != null ? String(r.cierre.efectivo) : '');
      setTarjeta(r.cierre?.contado?.['Mercado Pago'] != null ? String(r.cierre.contado['Mercado Pago']) : '');
      setTransfer(r.cierre?.contado?.Transferencia != null ? String(r.cierre.contado.Transferencia) : '');
      setNota(r.cierre?.nota ?? '');
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const num = (v) => (v === '' ? null : Number(v));
  const totalSumado = (num(efectivo) ?? 0) + (num(tarjeta) ?? 0) + (num(transfer) ?? 0);

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
                titulo="Tarjeta (máquina)"
                contado={num(tarjeta)}
                real={d.mp?.maquina ?? null}
                anotado={d.anotado['Mercado Pago']}
                detalle={d.mp ? `${d.mp.maquinaPagos} pagos · comisión ${pesos(d.mp.comision)}` : 'sin conexión a MP'}
              />
              <Linea titulo="Transferencias" contado={num(transfer)} real={d.mp?.transferencias ?? null} anotado={d.anotado.Transferencia} />
              <Linea titulo="Efectivo" contado={num(efectivo)} real={null} anotado={d.anotado.Efectivo} detalle={d.anotado.Efectivo ? '' : 'se compara con lo anotado'} />
            </ul>
            <p className="muted">
              «Cuadra» = lo que sumaste es igual a lo que entró a Mercado Pago (o a lo anotado, en el efectivo). Si dice «Faltan» o «Sobran», revisa si quedó un pago
              sin sumar o una transferencia que no era de clienta.
            </p>
          </section>

          <section>
            <h2 className="seccion__titulo">Cerrar el día</h2>
            <form
              className="hoja__form"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const r = await post('caja', { fecha: d.fecha, efectivo: num(efectivo) ?? 0, tarjeta, transferencia: transfer, nota });
                  setAviso(r.cierre.cuadra ? 'Caja cerrada. ¡Todo cuadra!' : 'Caja cerrada con diferencias (quedó anotado).');
                  clearTimeout(avisoT.current);
                  avisoT.current = setTimeout(() => setAviso(''), 4000);
                  cargar(d.fecha);
                } catch (err) {
                  setError(err.message);
                }
              }}
            >
              <Monto id="cj-t" label="Total tarjeta (cierre de la máquina)" valor={tarjeta} onCambio={setTarjeta} ayuda="Débito + crédito + prepago, como sale en el cierre de la Point." />
              <Monto id="cj-tr" label="Total transferencias" valor={transfer} onCambio={setTransfer} />
              <Monto id="cj-e" label="Efectivo contado en el cajón" valor={efectivo} onCambio={setEfectivo} />
              <p className="caja-total">
                Total del día: <strong>{pesos(totalSumado)}</strong>
              </p>
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
