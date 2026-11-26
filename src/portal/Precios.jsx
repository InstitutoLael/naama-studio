import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Pencil, Search, X } from 'lucide-react';
import { mundos, servicesForMundo } from '../data/categories';
import { servicesData } from '../data/servicesData';
import { agrupar, aNumero, enSecciones, normalizar } from '../data/menuPrecios';
import { refrescarPrecios, usePreciosVivos } from '../data/preciosVivos';
import { post } from './api';
import { puede } from './permisos';

const hay = (v) => v && String(v).trim() !== '' && v !== '---';
const plata = (v) => (/sin costo|gratis/i.test(String(v ?? '')) ? 'Sin costo' : aNumero(v) ? `$${aNumero(v).toLocaleString('es-CL')}` : 'Consultar');
const corto = (t = '') => t.replace(' horas', ' h').replace(' hora', ' h');

/** Precios del salón para responderle rápido a una clienta (los mismos de la página). */
/** Solo Diego y Allison: cambiar precio y tiempo de un servicio (o de cada largo). */
const EditarPrecio = ({ it, onListo }) => {
  const filas = it.variantes.length
    ? it.variantes.map((v) => ({ clave: `${it.cat}|${v.nombre}`, etiqueta: v.largo, precio: aNumero(v.price) || '', tiempo: v.time || '' }))
    : [{ clave: `${it.cat}|${it.name}`, etiqueta: 'Precio', precio: aNumero(it.price) || '', tiempo: it.time || '' }];
  const [v, setV] = useState(filas);
  const [estado, setEstado] = useState('');
  const guardar = async () => {
    setEstado('Guardando…');
    try {
      await post('precios-servicios', { cambios: v.map((f) => ({ clave: f.clave, precio: String(f.precio), tiempo: f.tiempo })) });
      await refrescarPrecios(true);
      setEstado('');
      onListo('Precio actualizado: ya se ve en la página y en el portal.');
    } catch (err) {
      setEstado(err.message);
    }
  };
  const volver = async () => {
    if (!window.confirm('¿Volver al precio original de la página?')) return;
    await post('precios-servicios', { cambios: v.map((f) => ({ clave: f.clave, volver: true })) });
    await refrescarPrecios(true);
    onListo('Volvió al precio original.');
  };
  return (
    <div className="editar-precio">
      {v.map((f, i) => (
        <div key={f.clave} className="editar-precio__fila">
          <span>{f.etiqueta}</span>
          <label className="con-signo">
            <b>$</b>
            <input
              className="input"
              inputMode="numeric"
              value={f.precio ? Number(f.precio).toLocaleString('es-CL') : ''}
              onChange={(e) => setV((xs) => xs.map((x, j) => (j === i ? { ...x, precio: e.target.value.replace(/\D/g, '') } : x)))}
            />
          </label>
          <input
            className="input editar-precio__tiempo"
            value={f.tiempo}
            placeholder="Ej.: 2 horas"
            onChange={(e) => setV((xs) => xs.map((x, j) => (j === i ? { ...x, tiempo: e.target.value } : x)))}
          />
        </div>
      ))}
      <div className="editar-precio__acciones">
        <button type="button" className="btn btn--sm" onClick={guardar} disabled={estado === 'Guardando…'}>
          Guardar precio
        </button>
        <button type="button" className="portal__link" onClick={volver}>
          Volver al original
        </button>
      </div>
      {estado && estado !== 'Guardando…' && <p className="portal-error">{estado}</p>}
    </div>
  );
};

const Precios = ({ cuenta }) => {
  const puedeCambiar = puede(cuenta, 'servicios');
  const [aviso, setAviso] = useState('');
  const [editando, setEditando] = useState(null);
  const versionPrecios = usePreciosVivos();
  const navegar = useNavigate();
  const [busca, setBusca] = useState('');
  const [mundo, setMundo] = useState('todos');
  const [abierto, setAbierto] = useState(null);

  const grupos = useMemo(() => {
    const palabras = normalizar(busca).split(/\s+/).filter(Boolean);
    return mundos
      .filter((m) => mundo === 'todos' || m.id === mundo)
      .map((m) => {
        const items = agrupar(
          servicesForMundo(servicesData, m).filter((s) => {
            const texto = normalizar(`${s.name} ${s.cat} ${s.worker}`);
            return palabras.every((w) => texto.includes(w));
          }),
        );
        return { m, secciones: enSecciones(m.id, items), n: items.length };
      })
      .filter((g) => g.n);
  }, [busca, mundo, versionPrecios]);

  const agendar = (nombre) => navegar(`/portal/agenda?servicio=${encodeURIComponent(nombre)}`);

  return (
    <div className="panel precios">
      <header className="panel__cabeza">
        <span className="eyebrow">Lo que cobramos</span>
        <h1 className="panel__titulo">
          Los <em>precios</em>
        </h1>
      </header>

      <div className="precios__barra">
        <label className="buscador">
          <Search aria-hidden="true" />
          <span className="visually-hidden">Buscar servicio</span>
          <input className="input" type="search" placeholder="Busca: rebaje, balayage, manos…" value={busca} onChange={(e) => setBusca(e.target.value)} />
          {busca && (
            <button type="button" className="precios__borrar" onClick={() => setBusca('')} aria-label="Borrar búsqueda">
              <X size={16} />
            </button>
          )}
        </label>
        <div className="precios__mundos" role="group" aria-label="Filtrar">
          {[{ id: 'todos', short: 'Todo' }, ...mundos].map((m) => (
            <button key={m.id} type="button" className={`chip ${mundo === m.id ? 'is-active' : ''}`} onClick={() => setMundo(m.id)}>
              {m.short}
            </button>
          ))}
        </div>
      </div>

      {aviso && (
        <p className="aviso-ok" role="status">
          {aviso}
        </p>
      )}
      {puedeCambiar && <p className="nota-mano precios__nota">toca un servicio para cambiar su precio o tiempo</p>}
      {grupos.length === 0 && <p className="muted precios__nada">No encontramos «{busca}». Prueba con otra palabra.</p>}

      {grupos.map(({ m, secciones }) => (
        <section key={m.id} className="precios__mundo">
          <h2 className="precios__titulo">{m.name}</h2>
          {secciones.map((sec) => (
            <div key={sec.titulo} className="precios__seccion">
              {secciones.length > 1 && <h3 className="precios__sub">{sec.titulo}</h3>}
              <ul className="precios__lista">
                {sec.items.map((it) => {
                  const clave = `${m.id}-${it.original ?? it.nombre}`;
                  const abre = abierto === clave;
                  return (
                    <li key={clave} className={`precio ${abre ? 'is-open' : ''}`}>
                      <button type="button" className="precio__fila" onClick={() => setAbierto(abre ? null : clave)} aria-expanded={abre}>
                        <span className="precio__nombre">{it.nombre}</span>
                        <span className="precio__monto">
                          {it.variantes.length ? (
                            <>
                              <small>desde</small> ${it.desde.toLocaleString('es-CL')}
                            </>
                          ) : (
                            <>
                              {it.desdeTexto && <small>desde</small>} {plata(it.price)}
                            </>
                          )}
                        </span>
                        <span className="precio__meta">
                          {it.variantes.length ? 'Según el largo' : corto(it.time)}
                          {it.worker ? ` · ${it.worker}` : ''}
                        </span>
                      </button>
                      {it.variantes.length > 0 && (
                        <div className="precio__largos">
                          {it.variantes.map((v) => (
                            <span key={v.largo} className="precio__largo">
                              <small>{v.largo === 'Extra largo' ? 'XL' : v.largo}</small>
                              <strong>{plata(v.price)}</strong>
                              <em>{corto(v.time)}</em>
                            </span>
                          ))}
                        </div>
                      )}
                      {abre && (
                        <div className="precio__detalle">
                          {hay(it.desc) && <p>{it.desc}</p>}
                          <button type="button" className="btn btn--ghost precio__agendar" onClick={() => agendar(it.original ?? it.nombre)}>
                            <CalendarPlus size={16} /> Agendar este servicio
                          </button>
                          {puedeCambiar &&
                            (editando === clave ? (
                              <EditarPrecio
                                it={it}
                                onListo={(t) => {
                                  setEditando(null);
                                  setAviso(t);
                                  setTimeout(() => setAviso(''), 4000);
                                }}
                              />
                            ) : (
                              <button type="button" className="portal__link" onClick={() => setEditando(clave)}>
                                <Pencil size={14} /> Cambiar precio o tiempo
                              </button>
                            ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      ))}
      <p className="muted precios__nota">Son los mismos precios de naamastudio.cl. Los que dicen «desde» dependen del largo o del diseño.</p>
    </div>
  );
};

export default Precios;
