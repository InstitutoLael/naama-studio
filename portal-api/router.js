// API del portal de Naamá. functions/api/portal/[[ruta]].js solo llama a manejar().
// Todo vive bajo /api/portal/… y responde JSON.

import { asegurarEsquema } from './esquema.js';
import { claveTemporal, hashClave, igualSeguro, nuevoToken, sha256, verificarClave } from './seguridad.js';
import { PERMISOS, ROL_IDS, permisosDe } from '../src/portal/permisos.js';

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

/* ── entrada ────────────────────────────────────────────── */

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
