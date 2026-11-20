import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, PlusIcon, SearchIcon, WhatsAppIcon } from '../components/common/Icons';
import { api, post } from './api';
import Hoja from './Hoja';
import FichaClienta from './FichaClienta';
import { leerCsv, leerVcf, limpiarNombre, mostrarTelefono, prepararContactos } from './contactos';

const FILTROS = [
  ['todas', 'Todas'],
  ['30', '+30 días sin venir'],
  ['60', '+60 días'],
  ['90', '+90 días'],
  ['sin', 'Sin visitas anotadas'],
];

const haceCuanto = (c) => {
  if (c.diasSinVenir === null) return 'Sin visitas anotadas';
  if (c.diasSinVenir === 0) return 'Vino hoy';
  if (c.diasSinVenir === 1) return 'Vino ayer';
  if (c.diasSinVenir < 60) return `Vino hace ${c.diasSinVenir} días`;
  const meses = Math.round(c.diasSinVenir / 30);
  return `Vino hace ${meses} meses`;
};

const fechaLarga = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const puedeElegirContactos = () => typeof navigator !== 'undefined' && 'contacts' in navigator && 'select' in (navigator.contacts ?? {});

const waUrl = (c) =>
  `https://wa.me/${c.telefono.replace('+', '')}?text=${encodeURIComponent(`Hola ${c.nombre.split(' ')[0]}! Te escribimos de Naamá Studio 🤍`)}`;

/* ── Subir un contacto (todas) ─────────────────────────── */

const SubirContacto = ({ multiple, onListo, onCerrar }) => {
  const [elegidos, setElegidos] = useState(null); // contactos sacados de la agenda
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const agenda = puedeElegirContactos();

  const elegir = async () => {
    setError('');
    try {
      const sel = await navigator.contacts.select(['name', 'tel'], { multiple });
      const lista = sel
        .flatMap((c) => (c.tel?.length ? [{ original: c.name?.[0] ?? '', telefono: c.tel[0] }] : []))
        .slice(0, multiple ? 1000 : 1);
      if (!lista.length) {
        setError('Ese contacto no tiene número.');
        return;
      }
      setElegidos(prepararContactos(lista).map((p) => ({ ...p, incluir: p.valido && !p.repetido })));
    } catch {
      // la persona cerró la agenda sin elegir
    }
  };

  const subir = async (contactos, origen) => {
    setError('');
    setEnviando(true);
    try {
      const r = await post('clientas', { contactos, origen });
      onListo(r);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <Hoja titulo="Subir clienta" onCerrar={onCerrar}>
      {agenda && !elegidos && (
        <div className="subir">
          <button type="button" className="btn subir__agenda" onClick={elegir}>
            <PlusIcon /> Elegir de mis contactos
          </button>
          <p className="muted subir__ayuda">Se abre la agenda de tu celular: toca a la clienta y listo.</p>
          <p className="subir__o">o escríbela a mano</p>
        </div>
      )}

      {elegidos && (
        <div className="hoja__form">
          {elegidos.map((c, i) => (
            <div key={i} className="field">
              <label htmlFor={`el-${i}`}>
                {c.telefono ? mostrarTelefono(c.telefono) : 'Número no válido'}
                {c.original !== c.nombre && <small className="subir__antes"> · estaba como «{c.original}»</small>}
              </label>
              <input
                id={`el-${i}`}
                className="input"
                value={c.nombre}
                onChange={(e) => setElegidos((xs) => xs.map((x, j) => (j === i ? { ...x, nombre: e.target.value, editado: true } : x)))}
              />
            </div>
          ))}
          {error && <p className="portal-error" role="alert">{error}</p>}
          <div className="hoja__acciones">
            <button
              type="button"
              className="btn"
              disabled={enviando || !elegidos.some((c) => c.telefono)}
              onClick={() =>
                subir(
                  elegidos.filter((c) => c.telefono).map((c) => ({ nombre: c.nombre, telefono: c.telefono, editado: true, nota: c.nota })),
                  'contacto',
                )
              }
            >
              {enviando ? 'Guardando…' : 'Guardar'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setElegidos(null)}>
              Elegir otra
            </button>
          </div>
        </div>
      )}

      {!elegidos && (
        <form
          className="hoja__form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const limpio = limpiarNombre(f.get('nombre'));
            subir([{ nombre: limpio.nombre || f.get('nombre'), telefono: f.get('telefono'), editado: true, nota: f.get('nota') || limpio.nota }], 'manual');
          }}
        >
          <div className="field">
            <label htmlFor="sc-nombre">Nombre</label>
            <input id="sc-nombre" name="nombre" className="input" required autoComplete="off" autoCapitalize="words" />
          </div>
          <div className="field">
            <label htmlFor="sc-tel">Número</label>
            <input id="sc-tel" name="telefono" className="input" type="tel" inputMode="tel" placeholder="9 1234 5678" required autoComplete="off" />
          </div>
          <div className="field">
            <label htmlFor="sc-nota">Nota (opcional)</label>
            <input id="sc-nota" name="nota" className="input" placeholder="Ej.: uñas, viene con su hija" autoComplete="off" />
          </div>
          {error && <p className="portal-error" role="alert">{error}</p>}
          <button type="submit" className="btn" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Guardar clienta'}
          </button>
        </form>
      )}
    </Hoja>
  );
};

/* ── Importar contactos desde un archivo (Administración) ── */

const PALABRA_CLIENTA = /client/i;

const Importar = ({ onListo, onCerrar }) => {
  const [lista, setLista] = useState(null);
  const [soloClientas, setSoloClientas] = useState(true);
  const [busca, setBusca] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const leer = async (archivo) => {
    setError('');
    const texto = await archivo.text();
    const crudos = /BEGIN:VCARD/i.test(texto) ? leerVcf(texto) : leerCsv(texto);
    if (!crudos.length) {
      setError('No encontré contactos con número en ese archivo.');
      return;
    }
    // Si el archivo es la agenda completa (muchos contactos), partimos mostrando solo los que dicen «clienta».
    const hayClientas = crudos.length > 300 && crudos.some((c) => PALABRA_CLIENTA.test(c.original));
    setSoloClientas(hayClientas);
    setLista(
      prepararContactos(crudos).map((p) => ({
        ...p,
        esClienta: PALABRA_CLIENTA.test(p.original),
        incluir: p.valido && !p.repetido && (!hayClientas || PALABRA_CLIENTA.test(p.original)),
      })),
    );
  };

  const visibles = useMemo(() => {
    if (!lista) return [];
    const q = busca.trim().toLowerCase();
    return lista
      .map((c, i) => ({ ...c, i }))
      .filter((c) => !soloClientas || c.esClienta)
      .filter((c) => !q || c.original.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q));
  }, [lista, soloClientas, busca]);

  const marcadas = lista?.filter((c) => c.incluir) ?? [];
  const cambiar = (i, cambios) => setLista((xs) => xs.map((x, j) => (j === i ? { ...x, ...cambios } : x)));

  return (
    <Hoja titulo="Importar contactos" onCerrar={onCerrar}>
      {!lista && (
        <div className="hoja__form">
          <ol className="pasos-ayuda">
            <li>
              En tu <strong>iPhone</strong>: abre <em>Contactos</em> → <em>Listas</em> → mantén apretado <em>Todos los contactos</em> →{' '}
              <em>Exportar</em> → <em>Guardar en Archivos</em>.
            </li>
            <li>
              En <strong>Android</strong>: <em>Contactos</em> → <em>Arreglar y gestionar</em> → <em>Exportar a archivo</em>.
            </li>
            <li>Elige ese archivo aquí abajo. Nada se sube hasta que revises la lista.</li>
          </ol>
          <label className="btn subir__archivo">
            <PlusIcon /> Elegir archivo (.vcf o .csv)
            <input type="file" accept=".vcf,.csv,text/vcard,text/x-vcard,text/csv" className="visually-hidden" onChange={(e) => e.target.files[0] && leer(e.target.files[0])} />
          </label>
          {error && <p className="portal-error" role="alert">{error}</p>}
        </div>
      )}

      {lista && (
        <div className="hoja__form">
          <p className="muted">
            Encontré <strong>{lista.length}</strong> contactos. Limpié los nombres (saqué «clienta», emojis y servicios, que quedan como nota). Revisa y
            desmarca los que no son clientas.
          </p>
          <div className="herramientas__chips">
            <button type="button" className="chip" aria-pressed={soloClientas} onClick={() => setSoloClientas(true)}>
              Solo los que dicen «clienta» ({lista.filter((c) => c.esClienta).length})
            </button>
            <button type="button" className="chip" aria-pressed={!soloClientas} onClick={() => setSoloClientas(false)}>
              Todos ({lista.length})
            </button>
          </div>
          <label className="buscador">
            <SearchIcon />
            <span className="visually-hidden">Buscar en la lista</span>
            <input className="input" placeholder="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </label>
          <div className="importar__marcar">
            <button type="button" className="portal__link" onClick={() => visibles.forEach((c) => c.valido && !c.repetido && cambiar(c.i, { incluir: true }))}>
              Marcar todos
            </button>
            <button type="button" className="portal__link" onClick={() => visibles.forEach((c) => cambiar(c.i, { incluir: false }))}>
              Desmarcar todos
            </button>
          </div>
          <ul className="importar">
            {visibles.slice(0, 400).map((c) => (
              <li key={c.i} className={`importar__fila ${c.valido && !c.repetido ? '' : 'is-mala'} ${c.revisar ? 'is-revisar' : ''}`}>
                <input
                  type="checkbox"
                  aria-label={`Incluir ${c.nombre}`}
                  checked={c.incluir}
                  disabled={!c.telefono || c.repetido}
                  onChange={(e) => cambiar(c.i, { incluir: e.target.checked })}
                />
                <div className="importar__datos">
                  <input
                    className="importar__nombre"
                    value={c.nombre}
                    placeholder="Escribe el nombre"
                    onChange={(e) => cambiar(c.i, { nombre: e.target.value, editado: true, valido: Boolean(c.telefono && e.target.value.trim()) })}
                  />
                  <span className="importar__meta">
                    {c.telefono ? mostrarTelefono(c.telefono) : 'Número no válido'}
                    {c.repetido && ' · repetido'}
                    {c.revisar && ' · escribe su nombre'}
                    {c.original !== c.nombre && ` · estaba como «${c.original}»`}
                    {c.nota && ` · nota: ${c.nota}`}
                  </span>
                </div>
              </li>
            ))}
            {visibles.length > 400 && <li className="muted">Mostrando 400 de {visibles.length}. Usa el buscador para ver el resto.</li>}
          </ul>
          {error && <p className="portal-error" role="alert">{error}</p>}
          <div className="hoja__acciones hoja__acciones--pegadas">
            <button
              type="button"
              className="btn"
              disabled={enviando || !marcadas.length}
              onClick={async () => {
                setEnviando(true);
                setError('');
                try {
                  const r = await post('clientas', {
                    origen: 'archivo',
                    contactos: marcadas.filter((c) => c.nombre.trim()).map((c) => ({ nombre: c.nombre, telefono: c.telefono, editado: true, nota: c.nota })),
                  });
                  onListo(r);
                } catch (err) {
                  setError(err.message);
                  setEnviando(false);
                }
              }}
            >
              {enviando ? 'Subiendo…' : `Subir ${marcadas.length} clientas`}
            </button>
          </div>
        </div>
      )}
    </Hoja>
  );
};

/* ── Ficha de una clienta ─────────────────────────────── */

const Ficha = ({ clienta, verNumeros, yo, onCambio, onCerrar }) => {
  const [visitas, setVisitas] = useState(null);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    api(`clientas/${clienta.id}/visitas`)
      .then((r) => setVisitas(r.visitas))
      .catch((err) => setError(err.message));
  }, [clienta.id, clienta.visitas]);

  return (
    <Hoja titulo={clienta.nombre} onCerrar={onCerrar}>
      <p className="ficha__resumen">
        {haceCuanto(clienta)}
        {clienta.visitas > 0 && ` · ${clienta.visitas} ${clienta.visitas === 1 ? 'visita anotada' : 'visitas anotadas'}`}
        {clienta.nota && <span className="muted"> · {clienta.nota}</span>}
      </p>
      {verNumeros && clienta.telefono && (
        <div className="hoja__acciones">
          <a className="btn" href={waUrl(clienta)} target="_blank" rel="noreferrer">
            <WhatsAppIcon /> {mostrarTelefono(clienta.telefono)}
          </a>
          <a className="btn btn--ghost" href={`tel:${clienta.telefono}`}>
            Llamar
          </a>
        </div>
      )}

      <FichaClienta clienta={clienta} yo={yo} />

      <form
        className="ficha__otra"
        onSubmit={async (e) => {
          e.preventDefault();
          const fecha = new FormData(e.currentTarget).get('fecha');
          try {
            const r = await post(`clientas/${clienta.id}/visita`, { fecha });
            onCambio(r.clienta);
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        <div className="field">
          <label htmlFor="fv">Anotar una visita de otro día</label>
          <input id="fv" name="fecha" type="date" className="input" required />
        </div>
        <button type="submit" className="btn btn--ghost btn--sm">
          Anotar
        </button>
      </form>

      <div>
        <p className="grupo__titulo">Visitas</p>
        {!visitas && !error && <p className="muted">Cargando…</p>}
        {visitas?.length === 0 && <p className="muted">Todavía no hay visitas anotadas.</p>}
        <ul className="ficha__visitas">
          {visitas?.map((v) => (
            <li key={v.fecha}>
              <span>{fechaLarga(v.fecha)}</span>
              {v.anotadaPor && <small>anotó {v.anotadaPor}</small>}
            </li>
          ))}
        </ul>
      </div>

      {verNumeros && !editando && (
        <button type="button" className="portal__link" onClick={() => setEditando(true)}>
          Editar datos
        </button>
      )}
      {verNumeros && editando && (
        <form
          className="hoja__form"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            try {
              const r = await post(`clientas/${clienta.id}`, { nombre: f.get('nombre'), telefono: f.get('telefono'), nota: f.get('nota') });
              onCambio(r.clienta);
              setEditando(false);
            } catch (err) {
              setError(err.message);
            }
          }}
        >
          <div className="field">
            <label htmlFor="ed-n">Nombre</label>
            <input id="ed-n" name="nombre" className="input" defaultValue={clienta.nombre} required />
          </div>
          <div className="field">
            <label htmlFor="ed-t">Número</label>
            <input id="ed-t" name="telefono" type="tel" className="input" defaultValue={clienta.telefono} required />
          </div>
          <div className="field">
            <label htmlFor="ed-o">Nota</label>
            <input id="ed-o" name="nota" className="input" defaultValue={clienta.nota ?? ''} />
          </div>
          <div className="hoja__acciones">
            <button type="submit" className="btn">
              Guardar
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={async () => {
                if (!window.confirm(`¿Quitar a ${clienta.nombre} de la lista?`)) return;
                try {
                  await post(`clientas/${clienta.id}`, { activa: false });
                  onCambio({ ...clienta, quitada: true });
                } catch (err) {
                  setError(err.message);
                }
              }}
            >
              Quitar de la lista
            </button>
          </div>
        </form>
      )}
      {error && <p className="portal-error" role="alert">{error}</p>}
    </Hoja>
  );
};

/* ── Página ───────────────────────────────────────────── */


/* ── Repetidas (Administración): mismo número con distintos nombres ── */
const fin4 = (t) => String(t ?? '').replace(/\D/g, '').slice(-4);

const Repetidas = ({ onCambio }) => {
  const [d, setD] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const [nombres, setNombres] = useState({});
  const [ocupado, setOcupado] = useState(null);
  const [error, setError] = useState('');
  const cargar = useCallback(() => api('clientas/repetidas').then(setD).catch(() => {}), []);
  useEffect(() => {
    cargar();
  }, [cargar]);
  if (!d || (!d.mismoNumero.length && !d.mismoNombre.length)) return null;

  const juntar = async (grupo, quedaId) => {
    setOcupado(quedaId);
    setError('');
    try {
      const nombre = nombres[grupo[0].id] ?? grupo.find((c) => c.id === quedaId).nombre;
      for (const c of grupo) if (c.id !== quedaId) await post(`clientas/${quedaId}/juntar`, { con: c.id, nombre });
      await cargar();
      onCambio(`Listo: quedó una sola «${nombre}» con todas sus visitas.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(null);
    }
  };
  const renombrar = async (c, nombre) => {
    if (!nombre.trim() || nombre.trim() === c.nombre) return;
    try {
      await post(`clientas/${c.id}`, { nombre });
      await cargar();
      onCambio(`Guardado: ${nombre.trim()}.`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className={`repetidas ${abierto ? 'is-open' : ''}`}>
      <button type="button" className="repetidas__cabeza" onClick={() => setAbierto((x) => !x)} aria-expanded={abierto}>
        <span className="repetidas__icono" aria-hidden="true">!</span>
        <span>
          <strong>
            {d.mismoNumero.length > 0
              ? `${d.mismoNumero.length === 1 ? 'Hay 1 clienta repetida' : `Hay ${d.mismoNumero.length} clientas repetidas`}`
              : 'Clientas con el mismo nombre'}
          </strong>
          <small>Toca para revisarlas y dejarlas ordenadas</small>
        </span>
      </button>
      {abierto && (
        <div className="repetidas__cuerpo">
          {error && <p className="portal-error">{error}</p>}
          {d.mismoNumero.map((g) => (
            <div key={g[0].id} className="repetida">
              <p className="repetida__titulo">Mismo número (…{fin4(g[0].telefono)}), distinto nombre</p>
              <label className="field">
                <span>¿Cómo se llama?</span>
                <input
                  className="input"
                  value={nombres[g[0].id] ?? g[0].nombre}
                  onChange={(e) => setNombres((n) => ({ ...n, [g[0].id]: e.target.value }))}
                />
              </label>
              <div className="repetida__opciones">
                {g.map((c) => (
                  <button key={c.id} type="button" className="chip" onClick={() => setNombres((n) => ({ ...n, [g[0].id]: c.nombre }))}>
                    {c.nombre}
                    {c.visitas ? ` · ${c.visitas} visita${c.visitas > 1 ? 's' : ''}` : ''}
                  </button>
                ))}
              </div>
              <button type="button" className="btn" disabled={ocupado !== null} onClick={() => juntar(g, [...g].sort((a, b) => b.visitas - a.visitas)[0].id)}>
                {ocupado ? 'Juntando…' : 'Juntar en una sola'}
              </button>
            </div>
          ))}
          {d.mismoNombre.length > 0 && (
            <div className="repetida">
              <p className="repetida__titulo">Mismo nombre, distinto número</p>
              <p className="muted repetida__ayuda">Son personas distintas. Ponles el apellido (o algo que las diferencie) para no confundirlas.</p>
              {d.mismoNombre.flat().map((c) => (
                <label key={c.id} className="repetida__fila">
                  <span>…{fin4(c.telefono)}</span>
                  <input className="input" defaultValue={c.nombre} onBlur={(e) => renombrar(c, e.target.value)} />
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};


/* ── Visitas por confirmar (Administración): la planilla y Mi mes traen nombres que calzan con varias clientas ── */
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const mesCorto = (iso) => (iso ? `${Number(iso.slice(8, 10))} ${MESES_CORTOS[Number(iso.slice(5, 7)) - 1]}` : '');
const cuandoFue = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' });
};
const sinTildes = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const GrupoPorConfirmar = ({ g, clientas, ocupado, onElegir, onDescartar }) => {
  const [buscar, setBuscar] = useState('');
  const q = sinTildes(buscar.trim());
  const encontradas = q.length >= 2 ? clientas.filter((c) => sinTildes(c.nombre).includes(q)).slice(0, 6) : [];
  const rango = g.desde === g.hasta ? mesCorto(g.desde) : `${mesCorto(g.desde)} → ${mesCorto(g.hasta)}`;
  return (
    <div className="repetida confirmar">
      <div className="confirmar__cabeza">
        <strong className="confirmar__nombre">«{g.nombre}»</strong>
        <span className="confirmar__dato">
          {g.n === 1 ? '1 visita' : `${g.n} visitas`} · {rango}
        </span>
        <span className="confirmar__origen">Anotado en: {g.origenes.join(', ')}</span>
      </div>
      <p className="confirmar__pregunta">{g.candidatas.length ? '¿Cuál de estas es?' : 'No la encontré en tus clientas. Búscala:'}</p>
      {g.candidatas.length > 0 && (
        <div className="repetida__opciones">
          {g.candidatas.map((c) => (
            <button key={c.id} type="button" className="chip chip--elegir" disabled={ocupado} onClick={() => onElegir(g, c)}>
              {c.nombre}
              {c.visitas ? <small> · {c.visitas} visita{c.visitas > 1 ? 's' : ''}</small> : null}
            </button>
          ))}
        </div>
      )}
      <label className="buscador confirmar__buscar">
        <SearchIcon />
        <span className="visually-hidden">Buscar otra clienta</span>
        <input className="input" placeholder={g.candidatas.length ? 'Es otra: buscar por nombre' : 'Buscar por nombre o apellido'} value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      </label>
      {encontradas.length > 0 && (
        <div className="repetida__opciones">
          {encontradas.map((c) => (
            <button key={c.id} type="button" className="chip chip--elegir" disabled={ocupado} onClick={() => onElegir(g, c)}>
              {c.nombre}
            </button>
          ))}
        </div>
      )}
      {q.length >= 2 && !encontradas.length && <p className="muted repetida__ayuda">No hay ninguna clienta con ese nombre. Súbela primero y sus visitas se anotan solas.</p>}
      <button type="button" className="link-btn confirmar__descartar" disabled={ocupado} onClick={() => onDescartar(g)}>
        No es una clienta (sacar de la lista)
      </button>
    </div>
  );
};

const SinClienta = ({ sin, clientas, ocupado, onElegir, onDescartar }) => {
  const [elegido, setElegido] = useState(null);
  const g = sin.lista.find((x) => x.clave === elegido);
  return (
    <div className="sinclienta">
      <p className="repetida__titulo">No están en tus clientas</p>
      <p className="muted repetida__ayuda">
        {sin.nombres === 1 ? '1 nombre' : `${sin.nombres.toLocaleString('es-CL')} nombres`} ({sin.visitas.toLocaleString('es-CL')} visitas) que no
        encontré en los contactos. Cuando subas a esa clienta, sus visitas se anotan solas. Si ya está con otro nombre, tócala y búscala.
      </p>
      <div className="repetida__opciones">
        {sin.lista.map((x) => (
          <button key={x.clave} type="button" className="chip" aria-pressed={elegido === x.clave} onClick={() => setElegido(elegido === x.clave ? null : x.clave)}>
            {x.nombre} · {x.n}
          </button>
        ))}
      </div>
      {g && <GrupoPorConfirmar key={g.clave} g={g} clientas={clientas} ocupado={ocupado} onElegir={onElegir} onDescartar={onDescartar} />}
    </div>
  );
};

const PorConfirmar = ({ clientas, onCambio }) => {
  const [d, setD] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [trayendo, setTrayendo] = useState(false);
  const [error, setError] = useState('');
  const cargar = useCallback(() => api('visitas/por-confirmar').then(setD).catch(() => {}), []);
  useEffect(() => {
    cargar();
  }, [cargar]);
  if (!d) return null;

  const elegir = async (g, c) => {
    setOcupado(true);
    setError('');
    try {
      const r = await post('visitas/por-confirmar', { clave: g.clave, clientaId: c.id });
      await cargar();
      onCambio(`Listo: ${r.anotadas === 1 ? '1 visita anotada' : `${r.anotadas} visitas anotadas`} a ${c.nombre}.`);
    } catch (err) {
      setError(err.message);
    }
    setOcupado(false);
  };
  const descartar = async (g) => {
    setOcupado(true);
    try {
      await post('visitas/por-confirmar', { clave: g.clave, descartar: true });
      await cargar();
    } catch (err) {
      setError(err.message);
    }
    setOcupado(false);
  };
  const traer = async () => {
    setTrayendo(true);
    setError('');
    try {
      const r = await post('visitas/planilla', {});
      setD(r);
      const x = r.resultado ?? {};
      if (x.error) setError(x.error);
      else onCambio(x.anotadas ? `Listo: ${x.anotadas} visitas nuevas desde la planilla.` : 'La planilla ya estaba al día.');
    } catch (err) {
      setError(err.message);
    }
    setTrayendo(false);
  };

  const p = d.planilla;
  const estadoPlanilla = !d.planillaConectada
    ? 'La planilla todavía no está conectada.'
    : p?.error
      ? `No se pudo leer la planilla (${cuandoFue(p.ts)}).`
      : p
        ? `Planilla revisada el ${cuandoFue(p.ts)} · ${p.filas.toLocaleString('es-CL')} filas${p.quedan ? ` · faltan ${p.quedan}` : ''}`
        : 'La planilla se revisa sola una vez al día.';
  const hay = d.totalGrupos > 0;
  const sin = d.sinClienta ?? { nombres: 0, visitas: 0, lista: [] };

  return (
    <section className={`repetidas porconfirmar ${abierto ? 'is-open' : ''} ${hay ? '' : 'is-ok'}`}>
      <button type="button" className="repetidas__cabeza" onClick={() => setAbierto((x) => !x)} aria-expanded={abierto}>
        <span className="repetidas__icono" aria-hidden="true">{hay ? '?' : <CheckIcon />}</span>
        <span>
          <strong>
            {hay
              ? `${d.totalVisitas === 1 ? '1 visita' : `${d.totalVisitas.toLocaleString('es-CL')} visitas`} por confirmar`
              : 'Las visitas se anotan solas'}
          </strong>
          <small>
            {hay
              ? `${d.totalGrupos === 1 ? '1 nombre calza' : `${d.totalGrupos} nombres calzan`} con más de una clienta. Toca para elegir cuál es.`
              : 'Desde Mi mes, la agenda, Servicios y la planilla del año.'}
          </small>
        </span>
      </button>
      {abierto && (
        <div className="repetidas__cuerpo">
          <div className="porconfirmar__planilla">
            <span>{estadoPlanilla}</span>
            {d.planillaConectada && (
              <button type="button" className="btn btn--sm btn--ghost" disabled={trayendo} onClick={traer}>
                {trayendo ? 'Leyendo la planilla…' : p?.quedan ? 'Seguir trayendo' : 'Traer ahora'}
              </button>
            )}
          </div>
          {error && <p className="portal-error">{error}</p>}
          {d.grupos.map((g) => (
            <GrupoPorConfirmar key={g.clave} g={g} clientas={clientas} ocupado={ocupado} onElegir={elegir} onDescartar={descartar} />
          ))}
          {d.totalGrupos > d.grupos.length && <p className="muted repetida__ayuda">Van los {d.grupos.length} nombres con más visitas. Al confirmarlos aparecen los que siguen.</p>}
          {sin.nombres > 0 && (
            <SinClienta sin={sin} clientas={clientas} ocupado={ocupado} onElegir={elegir} onDescartar={descartar} />
          )}
        </div>
      )}
    </section>
  );
};

const Clientas = ({ cuenta }) => {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [orden, setOrden] = useState('dias');
  const [hoja, setHoja] = useState(null);
  const [marcando, setMarcando] = useState(null);
  const avisoT = useRef();

  const cargar = useCallback(async () => {
    try {
      setDatos(await api('clientas'));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const mostrarAviso = (t) => {
    setAviso(t);
    clearTimeout(avisoT.current);
    avisoT.current = setTimeout(() => setAviso(''), 4000);
  };

  const actualizar = (c) =>
    setDatos((d) => ({
      ...d,
      clientas: c.quitada ? d.clientas.filter((x) => x.id !== c.id) : d.clientas.map((x) => (x.id === c.id ? { ...x, ...c } : x)),
    }));

  const vinoHoy = async (c) => {
    setMarcando(c.id);
    try {
      const r = await post(`clientas/${c.id}/visita`);
      actualizar(r.clienta);
      mostrarAviso(r.yaEstaba ? `${c.nombre} ya estaba anotada hoy.` : `Listo: ${c.nombre} vino hoy.`);
    } catch (err) {
      mostrarAviso(err.message);
    }
    setMarcando(null);
  };

  const lista = useMemo(() => {
    if (!datos) return [];
    const q = busca.trim().toLowerCase();
    const sinTilde = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    return datos.clientas
      .filter((c) => !q || sinTilde(c.nombre).includes(sinTilde(q)) || (c.telefono ?? '').includes(q.replace(/\D/g, '') || '§'))
      .filter((c) => {
        if (filtro === 'sin') return c.diasSinVenir === null;
        if (filtro === 'todas') return true;
        return c.diasSinVenir !== null && c.diasSinVenir >= Number(filtro);
      })
      .sort((a, b) => {
        if (orden === 'nombre') return a.nombre.localeCompare(b.nombre, 'es');
        if (orden === 'nuevas') return b.creada.localeCompare(a.creada);
        return (b.diasSinVenir ?? -1) - (a.diasSinVenir ?? -1);
      });
  }, [datos, busca, filtro, orden]);

  const todas = datos?.clientas ?? [];
  const hoy = todas.filter((c) => c.diasSinVenir === 0).length;
  const perdidas = todas.filter((c) => c.diasSinVenir !== null && c.diasSinVenir >= 60).length;

  const alSubir = (r) => {
    setHoja(null);
    const partes = [`${r.creadas} ${r.creadas === 1 ? 'clienta nueva' : 'clientas nuevas'}`];
    if (r.repetidas) partes.push(`${r.repetidas} ya estaban${r.yaEstaban?.length === 1 ? ` (como «${r.yaEstaban[0]}»)` : ''}`);
    if (r.invalidas) partes.push(`${r.invalidas} sin número válido`);
    mostrarAviso(partes.join(' · '));
    cargar();
  };

  return (
    <div className="panel">
      <header className="panel__cabeza panel__cabeza--fila">
        <div>
          <span className="eyebrow">Clientas</span>
          <h1 className="panel__titulo">
            ¿Quién <em>vino?</em>
          </h1>
        </div>
        <div className="panel__botones">
          <button type="button" className="btn btn--sm solo-compu" onClick={() => setHoja({ tipo: 'subir' })}>
            <PlusIcon /> Subir clienta
          </button>
          {datos?.verNumeros && (
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => setHoja({ tipo: 'importar' })}>
              Importar contactos
            </button>
          )}
        </div>
      </header>

      {datos?.verNumeros && (
        <PorConfirmar
          clientas={todas}
          onCambio={(t) => {
            cargar();
            mostrarAviso(t);
          }}
        />
      )}

      {datos?.verNumeros && (
        <Repetidas
          onCambio={(t) => {
            cargar();
            mostrarAviso(t);
          }}
        />
      )}

      <dl className="cifras">
        <div>
          <dt>Clientas</dt>
          <dd>{datos ? todas.length : '–'}</dd>
        </div>
        <div>
          <dt>Vinieron hoy</dt>
          <dd>{datos ? hoy : '–'}</dd>
        </div>
        <div>
          <dt>+60 días sin venir</dt>
          <dd>{datos ? perdidas : '–'}</dd>
        </div>
      </dl>

      <div className="herramientas">
        <label className="buscador">
          <SearchIcon />
          <span className="visually-hidden">Buscar clienta</span>
          <input className="input" placeholder="Buscar clienta" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
        <div className="herramientas__chips">
          {FILTROS.map(([id, label]) => (
            <button key={id} type="button" className="chip" aria-pressed={filtro === id} onClick={() => setFiltro(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="herramientas__selects">
          <select className="input input--select" value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar">
            <option value="dias">Más tiempo sin venir</option>
            <option value="nombre">Nombre</option>
            <option value="nuevas">Recién agregadas</option>
          </select>
        </div>
      </div>

      {error && <p className="portal-error" role="alert">{error}</p>}
      {!datos && !error && <p className="muted">Cargando…</p>}
      {datos && todas.length === 0 && (
        <p className="acceso__nota">Todavía no hay clientas. Toca «Subir clienta» para agregar la primera.</p>
      )}

      <ul className="cuentas">
        {lista.slice(0, 300).map((c) => (
          <li key={c.id} className="clienta">
            <button type="button" className="cuenta clienta__fila" onClick={() => setHoja({ tipo: 'ficha', id: c.id })}>
              <span className="cuenta__mono" aria-hidden="true">
                {c.nombre.charAt(0)}
              </span>
              <span className="cuenta__main">
                <span className="cuenta__nombre">{c.nombre}</span>
                <span className="cuenta__meta">
                  {haceCuanto(c)}
                  {c.visitas > 1 && ` · ${c.visitas} visitas`}
                </span>
                {datos.verNumeros && c.telefono && <span className="cuenta__meta cuenta__tel">{mostrarTelefono(c.telefono)}</span>}
              </span>
              {c.diasSinVenir !== null && c.diasSinVenir >= 60 && <span className="etiqueta">Hace tiempo</span>}
            </button>
            <div className="clienta__acciones">
              {datos.verNumeros && c.telefono && (
                <a className="clienta__wa" href={waUrl(c)} target="_blank" rel="noreferrer" aria-label={`WhatsApp a ${c.nombre}`}>
                  <WhatsAppIcon />
                </a>
              )}
              <button
                type="button"
                className={`chip clienta__vino ${c.diasSinVenir === 0 ? 'is-active' : ''}`}
                disabled={marcando === c.id}
                onClick={() => vinoHoy(c)}
              >
                {c.diasSinVenir === 0 ? (
                  <>
                    <CheckIcon /> Vino hoy
                  </>
                ) : (
                  'Vino hoy'
                )}
              </button>
            </div>
          </li>
        ))}
        {lista.length > 300 && <li className="muted">Mostrando 300 de {lista.length}. Usa el buscador para encontrar al resto.</li>}
        {datos && todas.length > 0 && lista.length === 0 && <li className="muted">Ninguna clienta con ese filtro.</li>}
      </ul>

      <button type="button" className="fab" onClick={() => setHoja({ tipo: 'subir' })} aria-label="Subir clienta">
        <PlusIcon />
      </button>

      {aviso && (
        <p className="aviso" role="status">
          {aviso}
        </p>
      )}

      {hoja?.tipo === 'subir' && <SubirContacto multiple={Boolean(datos?.verNumeros)} onListo={alSubir} onCerrar={() => setHoja(null)} />}
      {hoja?.tipo === 'importar' && <Importar onListo={alSubir} onCerrar={() => setHoja(null)} />}
      {hoja?.tipo === 'ficha' && (
        <Ficha
          yo={cuenta}
          clienta={todas.find((c) => c.id === hoja.id) ?? { id: hoja.id, nombre: '' }}
          verNumeros={datos?.verNumeros}
          onCambio={(c) => {
            actualizar(c);
            if (c.quitada) setHoja(null);
          }}
          onCerrar={() => setHoja(null)}
        />
      )}
    </div>
  );
};

export default Clientas;
