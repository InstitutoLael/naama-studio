import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PlusIcon, SearchIcon, WhatsAppIcon } from '../components/common/Icons';
import { api, post } from './api';
import Hoja from './Hoja';
import { PERMISOS, ROLES, ROL_IDS } from './permisos';

const FILTROS = [
  ['todas', 'Todas'],
  ['hoy', 'Entró hoy'],
  ['nunca', 'No ha entrado'],
  ['inactivas', 'Desactivadas'],
];

const cuando = (iso) => {
  if (!iso) return 'Nunca ha entrado';
  const d = new Date(iso);
  return `Último ingreso: ${d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', timeZone: 'America/Santiago' })}, ${d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' })}`;
};

const mensajeClave = (c, clave) =>
  `Hola ${c.nombre}! Tu cuenta del portal de Naamá está lista.\n\nInstala la app aquí: ${window.location.origin}/portal/app\nCorreo: ${c.email}\nClave temporal: ${clave}\n\nAl entrar te va a pedir crear tu propia clave.`;

/** Selector de rol + permisos extra (reutilizado al crear y al editar). */
const RolYPermisos = ({ rol, extras, onRol, onExtras }) => {
  const base = ROLES[rol]?.permisos ?? [];
  return (
    <>
      <fieldset className="grupo">
        <legend>Rol</legend>
        <div className="roles">
          {ROL_IDS.map((r) => (
            <button key={r} type="button" className={`option ${rol === r ? 'is-selected' : ''}`} onClick={() => onRol(r)}>
              <span className="option__main">
                <span className="option__name">{ROLES[r].nombre}</span>
                <span className="option__meta">{ROLES[r].detalle}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="grupo">
        <legend>Permisos</legend>
        <ul className="permisos">
          {Object.entries(PERMISOS).map(([id, texto]) => {
            const porRol = base.includes(id);
            const marcado = porRol || extras.includes(id);
            return (
              <li key={id}>
                <label className={`permiso ${porRol ? 'is-fijo' : ''}`}>
                  <input
                    type="checkbox"
                    checked={marcado}
                    disabled={porRol}
                    onChange={(e) => onExtras(e.target.checked ? [...extras, id] : extras.filter((x) => x !== id))}
                  />
                  <span>{texto}</span>
                  {porRol && <small>por su rol</small>}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </>
  );
};

/** Muestra la clave temporal una sola vez, con botón para mandarla por WhatsApp. */
const ClaveLista = ({ cuenta, clave, onCerrar }) => (
  <Hoja titulo="Clave temporal" onCerrar={onCerrar}>
    <p className="muted">
      Mándale esto a <strong>{cuenta.nombre}</strong>. La clave se muestra solo esta vez.
    </p>
    <p className="clave-temporal">{clave}</p>
    <div className="hoja__acciones">
      <a className="btn" href={`https://wa.me/?text=${encodeURIComponent(mensajeClave(cuenta, clave))}`} target="_blank" rel="noreferrer">
        <WhatsAppIcon /> Mandar por WhatsApp
      </a>
      <button type="button" className="btn btn--ghost" onClick={() => navigator.clipboard?.writeText(mensajeClave(cuenta, clave))}>
        Copiar mensaje
      </button>
    </div>
  </Hoja>
);

const NuevaCuenta = ({ onCreada, onCerrar }) => {
  const [rol, setRol] = useState('equipo');
  const [extras, setExtras] = useState([]);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  return (
    <Hoja titulo="Nueva cuenta" onCerrar={onCerrar}>
      <form
        className="hoja__form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setError('');
          setEnviando(true);
          try {
            const r = await post('cuentas', { nombre: f.get('nombre'), email: f.get('email'), rol, extras });
            onCreada(r.cuenta, r.claveTemporal);
          } catch (err) {
            setError(err.message);
            setEnviando(false);
          }
        }}
      >
        <div className="field">
          <label htmlFor="nc-nombre">Nombre</label>
          <input id="nc-nombre" name="nombre" className="input" required autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="nc-email">Correo</label>
          <input id="nc-email" name="email" type="email" className="input" required autoComplete="off" />
        </div>
        <RolYPermisos rol={rol} extras={extras} onRol={setRol} onExtras={setExtras} />
        {error && <p className="portal-error" role="alert">{error}</p>}
        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
    </Hoja>
  );
};

const EditarCuenta = ({ cuenta, esYo, onGuardada, onClave, onCerrar }) => {
  const [rol, setRol] = useState(cuenta.rol);
  const [extras, setExtras] = useState(cuenta.extras);
  const [email, setEmail] = useState(cuenta.email);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const guardar = async (cambios) => {
    setError('');
    setEnviando(true);
    try {
      const r = await post(`cuentas/${cuenta.id}`, cambios);
      onGuardada(r.cuenta);
    } catch (err) {
      setError(err.message);
    }
    setEnviando(false);
  };
  return (
    <Hoja titulo={cuenta.nombre} onCerrar={onCerrar}>
      <div className="field">
        <label htmlFor="ec-email">Correo</label>
        <input id="ec-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
        {cuenta.email.endsWith('@pendiente.naamastudio.cl') && <small className="muted">Correo provisorio: pon el suyo y después «Restablecer clave» para mandarle su acceso.</small>}
      </div>
      <RolYPermisos rol={rol} extras={extras} onRol={setRol} onExtras={setExtras} />
      {error && <p className="portal-error" role="alert">{error}</p>}
      <div className="hoja__acciones">
        <button type="button" className="btn" disabled={enviando} onClick={() => guardar({ rol, extras, email })}>
          Guardar cambios
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          disabled={enviando}
          onClick={async () => {
            if (!window.confirm(`¿Restablecer la clave de ${cuenta.nombre}? Su clave actual deja de funcionar.`)) return;
            try {
              const r = await post(`cuentas/${cuenta.id}/restablecer`);
              onClave(cuenta, r.claveTemporal);
            } catch (err) {
              setError(err.message);
            }
          }}
        >
          Restablecer clave
        </button>
        {!esYo && (
          <button
            type="button"
            className="btn btn--ghost"
            disabled={enviando}
            onClick={() => {
              const texto = cuenta.activa
                ? `¿Desactivar a ${cuenta.nombre}? No podrá entrar hasta que la actives de nuevo.`
                : `¿Activar de nuevo a ${cuenta.nombre}?`;
              if (window.confirm(texto)) guardar({ activa: !cuenta.activa });
            }}
          >
            {cuenta.activa ? 'Desactivar' : 'Activar'}
          </button>
        )}
      </div>
    </Hoja>
  );
};

const Cuentas = ({ yo }) => {
  const [cuentas, setCuentas] = useState(null);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [rolFiltro, setRolFiltro] = useState('');
  const [orden, setOrden] = useState('ingreso');
  const [hoja, setHoja] = useState(null); // { tipo: 'nueva' | 'editar' | 'clave', ... }

  const cargar = useCallback(async () => {
    try {
      const r = await api('cuentas');
      setCuentas(r.cuentas);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 60000); // se actualiza sola cada minuto
    return () => clearInterval(t);
  }, [cargar]);

  const lista = useMemo(() => {
    if (!cuentas) return [];
    const q = busca.trim().toLowerCase();
    return cuentas
      .filter((c) => !q || c.nombre.toLowerCase().includes(q) || c.email.includes(q))
      .filter((c) => !rolFiltro || c.rol === rolFiltro)
      .filter((c) => {
        if (filtro === 'hoy') return c.activa && c.entroHoy;
        if (filtro === 'nunca') return c.activa && !c.ultimoIngreso;
        if (filtro === 'inactivas') return !c.activa;
        return c.activa;
      })
      .sort((a, b) =>
        orden === 'ingreso'
          ? (b.ultimoIngreso ?? '').localeCompare(a.ultimoIngreso ?? '')
          : orden === 'creada'
            ? b.creada.localeCompare(a.creada)
            : a.nombre.localeCompare(b.nombre, 'es'),
      );
  }, [cuentas, busca, filtro, rolFiltro, orden]);

  const activas = cuentas?.filter((c) => c.activa) ?? [];
  const hoy = activas.filter((c) => c.entroHoy).length;

  return (
    <div className="panel">
      <header className="panel__cabeza panel__cabeza--fila">
        <div>
          <span className="eyebrow">Dirección</span>
          <h1 className="panel__titulo">Equipo</h1>
        </div>
        <button type="button" className="btn btn--sm solo-compu" onClick={() => setHoja({ tipo: 'nueva' })}>
          <PlusIcon /> Nueva cuenta
        </button>
      </header>

      <dl className="cifras">
        <div>
          <dt>Cuentas activas</dt>
          <dd>{cuentas ? activas.length : '–'}</dd>
        </div>
        <div>
          <dt>Entraron hoy</dt>
          <dd>{cuentas ? hoy : '–'}</dd>
        </div>
        <div>
          <dt>Nunca han entrado</dt>
          <dd>{cuentas ? activas.filter((c) => !c.ultimoIngreso).length : '–'}</dd>
        </div>
      </dl>

      <div className="herramientas">
        <label className="buscador">
          <SearchIcon />
          <span className="visually-hidden">Buscar</span>
          <input className="input" placeholder="Buscar por nombre o correo" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
        <div className="herramientas__chips">
          {FILTROS.map(([id, label]) => (
            <button key={id} type="button" className="chip" aria-pressed={filtro === id} onClick={() => setFiltro(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="herramientas__selects">
          <select className="input input--select" value={rolFiltro} onChange={(e) => setRolFiltro(e.target.value)} aria-label="Filtrar por rol">
            <option value="">Todos los roles</option>
            {ROL_IDS.map((r) => (
              <option key={r} value={r}>
                {ROLES[r].nombre}
              </option>
            ))}
          </select>
          <select className="input input--select" value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar">
            <option value="ingreso">Último ingreso</option>
            <option value="creada">Más nuevas</option>
            <option value="nombre">Nombre</option>
          </select>
        </div>
      </div>

      {error && <p className="portal-error" role="alert">{error}</p>}
      {!cuentas && !error && <p className="muted">Cargando…</p>}

      <ul className="cuentas">
        {lista.map((c) => (
          <li key={c.id}>
            <button type="button" className={`cuenta ${c.activa ? '' : 'is-inactiva'}`} onClick={() => setHoja({ tipo: 'editar', cuenta: c })}>
              <span className="cuenta__mono" aria-hidden="true">
                {c.nombre.charAt(0)}
              </span>
              <span className="cuenta__main">
                <span className="cuenta__nombre">
                  {c.nombre} {c.id === yo.id && <small>(tú)</small>}
                </span>
                <span className="cuenta__meta">
                  {ROLES[c.rol]?.nombre} · {cuando(c.ultimoIngreso)}
                </span>
              </span>
              {c.entroHoy && <span className="punto-hoy">Hoy</span>}
              {c.debeCambiar && c.activa && <span className="etiqueta">Clave temporal</span>}
              {!c.activa && <span className="etiqueta">Desactivada</span>}
            </button>
          </li>
        ))}
        {cuentas && lista.length === 0 && <li className="muted">No hay cuentas con ese filtro.</li>}
      </ul>

      <button type="button" className="fab" onClick={() => setHoja({ tipo: 'nueva' })} aria-label="Nueva cuenta">
        <PlusIcon />
      </button>

      {hoja?.tipo === 'nueva' && (
        <NuevaCuenta
          onCerrar={() => setHoja(null)}
          onCreada={(c, clave) => {
            setCuentas((xs) => [...(xs ?? []), { ...c, entroHoy: false }]);
            setHoja({ tipo: 'clave', cuenta: c, clave });
          }}
        />
      )}
      {hoja?.tipo === 'editar' && (
        <EditarCuenta
          cuenta={hoja.cuenta}
          esYo={hoja.cuenta.id === yo.id}
          onCerrar={() => setHoja(null)}
          onGuardada={(c) => {
            setCuentas((xs) => xs.map((x) => (x.id === c.id ? { ...x, ...c } : x)));
            setHoja(null);
          }}
          onClave={(c, clave) => {
            setCuentas((xs) => xs.map((x) => (x.id === c.id ? { ...x, debeCambiar: true } : x)));
            setHoja({ tipo: 'clave', cuenta: c, clave });
          }}
        />
      )}
      {hoja?.tipo === 'clave' && <ClaveLista cuenta={hoja.cuenta} clave={hoja.clave} onCerrar={() => setHoja(null)} />}
    </div>
  );
};

export default Cuentas;
