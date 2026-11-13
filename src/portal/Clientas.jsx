import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, PlusIcon, SearchIcon, WhatsAppIcon } from '../components/common/Icons';
import { api, post } from './api';
import Hoja from './Hoja';
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
    const hayClientas = crudos.some((c) => PALABRA_CLIENTA.test(c.original));
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
              <li key={c.i} className={`importar__fila ${c.valido && !c.repetido ? '' : 'is-mala'}`}>
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

const Ficha = ({ clienta, verNumeros, onCambio, onCerrar }) => {
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
          <input id="fv" name="fecha" type="date" className="input" required max={new Date().toLocaleDateString('en-CA')} />
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

const Clientas = () => {
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
          <button type="button" className="btn btn--sm" onClick={() => setHoja({ tipo: 'subir' })}>
            <PlusIcon /> Subir clienta
          </button>
          {datos?.verNumeros && (
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => setHoja({ tipo: 'importar' })}>
              Importar contactos
            </button>
          )}
        </div>
      </header>

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
                  {datos.verNumeros && c.telefono && ` · ${mostrarTelefono(c.telefono)}`}
                </span>
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

      {aviso && (
        <p className="aviso" role="status">
          {aviso}
        </p>
      )}

      {hoja?.tipo === 'subir' && <SubirContacto multiple={Boolean(datos?.verNumeros)} onListo={alSubir} onCerrar={() => setHoja(null)} />}
      {hoja?.tipo === 'importar' && <Importar onListo={alSubir} onCerrar={() => setHoja(null)} />}
      {hoja?.tipo === 'ficha' && (
        <Ficha
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
