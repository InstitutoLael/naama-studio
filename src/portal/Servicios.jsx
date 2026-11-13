import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ClipboardList, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { api, post } from './api';
import Hoja from './Hoja';
import { pesos } from './insumosBase';
import { CATALOGO, COMISIONES, MEDIOS_PAGO, PROFESIONALES, buscarServicio, calcular, comisionSugerida } from './servicios';

const diaLargo = (f) => new Date(`${f}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
const moverDia = (f, n) => {
  const d = new Date(`${f}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const corto = (id) => PROFESIONALES.find((p) => p.id === id)?.corto ?? id;
const pct = (c) => `${Math.round(c * 100)}%`;
const soloNumeros = (v) => Number(String(v ?? '').replace(/\D/g, '')) || 0;

const itemVacio = (profesional = '') => ({ clave: Math.random().toString(36).slice(2), servicio: '', profesional, monto: '', comision: null, propina: '' });

/** Formulario: una clienta, uno o más servicios, cómo pagó. */
const Anotar = ({ datos, fecha, onListo, onCerrar }) => {
  const [clienta, setClienta] = useState('');
  const [items, setItems] = useState([itemVacio()]);
  const [medio, setMedio] = useState('Mercado Pago');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const nombresServicios = useMemo(() => {
    const set = new Map(CATALOGO.map((c) => [c.nombre.toLowerCase(), c.nombre]));
    for (const h of datos.historial) if (!set.has(h.servicio.toLowerCase())) set.set(h.servicio.toLowerCase(), h.servicio);
    return [...set.values()].sort((a, b) => a.localeCompare(b, 'es'));
  }, [datos.historial]);

  const precioSugerido = (servicio, profesional) => {
    const h = datos.historial.find((x) => x.servicio.toLowerCase() === servicio.toLowerCase() && x.profesional === profesional);
    return h?.monto ?? buscarServicio(servicio)?.precio ?? '';
  };

  const cambiar = (clave, cambios) =>
    setItems((xs) =>
      xs.map((x) => {
        if (x.clave !== clave) return x;
        const n = { ...x, ...cambios };
        // Al elegir servicio o profesional, se proponen precio y %; si alguien ya escribió el monto, se respeta.
        if (('servicio' in cambios || 'profesional' in cambios) && n.servicio) {
          const cat = buscarServicio(n.servicio);
          if (cat?.salon && !n.profesional) n.profesional = 'SALÓN';
          if (!x.montoTocado) n.monto = String(precioSugerido(n.servicio, n.profesional) || n.monto || '');
          if (!x.comisionTocada && n.profesional) n.comision = n.profesional === 'SALÓN' ? 0 : comisionSugerida(n.profesional, n.servicio);
        }
        return n;
      }),
    );

  const listos = items.filter((x) => x.servicio && x.profesional && soloNumeros(x.monto));
  const total = listos.reduce((a, x) => a + soloNumeros(x.monto) + soloNumeros(x.propina), 0);

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    if (!clienta.trim()) return setError('Escribe el nombre de la clienta.');
    if (!listos.length || listos.length !== items.filter((x) => x.servicio || x.monto).length) {
      return setError('A cada servicio le falta el nombre, quién lo hizo o el monto.');
    }
    const encontrada = datos.clientas.find((c) => c.nombre.toLowerCase() === clienta.trim().toLowerCase());
    setEnviando(true);
    try {
      const r = await post('servicios', {
        fecha,
        clienta: clienta.trim(),
        clientaId: encontrada?.id,
        medio,
        items: listos.map((x) => ({
          servicio: x.servicio,
          profesional: x.profesional,
          monto: soloNumeros(x.monto),
          propina: soloNumeros(x.propina),
          comision: x.comision ?? comisionSugerida(x.profesional, x.servicio),
        })),
      });
      const mal = r.servicios.filter((x) => x.estado !== 'en_planilla');
      onListo(
        mal.length
          ? `Anotado en el portal. ${mal[0].error ?? 'No llegó a la planilla.'} Puedes reintentar abajo.`
          : `Anotado y en la planilla (${r.servicios[0].hoja}, fila ${r.servicios[0].fila}${r.servicios.length > 1 ? `–${r.servicios[r.servicios.length - 1].fila}` : ''}).`,
      );
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <Hoja titulo="Anotar servicio" onCerrar={onCerrar}>
      <form className="hoja__form" onSubmit={guardar}>
        <div className="field">
          <label htmlFor="sv-c">Clienta</label>
          <input
            id="sv-c"
            className="input"
            list="sv-clientas"
            value={clienta}
            onChange={(e) => setClienta(e.target.value)}
            placeholder="Escribe y elige"
            autoComplete="off"
            autoFocus
            required
          />
          <datalist id="sv-clientas">
            {datos.clientas.map((c) => (
              <option key={c.id} value={c.nombre} />
            ))}
          </datalist>
        </div>

        {items.map((x, i) => {
          const calc = x.profesional && soloNumeros(x.monto) ? calcular({ medio, monto: soloNumeros(x.monto), propina: soloNumeros(x.propina), comision: x.comision ?? comisionSugerida(x.profesional, x.servicio) }) : null;
          return (
            <fieldset key={x.clave} className="grupo servicio-item">
              <legend>
                Servicio {items.length > 1 ? i + 1 : ''}
                {items.length > 1 && (
                  <button type="button" className="icono-boton" aria-label="Quitar este servicio" onClick={() => setItems((xs) => xs.filter((y) => y.clave !== x.clave))}>
                    <X size={16} />
                  </button>
                )}
              </legend>
              <input
                className="input"
                list="sv-servicios"
                value={x.servicio}
                onChange={(e) => cambiar(x.clave, { servicio: e.target.value })}
                placeholder="Ej.: Manos, Color, Corte"
                aria-label="Servicio"
                autoComplete="off"
              />
              <div className="chips" role="radiogroup" aria-label="¿Quién lo hizo?">
                {PROFESIONALES.filter((p) => !['MICHELLE - PODOLOGA', 'LEAH - MANICURISTA'].includes(p.id) || x.profesional === p.id).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={x.profesional === p.id}
                    className={`chip ${x.profesional === p.id ? 'is-active' : ''}`}
                    onClick={() => cambiar(x.clave, { profesional: p.id })}
                  >
                    {p.corto}
                  </button>
                ))}
              </div>
              <div className="fila-campos">
                <label className="field">
                  <span>Monto</span>
                  <input
                    className="input"
                    inputMode="numeric"
                    value={x.monto ? Number(soloNumeros(x.monto)).toLocaleString('es-CL') : ''}
                    onChange={(e) => cambiar(x.clave, { monto: e.target.value, montoTocado: true })}
                    placeholder="$"
                  />
                </label>
                <label className="field">
                  <span>Propina</span>
                  <input
                    className="input"
                    inputMode="numeric"
                    value={x.propina ? Number(soloNumeros(x.propina)).toLocaleString('es-CL') : ''}
                    onChange={(e) => cambiar(x.clave, { propina: e.target.value })}
                    placeholder="$0"
                  />
                </label>
              </div>
              {x.profesional && (
                <div className="chips chips--chicos" role="radiogroup" aria-label="Porcentaje para la profesional">
                  {COMISIONES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={(x.comision ?? -1) === c}
                      className={`chip ${(x.comision ?? -1) === c ? 'is-active' : ''}`}
                      onClick={() => cambiar(x.clave, { comision: c, comisionTocada: true })}
                    >
                      {pct(c)}
                    </button>
                  ))}
                </div>
              )}
              {calc && x.profesional !== 'SALÓN' && (
                <small className="muted">
                  Para {corto(x.profesional)}: {pesos(calc.honorario)} · Naamá: {pesos(calc.naama)}
                </small>
              )}
            </fieldset>
          );
        })}
        <datalist id="sv-servicios">
          {nombresServicios.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <button type="button" className="portal__link" onClick={() => setItems((xs) => [...xs, itemVacio(xs[xs.length - 1]?.profesional)])}>
          + Otro servicio a la misma clienta
        </button>

        <div className="field">
          <span className="field__titulo">¿Cómo pagó?</span>
          <div className="chips" role="radiogroup" aria-label="Cómo pagó">
            {MEDIOS_PAGO.map((m) => (
              <button key={m} type="button" role="radio" aria-checked={medio === m} className={`chip ${medio === m ? 'is-active' : ''}`} onClick={() => setMedio(m)}>
                {m === 'Mercado Pago' ? 'Máquina (MP)' : m}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="portal-error" role="alert">{error}</p>}
        <button type="submit" className="btn" disabled={enviando}>
          <Check size={18} /> {enviando ? 'Anotando…' : `Anotar${total ? ` · ${pesos(total)}` : ''}`}
        </button>
      </form>
    </Hoja>
  );
};

const Conectar = ({ onListo, onCerrar }) => {
  const [error, setError] = useState('');
  return (
    <Hoja titulo="Conectar la planilla" onCerrar={onCerrar}>
      <p className="muted">Pega el enlace de la aplicación web de Apps Script (termina en /exec). Los pasos están en docs/PORTAL.md.</p>
      <form
        className="hoja__form"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await post('planilla/conectar', { url: new FormData(e.currentTarget).get('url') });
            onListo('Planilla conectada.');
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        <input name="url" className="input" placeholder="https://script.google.com/macros/s/…/exec" required autoFocus />
        {error && <p className="portal-error" role="alert">{error}</p>}
        <button type="submit" className="btn">
          Conectar
        </button>
      </form>
    </Hoja>
  );
};

const Servicios = ({ cuenta }) => {
  const [fecha, setFecha] = useState(null);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [hoja, setHoja] = useState(null);
  const [aviso, setAviso] = useState('');
  const avisoT = useRef();

  const cargar = useCallback(async (f) => {
    try {
      const d = await api(`servicios${f ? `?fecha=${f}` : ''}`);
      setDatos(d);
      setFecha(d.fecha);
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
    avisoT.current = setTimeout(() => setAviso(''), 5000);
  };
  const listo = (t) => {
    setHoja(null);
    mostrar(t);
    cargar(fecha);
  };

  const total = datos?.servicios.reduce((a, x) => a + x.monto + (x.propina || 0), 0) ?? 0;
  const esAdmin = cuenta?.permisos?.includes('cuentas');

  return (
    <div className="panel">
      <header className="panel__cabeza">
        <span className="eyebrow">Solo Administración</span>
        <h1 className="panel__titulo">
          Anotar <em>servicios</em>
        </h1>
      </header>

      {error && <p className="portal-error" role="alert">{error}</p>}
      {!datos && !error && <p className="muted">Cargando…</p>}

      {datos && (
        <>
          {!datos.planillaConectada && (
            <div className="aviso-fijo">
              <p>
                <strong>La planilla todavía no está conectada.</strong> Lo que anotes queda guardado aquí y se manda solo cuando la conectemos.
              </p>
              {esAdmin && (
                <button type="button" className="btn btn--sm" onClick={() => setHoja({ tipo: 'conectar' })}>
                  Conectar
                </button>
              )}
            </div>
          )}
          {datos.planillaConectada && datos.pendientes > 0 && (
            <div className="aviso-fijo">
              <p>
                <strong>{datos.pendientes} sin llegar a la planilla.</strong>
              </p>
              <button
                type="button"
                className="btn btn--sm"
                onClick={async () => {
                  const r = await post('servicios/reintentar');
                  listo(`${r.listos} de ${r.total} llegaron a la planilla.`);
                }}
              >
                <RefreshCw size={16} /> Reintentar
              </button>
            </div>
          )}

          <section className="hoy">
            <div className="dia-nav">
              <button type="button" className="icono-boton" aria-label="Día anterior" onClick={() => cargar(moverDia(fecha, -1))}>
                <ChevronLeft />
              </button>
              <span className="dia-nav__texto">{fecha === datos.hoy ? 'Hoy' : diaLargo(fecha)}</span>
              <button type="button" className="icono-boton" aria-label="Día siguiente" disabled={fecha >= datos.hoy} onClick={() => cargar(moverDia(fecha, 1))}>
                <ChevronRight />
              </button>
            </div>
            <div className="hoy__cifras">
              <div>
                <strong>{datos.servicios.length}</strong>
                <span>servicios</span>
              </div>
              <div>
                <strong>{pesos(total)}</strong>
                <span>cobrado</span>
              </div>
            </div>
            <button type="button" className="hoy__boton" onClick={() => setHoja({ tipo: 'anotar' })}>
              <Plus size={18} /> Anotar servicio
            </button>
          </section>

          <section>
            <h2 className="seccion__titulo">Anotados {fecha === datos.hoy ? 'hoy' : 'ese día'}</h2>
            {datos.servicios.length === 0 ? (
              <div className="vacio">
                <ClipboardList strokeWidth={1.2} />
                <p>
                  <strong>Nada anotado todavía.</strong>
                  <br />
                  Aprieta «Anotar servicio» cuando una clienta pague.
                </p>
              </div>
            ) : (
              <ul className="cuentas">
                {datos.servicios.map((x) => (
                  <li key={x.id} className="pedido">
                    <span className="pedido__texto">
                      <strong>
                        {x.clienta} · {x.servicio}
                      </strong>
                      <small>
                        {corto(x.profesional)} · {pesos(x.monto)}
                        {x.propina ? ` + ${pesos(x.propina)} propina` : ''} · {x.medio === 'Mercado Pago' ? 'Máquina' : x.medio} · {pct(x.comision)}
                      </small>
                      <small className={x.estado === 'en_planilla' ? 'ok' : 'alerta'}>
                        {x.estado === 'en_planilla' ? `✓ En la planilla (fila ${x.fila})` : `⚠ ${x.error ?? 'Falta mandarlo a la planilla'}`}
                      </small>
                    </span>
                    <span className="pedido__acciones">
                      {x.estado !== 'en_planilla' && datos.planillaConectada && (
                        <button
                          type="button"
                          className="icono-boton"
                          aria-label="Reintentar"
                          onClick={async () => {
                            const r = await post(`servicios/${x.id}/reintentar`);
                            listo(r.servicio.estado === 'en_planilla' ? 'Llegó a la planilla.' : r.servicio.error);
                          }}
                        >
                          <RefreshCw size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="icono-boton"
                        aria-label="Borrar"
                        onClick={async () => {
                          if (!window.confirm(`¿Borrar ${x.servicio} de ${x.clienta}?`)) return;
                          const r = await post(`servicios/${x.id}`, { borrar: true });
                          listo(r.enPlanilla ? `Borrado del portal. Bórralo también en la planilla: ${r.hoja}, fila ${r.fila}.` : 'Borrado.');
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {datos && (
        <button type="button" className="fab" onClick={() => setHoja({ tipo: 'anotar' })} aria-label="Anotar servicio">
          <Plus />
        </button>
      )}
      {aviso && (
        <p className="aviso" role="status">
          {aviso}
        </p>
      )}
      {hoja?.tipo === 'anotar' && <Anotar datos={datos} fecha={fecha} onListo={listo} onCerrar={() => setHoja(null)} />}
      {hoja?.tipo === 'conectar' && <Conectar onListo={listo} onCerrar={() => setHoja(null)} />}
    </div>
  );
};

export default Servicios;
