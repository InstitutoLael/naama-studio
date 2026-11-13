// API del portal de Naamá. functions/api/portal/[[ruta]].js solo llama a manejar().
// Todo vive bajo /api/portal/… y responde JSON.

import { asegurarEsquema } from './esquema.js';
import { claveTemporal, hashClave, igualSeguro, nuevoToken, sha256, verificarClave } from './seguridad.js';
import { PERMISOS, ROL_IDS, permisosDe } from '../src/portal/permisos.js';
import { normalizarTelefono, prepararContactos } from '../src/portal/contactos.js';
import { COMISIONES, MEDIOS_PAGO, PROFESIONALES, buscarServicio, comisionSugerida, profesionalDeNombre, turnoDeHora } from '../src/portal/servicios.js';

const COOKIE = 'naama_sesion';
const DIAS_SESION = 30;
const MIN_CLAVE = 8;

// Límites de intentos: [máximo, ventana en minutos]
const LIMITES = {
  entrarEmail: [5, 15],
  entrarIp: [20, 15],
  configurarIp: [5, 60],
};

/* ── utilidades ─────────────────────────────────────────── */

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });

const error = (status, mensaje) => json({ ok: false, error: mensaje }, status);

const ahora = () => new Date().toISOString();

/** Fecha (AAAA-MM-DD) en Chile. Usa la zona real, así respeta el horario de verano e invierno. */
export const fechaChile = (d = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

const limpiarEmail = (e) => String(e ?? '').trim().toLowerCase();
const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 120;
const limpiarNombre = (n) => String(n ?? '').trim().replace(/\s+/g, ' ').slice(0, 60);

const leerCookie = (request, nombre) => {
  const c = request.headers.get('Cookie') ?? '';
  const m = c.split(/;\s*/).find((p) => p.startsWith(`${nombre}=`));
  return m ? decodeURIComponent(m.slice(nombre.length + 1)) : null;
};

const cookieSesion = (token, maxAge) =>
  `${COOKIE}=${token}; Path=/api/portal; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

const ipDe = (request) => request.headers.get('CF-Connecting-IP') ?? 'local';

async function leerJson(request) {
  try {
    const t = await request.text();
    return t ? JSON.parse(t) : {};
  } catch {
    return null;
  }
}

/** Cuenta tal como la ve el navegador (nunca el hash ni la sal). */
const publica = (c) => ({
  id: c.id,
  email: c.email,
  nombre: c.nombre,
  rol: c.rol,
  extras: JSON.parse(c.extras || '[]'),
  permisos: permisosDe(c.rol, JSON.parse(c.extras || '[]')),
  debeCambiar: Boolean(c.debe_cambiar),
  activa: Boolean(c.activa),
  demo: Boolean(c.demo),
  creada: c.creada,
  ultimoIngreso: c.ultimo_ingreso,
});

/* ── límite de intentos ─────────────────────────────────── */

async function superaLimite(db, tipo, valor) {
  const [max, minutos] = LIMITES[tipo];
  const desde = Date.now() - minutos * 60000;
  const fila = await db
    .prepare('SELECT COUNT(*) AS n FROM intentos WHERE clave = ? AND ts > ?')
    .bind(`${tipo}:${valor}`, desde)
    .first();
  return (fila?.n ?? 0) >= max;
}

const anotarIntento = (db, tipo, valor) =>
  db.prepare('INSERT INTO intentos (clave, ts) VALUES (?, ?)').bind(`${tipo}:${valor}`, Date.now()).run();

const registrar = (db, cuentaId, tipo, detalle = null) =>
  db
    .prepare('INSERT INTO actividad (cuenta_id, tipo, detalle, ts) VALUES (?, ?, ?, ?)')
    .bind(cuentaId, tipo, detalle ? JSON.stringify(detalle) : null, ahora())
    .run();

/* ── sesión ─────────────────────────────────────────────── */

async function crearSesion(db, cuentaId) {
  const token = nuevoToken();
  const vence = new Date(Date.now() + DIAS_SESION * 86400000).toISOString();
  await db
    .prepare('INSERT INTO sesiones (token_hash, cuenta_id, creada, vence) VALUES (?, ?, ?, ?)')
    .bind(await sha256(token), cuentaId, ahora(), vence)
    .run();
  return cookieSesion(token, DIAS_SESION * 86400);
}

async function cuentaDeSesion(db, request) {
  const token = leerCookie(request, COOKIE);
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const fila = await db
    .prepare(
      `SELECT c.* FROM sesiones s JOIN cuentas c ON c.id = s.cuenta_id
       WHERE s.token_hash = ? AND s.vence > ? AND c.activa = 1`,
    )
    .bind(await sha256(token), ahora())
    .first();
  return fila ?? null;
}

/* ── rutas ──────────────────────────────────────────────── */

const rutas = [];
const ruta = (metodo, patron, opciones, fn) => rutas.push({ metodo, patron, ...opciones, fn });

// ¿Hay cuentas? ¿Quién soy?
ruta('GET', /^estado$/, {}, async ({ db, cuenta }) => {
  const total = await db.prepare('SELECT COUNT(*) AS n FROM cuentas').first();
  return json({ ok: true, configurado: (total?.n ?? 0) > 0, cuenta: cuenta ? publica(cuenta) : null });
});

// Primera cuenta (Administración). Solo funciona si no hay ninguna y con el secreto SETUP_SECRET de Cloudflare.
ruta('POST', /^configurar$/, {}, async ({ db, env, body, request }) => {
  const ip = ipDe(request);
  if (await superaLimite(db, 'configurarIp', ip)) return error(429, 'Demasiados intentos. Espera una hora.');
  const total = await db.prepare('SELECT COUNT(*) AS n FROM cuentas').first();
  if ((total?.n ?? 0) > 0) return error(409, 'El portal ya está configurado.');
  if (!env.SETUP_SECRET) return error(503, 'Falta configurar SETUP_SECRET en Cloudflare.');
  if (!igualSeguro(body.secreto, env.SETUP_SECRET)) {
    await anotarIntento(db, 'configurarIp', ip);
    return error(403, 'La clave de configuración no es correcta.');
  }
  const email = limpiarEmail(body.email);
  const nombre = limpiarNombre(body.nombre);
  if (!nombre || !emailValido(email)) return error(400, 'Revisa el nombre y el correo.');
  if (String(body.clave ?? '').length < MIN_CLAVE) return error(400, `La clave debe tener al menos ${MIN_CLAVE} caracteres.`);
  const { hash, sal } = await hashClave(body.clave);
  const r = await db
    .prepare(
      `INSERT INTO cuentas (email, nombre, rol, extras, hash, sal, debe_cambiar, creada, ultimo_ingreso)
       VALUES (?, ?, 'admin', '[]', ?, ?, 0, ?, ?)`,
    )
    .bind(email, nombre, hash, sal, ahora(), ahora())
    .run();
  const id = r.meta.last_row_id;
  await registrar(db, id, 'configuracion');
  const cuenta = await db.prepare('SELECT * FROM cuentas WHERE id = ?').bind(id).first();
  return json({ ok: true, cuenta: publica(cuenta) }, 201, { 'Set-Cookie': await crearSesion(db, id) });
});

ruta('POST', /^entrar$/, {}, async ({ db, body, request }) => {
  const email = limpiarEmail(body.email);
  const ip = ipDe(request);
  if ((await superaLimite(db, 'entrarEmail', email)) || (await superaLimite(db, 'entrarIp', ip))) {
    return error(429, 'Demasiados intentos. Espera 15 minutos o pídele a Administración que te restablezca la clave.');
  }
  const cuenta = await db.prepare('SELECT * FROM cuentas WHERE email = ?').bind(email).first();
  // Siempre calculamos un hash, exista o no la cuenta, para no revelar qué correos existen por el tiempo de respuesta.
  const ok = cuenta
    ? await verificarClave(String(body.clave ?? ''), cuenta.hash, cuenta.sal)
    : (await hashClave(String(body.clave ?? '')), false);
  if (!ok || !cuenta.activa) {
    await anotarIntento(db, 'entrarEmail', email);
    await anotarIntento(db, 'entrarIp', ip);
    return error(401, 'Correo o clave incorrectos.');
  }
  await db.prepare('UPDATE cuentas SET ultimo_ingreso = ? WHERE id = ?').bind(ahora(), cuenta.id).run();
  await registrar(db, cuenta.id, 'entrar');
  return json({ ok: true, cuenta: publica(cuenta) }, 200, { 'Set-Cookie': await crearSesion(db, cuenta.id) });
});

ruta('POST', /^salir$/, {}, async ({ db, request }) => {
  const token = leerCookie(request, COOKIE);
  if (token) await db.prepare('DELETE FROM sesiones WHERE token_hash = ?').bind(await sha256(token)).run();
  return json({ ok: true }, 200, { 'Set-Cookie': cookieSesion('', 0) });
});

ruta('POST', /^clave$/, { sesion: true, permiteCambio: true }, async ({ db, cuenta, body, request }) => {
  const nueva = String(body.nueva ?? '');
  if (!(await verificarClave(String(body.actual ?? ''), cuenta.hash, cuenta.sal))) {
    return error(401, 'La clave actual no es correcta.');
  }
  if (nueva.length < MIN_CLAVE) return error(400, `La clave nueva debe tener al menos ${MIN_CLAVE} caracteres.`);
  if (nueva === body.actual) return error(400, 'La clave nueva tiene que ser distinta a la actual.');
  const { hash, sal } = await hashClave(nueva);
  await db.prepare('UPDATE cuentas SET hash = ?, sal = ?, debe_cambiar = 0 WHERE id = ?').bind(hash, sal, cuenta.id).run();
  // Cierra las demás sesiones abiertas (otro celular, otro computador).
  const token = leerCookie(request, COOKIE);
  await db
    .prepare('DELETE FROM sesiones WHERE cuenta_id = ? AND token_hash != ?')
    .bind(cuenta.id, await sha256(token ?? ''))
    .run();
  await registrar(db, cuenta.id, 'cambio_clave');
  return json({ ok: true });
});

/* Gestión de cuentas (permiso «cuentas») */

const validarRolExtras = (rol, extras) => {
  if (!ROL_IDS.includes(rol)) return 'Rol no válido.';
  if (!Array.isArray(extras) || extras.some((p) => !(p in PERMISOS))) return 'Permisos no válidos.';
  return null;
};

ruta('GET', /^cuentas$/, { permiso: 'cuentas' }, async ({ db }) => {
  const { results } = await db.prepare('SELECT * FROM cuentas ORDER BY activa DESC, nombre COLLATE NOCASE').all();
  const hoy = fechaChile();
  return json({
    ok: true,
    hoy,
    cuentas: results.map((c) => ({
      ...publica(c),
      entroHoy: c.ultimo_ingreso ? fechaChile(new Date(c.ultimo_ingreso)) === hoy : false,
    })),
  });
});

ruta('POST', /^cuentas$/, { permiso: 'cuentas' }, async ({ db, cuenta, body }) => {
  const email = limpiarEmail(body.email);
  const nombre = limpiarNombre(body.nombre);
  const rol = String(body.rol ?? '');
  const extras = body.extras ?? [];
  if (!nombre || !emailValido(email)) return error(400, 'Revisa el nombre y el correo.');
  const malo = validarRolExtras(rol, extras);
  if (malo) return error(400, malo);
  const existe = await db.prepare('SELECT id FROM cuentas WHERE email = ?').bind(email).first();
  if (existe) return error(409, 'Ya hay una cuenta con ese correo.');
  const temporal = claveTemporal();
  const { hash, sal } = await hashClave(temporal);
  const r = await db
    .prepare(
      `INSERT INTO cuentas (email, nombre, rol, extras, hash, sal, debe_cambiar, demo, creada, creada_por)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
    )
    .bind(email, nombre, rol, JSON.stringify([...new Set(extras)]), hash, sal, body.demo ? 1 : 0, ahora(), cuenta.id)
    .run();
  const id = r.meta.last_row_id;
  await registrar(db, cuenta.id, 'crear_cuenta', { id, rol });
  const nuevaCuenta = await db.prepare('SELECT * FROM cuentas WHERE id = ?').bind(id).first();
  return json({ ok: true, cuenta: publica(nuevaCuenta), claveTemporal: temporal }, 201);
});

ruta('POST', /^cuentas\/(\d+)$/, { permiso: 'cuentas' }, async ({ db, cuenta, body, params }) => {
  const id = Number(params[0]);
  const actual = await db.prepare('SELECT * FROM cuentas WHERE id = ?').bind(id).first();
  if (!actual) return error(404, 'No existe esa cuenta.');
  const rol = body.rol ?? actual.rol;
  const extras = body.extras ?? JSON.parse(actual.extras);
  const nombre = body.nombre !== undefined ? limpiarNombre(body.nombre) : actual.nombre;
  const activa = body.activa !== undefined ? (body.activa ? 1 : 0) : actual.activa;
  const malo = validarRolExtras(rol, extras);
  if (malo) return error(400, malo);
  if (!nombre) return error(400, 'El nombre no puede quedar vacío.');
  // Nadie se quita a sí misma el acceso a Cuentas ni se desactiva (para no quedar sin administración).
  if (id === cuenta.id && (!permisosDe(rol, extras).includes('cuentas') || !activa)) {
    return error(400, 'No puedes quitarte tu propio acceso. Pídeselo a otra persona de Administración.');
  }
  await db
    .prepare('UPDATE cuentas SET nombre = ?, rol = ?, extras = ?, activa = ? WHERE id = ?')
    .bind(nombre, rol, JSON.stringify([...new Set(extras)]), activa, id)
    .run();
  if (!activa) await db.prepare('DELETE FROM sesiones WHERE cuenta_id = ?').bind(id).run();
  await registrar(db, cuenta.id, 'editar_cuenta', { id, rol, activa });
  const nueva = await db.prepare('SELECT * FROM cuentas WHERE id = ?').bind(id).first();
  return json({ ok: true, cuenta: publica(nueva) });
});

ruta('POST', /^cuentas\/(\d+)\/restablecer$/, { permiso: 'cuentas' }, async ({ db, cuenta, params }) => {
  const id = Number(params[0]);
  const actual = await db.prepare('SELECT id FROM cuentas WHERE id = ?').bind(id).first();
  if (!actual) return error(404, 'No existe esa cuenta.');
  const temporal = claveTemporal();
  const { hash, sal } = await hashClave(temporal);
  await db.batch([
    db.prepare('UPDATE cuentas SET hash = ?, sal = ?, debe_cambiar = 1 WHERE id = ?').bind(hash, sal, id),
    db.prepare('DELETE FROM sesiones WHERE cuenta_id = ?').bind(id),
  ]);
  await registrar(db, cuenta.id, 'restablecer_clave', { id });
  return json({ ok: true, claveTemporal: temporal });
});

/* ── Clientas ───────────────────────────────────────────────
   Todas las cuentas pueden subir clientas y anotar visitas.
   Solo quien tiene el permiso «clientas» (Administración y Dueña) ve los números. */

const tiene = (cuenta, permiso) => permisosDe(cuenta.rol, JSON.parse(cuenta.extras || '[]')).includes(permiso);

const diasEntre = (desde, hasta) => Math.round((Date.parse(`${hasta}T12:00:00Z`) - Date.parse(`${desde}T12:00:00Z`)) / 86400000);

const clientaPublica = (c, verNumero, hoy) => ({
  id: c.id,
  nombre: c.nombre,
  nota: c.nota,
  visitas: c.visitas,
  ultimaVisita: c.ultima_visita,
  diasSinVenir: c.ultima_visita ? diasEntre(c.ultima_visita, hoy) : null,
  creada: c.creada,
  ...(verNumero ? { telefono: c.telefono, origen: c.origen } : {}),
});

const MAX_IMPORTAR = 1000;
const TANDA = 40; // D1 acepta ~90 variables por consulta: insertamos de a una fila, en tandas de 40 consultas

ruta('GET', /^clientas$/, { sesion: true }, async ({ db, cuenta }) => {
  const { results } = await db.prepare('SELECT * FROM clientas WHERE activa = 1 ORDER BY nombre COLLATE NOCASE').all();
  const hoy = fechaChile();
  const ver = tiene(cuenta, 'clientas');
  return json({ ok: true, hoy, verNumeros: ver, clientas: results.map((c) => clientaPublica(c, ver, hoy)) });
});

/** Sube una o varias clientas. Body: { contactos: [{ nombre, telefono }], origen }. Se limpian y se saltan las repetidas. */
ruta('POST', /^clientas$/, { sesion: true }, async ({ db, cuenta, body }) => {
  const lista = Array.isArray(body.contactos) ? body.contactos : [];
  if (!lista.length) return error(400, 'No hay contactos para subir.');
  const origen = ['contacto', 'archivo', 'manual'].includes(body.origen) ? body.origen : 'manual';
  if (lista.length > 1 && !tiene(cuenta, 'clientas')) return error(403, 'Solo Administración puede importar listas de contactos.');
  if (lista.length > MAX_IMPORTAR) return error(400, `Máximo ${MAX_IMPORTAR} contactos por vez.`);

  const preparados = prepararContactos(lista.map((c) => ({ original: c.nombre, telefono: c.telefono })));
  // Si viene un nombre ya editado a mano, se respeta tal cual (solo se recorta).
  preparados.forEach((p, i) => {
    if (lista[i].editado && String(lista[i].nombre ?? '').trim()) {
      p.nombre = String(lista[i].nombre).trim().replace(/\s+/g, ' ').slice(0, 60);
      p.valido = Boolean(p.telefono);
    }
    if (lista[i].nota !== undefined) p.nota = String(lista[i].nota ?? '').trim().slice(0, 80);
  });
  const validos = preparados.filter((p) => p.valido && !p.repetido);
  const invalidas = preparados.filter((p) => !p.valido).length;

  // ¿Cuáles ya existen? Se consulta por tandas para no pasar el límite de variables de D1.
  const existentes = new Map();
  for (let i = 0; i < validos.length; i += 80) {
    const tanda = validos.slice(i, i + 80).map((p) => p.telefono);
    const { results } = await db
      .prepare(`SELECT id, nombre, telefono FROM clientas WHERE telefono IN (${tanda.map(() => '?').join(',')})`)
      .bind(...tanda)
      .all();
    results.forEach((r) => existentes.set(r.telefono, r));
  }
  const nuevos = validos.filter((p) => !existentes.has(p.telefono));
  const t = ahora();
  for (let i = 0; i < nuevos.length; i += TANDA) {
    await db.batch(
      nuevos.slice(i, i + TANDA).map((p) =>
        db
          .prepare('INSERT INTO clientas (nombre, telefono, nota, origen, creada, creada_por) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(telefono) DO NOTHING')
          .bind(p.nombre, p.telefono, p.nota || null, origen, t, cuenta.id),
      ),
    );
  }
  await registrar(db, cuenta.id, 'subir_clientas', { nuevas: nuevos.length, origen });
  const repetidas = validos.length - nuevos.length + preparados.filter((p) => p.repetido).length;
  // A quien no ve números, solo se le dice el nombre con que ya estaba guardada.
  const yaEstaban = validos.filter((p) => existentes.has(p.telefono)).map((p) => existentes.get(p.telefono).nombre);
  return json({ ok: true, creadas: nuevos.length, repetidas, invalidas, yaEstaban: yaEstaban.slice(0, 20) }, 201);
});

ruta('POST', /^clientas\/(\d+)\/visita$/, { sesion: true }, async ({ db, cuenta, body, params }) => {
  const id = Number(params[0]);
  const c = await db.prepare('SELECT id FROM clientas WHERE id = ? AND activa = 1').bind(id).first();
  if (!c) return error(404, 'No existe esa clienta.');
  const hoy = fechaChile();
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(body.fecha ?? '') ? body.fecha : hoy;
  if (fecha > hoy) return error(400, 'La fecha no puede ser futura.');
  const r = await db
    .prepare('INSERT INTO visitas (clienta_id, fecha, cuenta_id, ts) VALUES (?, ?, ?, ?) ON CONFLICT(clienta_id, fecha) DO NOTHING')
    .bind(id, fecha, cuenta.id, ahora())
    .run();
  if (r.meta.changes) {
    await db
      .prepare(
        `UPDATE clientas SET visitas = (SELECT COUNT(*) FROM visitas WHERE clienta_id = ?),
         ultima_visita = (SELECT MAX(fecha) FROM visitas WHERE clienta_id = ?) WHERE id = ?`,
      )
      .bind(id, id, id)
      .run();
    await registrar(db, cuenta.id, 'visita', { clienta: id, fecha });
  }
  const fila = await db.prepare('SELECT * FROM clientas WHERE id = ?').bind(id).first();
  return json({ ok: true, yaEstaba: !r.meta.changes, clienta: clientaPublica(fila, tiene(cuenta, 'clientas'), hoy) });
});

ruta('GET', /^clientas\/(\d+)\/visitas$/, { sesion: true }, async ({ db, params }) => {
  const { results } = await db
    .prepare(
      `SELECT v.fecha, c.nombre AS anotada_por FROM visitas v LEFT JOIN cuentas c ON c.id = v.cuenta_id
       WHERE v.clienta_id = ? ORDER BY v.fecha DESC LIMIT 50`,
    )
    .bind(Number(params[0]))
    .all();
  return json({ ok: true, visitas: results.map((v) => ({ fecha: v.fecha, anotadaPor: v.anotada_por })) });
});

ruta('POST', /^clientas\/(\d+)$/, { permiso: 'clientas' }, async ({ db, cuenta, body, params }) => {
  const id = Number(params[0]);
  const c = await db.prepare('SELECT * FROM clientas WHERE id = ?').bind(id).first();
  if (!c) return error(404, 'No existe esa clienta.');
  const nombre = body.nombre !== undefined ? String(body.nombre).trim().replace(/\s+/g, ' ').slice(0, 60) : c.nombre;
  const nota = body.nota !== undefined ? String(body.nota ?? '').trim().slice(0, 80) : c.nota;
  const activa = body.activa !== undefined ? (body.activa ? 1 : 0) : c.activa;
  let telefono = c.telefono;
  if (body.telefono !== undefined) {
    telefono = normalizarTelefono(body.telefono);
    if (!telefono) return error(400, 'El número no es válido.');
    const otra = await db.prepare('SELECT id FROM clientas WHERE telefono = ? AND id != ?').bind(telefono, id).first();
    if (otra) return error(409, 'Ese número ya es de otra clienta.');
  }
  if (!nombre) return error(400, 'El nombre no puede quedar vacío.');
  await db.prepare('UPDATE clientas SET nombre = ?, nota = ?, telefono = ?, activa = ? WHERE id = ?').bind(nombre, nota, telefono, activa, id).run();
  await registrar(db, cuenta.id, 'editar_clienta', { id, activa });
  const fila = await db.prepare('SELECT * FROM clientas WHERE id = ?').bind(id).first();
  return json({ ok: true, clienta: clientaPublica(fila, true, fechaChile()) });
});

/* ── Insumos ────────────────────────────────────────────────
   Todas: ver productos, crear uno con foto, anotar lo que usaron y avisar que llegó una compra.
   Permiso «insumos»: editar productos y corregir stock.
   Los costos y montos solo los ve quien tiene «finanzas» o «compras» (Gaby no). */

const verCostos = (cuenta) => tiene(cuenta, 'finanzas') || tiene(cuenta, 'compras');
const UNIDADES_OK = ['g', 'ml', 'u'];
const USOS_OK = ['trabajo', 'venta', 'ambos'];
const FOTO_RE = /^data:image\/(webp|jpeg|png);base64,([A-Za-z0-9+/=]+)$/;
const MAX_FOTO = 450000; // ~330 KB de imagen: las fotos se achican en el celular antes de subir

const numero = (v, { min = 0, max = 1e7 } = {}) => {
  const n = Number(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};
const texto = (v, largo = 80) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, largo);
const haceDias = (n) => fechaChile(new Date(Date.now() - n * 86400000));

async function guardarFoto(db, foto) {
  if (!foto) return null;
  const m = String(foto).match(FOTO_RE);
  if (!m || foto.length > MAX_FOTO) throw Object.assign(new Error('La foto no es válida o es muy grande.'), { status: 400 });
  const r = await db.prepare('INSERT INTO fotos (tipo, datos, creada) VALUES (?, ?, ?)').bind(`image/${m[1]}`, m[2], ahora()).run();
  return r.meta.last_row_id;
}

const productoPublico = (p, ver) => {
  const tam = p.tamano || 1;
  const consumoDia = (p.c30 ?? 0) / 30;
  return {
    id: p.id,
    nombre: p.nombre,
    marca: p.marca,
    categoria: p.categoria,
    unidad: p.unidad,
    tamano: p.tamano,
    stock: Math.round(p.stock * 10) / 10,
    envases: Math.round((p.stock / tam) * 10) / 10,
    minimo: p.minimo,
    bajo: p.stock <= p.minimo * tam,
    fotoId: p.foto_id,
    variante: p.variante,
    uso: p.uso,
    precioVenta: p.precio_venta,
    proveedor: p.proveedor,
    consumo30: Math.round((p.c30 ?? 0) * 10) / 10,
    usos30: p.n30 ?? 0,
    diasRestantes: consumoDia > 0 ? Math.floor(p.stock / consumoDia) : null,
    ...(ver ? { costo: p.costo, costoUnidad: p.costo ? p.costo / tam : null } : {}),
  };
};

const SQL_PRODUCTOS = `SELECT p.*, COALESCE(SUM(u.cantidad), 0) AS c30, COUNT(u.id) AS n30
  FROM productos p LEFT JOIN usos u ON u.producto_id = p.id AND u.fecha >= ?
  WHERE p.activo = 1 GROUP BY p.id ORDER BY p.categoria, p.nombre COLLATE NOCASE, p.variante COLLATE NOCASE`;

ruta('GET', /^insumos$/, { sesion: true }, async ({ db, cuenta }) => {
  const { results } = await db.prepare(SQL_PRODUCTOS).bind(haceDias(30)).all();
  const ver = verCostos(cuenta);
  return json({ ok: true, verCostos: ver, puedeEditar: tiene(cuenta, 'insumos'), productos: results.map((p) => productoPublico(p, ver)) });
});

ruta('GET', /^insumos\/foto\/(\d+)$/, { sesion: true }, async ({ db, params }) => {
  const f = await db.prepare('SELECT tipo, datos FROM fotos WHERE id = ?').bind(Number(params[0])).first();
  if (!f) return error(404, 'No existe esa foto.');
  const bin = Uint8Array.from(atob(f.datos), (c) => c.charCodeAt(0));
  return new Response(bin, { headers: { 'Content-Type': f.tipo, 'Cache-Control': 'private, max-age=2592000, immutable' } });
});

const leerProducto = (body, cuenta, actual = {}) => {
  const nombre = body.nombre !== undefined ? texto(body.nombre, 60) : actual.nombre;
  const unidad = body.unidad ?? actual.unidad ?? 'g';
  const tamano = body.tamano !== undefined ? numero(body.tamano, { min: 0.01 }) : actual.tamano;
  const minimo = body.minimo !== undefined ? numero(body.minimo, { max: 1000 }) : actual.minimo ?? 1;
  const categoria = body.categoria !== undefined ? texto(body.categoria, 30) || 'Otros' : actual.categoria ?? 'Otros';
  const uso = body.uso ?? actual.uso ?? 'trabajo';
  if (!USOS_OK.includes(uso)) return { error: 'Elige si es para trabajar, para vender o ambos.' };
  let precioVenta = actual.precio_venta ?? null;
  if (body.precioVenta !== undefined) {
    const vacio = body.precioVenta === '' || body.precioVenta === null;
    precioVenta = vacio ? null : numero(body.precioVenta, { max: 10000000 });
    if (precioVenta === null && !vacio) return { error: 'El precio de venta no es válido.' };
    if (precioVenta !== null) precioVenta = Math.round(precioVenta);
  }
  if (!nombre) return { error: 'Ponle un nombre al producto.' };
  if (!UNIDADES_OK.includes(unidad)) return { error: 'Elige si viene en gramos, ml o unidades.' };
  if (tamano === null || tamano === undefined) return { error: 'Escribe cuánto trae cada envase (por ejemplo 1000).' };
  if (minimo === null) return { error: 'El mínimo no es válido.' };
  const datos = {
    nombre,
    marca: body.marca !== undefined ? texto(body.marca, 40) || null : actual.marca ?? null,
    categoria,
    unidad,
    tamano,
    minimo,
    proveedor: body.proveedor !== undefined ? texto(body.proveedor, 50) || null : actual.proveedor ?? null,
    variante: body.variante !== undefined ? texto(body.variante, 40) || null : actual.variante ?? null,
    uso,
    precioVenta,
    costo: actual.costo ?? null,
  };
  if (verCostos(cuenta) && body.costo !== undefined) {
    const vacio = body.costo === '' || body.costo === null;
    const c = vacio ? null : numero(body.costo, { max: 10000000 });
    if (c === null && !vacio) return { error: 'El precio no es válido.' };
    datos.costo = c === null ? null : Math.round(c);
  }
  return { datos };
};

ruta('POST', /^insumos$/, { sesion: true }, async ({ db, cuenta, body }) => {
  const { datos, error: e } = leerProducto(body, cuenta);
  if (e) return error(400, e);
  const cuantos = numero(body.envases ?? 0, { max: 10000 });
  if (cuantos === null) return error(400, 'La cantidad de envases no es válida.');
  let fotoId;
  try {
    fotoId = await guardarFoto(db, body.foto);
  } catch (err) {
    return error(err.status ?? 400, err.message);
  }
  const r = await db
    .prepare(
      `INSERT INTO productos (nombre, marca, categoria, unidad, tamano, stock, minimo, costo, proveedor, foto_id, variante, uso, precio_venta, creado, creado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(datos.nombre, datos.marca, datos.categoria, datos.unidad, datos.tamano, cuantos * datos.tamano, datos.minimo, datos.costo, datos.proveedor, fotoId, datos.variante, datos.uso, datos.precioVenta, ahora(), cuenta.id)
    .run();
  const id = r.meta.last_row_id;
  if (cuantos > 0) {
    await db
      .prepare('INSERT INTO movimientos (producto_id, tipo, cantidad, nota, cuenta_id, ts) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, 'inicial', cuantos * datos.tamano, null, cuenta.id, ahora())
      .run();
  }
  await registrar(db, cuenta.id, 'crear_producto', { id });
  const p = await db.prepare(SQL_PRODUCTOS.replace('WHERE p.activo = 1', 'WHERE p.id = ?')).bind(haceDias(30), id).first();
  return json({ ok: true, producto: productoPublico(p, verCostos(cuenta)) }, 201);
});

/** «Anotar lo que usé»: un servicio y uno o más productos con lo que marcó la pesa. */
ruta('POST', /^insumos\/uso$/, { sesion: true }, async ({ db, cuenta, body }) => {
  const items = Array.isArray(body.items) ? body.items.slice(0, 15) : [];
  const servicio = texto(body.servicio, 80) || null;
  if (!items.length) return error(400, 'Elige al menos un producto.');
  const limpios = [];
  for (const it of items) {
    const cantidad = numero(it.cantidad, { min: 0.01, max: 100000 });
    if (!cantidad) return error(400, 'Escribe cuánto usaste (lo que marcó la pesa).');
    limpios.push({ id: Number(it.productoId), cantidad });
  }
  const ids = [...new Set(limpios.map((x) => x.id))];
  const { results } = await db
    .prepare(`SELECT id FROM productos WHERE activo = 1 AND id IN (${ids.map(() => '?').join(',')})`)
    .bind(...ids)
    .all();
  if (results.length !== ids.length) return error(404, 'Uno de los productos ya no existe.');
  const registro = crypto.randomUUID();
  const hoy = fechaChile();
  const t = ahora();
  await db.batch(
    limpios.flatMap((x) => [
      db
        .prepare('INSERT INTO usos (producto_id, cantidad, servicio, registro, cuenta_id, fecha, ts) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(x.id, x.cantidad, servicio, registro, cuenta.id, hoy, t),
      db.prepare('UPDATE productos SET stock = MAX(0, stock - ?) WHERE id = ?').bind(x.cantidad, x.id),
    ]),
  );
  await registrar(db, cuenta.id, 'uso_insumos', { servicio, productos: limpios.length });
  return json({ ok: true, registro });
});

/** Llegó una compra: suma envases al stock. */
ruta('POST', /^insumos\/(\d+)\/llego$/, { sesion: true }, async ({ db, cuenta, body, params }) => {
  const id = Number(params[0]);
  const p = await db.prepare('SELECT * FROM productos WHERE id = ? AND activo = 1').bind(id).first();
  if (!p) return error(404, 'No existe ese producto.');
  const cuantos = numero(body.envases, { min: 0.1, max: 10000 });
  if (!cuantos) return error(400, '¿Cuántos llegaron?');
  await db.batch([
    db.prepare('UPDATE productos SET stock = stock + ? WHERE id = ?').bind(cuantos * p.tamano, id),
    db
      .prepare('INSERT INTO movimientos (producto_id, tipo, cantidad, nota, cuenta_id, ts) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, 'compra', cuantos * p.tamano, `${cuantos} envase(s)`, cuenta.id, ahora()),
  ]);
  await registrar(db, cuenta.id, 'llego_compra', { id, envases: cuantos });
  return json({ ok: true });
});

/** Vendí: descuenta unidades del stock y anota la venta (el total solo lo ven quienes ven plata). */
ruta('POST', /^insumos\/(\d+)\/venta$/, { sesion: true }, async ({ db, cuenta, body, params }) => {
  const id = Number(params[0]);
  const p = await db.prepare('SELECT * FROM productos WHERE id = ? AND activo = 1').bind(id).first();
  if (!p) return error(404, 'No existe ese producto.');
  if (p.uso === 'trabajo') return error(400, 'Este producto no está marcado para vender.');
  const unidades = numero(body.unidades ?? 1, { min: 1, max: 1000 });
  if (!unidades) return error(400, '¿Cuántos vendiste?');
  const total = body.total !== undefined && body.total !== '' ? numero(body.total, { max: 100000000 }) : p.precio_venta ? p.precio_venta * unidades : null;
  await db.batch([
    db.prepare('UPDATE productos SET stock = MAX(0, stock - ?) WHERE id = ?').bind(unidades * p.tamano, id),
    db
      .prepare('INSERT INTO ventas (producto_id, unidades, total, cuenta_id, fecha, ts) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, unidades, total === null ? null : Math.round(total), cuenta.id, fechaChile(), ahora()),
    db
      .prepare('INSERT INTO movimientos (producto_id, tipo, cantidad, nota, cuenta_id, ts) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, 'venta', -unidades * p.tamano, `${unidades} vendido(s)`, cuenta.id, ahora()),
  ]);
  await registrar(db, cuenta.id, 'venta', { id, unidades });
  return json({ ok: true });
});

/** Corregir el stock contando lo que hay (permiso «insumos»). */
ruta('POST', /^insumos\/(\d+)\/ajuste$/, { permiso: 'insumos' }, async ({ db, cuenta, body, params }) => {
  const id = Number(params[0]);
  const p = await db.prepare('SELECT * FROM productos WHERE id = ?').bind(id).first();
  if (!p) return error(404, 'No existe ese producto.');
  const cuantos = numero(body.envases, { max: 10000 });
  if (cuantos === null) return error(400, 'Escribe cuántos envases hay (puede ser 2,5).');
  const nuevo = cuantos * p.tamano;
  await db.batch([
    db.prepare('UPDATE productos SET stock = ? WHERE id = ?').bind(nuevo, id),
    db
      .prepare('INSERT INTO movimientos (producto_id, tipo, cantidad, nota, cuenta_id, ts) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, 'ajuste', nuevo - p.stock, 'conteo', cuenta.id, ahora()),
  ]);
  return json({ ok: true });
});

ruta('POST', /^insumos\/(\d+)$/, { permiso: 'insumos' }, async ({ db, cuenta, body, params }) => {
  const id = Number(params[0]);
  const actual = await db.prepare('SELECT * FROM productos WHERE id = ?').bind(id).first();
  if (!actual) return error(404, 'No existe ese producto.');
  if (body.activo === false) {
    await db.prepare('UPDATE productos SET activo = 0 WHERE id = ?').bind(id).run();
    return json({ ok: true });
  }
  const { datos, error: e } = leerProducto(body, cuenta, actual);
  if (e) return error(400, e);
  let fotoId = actual.foto_id;
  try {
    if (body.foto) fotoId = await guardarFoto(db, body.foto);
  } catch (err) {
    return error(err.status ?? 400, err.message);
  }
  // Si cambia el tamaño del envase, el stock se mantiene en envases.
  const stock = datos.tamano !== actual.tamano ? (actual.stock / actual.tamano) * datos.tamano : actual.stock;
  await db
    .prepare(
      'UPDATE productos SET nombre=?, marca=?, categoria=?, unidad=?, tamano=?, minimo=?, costo=?, proveedor=?, foto_id=?, stock=?, variante=?, uso=?, precio_venta=? WHERE id=?',
    )
    .bind(datos.nombre, datos.marca, datos.categoria, datos.unidad, datos.tamano, datos.minimo, datos.costo, datos.proveedor, fotoId, stock, datos.variante, datos.uso, datos.precioVenta, id)
    .run();
  await registrar(db, cuenta.id, 'editar_producto', { id });
  return json({ ok: true });
});

/** Ficha del producto: historial y promedio por servicio. */
ruta('GET', /^insumos\/(\d+)$/, { sesion: true }, async ({ db, cuenta, params }) => {
  const id = Number(params[0]);
  const [porServicio, ultimos, movs] = await Promise.all([
    db
      .prepare(
        `SELECT servicio, COUNT(*) AS veces, AVG(cantidad) AS promedio
         FROM usos WHERE producto_id = ? AND fecha >= ? GROUP BY servicio ORDER BY veces DESC LIMIT 12`,
      )
      .bind(id, haceDias(180))
      .all(),
    db
      .prepare(
        `SELECT u.fecha, u.cantidad, u.servicio, c.nombre AS quien FROM usos u LEFT JOIN cuentas c ON c.id = u.cuenta_id
         WHERE u.producto_id = ? ORDER BY u.id DESC LIMIT 15`,
      )
      .bind(id)
      .all(),
    db
      .prepare(
        `SELECT m.tipo, m.cantidad, m.nota, m.ts, c.nombre AS quien FROM movimientos m LEFT JOIN cuentas c ON c.id = m.cuenta_id
         WHERE m.producto_id = ? ORDER BY m.id DESC LIMIT 8`,
      )
      .bind(id)
      .all(),
  ]);
  const verQuien = tiene(cuenta, 'insumos') || tiene(cuenta, 'finanzas');
  return json({
    ok: true,
    porServicio: porServicio.results.map((r) => ({ servicio: r.servicio ?? 'Sin servicio', veces: r.veces, promedio: Math.round(r.promedio * 10) / 10 })),
    ultimos: ultimos.results.map((u) => ({ fecha: u.fecha, cantidad: u.cantidad, servicio: u.servicio, ...(verQuien ? { quien: u.quien } : {}) })),
    movimientos: movs.results.map((m) => ({ tipo: m.tipo, cantidad: m.cantidad, nota: m.nota, ts: m.ts, quien: m.quien })),
  });
});

/** Datos para Administración y Vivy: cuánto se usa por servicio, cuánto cuesta y qué se acaba. */
ruta('GET', /^insumos-datos$/, { sesion: true }, async ({ db, cuenta }) => {
  if (!tiene(cuenta, 'insumos') && !tiene(cuenta, 'finanzas')) return error(403, 'No tienes acceso a esta sección.');
  const desde = haceDias(90);
  const { results: filas } = await db
    .prepare(
      `SELECT u.registro, u.servicio, u.cantidad, p.id AS pid, p.nombre || COALESCE(' · ' || p.variante, '') AS nombre, p.unidad, p.costo, p.tamano
       FROM usos u JOIN productos p ON p.id = u.producto_id WHERE u.fecha >= ? ORDER BY u.id DESC LIMIT 5000`,
    )
    .bind(desde)
    .all();
  const ver = verCostos(cuenta);
  const servicios = new Map();
  for (const f of filas) {
    const nombre = f.servicio ?? 'Sin servicio';
    if (!servicios.has(nombre)) servicios.set(nombre, { registros: new Map(), productos: new Map() });
    const s = servicios.get(nombre);
    const reg = s.registros.get(f.registro) ?? { costo: 0, completo: true };
    reg.costo += f.costo ? (f.costo / f.tamano) * f.cantidad : 0;
    if (!f.costo) reg.completo = false;
    s.registros.set(f.registro, reg);
    const pr = s.productos.get(f.pid) ?? { nombre: f.nombre, unidad: f.unidad, total: 0 };
    pr.total += f.cantidad;
    s.productos.set(f.pid, pr);
  }
  const porServicio = [...servicios.entries()]
    .map(([nombre, s]) => {
      const regs = [...s.registros.values()];
      return {
        servicio: nombre,
        veces: regs.length,
        productos: [...s.productos.values()]
          .map((p) => ({ nombre: p.nombre, unidad: p.unidad, promedio: Math.round((p.total / regs.length) * 10) / 10 }))
          .sort((a, b) => b.promedio - a.promedio)
          .slice(0, 5),
        ...(ver ? { costoPromedio: Math.round(regs.reduce((a, r) => a + r.costo, 0) / regs.length), costoCompleto: regs.every((r) => r.completo) } : {}),
      };
    })
    .sort((a, b) => b.veces - a.veces);
  let ventas = null;
  if (ver) {
    const { results } = await db
      .prepare(
        `SELECT p.nombre || COALESCE(' · ' || p.variante, '') AS nombre, SUM(v.unidades) AS unidades, SUM(v.total) AS total
         FROM ventas v JOIN productos p ON p.id = v.producto_id WHERE v.fecha >= ? GROUP BY v.producto_id ORDER BY total DESC LIMIT 20`,
      )
      .bind(haceDias(30))
      .all();
    ventas = results.map((r) => ({ nombre: r.nombre, unidades: r.unidades, total: r.total }));
  }
  return json({ ok: true, desde, verCostos: ver, porServicio, ventas });
});

/* ── Lista de compras ──────────────────────────────────────
   Todas piden. Permiso «compras» marca comprado (con monto) o descarta. */

const pedidoPublico = (p, ver) => ({
  id: p.id,
  productoId: p.producto_id,
  texto: p.texto,
  cantidad: p.cantidad,
  urgente: Boolean(p.urgente),
  estado: p.estado,
  pedidoPor: p.pedido_nombre,
  ts: p.ts,
  resueltoPor: p.resuelto_nombre,
  resueltoTs: p.resuelto_ts,
  fotoId: p.foto_id ?? null,
  ...(ver ? { monto: p.monto, proveedor: p.proveedor } : {}),
});

ruta('GET', /^compras$/, { sesion: true }, async ({ db, cuenta }) => {
  const { results } = await db
    .prepare(
      `SELECT pe.*, a.nombre AS pedido_nombre, b.nombre AS resuelto_nombre, pr.foto_id
       FROM pedidos pe LEFT JOIN cuentas a ON a.id = pe.pedido_por LEFT JOIN cuentas b ON b.id = pe.resuelto_por
       LEFT JOIN productos pr ON pr.id = pe.producto_id
       WHERE pe.estado = 'pedido' OR pe.resuelto_ts >= ? ORDER BY pe.estado = 'pedido' DESC, pe.urgente DESC, pe.id DESC LIMIT 200`,
    )
    .bind(new Date(Date.now() - 45 * 86400000).toISOString())
    .all();
  const ver = verCostos(cuenta);
  return json({ ok: true, puedeResolver: tiene(cuenta, 'compras'), verCostos: ver, pedidos: results.map((p) => pedidoPublico(p, ver)) });
});

ruta('POST', /^compras$/, { sesion: true }, async ({ db, cuenta, body }) => {
  let productoId = body.productoId ? Number(body.productoId) : null;
  let t = texto(body.texto, 80);
  if (productoId) {
    const p = await db.prepare('SELECT id, nombre, marca, variante FROM productos WHERE id = ?').bind(productoId).first();
    if (!p) productoId = null;
    else {
      if (!t) t = [p.nombre, p.variante, p.marca].filter(Boolean).join(' · ');
      const ya = await db.prepare(`SELECT id FROM pedidos WHERE producto_id = ? AND estado = 'pedido'`).bind(productoId).first();
      if (ya) return json({ ok: true, yaEstaba: true });
    }
  }
  if (!t) return error(400, 'Escribe qué hay que comprar.');
  await db
    .prepare('INSERT INTO pedidos (producto_id, texto, cantidad, urgente, pedido_por, ts) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(productoId, t, texto(body.cantidad, 30) || null, body.urgente ? 1 : 0, cuenta.id, ahora())
    .run();
  await registrar(db, cuenta.id, 'pedir_compra', { productoId });
  return json({ ok: true }, 201);
});

ruta('POST', /^compras\/(\d+)$/, { permiso: 'compras' }, async ({ db, cuenta, body, params }) => {
  const id = Number(params[0]);
  const pe = await db.prepare('SELECT * FROM pedidos WHERE id = ?').bind(id).first();
  if (!pe) return error(404, 'No existe ese pedido.');
  const estado = body.estado;
  if (!['comprado', 'descartado', 'pedido'].includes(estado)) return error(400, 'Estado no válido.');
  const monto = body.monto === undefined || body.monto === '' || body.monto === null ? null : numero(body.monto, { max: 100000000 });
  const llegaron = body.envases ? numero(body.envases, { min: 0.1, max: 10000 }) : null;
  const abierto = estado === 'pedido';
  const pasos = [
    db
      .prepare('UPDATE pedidos SET estado = ?, resuelto_por = ?, resuelto_ts = ?, monto = ?, proveedor = ? WHERE id = ?')
      .bind(estado, abierto ? null : cuenta.id, abierto ? null : ahora(), monto === null ? null : Math.round(monto), texto(body.proveedor, 50) || null, id),
  ];
  if (estado === 'comprado' && pe.producto_id && llegaron) {
    const p = await db.prepare('SELECT tamano FROM productos WHERE id = ?').bind(pe.producto_id).first();
    if (p) {
      pasos.push(db.prepare('UPDATE productos SET stock = stock + ? WHERE id = ?').bind(llegaron * p.tamano, pe.producto_id));
      pasos.push(
        db
          .prepare('INSERT INTO movimientos (producto_id, tipo, cantidad, nota, cuenta_id, ts) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(pe.producto_id, 'compra', llegaron * p.tamano, `${llegaron} envase(s) · pedido ${id}`, cuenta.id, ahora()),
      );
    }
  }
  await db.batch(pasos);
  await registrar(db, cuenta.id, 'resolver_compra', { id, estado });
  return json({ ok: true });
});

/* ── Plata (Mercado Pago) ───────────────────────────────────
   Solo quien tiene «finanzas» (Diego, Allison, Vivy). Lee los pagos con la llave MP_ACCESS_TOKEN
   (secreto de Cloudflare, solo lectura). Mercado Pago no entrega el saldo por API: el saldo lo anota
   Administración desde la app de Mercado Pago y el portal descuenta lo que falta pagar del mes. */

const MP = 'https://api.mercadopago.com';

/** Desfase real de Chile para una fecha (-03:00 en verano, -04:00 en invierno). */
export const desfaseChile = (d = new Date()) => {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Santiago', timeZoneName: 'longOffset' }).formatToParts(d);
  const tz = partes.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-03:00';
  return tz.replace('GMT', '') || '+00:00';
};

const mesChile = () => fechaChile().slice(0, 7);

/** Id de la cuenta de Mercado Pago dueña de la llave (para quedarnos solo con lo que le pagan a Naamá). */
async function cuentaMP(env) {
  try {
    const r = await (env.MP_FETCH ?? fetch)(`${MP}/users/me`, { headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` } });
    if (!r.ok) return null;
    return (await r.json()).id ?? null;
  } catch {
    return null;
  }
}

async function pagosMP(env, desde) {
  const llamar = env.MP_FETCH ?? fetch;
  const pagos = [];
  for (let offset = 0; offset < 1000; offset += 100) {
    const url = new URL(`${MP}/v1/payments/search`);
    url.search = new URLSearchParams({
      sort: 'date_created',
      criteria: 'desc',
      range: 'date_created',
      begin_date: `${desde}T00:00:00.000${desfaseChile(new Date(`${desde}T12:00:00Z`))}`,
      end_date: 'NOW',
      limit: '100',
      offset: String(offset),
    }).toString();
    const r = await llamar(url.toString(), { headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` } });
    if (r.status === 401 || r.status === 403) throw Object.assign(new Error('La llave de Mercado Pago no es válida o venció.'), { status: 502 });
    if (!r.ok) throw Object.assign(new Error('Mercado Pago no respondió. Inténtalo en un rato.'), { status: 502 });
    const data = await r.json();
    pagos.push(...(data.results ?? []));
    if ((data.results ?? []).length < 100) break;
  }
  return pagos;
}

const resumirPago = (p) => {
  const comision = (p.fee_details ?? []).reduce((a, f) => a + (f.amount ?? 0), 0);
  const bruto = p.transaction_amount ?? 0;
  const neto = p.transaction_details?.net_received_amount ?? bruto - comision;
  return {
    id: p.id,
    fecha: p.date_approved ?? p.date_created,
    dia: fechaChile(new Date(p.date_approved ?? p.date_created)),
    bruto,
    comision: Math.round(comision),
    neto: Math.round(neto),
    estado: p.status,
    medio: p.payment_type_id,
    libera: p.money_release_date,
    liberado: p.money_release_status === 'released',
    detalle: p.description ?? null,
    cobrador: p.collector_id ?? p.collector?.id ?? null,
    operacion: p.operation_type ?? null,
  };
};

/** Movimientos que no son ventas: pagos que hace Naamá, recargas, inversiones, etc. */
const NO_VENTA = new Set(['investment', 'cellphone_recharge', 'money_exchange', 'recurring_payment', 'payment_addition']);

const sinTildes = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const GENERICAS = new Set(['plan', 'pago', 'cuenta', 'servicio', 'mensual']);
/** Palabras del nombre del gasto fijo que sirven para reconocerlo en el detalle del pago («Luz (Enel)» → enel). */
const clavesGasto = (nombre) =>
  sinTildes(nombre)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !GENERICAS.has(w));

const PALABRAS_ESTADO = { approved: 'aprobado', refunded: 'devuelto', charged_back: 'contracargo', cancelled: 'anulado', in_mediation: 'en reclamo' };

const sumar = (lista) => ({
  cantidad: lista.length,
  bruto: Math.round(lista.reduce((a, p) => a + p.bruto, 0)),
  comision: Math.round(lista.reduce((a, p) => a + p.comision, 0)),
  neto: Math.round(lista.reduce((a, p) => a + p.neto, 0)),
});

ruta('GET', /^plata$/, { permiso: 'finanzas' }, async ({ db, env }) => {
  const mes = mesChile();
  const hoy = fechaChile();
  const { results: compromisos } = await db.prepare('SELECT * FROM compromisos WHERE activo = 1 ORDER BY dia, nombre').all();
  const saldoFila = await db.prepare(`SELECT valor FROM meta WHERE clave = 'saldo_mp'`).first();
  const saldo = saldoFila ? JSON.parse(saldoFila.valor) : null;
  const { results: inyFilas } = await db.prepare('SELECT * FROM inyecciones ORDER BY dia DESC, id DESC LIMIT 60').all();
  const { results: cobrosFilas } = await db.prepare('SELECT * FROM iny_cobros ORDER BY dia DESC, id DESC').all();
  const inyecciones = inyFilas
    .map((i) => {
      const unidad = i.costo / i.cantidad;
      const cobros = cobrosFilas
        .filter((c) => c.iny_id === i.id)
        .map((c) => ({ id: c.id, cobrado: c.cobrado, clienta: c.clienta, dia: c.dia, diferencia: Math.round(c.cobrado - unidad) }));
      return {
        id: i.id,
        mpId: i.mp_id,
        detalle: i.detalle,
        costo: i.costo,
        cantidad: i.cantidad,
        unidad: Math.round(unidad),
        dia: i.dia,
        cobros,
        quedan: i.cantidad - cobros.length,
        porReponer: Math.round(unidad * Math.max(0, i.cantidad - cobros.length)),
      };
    })
    .filter((i) => i.quedan > 0 || i.cobros.some((c) => c.dia >= `${mes}-01`) || i.dia >= `${mes}-01`);
  const cobrosMes = inyecciones.flatMap((i) => i.cobros).filter((c) => c.dia >= `${mes}-01`);
  const pendientes = compromisos.filter((c) => c.pagado_mes !== mes);
  const porPagar = pendientes.reduce((a, c) => a + c.monto, 0);
  const base = {
    ok: true,
    hoy,
    mes,
    saldo,
    compromisos: compromisos.map((c) => ({ id: c.id, nombre: c.nombre, monto: c.monto, dia: c.dia, pagado: c.pagado_mes === mes })),
    porPagar,
    disponible: saldo ? saldo.monto - porPagar : null,
    inyecciones,
    inyResumen: {
      porReponer: inyecciones.reduce((a, i) => a + i.porReponer, 0),
      paraVivy: cobrosMes.reduce((a, c) => a + c.diferencia, 0),
      cobradas: cobrosMes.length,
    },
  };
  if (!env.MP_ACCESS_TOKEN) return json({ ...base, conectado: false });

  const desde = haceDias(45) < `${mes}-01` ? haceDias(45) : `${mes}-01`;
  let pagos;
  let salidas = [];
  try {
    const [crudos, yo] = await Promise.all([pagosMP(env, desde), cuentaMP(env)]);
    const todos = crudos.map(resumirPago);
    const esMio = (p) => yo == null || p.cobrador == null || String(p.cobrador) === String(yo);
    pagos = todos.filter((p) => esMio(p) && !NO_VENTA.has(p.operacion));
    salidas = todos
      .filter((p) => !esMio(p) && p.estado === 'approved' && p.dia.startsWith(mes))
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  } catch (e) {
    return json({ ...base, conectado: true, errorMP: e.message });
  }
  pagos.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

  const { results: todasIny } = await db.prepare('SELECT mp_id FROM inyecciones WHERE mp_id IS NOT NULL').all();
  const inyIds = new Set(todasIny.map((i) => String(i.mp_id)));

  // Si Naamá pagó por Mercado Pago este mes el monto exacto de un gasto fijo, se marca solo como pagado.
  // Cada pago se usa una sola vez: si alguien desmarca el gasto, no se vuelve a marcar solo.
  const filaAuto = await db.prepare(`SELECT valor FROM meta WHERE clave = 'mp_auto'`).first();
  const yaUsadas = new Set(filaAuto ? JSON.parse(filaAuto.valor) : []);
  const usadas = new Set();
  let marcados = 0;
  for (const c of base.compromisos.filter((x) => !x.pagado)) {
    const claves = clavesGasto(c.nombre);
    const libre = (x) => !usadas.has(x.id) && !yaUsadas.has(x.id) && !inyIds.has(String(x.id));
    const s =
      salidas.find((x) => libre(x) && Math.abs(x.bruto - c.monto) <= 1) ??
      salidas.find((x) => libre(x) && claves.some((k) => sinTildes(x.detalle ?? '').includes(k)));
    if (!s) continue;
    usadas.add(s.id);
    yaUsadas.add(s.id);
    await db.prepare('UPDATE compromisos SET pagado_mes = ? WHERE id = ?').bind(mes, c.id).run();
    c.pagado = true;
    c.pagadoMP = s.dia;
    c.pagadoMonto = s.bruto;
    c.pagadoDetalle = s.detalle;
    marcados += c.monto;
  }
  if (usadas.size) {
    await db
      .prepare(`INSERT INTO meta (clave, valor) VALUES ('mp_auto', ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor`)
      .bind(JSON.stringify([...yaUsadas].slice(-300)))
      .run();
  }
  if (marcados) {
    base.porPagar -= marcados;
    base.disponible = saldo ? saldo.monto - base.porPagar : null;
  }
  const aprobados = pagos.filter((p) => p.estado === 'approved');
  const semana = haceDias(6);
  const porLiberar = aprobados.filter((p) => !p.liberado && p.libera);
  const calendario = new Map();
  for (const p of porLiberar) {
    const d = fechaChile(new Date(p.libera));
    calendario.set(d, (calendario.get(d) ?? 0) + p.neto);
  }
  const porDia = new Map();
  for (let i = 13; i >= 0; i--) porDia.set(haceDias(i), 0);
  for (const p of aprobados.filter((x) => porDia.has(x.dia))) porDia.set(p.dia, porDia.get(p.dia) + p.bruto);
  return json({
    ...base,
    conectado: true,
    hoyMP: sumar(aprobados.filter((p) => p.dia === hoy)),
    semanaMP: sumar(aprobados.filter((p) => p.dia >= semana)),
    mesMP: sumar(aprobados.filter((p) => p.dia.startsWith(mes))),
    porLiberar: {
      total: Math.round(porLiberar.reduce((a, p) => a + p.neto, 0)),
      calendario: [...calendario.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([dia, monto]) => ({ dia, monto: Math.round(monto) })),
    },
    devueltos: pagos.filter((p) => ['refunded', 'charged_back', 'cancelled'].includes(p.estado) && p.dia.startsWith(mes)).length,
    porDia: [...porDia.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([dia, bruto]) => ({ dia, bruto: Math.round(bruto) })),
    salidas: salidas.slice(0, 40).map((p) => ({
      id: p.id,
      dia: p.dia,
      fecha: p.fecha,
      monto: p.bruto,
      detalle: p.detalle,
      medio: p.medio,
      gastoFijo: usadas.has(p.id),
      inyeccion: inyIds.has(String(p.id)),
    })),
    totalSalidas: Math.round(salidas.filter((p) => !inyIds.has(String(p.id))).reduce((a, p) => a + p.bruto, 0)),
    totalSalidasIny: Math.round(salidas.filter((p) => inyIds.has(String(p.id))).reduce((a, p) => a + p.bruto, 0)),
    ultimos: pagos
      .filter((p) => PALABRAS_ESTADO[p.estado])
      .slice(0, 25)
      .map(({ cobrador, operacion, ...p }) => ({ ...p, estadoTexto: PALABRAS_ESTADO[p.estado] })),
  });
});

/** Saldo que muestra la app de Mercado Pago (lo anota Administración). */
ruta('POST', /^plata\/saldo$/, { permiso: 'finanzas' }, async ({ db, cuenta, body }) => {
  const monto = numero(String(body.monto ?? '').replace(/\./g, ''), { max: 1e10 });
  if (monto === null) return error(400, 'Escribe el saldo (solo números).');
  const valor = JSON.stringify({ monto: Math.round(monto), ts: ahora(), por: cuenta.nombre });
  await db.prepare(`INSERT INTO meta (clave, valor) VALUES ('saldo_mp', ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor`).bind(valor).run();
  await registrar(db, cuenta.id, 'saldo_mp', { monto });
  return json({ ok: true });
});

/** Gastos fijos del mes (arriendo, luz, honorarios…): se marcan pagados mes a mes. */
ruta('POST', /^plata\/compromisos$/, { permiso: 'finanzas' }, async ({ db, body }) => {
  const nombre = texto(body.nombre, 50);
  const monto = numero(String(body.monto ?? '').replace(/\./g, ''), { min: 1, max: 1e9 });
  const dia = body.dia ? numero(body.dia, { min: 1, max: 31 }) : null;
  if (!nombre || !monto) return error(400, 'Escribe el nombre y el monto.');
  const repetido = await db.prepare('SELECT id FROM compromisos WHERE activo = 1 AND lower(nombre) = lower(?)').bind(nombre).first();
  if (repetido) return error(409, `Ya tienes «${nombre}» en los gastos fijos.`);
  await db.prepare('INSERT INTO compromisos (nombre, monto, dia, creado) VALUES (?, ?, ?, ?)').bind(nombre, Math.round(monto), dia, ahora()).run();
  return json({ ok: true }, 201);
});

ruta('POST', /^plata\/compromisos\/(\d+)$/, { permiso: 'finanzas' }, async ({ db, body, params }) => {
  const id = Number(params[0]);
  const c = await db.prepare('SELECT * FROM compromisos WHERE id = ?').bind(id).first();
  if (!c) return error(404, 'No existe.');
  if (body.borrar) {
    await db.prepare('UPDATE compromisos SET activo = 0 WHERE id = ?').bind(id).run();
    return json({ ok: true });
  }
  const monto = body.monto !== undefined ? numero(String(body.monto).replace(/\./g, ''), { min: 1, max: 1e9 }) : c.monto;
  if (!monto) return error(400, 'El monto no es válido.');
  const pagado = body.pagado === undefined ? c.pagado_mes : body.pagado ? mesChile() : null;
  await db.prepare('UPDATE compromisos SET monto = ?, pagado_mes = ? WHERE id = ?').bind(Math.round(monto), pagado, id).run();
  return json({ ok: true });
});

ruta('POST', /^plata\/inyecciones$/, { permiso: 'finanzas' }, async ({ db, body, cuenta }) => {
  const costo = numero(String(body.costo ?? '').replace(/\./g, ''), { min: 1, max: 1e8 });
  const cantidad = numero(body.cantidad ?? 1, { min: 1, max: 200 }) || 1;
  const detalle = texto(body.detalle, 80) || 'Inyecciones';
  const mpId = body.mpId ? texto(body.mpId, 30) : null;
  const dia = /^\d{4}-\d{2}-\d{2}$/.test(body.dia ?? '') ? body.dia : fechaChile();
  if (!costo) return error(400, 'Escribe cuánto costó.');
  if (mpId && (await db.prepare('SELECT id FROM inyecciones WHERE mp_id = ?').bind(mpId).first())) return error(409, 'Esa compra ya está anotada como inyecciones.');
  await db
    .prepare('INSERT INTO inyecciones (mp_id, detalle, costo, cantidad, dia, por, creado) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(mpId, detalle, Math.round(costo), Math.round(cantidad), dia, cuenta.nombre, ahora())
    .run();
  return json({ ok: true }, 201);
});

ruta('POST', /^plata\/inyecciones\/(\d+)$/, { permiso: 'finanzas' }, async ({ db, body, params, cuenta }) => {
  const id = Number(params[0]);
  const i = await db.prepare('SELECT * FROM inyecciones WHERE id = ?').bind(id).first();
  if (!i) return error(404, 'No existe.');
  if (body.borrar) {
    await db.batch([db.prepare('DELETE FROM iny_cobros WHERE iny_id = ?').bind(id), db.prepare('DELETE FROM inyecciones WHERE id = ?').bind(id)]);
    return json({ ok: true });
  }
  if (body.cantidad != null) {
    const cantidad = numero(body.cantidad, { min: 1, max: 200 });
    if (!cantidad) return error(400, 'Cantidad no válida.');
    await db.prepare('UPDATE inyecciones SET cantidad = ? WHERE id = ?').bind(Math.round(cantidad), id).run();
    return json({ ok: true });
  }
  const usados = (await db.prepare('SELECT COUNT(*) AS n FROM iny_cobros WHERE iny_id = ?').bind(id).first()).n;
  if (usados >= i.cantidad) return error(409, 'Ya se cobraron todas las de esa compra.');
  const cobrado = numero(String(body.cobrado ?? '').replace(/\./g, ''), { min: 1, max: 1e8 });
  if (!cobrado) return error(400, 'Escribe cuánto se cobró.');
  await db
    .prepare('INSERT INTO iny_cobros (iny_id, cobrado, clienta, dia, por, creado) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, Math.round(cobrado), texto(body.clienta, 60) || null, fechaChile(), cuenta.nombre, ahora())
    .run();
  return json({ ok: true, diferencia: Math.round(cobrado - i.costo / i.cantidad) });
});

ruta('POST', /^plata\/inyecciones\/cobros\/(\d+)$/, { permiso: 'finanzas' }, async ({ db, body, params }) => {
  if (!body.borrar) return error(400, 'Nada que hacer.');
  await db.prepare('DELETE FROM iny_cobros WHERE id = ?').bind(Number(params[0])).run();
  return json({ ok: true });
});

/* ── entrada ────────────────────────────────────────────── */

/* ── servicios → planilla ───────────────────────────────── */

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const fechaDe = (v, hoy = fechaChile()) => (FECHA.test(v ?? '') && v <= hoy ? v : hoy);
const plata = (v, max = 1e8) => numero(String(v ?? '').replace(/\D/g, ''), { min: 0, max }) ?? 0;
const horaChile = () => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Santiago', hour: 'numeric', hourCycle: 'h23' }).format(new Date()));
const URL_PLANILLA = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]{20,}\/exec$/;

const servicioPublico = (x) => ({
  id: x.id,
  fecha: x.fecha,
  clienta: x.clienta,
  clientaId: x.clienta_id,
  profesional: x.profesional,
  servicio: x.servicio,
  categoria: x.categoria,
  medio: x.medio,
  monto: x.monto,
  propina: x.propina,
  comision: x.comision,
  estado: x.estado,
  hoja: x.hoja,
  fila: x.fila,
  error: x.error,
  por: x.por,
});

/** Manda un servicio a la planilla. El Apps Script recibe solo un código y viene a buscar la fila aquí (no hay claves compartidas). */
async function mandarAPlanilla(db, env, id) {
  const fila = await db.prepare('SELECT * FROM servicios WHERE id = ?').bind(id).first();
  if (!fila || fila.estado === 'en_planilla') return fila;
  const url = (await db.prepare(`SELECT valor FROM meta WHERE clave = 'planilla_url'`).first())?.valor;
  const marcar = (estado, extra = {}) =>
    db
      .prepare('UPDATE servicios SET estado = ?, hoja = ?, fila = ?, error = ? WHERE id = ?')
      .bind(estado, extra.hoja ?? null, extra.fila ?? null, extra.error ?? null, id)
      .run();
  if (!url) {
    await marcar('pendiente', { error: 'Falta conectar la planilla.' });
    return { ...fila, estado: 'pendiente', error: 'Falta conectar la planilla.' };
  }
  try {
    const r = await (env.PLANILLA_FETCH ?? fetch)(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token: fila.token }),
      redirect: 'follow',
    });
    const d = await r.json().catch(() => null);
    if (d?.ok) {
      await marcar('en_planilla', { hoja: d.hoja, fila: d.fila });
      return { ...fila, estado: 'en_planilla', hoja: d.hoja, fila: d.fila, error: null };
    }
    const msg = String(d?.error ?? `La planilla respondió ${r.status}.`).slice(0, 200);
    await marcar('error', { error: msg });
    return { ...fila, estado: 'error', error: msg };
  } catch {
    await marcar('error', { error: 'No se pudo llegar a la planilla.' });
    return { ...fila, estado: 'error', error: 'No se pudo llegar a la planilla.' };
  }
}

// Lo que el Apps Script de la planilla viene a buscar con el código. Sin sesión: el código (64 caracteres al azar) es la llave
// y solo sirve una vez y por 2 días.
ruta('GET', /^planilla\/fila\/([0-9a-f]{64})$/, {}, async ({ db, params }) => {
  const x = await db.prepare('SELECT * FROM servicios WHERE token = ?').bind(params[0]).first();
  if (!x || x.estado === 'en_planilla' || Date.now() - Date.parse(x.creado) > 2 * 86400000) return error(404, 'No encontrado.');
  return json({
    ok: true,
    fila: {
      fecha: x.fecha,
      clienta: x.clienta,
      profesional: x.profesional,
      servicio: x.servicio,
      medio: x.medio,
      efectivo: x.medio === 'Mercado Pago' ? '' : x.monto,
      maquina: x.medio === 'Mercado Pago' ? x.monto : '',
      propina: x.propina || '',
      comision: x.comision,
      turno: x.turno ?? '',
      categoria: x.categoria ?? '',
    },
  });
});

ruta('POST', /^planilla\/conectar$/, { permiso: 'cuentas' }, async ({ db, cuenta, body }) => {
  const url = String(body.url ?? '').trim();
  if (!URL_PLANILLA.test(url)) return error(400, 'Ese enlace no es el de la aplicación web de Apps Script (termina en /exec).');
  await db.prepare(`INSERT INTO meta (clave, valor) VALUES ('planilla_url', ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor`).bind(url).run();
  await registrar(db, cuenta.id, 'planilla', { conectada: true });
  return json({ ok: true });
});

ruta('GET', /^servicios$/, { permiso: 'servicios' }, async ({ db, request }) => {
  const hoy = fechaChile();
  const fecha = fechaDe(new URL(request.url).searchParams.get('fecha'), hoy);
  const [{ results: lista }, { results: historial }, { results: clientas }, conectada] = await Promise.all([
    db.prepare('SELECT * FROM servicios WHERE fecha = ? ORDER BY id DESC').bind(fecha).all(),
    db
      .prepare(
        `SELECT servicio, profesional, monto, comision, categoria FROM servicios
         WHERE id IN (SELECT MAX(id) FROM servicios GROUP BY lower(servicio), profesional)`,
      )
      .all(),
    db.prepare('SELECT id, nombre FROM clientas WHERE activa = 1 ORDER BY nombre').all(),
    db.prepare(`SELECT valor FROM meta WHERE clave = 'planilla_url'`).first(),
  ]);
  const pendientes = await db.prepare(`SELECT COUNT(*) AS n FROM servicios WHERE estado != 'en_planilla'`).first();
  return json({
    ok: true,
    hoy,
    fecha,
    planillaConectada: Boolean(conectada?.valor),
    pendientes: pendientes?.n ?? 0,
    servicios: lista.map(servicioPublico),
    historial: historial.map((h) => ({ servicio: h.servicio, profesional: h.profesional, monto: h.monto, comision: h.comision, categoria: h.categoria })),
    clientas,
  });
});

ruta('POST', /^servicios$/, { permiso: 'servicios' }, async ({ db, env, cuenta, body }) => {
  const hoy = fechaChile();
  const fecha = fechaDe(body.fecha, hoy);
  const medio = MEDIOS_PAGO.includes(body.medio) ? body.medio : null;
  if (!medio) return error(400, 'Elige cómo pagó.');
  let clientaId = body.clientaId ? Number(body.clientaId) : null;
  let clienta = texto(body.clienta, 60);
  if (clientaId) {
    const c = await db.prepare('SELECT id, nombre FROM clientas WHERE id = ? AND activa = 1').bind(clientaId).first();
    if (!c) clientaId = null;
    else clienta = c.nombre;
  }
  if (!clienta) return error(400, 'Escribe el nombre de la clienta.');
  const items = Array.isArray(body.items) ? body.items.slice(0, 12) : [];
  if (!items.length) return error(400, 'Agrega al menos un servicio.');
  const limpios = [];
  for (const it of items) {
    const profesional = PROFESIONALES.some((p) => p.id === it.profesional) ? it.profesional : null;
    const servicio = texto(it.servicio, 60);
    const monto = plata(it.monto);
    if (!profesional || !servicio || !monto) return error(400, 'A cada servicio le falta profesional, nombre o monto.');
    const comision = COMISIONES.includes(Number(it.comision)) ? Number(it.comision) : comisionSugerida(profesional, servicio);
    const cat = buscarServicio(servicio)?.categoria ?? texto(it.categoria, 30) ?? null;
    limpios.push({ profesional, servicio, monto, propina: plata(it.propina, 1e6), comision, categoria: cat || null });
  }
  const turno = fecha === hoy ? turnoDeHora(horaChile()) : null;
  const ids = [];
  for (const it of limpios) {
    const r = await db
      .prepare(
        `INSERT INTO servicios (fecha, clienta, clienta_id, profesional, servicio, categoria, medio, monto, propina, comision, turno, token, por, creado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(fecha, clienta, clientaId, it.profesional, it.servicio, it.categoria, medio, it.monto, it.propina, it.comision, turno, nuevoToken(), cuenta.nombre, ahora())
      .run();
    ids.push(r.meta.last_row_id);
  }
  if (clientaId) {
    const v = await db
      .prepare('INSERT INTO visitas (clienta_id, fecha, cuenta_id, ts) VALUES (?, ?, ?, ?) ON CONFLICT(clienta_id, fecha) DO NOTHING')
      .bind(clientaId, fecha, cuenta.id, ahora())
      .run();
    if (v.meta.changes) {
      await db
        .prepare(
          `UPDATE clientas SET visitas = (SELECT COUNT(*) FROM visitas WHERE clienta_id = ?),
           ultima_visita = (SELECT MAX(fecha) FROM visitas WHERE clienta_id = ?) WHERE id = ?`,
        )
        .bind(clientaId, clientaId, clientaId)
        .run();
    }
  }
  const resultado = [];
  for (const id of ids) resultado.push(servicioPublico(await mandarAPlanilla(db, env, id)));
  await registrar(db, cuenta.id, 'servicio', { clienta, n: ids.length });
  return json({ ok: true, servicios: resultado }, 201);
});

ruta('POST', /^servicios\/(\d+)\/reintentar$/, { permiso: 'servicios' }, async ({ db, env, params }) => {
  const x = await mandarAPlanilla(db, env, Number(params[0]));
  if (!x) return error(404, 'No existe.');
  return json({ ok: true, servicio: servicioPublico(x) });
});

ruta('POST', /^servicios\/reintentar$/, { permiso: 'servicios' }, async ({ db, env }) => {
  const { results } = await db.prepare(`SELECT id FROM servicios WHERE estado != 'en_planilla' ORDER BY id LIMIT 40`).all();
  let listos = 0;
  for (const { id } of results) if ((await mandarAPlanilla(db, env, id))?.estado === 'en_planilla') listos++;
  return json({ ok: true, listos, total: results.length });
});

ruta('POST', /^servicios\/(\d+)$/, { permiso: 'servicios' }, async ({ db, cuenta, body, params }) => {
  const x = await db.prepare('SELECT * FROM servicios WHERE id = ?').bind(Number(params[0])).first();
  if (!x) return error(404, 'No existe.');
  if (!body.borrar) return error(400, 'Nada que hacer.');
  await db.prepare('DELETE FROM servicios WHERE id = ?').bind(x.id).run();
  await registrar(db, cuenta.id, 'servicio-borrado', { id: x.id, clienta: x.clienta, hoja: x.hoja, fila: x.fila });
  return json({ ok: true, enPlanilla: x.estado === 'en_planilla', hoja: x.hoja, fila: x.fila });
});

/* ── cierre de caja ─────────────────────────────────────── */

const TARJETAS = new Set(['credit_card', 'debit_card', 'prepaid_card', 'account_money']);

async function mpDelDia(env, fecha) {
  if (!env.MP_ACCESS_TOKEN) return null;
  const [crudos, yo] = await Promise.all([pagosMP(env, fecha), cuentaMP(env)]);
  const pagos = crudos
    .map(resumirPago)
    .filter((p) => (yo == null || p.cobrador == null || String(p.cobrador) === String(yo)) && !NO_VENTA.has(p.operacion))
    .filter((p) => p.estado === 'approved' && p.dia === fecha);
  const tarjetas = pagos.filter((p) => TARJETAS.has(p.medio));
  const transferencias = pagos.filter((p) => p.medio === 'bank_transfer');
  const suma = (l) => Math.round(l.reduce((a, p) => a + p.bruto, 0));
  return {
    maquina: suma(tarjetas),
    maquinaPagos: tarjetas.length,
    comision: Math.round(tarjetas.reduce((a, p) => a + p.comision, 0)),
    transferencias: suma(transferencias),
    transferenciasPagos: transferencias.length,
  };
}

ruta('GET', /^caja$/, { permiso: 'caja' }, async ({ db, env, request }) => {
  const hoy = fechaChile();
  const fecha = fechaDe(new URL(request.url).searchParams.get('fecha'), hoy);
  const { results: lista } = await db.prepare('SELECT * FROM servicios WHERE fecha = ? ORDER BY id').bind(fecha).all();
  const porMedio = Object.fromEntries(MEDIOS_PAGO.map((m) => [m, 0]));
  for (const x of lista) porMedio[x.medio] += x.monto + (x.propina || 0);
  let mp = null;
  let errorMP = null;
  try {
    mp = await mpDelDia(env, fecha);
  } catch (e) {
    errorMP = e.message;
  }
  const cierre = await db.prepare('SELECT * FROM cierres WHERE fecha = ?').bind(fecha).first();
  const { results: anteriores } = await db.prepare('SELECT fecha, efectivo, datos, por FROM cierres ORDER BY fecha DESC LIMIT 14').all();
  return json({
    ok: true,
    hoy,
    fecha,
    servicios: lista.length,
    anotado: porMedio,
    total: Object.values(porMedio).reduce((a, b) => a + b, 0),
    mp,
    errorMP,
    cierre: cierre ? { ...JSON.parse(cierre.datos), efectivo: cierre.efectivo, nota: cierre.nota, por: cierre.por, ts: cierre.ts } : null,
    anteriores: anteriores.map((c) => {
      const d = JSON.parse(c.datos);
      return { fecha: c.fecha, efectivo: c.efectivo, total: d.total, cuadra: d.cuadra, por: c.por };
    }),
  });
});

ruta('POST', /^caja$/, { permiso: 'caja' }, async ({ db, env, cuenta, body }) => {
  const hoy = fechaChile();
  const fecha = fechaDe(body.fecha, hoy);
  const efectivo = plata(body.efectivo);
  const { results: lista } = await db.prepare('SELECT medio, monto, propina FROM servicios WHERE fecha = ?').bind(fecha).all();
  const anotado = Object.fromEntries(MEDIOS_PAGO.map((m) => [m, 0]));
  for (const x of lista) anotado[x.medio] += x.monto + (x.propina || 0);
  let mp = null;
  try {
    mp = await mpDelDia(env, fecha);
  } catch {
    mp = null;
  }
  const difEfectivo = efectivo - anotado.Efectivo;
  const difMaquina = mp ? mp.maquina - anotado['Mercado Pago'] : null;
  const difTransfer = mp ? mp.transferencias - anotado.Transferencia : null;
  const cuadra = Math.abs(difEfectivo) < 100 && (difMaquina == null || Math.abs(difMaquina) < 100) && (difTransfer == null || Math.abs(difTransfer) < 100);
  const datos = { anotado, mp, total: Object.values(anotado).reduce((a, b) => a + b, 0), difEfectivo, difMaquina, difTransfer, cuadra, servicios: lista.length };
  await db
    .prepare(
      `INSERT INTO cierres (fecha, datos, efectivo, nota, por, ts) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(fecha) DO UPDATE SET datos = excluded.datos, efectivo = excluded.efectivo, nota = excluded.nota, por = excluded.por, ts = excluded.ts`,
    )
    .bind(fecha, JSON.stringify(datos), efectivo, texto(body.nota, 300) || null, cuenta.nombre, ahora())
    .run();
  await registrar(db, cuenta.id, 'cierre', { fecha, cuadra });
  return json({ ok: true, cierre: { ...datos, efectivo } });
});

/* ── disponibilidad ─────────────────────────────────────── */

const ESTADOS_DISPO = ['todo', 'manana', 'tarde', 'no'];

/** Próximos días con el salón abierto (lunes a sábado). */
const proximosDias = (n = 14) => {
  const dias = [];
  for (let i = 0; dias.length < n && i < n + 4; i++) {
    const d = new Date(Date.now() + i * 86400000);
    const f = fechaChile(d);
    const dow = new Date(`${f}T12:00:00Z`).getUTCDay();
    if (dow !== 0) dias.push(f);
  }
  return dias;
};

ruta('GET', /^disponibilidad$/, { sesion: true }, async ({ db, cuenta }) => {
  const dias = proximosDias(14);
  const { results: equipo } = await db.prepare('SELECT id, nombre FROM cuentas WHERE activa = 1 AND demo = 0 ORDER BY nombre').all();
  const { results: marcas } = await db
    .prepare('SELECT cuenta_id, fecha, estado, nota FROM disponibilidad WHERE fecha >= ? AND fecha <= ?')
    .bind(dias[0], dias[dias.length - 1])
    .all();
  const de = (id) => Object.fromEntries(marcas.filter((m) => m.cuenta_id === id).map((m) => [m.fecha, { estado: m.estado, nota: m.nota }]));
  return json({
    ok: true,
    dias,
    yo: { id: cuenta.id, marcas: de(cuenta.id) },
    equipo: equipo.map((c) => ({ id: c.id, nombre: c.nombre, marcas: de(c.id) })),
  });
});

ruta('POST', /^disponibilidad$/, { sesion: true }, async ({ db, cuenta, body }) => {
  const dias = (Array.isArray(body.fechas) ? body.fechas : [body.fecha]).filter((f) => FECHA.test(f ?? '')).slice(0, 31);
  if (!dias.length) return error(400, 'Elige el día.');
  const hoy = fechaChile();
  if (dias.some((f) => f < hoy)) return error(400, 'No se puede cambiar un día que ya pasó.');
  const estado = String(body.estado ?? '');
  for (const f of dias) {
    if (!estado) await db.prepare('DELETE FROM disponibilidad WHERE cuenta_id = ? AND fecha = ?').bind(cuenta.id, f).run();
    else {
      if (!ESTADOS_DISPO.includes(estado)) return error(400, 'Estado no válido.');
      await db
        .prepare(
          `INSERT INTO disponibilidad (cuenta_id, fecha, estado, nota, ts) VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(cuenta_id, fecha) DO UPDATE SET estado = excluded.estado, nota = excluded.nota, ts = excluded.ts`,
        )
        .bind(cuenta.id, f, estado, texto(body.nota, 80) || null, ahora())
        .run();
    }
  }
  return json({ ok: true });
});

/* ── mi mes ─────────────────────────────────────────────── */

const MES = /^\d{4}-\d{2}$/;
const normTexto = (t) =>
  String(t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Cruza lo que anotó ella con lo que anotó Administración (mismo día; mismo monto o mismo servicio). */
function cruzar(suyos, nuestros) {
  const libres = new Set(nuestros.map((x) => x.id));
  const filas = suyos.map((m) => {
    const candidatos = nuestros.filter((x) => libres.has(x.id) && x.fecha === m.fecha);
    const par =
      candidatos.find((x) => m.monto && x.monto === m.monto) ??
      candidatos.find((x) => normTexto(x.servicio) === normTexto(m.servicio)) ??
      candidatos.find((x) => m.clienta && normTexto(x.clienta).split(' ')[0] === normTexto(m.clienta).split(' ')[0]);
    if (par) libres.delete(par.id);
    return { ...m, coincide: par ? { id: par.id, servicio: par.servicio, monto: par.monto, clienta: par.clienta } : null };
  });
  return { filas, soloNuestros: nuestros.filter((x) => libres.has(x.id)).map((x) => ({ id: x.id, fecha: x.fecha, clienta: x.clienta, servicio: x.servicio, monto: x.monto })) };
}

const miServicioPublico = (m) => ({ id: m.id, fecha: m.fecha, clienta: m.clienta, servicio: m.servicio, monto: m.monto, nota: m.nota });

ruta('GET', /^mi-mes$/, { sesion: true }, async ({ db, cuenta, request }) => {
  const q = new URL(request.url).searchParams;
  const mes = MES.test(q.get('mes') ?? '') ? q.get('mes') : fechaChile().slice(0, 7);
  const revisa = tiene(cuenta, 'servicios') || tiene(cuenta, 'finanzas');
  let quien = cuenta;
  if (q.get('cuenta') && Number(q.get('cuenta')) !== cuenta.id) {
    if (!revisa) return error(403, 'Solo ves tu propio mes.');
    quien = await db.prepare('SELECT * FROM cuentas WHERE id = ?').bind(Number(q.get('cuenta'))).first();
    if (!quien) return error(404, 'No existe.');
  }
  const { results } = await db
    .prepare('SELECT * FROM mis_servicios WHERE cuenta_id = ? AND fecha LIKE ? ORDER BY fecha DESC, id DESC')
    .bind(quien.id, `${mes}-%`)
    .all();
  const suyos = results.map(miServicioPublico);
  const base = {
    ok: true,
    mes,
    persona: { id: quien.id, nombre: quien.nombre, profesional: profesionalDeNombre(quien.nombre) },
    servicios: suyos,
    total: suyos.reduce((a, m) => a + (m.monto || 0), 0),
    revisa,
  };
  if (!revisa) return json(base);
  const { results: equipo } = await db
    .prepare(
      `SELECT c.id, c.nombre, (SELECT COUNT(*) FROM mis_servicios m WHERE m.cuenta_id = c.id AND m.fecha LIKE ?) AS n
       FROM cuentas c WHERE c.activa = 1 AND c.demo = 0 ORDER BY c.nombre`,
    )
    .bind(`${mes}-%`)
    .all();
  let cruce = null;
  if (base.persona.profesional) {
    const { results: nuestros } = await db
      .prepare('SELECT * FROM servicios WHERE profesional = ? AND fecha LIKE ? ORDER BY fecha')
      .bind(base.persona.profesional, `${mes}-%`)
      .all();
    cruce = cruzar(suyos, nuestros);
  }
  return json({ ...base, equipo, cruce });
});

ruta('POST', /^mi-mes$/, { sesion: true }, async ({ db, cuenta, body }) => {
  const hoy = fechaChile();
  const fecha = FECHA.test(body.fecha ?? '') ? body.fecha : hoy;
  if (fecha > hoy) return error(400, 'La fecha no puede ser futura.');
  const servicio = texto(body.servicio, 60);
  if (!servicio) return error(400, '¿Qué servicio hiciste?');
  await db
    .prepare('INSERT INTO mis_servicios (cuenta_id, fecha, clienta, servicio, monto, nota, creado) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(cuenta.id, fecha, texto(body.clienta, 60) || null, servicio, plata(body.monto) || null, texto(body.nota, 120) || null, ahora())
    .run();
  return json({ ok: true }, 201);
});

ruta('POST', /^mi-mes\/(\d+)$/, { sesion: true }, async ({ db, cuenta, body, params }) => {
  const m = await db.prepare('SELECT * FROM mis_servicios WHERE id = ?').bind(Number(params[0])).first();
  if (!m || (m.cuenta_id !== cuenta.id && !tiene(cuenta, 'servicios'))) return error(404, 'No existe.');
  if (!body.borrar) return error(400, 'Nada que hacer.');
  await db.prepare('DELETE FROM mis_servicios WHERE id = ?').bind(m.id).run();
  return json({ ok: true });
});


export async function manejar(request, env) {
  const db = env.DB;
  if (!db) return error(503, 'Falta conectar la base de datos (D1) con el nombre DB en Cloudflare.');
  const url = new URL(request.url);
  const camino = url.pathname.replace(/^\/api\/portal\/?/, '').replace(/\/$/, '');
  const metodo = request.method;

  if (metodo !== 'GET' && metodo !== 'HEAD') {
    // Freno contra ataques desde otros sitios: toda escritura trae nuestro encabezado y viene de nuestro dominio.
    if (request.headers.get('x-naama') !== '1') return error(403, 'Pedido no permitido.');
    const origen = request.headers.get('Origin');
    if (origen && origen !== url.origin) return error(403, 'Pedido no permitido.');
  }

  let encontrada = null;
  let params = [];
  for (const r of rutas) {
    const m = camino.match(r.patron);
    if (m && r.metodo === metodo) {
      encontrada = r;
      params = m.slice(1);
      break;
    }
  }
  if (!encontrada) return error(404, 'No encontrado.');

  try {
    await asegurarEsquema(db);
    const cuenta = await cuentaDeSesion(db, request);
    const necesitaSesion = encontrada.sesion || encontrada.permiso;
    if (necesitaSesion && !cuenta) return error(401, 'Tu sesión terminó. Vuelve a entrar.');
    if (cuenta?.debe_cambiar && necesitaSesion && !encontrada.permiteCambio) {
      return error(403, 'Primero crea tu clave personal.');
    }
    if (encontrada.permiso && !permisosDe(cuenta.rol, JSON.parse(cuenta.extras)).includes(encontrada.permiso)) {
      return error(403, 'No tienes acceso a esta sección.');
    }
    let body = {};
    if (metodo === 'POST') {
      body = await leerJson(request);
      if (body === null || typeof body !== 'object') return error(400, 'Datos mal formados.');
    }
    return await encontrada.fn({ db, env, request, cuenta, body, params });
  } catch (e) {
    console.error('portal', camino, e);
    return error(500, 'Algo falló en el servidor. Inténtalo de nuevo.');
  }
}
