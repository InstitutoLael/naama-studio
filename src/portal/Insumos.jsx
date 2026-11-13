import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Check, ChevronLeft, ChevronRight, Copy, Minus, Package, PackageX, Plus, Scale, ShoppingBag, Tag, Trash2 } from 'lucide-react';
import { SearchIcon } from '../components/common/Icons';
import { servicesData } from '../data/servicesData';
import { api, post } from './api';
import Hoja from './Hoja';
import { CATEGORIAS_INSUMO, PROVEEDORES, UNIDADES, num, pesos } from './insumosBase';
import { puede } from './permisos';

/* ── utilidades ─────────────────────────────────────────── */

const fotoUrl = (id) => (id ? `/api/portal/insumos/foto/${id}` : null);

// Nombres del portal → nombre en la lista de servicios de la web.
const ALIAS = { vivy: 'viviana', viviana: 'viviana', kata: 'katalina', katalina: 'katalina' };
const SERVICIOS = [...new Set(servicesData.map((s) => s.name))].map((name) => {
  const s = servicesData.find((x) => x.name === name);
  return { nombre: name, quien: s.worker.toLowerCase(), cat: s.cat };
});

/** Achica la foto en el celular (máx. 640 px, WebP/JPEG) para que suba rápido y pese poco. */
async function achicarFoto(archivo) {
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = mal;
      i.src = url;
    });
    const lado = 640;
    const escala = Math.min(1, lado / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * escala);
    c.height = Math.round(img.height * escala);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    let datos = c.toDataURL('image/webp', 0.72);
    if (!datos.startsWith('data:image/webp')) datos = c.toDataURL('image/jpeg', 0.75); // Safari antiguo
    return datos;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const quedan = (p) => {
  if (p.unidad === 'u') return `${num(p.stock)} unidades`;
  if (p.envases >= 1 || p.stock === 0) return `${num(p.envases, 1)} ${p.envases === 1 ? 'envase' : 'envases'}`;
  return `${num(p.stock)} ${UNIDADES[p.unidad].corto} (menos de 1 envase)`;
};

const familiaDe = (p) => `${p.nombre.toLowerCase()}|${(p.marca ?? '').toLowerCase()}`;
const nombreCompleto = (p) => (p.variante ? `${p.nombre} · ${p.variante}` : p.nombre);

/** Agrupa tonos/colores/tipos del mismo producto (mismo nombre y marca). */
const agrupar = (productos) => {
  const mapa = new Map();
  for (const p of productos) {
    const k = familiaDe(p);
    if (!mapa.has(k)) mapa.set(k, []);
    mapa.get(k).push(p);
  }
  return [...mapa.values()].map((items) => ({
    clave: familiaDe(items[0]),
    nombre: items[0].nombre,
    marca: items[0].marca,
    categoria: items[0].categoria,
    items,
    portada: items.find((x) => x.fotoId) ?? items[0],
    bajos: items.filter((x) => x.bajo).length,
    esFamilia: items.length > 1 || Boolean(items[0].variante),
  }));
};

const USOS = [
  ['trabajo', 'Para trabajar'],
  ['venta', 'Para vender'],
  ['ambos', 'Ambos'],
];

const barra = (p) => Math.max(0, Math.min(100, (p.envases / Math.max(p.minimo * 3, 1)) * 100));

const FotoProducto = ({ p, grande = false }) =>
  p?.fotoId ? (
    <img className={`producto__foto ${grande ? 'producto__foto--grande' : ''}`} src={fotoUrl(p.fotoId)} alt="" loading="lazy" />
  ) : (
    <span className={`producto__foto producto__foto--vacia ${grande ? 'producto__foto--grande' : ''}`}>
      <Package strokeWidth={1.4} />
    </span>
  );

const Paso = ({ n, titulo, children }) => (
  <section className="flujo__paso">
    <h3 className="flujo__titulo">
      <span>{n}</span> {titulo}
    </h3>
    {children}
  </section>
);

/* ── Anotar lo que usé ─────────────────────────────────── */

const AnotarUso = ({ cuenta, productos, inicial, onListo, onCerrar }) => {
  const [paso, setPaso] = useState(1);
  const [servicio, setServicio] = useState('');
  const [busca, setBusca] = useState('');
  const [lineas, setLineas] = useState(inicial ? [{ producto: inicial, cantidad: '' }] : []);
  const [buscaProd, setBuscaProd] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const yo = ALIAS[cuenta.nombre.toLowerCase()] ?? cuenta.nombre.toLowerCase();
  const servicios = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const lista = SERVICIOS.filter((s) => !q || s.nombre.toLowerCase().includes(q));
    const mios = lista.filter((s) => s.quien.includes(yo));
    const otros = lista.filter((s) => !s.quien.includes(yo));
    return q ? lista.slice(0, 30) : [...mios, ...otros].slice(0, 24);
  }, [busca, yo]);

  const [abierta, setAbierta] = useState(null);
  const familias = useMemo(() => {
    const q = buscaProd.trim().toLowerCase();
    const lista = productos.filter((p) => p.uso !== 'venta' && (!q || `${p.nombre} ${p.marca ?? ''} ${p.variante ?? ''}`.toLowerCase().includes(q)));
    return agrupar(lista);
  }, [productos, buscaProd]);

  const elegido = (p) => lineas.some((l) => l.producto.id === p.id);
  const alternar = (p) =>
    setLineas((ls) => (elegido(p) ? ls.filter((l) => l.producto.id !== p.id) : [...ls, { producto: p, cantidad: '' }]));

  const guardar = async () => {
    setError('');
    if (lineas.some((l) => !(Number(String(l.cantidad).replace(',', '.')) > 0))) {
      setError('Escribe cuánto marcó la pesa en cada producto.');
      return;
    }
    setEnviando(true);
    try {
      await post('insumos/uso', {
        servicio: servicio || null,
        items: lineas.map((l) => ({ productoId: l.producto.id, cantidad: String(l.cantidad).replace(',', '.') })),
      });
      onListo(`Anotado: ${lineas.length === 1 ? nombreCompleto(lineas[0].producto) : `${lineas.length} productos`}${servicio ? ` en ${servicio}` : ''}.`);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <Hoja titulo="Anotar lo que usé" onCerrar={onCerrar}>
      <div className="flujo__progreso" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={n <= paso ? 'is-on' : ''} />
        ))}
      </div>

      {paso === 1 && (
        <Paso n="1" titulo="¿Qué servicio hiciste?">
          <label className="buscador">
            <SearchIcon />
            <span className="visually-hidden">Buscar servicio</span>
            <input className="input" placeholder="Buscar servicio" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </label>
          <div className="opciones-servicio">
            {servicios.map((s) => (
              <button
                key={s.nombre}
                type="button"
                className={`chip ${servicio === s.nombre ? 'is-active' : ''}`}
                onClick={() => {
                  setServicio(s.nombre);
                  setPaso(lineas.length ? 3 : 2);
                }}
              >
                {s.nombre}
              </button>
            ))}
            {busca.trim() && !servicios.some((s) => s.nombre.toLowerCase() === busca.trim().toLowerCase()) && (
              <button
                type="button"
                className="chip"
                onClick={() => {
                  setServicio(busca.trim());
                  setPaso(lineas.length ? 3 : 2);
                }}
              >
                Usar «{busca.trim()}»
              </button>
            )}
          </div>
          <button
            type="button"
            className="portal__link"
            onClick={() => {
              setServicio('');
              setPaso(lineas.length ? 3 : 2);
            }}
          >
            No fue para un servicio (limpieza, prueba…)
          </button>
        </Paso>
      )}

      {paso === 2 && (
        <Paso n="2" titulo="Toca los productos que usaste">
          {productos.length === 0 ? (
            <p className="acceso__nota">Todavía no hay productos. Ciérrame y toca «+» para agregar el primero con su foto.</p>
          ) : (
            <>
              <label className="buscador">
                <SearchIcon />
                <span className="visually-hidden">Buscar producto</span>
                <input className="input" placeholder="Buscar producto" value={buscaProd} onChange={(e) => setBuscaProd(e.target.value)} />
              </label>
              <ul className="elegir-productos">
                {familias.map((f) => {
                  const marcados = f.items.filter(elegido).length;
                  const unico = !f.esFamilia ? f.items[0] : null;
                  return (
                    <li key={f.clave} className={abierta === f.clave ? 'is-abierta' : ''}>
                      <button
                        type="button"
                        className={`elegir ${marcados ? 'is-on' : ''}`}
                        onClick={() => (unico ? alternar(unico) : setAbierta(abierta === f.clave ? null : f.clave))}
                      >
                        <FotoProducto p={f.portada} />
                        <span className="elegir__nombre">{f.nombre}</span>
                        <span className="elegir__marca">{f.esFamilia ? `${f.items.length} ${f.items.length === 1 ? 'tono' : 'tonos'} · elige` : f.marca ?? ''}</span>
                        {marcados > 0 && (
                          <span className="elegir__check">{f.esFamilia ? marcados : <Check size={16} strokeWidth={2.4} />}</span>
                        )}
                      </button>
                      {abierta === f.clave && (
                        <div className="variantes">
                          <p>¿Qué tono o tipo de {f.nombre}?</p>
                          <div className="chips-envueltos">
                            {f.items.map((p) => (
                              <button key={p.id} type="button" className={`chip ${elegido(p) ? 'is-active' : ''}`} onClick={() => alternar(p)}>
                                {elegido(p) && <Check size={14} />} {p.variante ?? 'Sin tono'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <div className="hoja__acciones hoja__acciones--pegadas">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPaso(1)}>
              <ChevronLeft /> Atrás
            </button>
            <button type="button" className="btn" disabled={!lineas.length} onClick={() => setPaso(3)}>
              Listo ({lineas.length})
            </button>
          </div>
        </Paso>
      )}

      {paso === 3 && (
        <Paso n="3" titulo="¿Cuánto marcó la pesa?">
          {servicio && <p className="flujo__resumen">Servicio: <strong>{servicio}</strong></p>}
          <ul className="pesadas">
            {lineas.map((l, i) => (
              <li key={l.producto.id} className="pesada">
                <FotoProducto p={l.producto} />
                <div className="pesada__datos">
                  <strong>{nombreCompleto(l.producto)}</strong>
                  <div className="pesada__entrada">
                    <input
                      className="input pesada__input"
                      inputMode="decimal"
                      placeholder="0"
                      value={l.cantidad}
                      autoFocus={i === 0}
                      onChange={(e) => setLineas((ls) => ls.map((x, j) => (j === i ? { ...x, cantidad: e.target.value.replace(/[^\d.,]/g, '') } : x)))}
                    />
                    <span className="pesada__unidad">{UNIDADES[l.producto.unidad].corto}</span>
                  </div>
                  <div className="pesada__atajos">
                    {(l.producto.unidad === 'u' ? [1, 2, 5, 10] : [5, 10, 20, 50]).map((v) => (
                      <button
                        key={v}
                        type="button"
                        className="chip"
                        onClick={() =>
                          setLineas((ls) => ls.map((x, j) => (j === i ? { ...x, cantidad: String((Number(String(x.cantidad).replace(',', '.')) || 0) + v) } : x)))
                        }
                      >
                        +{v}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="pesada__quitar"
                      aria-label={`Quitar ${l.producto.nombre}`}
                      onClick={() => setLineas((ls) => ls.filter((_, j) => j !== i))}
                    >
                      <Trash2 size={18} strokeWidth={1.6} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="portal__link" onClick={() => setPaso(2)}>
            + Agregar otro producto
          </button>
          {error && <p className="portal-error" role="alert">{error}</p>}
          <div className="hoja__acciones hoja__acciones--pegadas">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPaso(2)}>
              <ChevronLeft /> Atrás
            </button>
            <button type="button" className="btn" disabled={enviando || !lineas.length} onClick={guardar}>
              {enviando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </Paso>
      )}
    </Hoja>
  );
};

/* ── Producto nuevo / editar ───────────────────────────── */

const FormProducto = ({ producto, base, verCostos, onListo, onCerrar }) => {
  const editando = Boolean(producto);
  const molde = producto ?? base; // «Agregar otro tono» copia todo menos el tono y la foto
  const [foto, setFoto] = useState(null);
  const [unidad, setUnidad] = useState(molde?.unidad ?? 'g');
  const [categoria, setCategoria] = useState(molde?.categoria ?? '');
  const [uso, setUso] = useState(molde?.uso ?? 'trabajo');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const camara = useRef();

  return (
    <Hoja titulo={editando ? 'Editar producto' : base ? `Otro tono de ${base.nombre}` : 'Producto nuevo'} onCerrar={onCerrar}>
      <form
        className="hoja__form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setError('');
          if (!categoria) {
            setError('Elige una categoría.');
            return;
          }
          setEnviando(true);
          const datos = {
            nombre: f.get('nombre'),
            marca: f.get('marca'),
            categoria,
            unidad,
            uso,
            variante: f.get('variante'),
            precioVenta: uso === 'trabajo' ? '' : String(f.get('precioVenta') ?? '').replace(/\D/g, ''),
            tamano: String(f.get('tamano')).replace(',', '.'),
            minimo: String(f.get('minimo') || '1').replace(',', '.'),
            proveedor: f.get('proveedor'),
            ...(verCostos ? { costo: String(f.get('costo') ?? '').replace(/\D/g, '') } : {}),
            ...(foto ? { foto } : {}),
            ...(!editando ? { envases: String(f.get('envases') || '0').replace(',', '.') } : {}),
          };
          try {
            await post(editando ? `insumos/${producto.id}` : 'insumos', datos);
            onListo(editando ? 'Producto actualizado.' : `Listo: ${[datos.nombre, datos.variante].filter(Boolean).join(' · ')} quedó en Insumos.`);
          } catch (err) {
            setError(err.message);
            setEnviando(false);
          }
        }}
      >
        <button type="button" className="sacar-foto" onClick={() => camara.current?.click()}>
          {foto || producto?.fotoId ? (
            <img src={foto ?? fotoUrl(producto.fotoId)} alt="Foto del producto" />
          ) : (
            <>
              <Camera strokeWidth={1.4} />
              <span>Sacar foto del producto</span>
            </>
          )}
        </button>
        <input
          ref={camara}
          type="file"
          accept="image/*"
          capture="environment"
          className="visually-hidden"
          onChange={async (e) => {
            const a = e.target.files?.[0];
            if (!a) return;
            try {
              setFoto(await achicarFoto(a));
            } catch {
              setError('No pude leer esa foto. Prueba con otra.');
            }
          }}
        />

        <div className="field">
          <label htmlFor="pr-nombre">¿Qué es?</label>
          <input id="pr-nombre" name="nombre" className="input" placeholder="Ej.: Tinte Igora, Esmalte permanente" defaultValue={molde?.nombre} required />
        </div>
        <div className="field">
          <label htmlFor="pr-var">Tono, color o tipo (opcional)</label>
          <input
            id="pr-var"
            name="variante"
            className="input"
            placeholder="Ej.: 7.1 Rubio ceniza · Rojo 045 · Matizador"
            defaultValue={producto?.variante ?? ''}
            autoFocus={Boolean(base)}
          />
        </div>
        <div className="field">
          <label htmlFor="pr-marca">Marca (opcional)</label>
          <input id="pr-marca" name="marca" className="input" placeholder="Ej.: Wella" defaultValue={molde?.marca ?? ''} />
        </div>

        <fieldset className="grupo">
          <legend>¿Para qué es?</legend>
          <div className="segmentado">
            {USOS.map(([id, txt]) => (
              <button key={id} type="button" aria-pressed={uso === id} onClick={() => setUso(id)}>
                {txt}
              </button>
            ))}
          </div>
        </fieldset>
        {uso !== 'trabajo' && (
          <div className="field">
            <label htmlFor="pr-pv">Precio de venta a la clienta</label>
            <input id="pr-pv" name="precioVenta" className="input" inputMode="numeric" placeholder="$" defaultValue={molde?.precioVenta ?? ''} />
          </div>
        )}

        <fieldset className="grupo">
          <legend>Categoría</legend>
          <div className="chips-envueltos">
            {CATEGORIAS_INSUMO.map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={categoria === c} onClick={() => setCategoria(c)}>
                {c}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="grupo">
          <legend>¿Cómo se mide?</legend>
          <div className="segmentado">
            {Object.entries(UNIDADES).map(([id, u]) => (
              <button key={id} type="button" aria-pressed={unidad === id} onClick={() => setUnidad(id)}>
                {u.largo}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="fila-campos">
          <div className="field">
            <label htmlFor="pr-tam">Cada envase trae</label>
            <div className="con-unidad">
              <input id="pr-tam" name="tamano" className="input" inputMode="decimal" placeholder={unidad === 'u' ? '100' : '1000'} defaultValue={molde?.tamano} required />
              <span>{UNIDADES[unidad].corto}</span>
            </div>
          </div>
          {!editando && (
            <div className="field">
              <label htmlFor="pr-env">¿Cuántos hay?</label>
              <div className="con-unidad">
                <input id="pr-env" name="envases" className="input" inputMode="decimal" placeholder="1" defaultValue="1" />
                <span>envases</span>
              </div>
            </div>
          )}
        </div>
        <div className="field">
          <label htmlFor="pr-min">Avisar cuando queden menos de</label>
          <div className="con-unidad">
            <input id="pr-min" name="minimo" className="input" inputMode="decimal" defaultValue={molde?.minimo ?? 1} />
            <span>envases</span>
          </div>
        </div>
        {verCostos && (
          <div className="field">
            <label htmlFor="pr-costo">Precio de cada envase (solo lo ven ustedes)</label>
            <input id="pr-costo" name="costo" className="input" inputMode="numeric" placeholder="$" defaultValue={molde?.costo ?? ''} />
          </div>
        )}
        <div className="field">
          <label htmlFor="pr-prov">¿Dónde se compra? (opcional)</label>
          <input id="pr-prov" name="proveedor" className="input" list="proveedores" defaultValue={molde?.proveedor ?? ''} />
          <datalist id="proveedores">
            {PROVEEDORES.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
        {error && <p className="portal-error" role="alert">{error}</p>}
        <div className="hoja__acciones hoja__acciones--pegadas">
          <button type="submit" className="btn" disabled={enviando}>
            {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Agregar producto'}
          </button>
        </div>
      </form>
    </Hoja>
  );
};

/* ── Ficha del producto ────────────────────────────────── */

const FichaProducto = ({ p, verCostos, puedeEditar, onUsar, onEditar, onOtroTono, onCambio, onCerrar }) => {
  const [detalle, setDetalle] = useState(null);
  const [modo, setModo] = useState(null); // 'llego' | 'ajuste'
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');
  const u = UNIDADES[p.unidad].corto;

  useEffect(() => {
    api(`insumos/${p.id}`)
      .then(setDetalle)
      .catch((err) => setError(err.message));
  }, [p.id, p.stock]);

  const accion = async (camino, cuerpo, aviso) => {
    setError('');
    try {
      await post(camino, cuerpo);
      setModo(null);
      setValor('');
      onCambio(aviso);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Hoja titulo={nombreCompleto(p)} onCerrar={onCerrar}>
      <div className="ficha-prod">
        <FotoProducto p={p} grande />
        <div className="ficha-prod__datos">
          {p.marca && <span className="muted">{p.marca}</span>}
          <strong className={`ficha-prod__quedan ${p.bajo ? 'is-bajo' : ''}`}>Quedan {quedan(p)}</strong>
          <span className="muted">
            Cada envase: {num(p.tamano)} {u}
            {verCostos && p.costo ? ` · ${pesos(p.costo)}` : ''}
          </span>
          {p.uso !== 'trabajo' && <span className="pildora pildora--venta">Se vende{p.precioVenta ? ` · ${pesos(p.precioVenta)}` : ''}</span>}
          {p.diasRestantes !== null && <span className="pildora">Se acaba en ~{p.diasRestantes} días</span>}
        </div>
      </div>

      <div className="acciones-grandes">
        {p.uso !== 'trabajo' && (
          <button
            type="button"
            className="accion-grande accion-grande--fuerte"
            onClick={() =>
              window.confirm(`¿Vendiste 1 ${nombreCompleto(p)}${p.precioVenta ? ` a ${pesos(p.precioVenta)}` : ''}?`) &&
              accion(`insumos/${p.id}/venta`, { unidades: 1 }, `Venta anotada: ${nombreCompleto(p)}.`)
            }
          >
            <Tag strokeWidth={1.6} /> Vendí uno
          </button>
        )}
        {p.uso !== 'venta' && (
          <button type="button" className="accion-grande" onClick={onUsar}>
            <Scale strokeWidth={1.6} /> Anotar uso
          </button>
        )}
        <button type="button" className="accion-grande" onClick={() => setModo(modo === 'llego' ? null : 'llego')}>
          <Plus strokeWidth={1.6} /> Llegó compra
        </button>
        <button type="button" className="accion-grande" onClick={() => accion('compras', { productoId: p.id }, `${nombreCompleto(p)} quedó en la lista de compras.`)}>
          <ShoppingBag strokeWidth={1.6} /> Queda poco
        </button>
        <button
          type="button"
          className="accion-grande accion-grande--alerta"
          onClick={() =>
            window.confirm(`¿Se acabó ${nombreCompleto(p)}? Queda urgente en la lista de compras y les avisa.`) &&
            accion(`insumos/${p.id}/se-acabo`, {}, `Listo: ${nombreCompleto(p)} quedó urgente en la lista de compras.`)
          }
        >
          <PackageX strokeWidth={1.6} /> Se acabó
        </button>
        <button type="button" className="accion-grande" onClick={onOtroTono}>
          <Copy strokeWidth={1.6} /> Agregar otro tono
        </button>
        {puedeEditar && (
          <button type="button" className="accion-grande" onClick={() => setModo(modo === 'ajuste' ? null : 'ajuste')}>
            <Minus strokeWidth={1.6} /> Corregir stock
          </button>
        )}
      </div>

      {modo && (
        <form
          className="ficha__otra"
          onSubmit={(e) => {
            e.preventDefault();
            const v = valor.replace(',', '.');
            if (modo === 'llego') accion(`insumos/${p.id}/llego`, { envases: v }, `Sumados ${v} envases de ${p.nombre}.`);
            else accion(`insumos/${p.id}/ajuste`, { envases: v }, `Stock de ${p.nombre} corregido.`);
          }}
        >
          <div className="field">
            <label htmlFor="fp-v">{modo === 'llego' ? '¿Cuántos envases llegaron?' : '¿Cuántos envases hay ahora? (puede ser 2,5)'}</label>
            <input id="fp-v" className="input" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} autoFocus required />
          </div>
          <button type="submit" className="btn btn--sm">
            Guardar
          </button>
        </form>
      )}

      {detalle?.porServicio?.length > 0 && (
        <div>
          <p className="grupo__titulo">Cuánto se usa por servicio</p>
          <ul className="ficha__visitas">
            {detalle.porServicio.map((s) => (
              <li key={s.servicio}>
                <span>{s.servicio}</span>
                <small>
                  {num(s.promedio, 1)} {u} promedio · {s.veces} {s.veces === 1 ? 'vez' : 'veces'}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}
      {detalle?.ultimos?.length > 0 && (
        <div>
          <p className="grupo__titulo">Últimos usos</p>
          <ul className="ficha__visitas">
            {detalle.ultimos.map((x, i) => (
              <li key={i}>
                <span>
                  {num(x.cantidad, 1)} {u} · {x.servicio ?? 'sin servicio'}
                </span>
                <small>
                  {new Date(`${x.fecha}T12:00:00`).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                  {x.quien ? ` · ${x.quien}` : ''}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}
      {detalle && !detalle.ultimos?.length && <p className="muted">Todavía nadie anota usos de este producto.</p>}

      {puedeEditar && (
        <div className="hoja__acciones">
          <button type="button" className="portal__link" onClick={onEditar}>
            Editar producto
          </button>
          <button
            type="button"
            className="portal__link fila-lista--peligro"
            onClick={() => window.confirm(`¿Quitar ${p.nombre} de Insumos?`) && accion(`insumos/${p.id}`, { activo: false }, `${p.nombre} se quitó.`)}
          >
            Quitar producto
          </button>
        </div>
      )}
      {error && <p className="portal-error" role="alert">{error}</p>}
    </Hoja>
  );
};

/* ── Datos (Administración y Vivy) ─────────────────────── */

const Datos = ({ productos, verCostos }) => {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api('insumos-datos')
      .then(setDatos)
      .catch((err) => setError(err.message));
  }, []);

  const seAcaban = productos.filter((p) => p.diasRestantes !== null).sort((a, b) => a.diasRestantes - b.diasRestantes).slice(0, 6);
  const masUsados = [...productos].filter((p) => p.consumo30 > 0).sort((a, b) => b.usos30 - a.usos30).slice(0, 6);
  const gasto30 = verCostos ? productos.reduce((a, p) => a + (p.costoUnidad ? p.costoUnidad * p.consumo30 : 0), 0) : null;

  if (error) return <p className="portal-error">{error}</p>;
  return (
    <div className="pantalla">
      {verCostos && (
        <dl className="cifras">
          <div>
            <dt>Producto usado (30 días)</dt>
            <dd>{pesos(gasto30)}</dd>
          </div>
          <div>
            <dt>Servicios con datos</dt>
            <dd>{datos ? datos.porServicio.reduce((a, s) => a + s.veces, 0) : '–'}</dd>
          </div>
          <div>
            <dt>Productos bajo mínimo</dt>
            <dd>{productos.filter((p) => p.bajo).length}</dd>
          </div>
        </dl>
      )}

      <section>
        <h2 className="seccion__titulo">Cuánto se usa en cada servicio</h2>
        {!datos && <p className="muted">Cargando…</p>}
        {datos?.porServicio.length === 0 && (
          <p className="acceso__nota">Cuando el equipo empiece a anotar lo que usa, aquí vas a ver el promedio por servicio y cuánto cuesta cada uno en producto.</p>
        )}
        <ul className="tarjetas-datos">
          {datos?.porServicio.map((s) => (
            <li key={s.servicio} className="dato-servicio">
              <div className="dato-servicio__cabeza">
                <strong>{s.servicio}</strong>
                <small>{s.veces} {s.veces === 1 ? 'vez' : 'veces'}</small>
              </div>
              <ul>
                {s.productos.map((p) => (
                  <li key={p.nombre}>
                    <span>{p.nombre}</span>
                    <span>
                      {num(p.promedio, 1)} {UNIDADES[p.unidad].corto}
                    </span>
                  </li>
                ))}
              </ul>
              {verCostos && (
                <p className="dato-servicio__costo">
                  Costo en producto: <strong>{pesos(s.costoPromedio)}</strong>
                  {!s.costoCompleto && <small> (faltan precios de algunos productos)</small>}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {verCostos && datos?.ventas?.length > 0 && (
        <section>
          <h2 className="seccion__titulo">Ventas del mes · {pesos(datos.ventas.reduce((a, v) => a + (v.total ?? 0), 0))}</h2>
          <ul className="cuentas">
            {datos.ventas.map((v) => (
              <li key={v.nombre} className="fila-dato">
                <span>
                  {v.nombre} <small className="muted">· {num(v.unidades)} vendidos</small>
                </span>
                <strong>{pesos(v.total)}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      {seAcaban.length > 0 && (
        <section>
          <h2 className="seccion__titulo">Se acaban pronto (según el ritmo real)</h2>
          <ul className="cuentas">
            {seAcaban.map((p) => (
              <li key={p.id} className="fila-dato">
                <FotoProducto p={p} />
                <span>{nombreCompleto(p)}</span>
                <strong>~{p.diasRestantes} días</strong>
              </li>
            ))}
          </ul>
        </section>
      )}
      {masUsados.length > 0 && (
        <section>
          <h2 className="seccion__titulo">Lo más usado del mes</h2>
          <ul className="cuentas">
            {masUsados.map((p) => (
              <li key={p.id} className="fila-dato">
                <FotoProducto p={p} />
                <span>{nombreCompleto(p)}</span>
                <strong>
                  {num(p.consumo30)} {UNIDADES[p.unidad].corto}
                </strong>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

/* ── Página ───────────────────────────────────────────── */

const Insumos = ({ cuenta }) => {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [vista, setVista] = useState('productos');
  const [cat, setCat] = useState('Todos');
  const [busca, setBusca] = useState('');
  const [hoja, setHoja] = useState(null);
  const [aviso, setAviso] = useState('');
  const avisoT = useRef();

  const cargar = useCallback(async () => {
    try {
      setDatos(await api('insumos'));
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

  const productos = datos?.productos ?? [];
  const hayVenta = productos.some((p) => p.uso !== 'trabajo');
  const cats = ['Todos', ...(hayVenta ? ['Para vender'] : []), ...CATEGORIAS_INSUMO.filter((c) => productos.some((p) => p.categoria === c))];
  const filtrados = productos
    .filter((p) => cat === 'Todos' || (cat === 'Para vender' ? p.uso !== 'trabajo' : p.categoria === cat))
    .filter((p) => !busca.trim() || `${p.nombre} ${p.marca ?? ''} ${p.variante ?? ''}`.toLowerCase().includes(busca.trim().toLowerCase()));
  const familias = agrupar(filtrados);
  const familiaAbierta = hoja?.tipo === 'familia' ? agrupar(productos).find((f) => f.clave === hoja.clave) : null;
  const bajos = productos.filter((p) => p.bajo);
  const verDatos = puede(cuenta, 'insumos') || puede(cuenta, 'finanzas');
  const actual = hoja?.id ? productos.find((p) => p.id === hoja.id) : null;

  return (
    <div className="panel">
      <header className="panel__cabeza">
        <span className="eyebrow">Insumos</span>
        <h1 className="panel__titulo">
          Lo que <em>usamos</em>
        </h1>
      </header>

      <button type="button" className="boton-heroe" onClick={() => setHoja({ tipo: 'usar' })}>
        <span className="boton-heroe__icono">
          <Scale strokeWidth={1.6} />
        </span>
        <span>
          <strong>Anotar lo que usé</strong>
          <small>Servicio, producto y lo que marcó la pesa</small>
        </span>
      </button>

      {verDatos && (
        <div className="segmentado segmentado--ancho">
          <button type="button" aria-pressed={vista === 'productos'} onClick={() => setVista('productos')}>
            Productos
          </button>
          <button type="button" aria-pressed={vista === 'datos'} onClick={() => setVista('datos')}>
            Datos
          </button>
        </div>
      )}

      {error && <p className="portal-error" role="alert">{error}</p>}
      {!datos && !error && <p className="muted">Cargando…</p>}

      {vista === 'datos' && datos ? (
        <Datos productos={productos} verCostos={datos.verCostos} />
      ) : (
        datos && (
          <>
            {bajos.length > 0 && (
              <p className="alerta">
                <strong>{bajos.length === 1 ? '1 producto se está acabando' : `${bajos.length} productos se están acabando`}:</strong>{' '}
                {bajos
                  .slice(0, 4)
                  .map((p) => p.nombre)
                  .join(', ')}
                {bajos.length > 4 ? '…' : ''}
              </p>
            )}
            {productos.length > 0 && (
              <div className="herramientas">
                <label className="buscador">
                  <SearchIcon />
                  <span className="visually-hidden">Buscar producto</span>
                  <input className="input" placeholder="Buscar producto" value={busca} onChange={(e) => setBusca(e.target.value)} />
                </label>
                <div className="herramientas__chips">
                  {cats.map((c) => (
                    <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {productos.length === 0 && (
              <div className="vacio">
                <Package strokeWidth={1.2} />
                <p>
                  <strong>Agreguemos el primer producto.</strong>
                  <br />
                  Toca «+», sácale una foto y escribe cuánto trae. Toma un minuto.
                </p>
              </div>
            )}
            <ul className="productos">
              {familias.map((f) => {
                if (!f.esFamilia) {
                  const p = f.items[0];
                  return (
                    <li key={p.id}>
                      <button type="button" className={`producto ${p.bajo ? 'is-bajo' : ''}`} onClick={() => setHoja({ tipo: 'ficha', id: p.id })}>
                        <FotoProducto p={p} />
                        <span className="producto__nombre">{p.nombre}</span>
                        <span className="producto__marca">{p.marca ?? p.categoria}</span>
                        <span className="producto__barra">
                          <span style={{ width: `${barra(p)}%` }} />
                        </span>
                        <span className="producto__quedan">{quedan(p)}</span>
                        {p.bajo && <span className="producto__alerta">Queda poco</span>}
                        {p.uso !== 'trabajo' && <span className="producto__venta">Venta</span>}
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={f.clave}>
                    <button type="button" className={`producto ${f.bajos ? 'is-bajo' : ''}`} onClick={() => setHoja({ tipo: 'familia', clave: f.clave })}>
                      <FotoProducto p={f.portada} />
                      <span className="producto__nombre">{f.nombre}</span>
                      <span className="producto__marca">{f.marca ?? f.categoria}</span>
                      <span className="producto__tonos">
                        {f.items.length} {f.items.length === 1 ? 'tono' : 'tonos'}
                        <ChevronRight size={14} />
                      </span>
                      {f.bajos > 0 && <span className="producto__alerta">{f.bajos === 1 ? '1 se acaba' : `${f.bajos} se acaban`}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )
      )}

      <button type="button" className="fab" onClick={() => setHoja({ tipo: 'nuevo' })} aria-label="Producto nuevo">
        <Plus />
      </button>
      <button type="button" className="btn btn--sm btn--ghost solo-compu" onClick={() => setHoja({ tipo: 'nuevo' })}>
        <Plus size={16} /> Producto nuevo
      </button>

      {aviso && (
        <p className="aviso" role="status">
          {aviso}
        </p>
      )}

      {hoja?.tipo === 'usar' && (
        <AnotarUso cuenta={cuenta} productos={productos} inicial={hoja.producto} onListo={listo} onCerrar={() => setHoja(null)} />
      )}
      {hoja?.tipo === 'nuevo' && <FormProducto base={hoja.base} verCostos={datos?.verCostos} onListo={listo} onCerrar={() => setHoja(null)} />}
      {familiaAbierta && (
        <Hoja titulo={familiaAbierta.nombre} onCerrar={() => setHoja(null)}>
          {familiaAbierta.marca && <p className="muted">{familiaAbierta.marca}</p>}
          <ul className="cuentas">
            {familiaAbierta.items.map((p) => (
              <li key={p.id}>
                <button type="button" className="fila-dato fila-dato--boton" onClick={() => setHoja({ tipo: 'ficha', id: p.id })}>
                  <FotoProducto p={p} />
                  <span>
                    <strong>{p.variante ?? 'Sin tono'}</strong>
                    <small className={p.bajo ? 'texto-alerta' : 'muted'}> · {quedan(p)}</small>
                  </span>
                  <ChevronRight size={18} />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn--ghost" onClick={() => setHoja({ tipo: 'nuevo', base: familiaAbierta.items[0] })}>
            <Plus size={16} /> Agregar otro tono
          </button>
        </Hoja>
      )}
      {hoja?.tipo === 'editar' && actual && (
        <FormProducto producto={actual} verCostos={datos?.verCostos} onListo={listo} onCerrar={() => setHoja(null)} />
      )}
      {hoja?.tipo === 'ficha' && actual && (
        <FichaProducto
          p={actual}
          verCostos={datos?.verCostos}
          puedeEditar={datos?.puedeEditar}
          onUsar={() => setHoja({ tipo: 'usar', producto: actual })}
          onEditar={() => setHoja({ tipo: 'editar', id: actual.id })}
          onOtroTono={() => setHoja({ tipo: 'nuevo', base: actual })}
          onCambio={(t) => {
            mostrarAviso(t);
            cargar();
          }}
          onCerrar={() => setHoja(null)}
        />
      )}
    </div>
  );
};

export default Insumos;
