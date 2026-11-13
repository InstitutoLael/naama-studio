import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarClock, Check, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { api, post } from './api';
import Hoja from './Hoja';
import { pesos } from './insumosBase';

// Gastos fijos sacados de GASTOS 2026 (montos de los últimos meses): se cargan con un toque y se editan.
const FIJOS_SUGERIDOS = [
  { nombre: 'Arriendo', monto: 900000, dia: 28 },
  { nombre: 'Préstamo (cuota)', monto: 385883, dia: 5 },
  { nombre: 'Luz (Enel)', monto: 80000, dia: 10 },
  { nombre: 'Gas', monto: 70000, dia: 27 },
  { nombre: 'Plan Entel', monto: 29990, dia: 15 },
  { nombre: 'Internet Mundo', monto: 14990, dia: 8 },
  { nombre: 'Agua (Aguas Andinas)', monto: 9240, dia: 13 },
  { nombre: 'Cámaras V380', monto: 7400, dia: 7 },
];

const MEDIOS = { credit_card: 'Crédito', debit_card: 'Débito', account_money: 'Saldo MP', bank_transfer: 'Transferencia', prepaid_card: 'Prepago' };

const hora = (iso) => new Date(iso).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' });
const diaCorto = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });

const Cifra = ({ titulo, datos }) => (
  <div>
    <dt>{titulo}</dt>
    <dd>{datos ? pesos(datos.bruto) : '–'}</dd>
    {datos && (
      <small className="cifra__extra">
        {datos.cantidad} pagos · comisión {pesos(datos.comision)}
      </small>
    )}
  </div>
);

const Plata = () => {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [cargandoFijos, setCargandoFijos] = useState(false);
  const [hoja, setHoja] = useState(null);
  const [aviso, setAviso] = useState('');
  const avisoT = useRef();

  const cargar = useCallback(async () => {
    try {
      setD(await api('plata'));
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
    avisoT.current = setTimeout(() => setAviso(''), 3500);
  };
  const accion = async (camino, cuerpo, texto) => {
    try {
      await post(camino, cuerpo);
      setHoja(null);
      if (texto) mostrar(texto);
      cargar();
    } catch (err) {
      mostrar(err.message);
    }
  };

  const maxDia = Math.max(1, ...(d?.porDia ?? []).map((x) => x.bruto));

  return (
    <div className="panel">
      <header className="panel__cabeza">
        <span className="eyebrow">Solo Administración y Vivy</span>
        <h1 className="panel__titulo">
          La <em>plata</em>
        </h1>
      </header>

      {error && <p className="portal-error" role="alert">{error}</p>}
      {!d && !error && <p className="muted">Cargando…</p>}

      {d && (
        <>
          <section className="hoy plata-heroe">
            <span className="plata-heroe__titulo">Disponible para gastar</span>
            <strong className="plata-heroe__monto">{d.disponible === null ? '—' : pesos(d.disponible)}</strong>
            <span className="plata-heroe__detalle">
              {d.saldo ? (
                <>
                  Saldo {pesos(d.saldo.monto)} (anotado {hora(d.saldo.ts)} por {d.saldo.por}) − {pesos(d.porPagar)} que falta pagar este mes
                </>
              ) : (
                'Anota el saldo que te muestra la app de Mercado Pago y te digo cuánto queda libre.'
              )}
            </span>
            <button type="button" className="hoy__boton" onClick={() => setHoja({ tipo: 'saldo' })}>
              <Wallet size={18} /> {d.saldo ? 'Actualizar saldo' : 'Anotar saldo'}
            </button>
          </section>

          {!d.conectado && (
            <p className="acceso__nota">
              <strong>Falta conectar Mercado Pago.</strong> Cuando pongas la llave en Cloudflare, aquí aparece solo lo que entra cada día, las comisiones y lo
              que está por liberarse.
            </p>
          )}
          {d.errorMP && <p className="portal-error">{d.errorMP}</p>}

          {d.conectado && !d.errorMP && (
            <>
              <dl className="cifras cifras--plata">
                <Cifra titulo="Hoy" datos={d.hoyMP} />
                <Cifra titulo="Últimos 7 días" datos={d.semanaMP} />
                <Cifra titulo="Este mes" datos={d.mesMP} />
              </dl>

              {d.porDia?.length > 0 && (
                <section>
                  <h2 className="seccion__titulo">Lo que entró por Mercado Pago (14 días)</h2>
                  <div className="barras" role="img" aria-label="Ingresos por día">
                    {d.porDia.map((x) => (
                      <div key={x.dia} className="barras__col" title={`${diaCorto(x.dia)}: ${pesos(x.bruto)}`}>
                        <span className="barras__barra" style={{ height: `${Math.max(4, (x.bruto / maxDia) * 100)}%` }} />
                        <small>{new Date(`${x.dia}T12:00:00`).getDate()}</small>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="seccion__titulo">Por liberarse · {pesos(d.porLiberar.total)}</h2>
                {d.porLiberar.calendario.length === 0 ? (
                  <p className="muted">Todo lo cobrado ya está liberado.</p>
                ) : (
                  <ul className="cuentas">
                    {d.porLiberar.calendario.map((c) => (
                      <li key={c.dia} className="fila-dato">
                        <CalendarClock size={20} strokeWidth={1.6} className="icono-suave" />
                        <span>{diaCorto(c.dia)}</span>
                        <strong>{pesos(c.monto)}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          <section>
            <h2 className="seccion__titulo">Gastos fijos del mes · falta pagar {pesos(d.porPagar)}</h2>
            {d.compromisos.length === 0 ? (
              <div className="vacio">
                <p>
                  <strong>Anota los gastos fijos</strong> (arriendo, luz, préstamo…) para que el portal te diga cuánto queda libre de verdad.
                </p>
                <button
                  type="button"
                  className="btn btn--sm"
                  disabled={cargandoFijos}
                  onClick={async () => {
                    if (cargandoFijos) return;
                    setCargandoFijos(true);
                    for (const f of FIJOS_SUGERIDOS) await post('plata/compromisos', f).catch(() => {});
                    setCargandoFijos(false);
                    mostrar('Cargué los gastos fijos de tu planilla. Ajusta los montos si cambiaron.');
                    cargar();
                  }}
                >
                  {cargandoFijos ? 'Cargando…' : 'Cargar los de mi planilla'}
                </button>
              </div>
            ) : (
              <ul className="cuentas">
                {d.compromisos.map((c) => (
                  <li key={c.id} className={`compromiso ${c.pagado ? 'is-pagado' : ''}`}>
                    <button
                      type="button"
                      className="compromiso__check"
                      aria-pressed={c.pagado}
                      aria-label={c.pagado ? `Marcar ${c.nombre} como no pagado` : `Marcar ${c.nombre} como pagado`}
                      onClick={() => accion(`plata/compromisos/${c.id}`, { pagado: !c.pagado }, c.pagado ? null : `${c.nombre}: pagado.`)}
                    >
                      {c.pagado && <Check size={16} strokeWidth={2.4} />}
                    </button>
                    <span className="compromiso__texto">
                      <strong>{c.nombre}</strong>
                      <small>{c.dia ? `vence el ${c.dia}` : 'sin fecha'}</small>
                    </span>
                    <strong className="compromiso__monto">{pesos(c.monto)}</strong>
                    <button type="button" className="icono-boton" aria-label={`Editar ${c.nombre}`} onClick={() => setHoja({ tipo: 'compromiso', c })}>
                      <Pencil size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="portal__link" onClick={() => setHoja({ tipo: 'compromiso' })}>
              + Agregar gasto fijo
            </button>
          </section>

          {d.conectado && d.ultimos?.length > 0 && (
            <section>
              <h2 className="seccion__titulo">Últimos pagos</h2>
              <ul className="cuentas">
                {d.ultimos.map((p) => (
                  <li key={p.id} className={`pago ${p.estado !== 'approved' ? 'is-fallido' : ''}`}>
                    <span className="pago__texto">
                      <strong>{pesos(p.bruto)}</strong>
                      <small>
                        {hora(p.fecha)} · {MEDIOS[p.medio] ?? p.medio ?? '—'}
                        {p.estado !== 'approved' ? ` · ${p.estadoTexto ?? p.estado}` : ''}
                      </small>
                    </span>
                    {p.estado === 'approved' && (
                      <span className="pago__neto">
                        neto {pesos(p.neto)}
                        <small>{p.liberado ? 'liberado' : 'por liberar'}</small>
                      </span>
                    )}
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

      {hoja?.tipo === 'saldo' && (
        <Hoja titulo="Saldo en Mercado Pago" onCerrar={() => setHoja(null)}>
          <p className="muted">Abre la app de Mercado Pago y escribe el «Dinero disponible» que aparece arriba.</p>
          <form
            className="hoja__form"
            onSubmit={(e) => {
              e.preventDefault();
              accion('plata/saldo', { monto: new FormData(e.currentTarget).get('monto') }, 'Saldo actualizado.');
            }}
          >
            <input name="monto" className="input pesada__input" inputMode="numeric" placeholder="$" autoFocus required />
            <button type="submit" className="btn">
              Guardar
            </button>
          </form>
        </Hoja>
      )}
      {hoja?.tipo === 'compromiso' && (
        <Hoja titulo={hoja.c ? hoja.c.nombre : 'Gasto fijo nuevo'} onCerrar={() => setHoja(null)}>
          <form
            className="hoja__form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              if (hoja.c) accion(`plata/compromisos/${hoja.c.id}`, { monto: f.get('monto') }, 'Monto actualizado.');
              else accion('plata/compromisos', { nombre: f.get('nombre'), monto: f.get('monto'), dia: f.get('dia') }, 'Gasto fijo agregado.');
            }}
          >
            {!hoja.c && (
              <div className="field">
                <label htmlFor="cm-n">¿Qué es?</label>
                <input id="cm-n" name="nombre" className="input" placeholder="Ej.: Arriendo" required />
              </div>
            )}
            <div className="field">
              <label htmlFor="cm-m">Monto</label>
              <input id="cm-m" name="monto" className="input" inputMode="numeric" defaultValue={hoja.c?.monto ?? ''} required />
            </div>
            {!hoja.c && (
              <div className="field">
                <label htmlFor="cm-d">Día del mes en que se paga (opcional)</label>
                <input id="cm-d" name="dia" className="input" inputMode="numeric" placeholder="28" />
              </div>
            )}
            <div className="hoja__acciones">
              <button type="submit" className="btn">
                <Plus size={16} /> Guardar
              </button>
              {hoja.c && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => window.confirm(`¿Quitar ${hoja.c.nombre}?`) && accion(`plata/compromisos/${hoja.c.id}`, { borrar: true }, 'Quitado.')}
                >
                  <Trash2 size={16} /> Quitar
                </button>
              )}
            </div>
          </form>
        </Hoja>
      )}
    </div>
  );
};

export default Plata;
