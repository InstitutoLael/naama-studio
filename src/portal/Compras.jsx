import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Package, Plus, ShoppingBag, X } from 'lucide-react';
import { api, post } from './api';
import Hoja from './Hoja';
import { PROVEEDORES, pesos } from './insumosBase';

const fecha = (iso) => new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', timeZone: 'America/Santiago' });
const fotoUrl = (id) => (id ? `/api/portal/insumos/foto/${id}` : null);

const Pedir = ({ onListo, onCerrar }) => {
  const [urgente, setUrgente] = useState(false);
  const [error, setError] = useState('');
  return (
    <Hoja titulo="¿Qué hay que comprar?" onCerrar={onCerrar}>
      <form
        className="hoja__form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            await post('compras', { texto: f.get('texto'), cantidad: f.get('cantidad'), urgente });
            onListo('Pedido anotado en la lista.');
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        <div className="field">
          <label htmlFor="pd-t">Producto</label>
          <input id="pd-t" name="texto" className="input" placeholder="Ej.: Algodón, guantes talla M" required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="pd-c">Cantidad (opcional)</label>
          <input id="pd-c" name="cantidad" className="input" placeholder="Ej.: 2 cajas" />
        </div>
        <label className="permiso permiso--suelto">
          <input type="checkbox" checked={urgente} onChange={(e) => setUrgente(e.target.checked)} />
          <span>Es urgente (se acabó o falta para hoy)</span>
        </label>
        {error && <p className="portal-error" role="alert">{error}</p>}
        <button type="submit" className="btn">
          Agregar a la lista
        </button>
      </form>
    </Hoja>
  );
};

const Comprar = ({ pedido, verCostos, onListo, onCerrar }) => {
  const [error, setError] = useState('');
  return (
    <Hoja titulo="Marcar como comprado" onCerrar={onCerrar}>
      <p className="muted">{pedido.texto}</p>
      <form
        className="hoja__form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            await post(`compras/${pedido.id}`, {
              estado: 'comprado',
              monto: String(f.get('monto') ?? '').replace(/\D/g, ''),
              proveedor: f.get('proveedor'),
              envases: f.get('envases') ? String(f.get('envases')).replace(',', '.') : undefined,
            });
            onListo(`${pedido.texto}: comprado.`);
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        {pedido.productoId && (
          <div className="field">
            <label htmlFor="cp-e">¿Cuántos envases llegaron? (se suman al stock)</label>
            <input id="cp-e" name="envases" className="input" inputMode="decimal" placeholder="1" />
          </div>
        )}
        {verCostos && (
          <div className="field">
            <label htmlFor="cp-m">¿Cuánto costó? (opcional)</label>
            <input id="cp-m" name="monto" className="input" inputMode="numeric" placeholder="$" />
          </div>
        )}
        <div className="field">
          <label htmlFor="cp-p">¿Dónde? (opcional)</label>
          <input id="cp-p" name="proveedor" className="input" list="proveedores-c" />
          <datalist id="proveedores-c">
            {PROVEEDORES.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
        {error && <p className="portal-error" role="alert">{error}</p>}
        <button type="submit" className="btn">
          <Check size={18} /> Comprado
        </button>
      </form>
    </Hoja>
  );
};

const Compras = () => {
  const [datos, setDatos] = useState(null);
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState('');
  const [hoja, setHoja] = useState(null);
  const [aviso, setAviso] = useState('');
  const avisoT = useRef();

  const cargar = useCallback(async () => {
    try {
      const [c, i] = await Promise.all([api('compras'), api('insumos')]);
      setDatos(c);
      setProductos(i.productos);
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
    avisoT.current = setTimeout(() => setAviso(''), 3500);
  };
  const listo = (t) => {
    setHoja(null);
    mostrarAviso(t);
    cargar();
  };

  const pendientes = datos?.pedidos.filter((p) => p.estado === 'pedido') ?? [];
  const resueltos = datos?.pedidos.filter((p) => p.estado !== 'pedido') ?? [];
  const yaPedidos = new Set(pendientes.map((p) => p.productoId).filter(Boolean));
  const sugeridos = productos.filter((p) => p.bajo && !yaPedidos.has(p.id));
  const gastado = resueltos.filter((p) => p.estado === 'comprado' && p.monto).reduce((a, p) => a + p.monto, 0);

  const resolver = async (p, estado) => {
    try {
      await post(`compras/${p.id}`, { estado });
      mostrarAviso(estado === 'descartado' ? 'Quitado de la lista.' : 'Vuelve a la lista.');
      cargar();
    } catch (err) {
      mostrarAviso(err.message);
    }
  };

  return (
    <div className="panel">
      <header className="panel__cabeza">
        <span className="eyebrow">Compras</span>
        <h1 className="panel__titulo">
          Por <em>comprar</em>
        </h1>
      </header>

      {error && <p className="portal-error" role="alert">{error}</p>}
      {!datos && !error && <p className="muted">Cargando…</p>}

      {sugeridos.length > 0 && (
        <section>
          <h2 className="seccion__titulo">Se están acabando</h2>
          <ul className="cuentas">
            {sugeridos.map((p) => (
              <li key={p.id} className="fila-dato">
                {p.fotoId ? <img className="producto__foto" src={fotoUrl(p.fotoId)} alt="" /> : <span className="producto__foto producto__foto--vacia"><Package strokeWidth={1.4} /></span>}
                <span>
                  {p.nombre}
                  <small className="muted"> · quedan {p.envases}</small>
                </span>
                <button
                  type="button"
                  className="chip"
                  onClick={async () => {
                    await post('compras', { productoId: p.id });
                    listo(`${p.nombre} agregado a la lista.`);
                  }}
                >
                  <Plus size={14} /> A la lista
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {datos && (
        <section>
          <h2 className="seccion__titulo">Lista ({pendientes.length})</h2>
          {pendientes.length === 0 ? (
            <div className="vacio">
              <ShoppingBag strokeWidth={1.2} />
              <p>
                <strong>No falta nada por ahora.</strong>
                <br />
                Si algo se acaba, tócalo en «+».
              </p>
            </div>
          ) : (
            <ul className="cuentas">
              {pendientes.map((p) => (
                <li key={p.id} className="pedido">
                  {p.fotoId ? <img className="producto__foto" src={fotoUrl(p.fotoId)} alt="" /> : <span className="producto__foto producto__foto--vacia"><ShoppingBag strokeWidth={1.4} /></span>}
                  <span className="pedido__texto">
                    <strong>
                      {p.texto}
                      {p.urgente && <span className="etiqueta">Urgente</span>}
                    </strong>
                    <small>
                      {p.cantidad ? `${p.cantidad} · ` : ''}pidió {p.pedidoPor ?? '—'} · {fecha(p.ts)}
                    </small>
                  </span>
                  {datos.puedeResolver && (
                    <span className="pedido__acciones">
                      <button type="button" className="icono-boton" aria-label="Quitar de la lista" onClick={() => resolver(p, 'descartado')}>
                        <X size={18} />
                      </button>
                      <button type="button" className="chip is-active" onClick={() => setHoja({ tipo: 'comprar', pedido: p })}>
                        <Check size={14} /> Comprado
                      </button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {resueltos.length > 0 && (
        <section>
          <h2 className="seccion__titulo">
            Comprado últimamente{datos?.verCostos && gastado ? ` · ${pesos(gastado)}` : ''}
          </h2>
          <ul className="cuentas">
            {resueltos.map((p) => (
              <li key={p.id} className="pedido is-hecho">
                <span className="pedido__texto">
                  <strong>{p.texto}</strong>
                  <small>
                    {p.estado === 'comprado' ? 'Comprado' : 'Quitado'} · {p.resueltoPor ?? '—'} · {p.resueltoTs ? fecha(p.resueltoTs) : ''}
                    {datos.verCostos && p.monto ? ` · ${pesos(p.monto)}` : ''}
                    {p.proveedor ? ` · ${p.proveedor}` : ''}
                  </small>
                </span>
                {datos.puedeResolver && p.estado === 'descartado' && (
                  <button type="button" className="portal__link" onClick={() => resolver(p, 'pedido')}>
                    Devolver
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <button type="button" className="fab" onClick={() => setHoja({ tipo: 'pedir' })} aria-label="Pedir algo">
        <Plus />
      </button>
      <button type="button" className="btn btn--sm btn--ghost solo-compu" onClick={() => setHoja({ tipo: 'pedir' })}>
        <Plus size={16} /> Pedir algo
      </button>

      {aviso && (
        <p className="aviso" role="status">
          {aviso}
        </p>
      )}
      {hoja?.tipo === 'pedir' && <Pedir onListo={listo} onCerrar={() => setHoja(null)} />}
      {hoja?.tipo === 'comprar' && <Comprar pedido={hoja.pedido} verCostos={datos?.verCostos} onListo={listo} onCerrar={() => setHoja(null)} />}
    </div>
  );
};

export default Compras;
