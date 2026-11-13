// Pruebas de la API del portal contra una base SQLite en memoria. Correr con: npm test
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearD1 } from './d1-memoria.mjs';
import { manejar } from '../portal-api/router.js';
import { reiniciarEsquema } from '../portal-api/esquema.js';

const BASE = 'https://naamastudio.cl/api/portal/';
let env;

beforeEach(() => {
  reiniciarEsquema();
  env = { DB: crearD1(), SETUP_SECRET: 'secreto-de-prueba' };
});

/** Cliente con su propio «navegador»: guarda la cookie de sesión. */
const cliente = (ip = '1.1.1.1') => {
  let cookie = '';
  const pedir = async (camino, { metodo = 'GET', body, headers = {} } = {}) => {
    const h = { 'CF-Connecting-IP': ip, ...headers };
    if (cookie) h.Cookie = cookie;
    if (metodo !== 'GET') {
      h['Content-Type'] = 'application/json';
      if (!('x-naama' in headers)) h['x-naama'] = '1';
    }
    const res = await manejar(new Request(BASE + camino, { method: metodo, headers: h, body: body ? JSON.stringify(body) : undefined }), env);
    const sc = res.headers.get('Set-Cookie');
    if (sc) cookie = sc.split(';')[0];
    return { status: res.status, data: await res.json(), setCookie: sc };
  };
  return { pedir, post: (c, body, o = {}) => pedir(c, { metodo: 'POST', body, ...o }), get cookie() { return cookie; } };
};

const configurar = async (c = cliente()) => {
  const r = await c.post('configurar', { secreto: 'secreto-de-prueba', nombre: 'Diego', email: 'Diego@Naama.cl', clave: 'claveDiego123' });
  assert.equal(r.status, 201);
  return c;
};

test('primer ingreso: crea la cuenta de Administración una sola vez', async () => {
  const c = cliente();
  assert.equal((await c.pedir('estado')).data.configurado, false);
  const malo = await c.post('configurar', { secreto: 'otro', nombre: 'X', email: 'x@x.cl', clave: '12345678' });
  assert.equal(malo.status, 403);
  await configurar(c);
  const est = await c.pedir('estado');
  assert.equal(est.data.configurado, true);
  assert.equal(est.data.cuenta.email, 'diego@naama.cl');
  assert.equal(est.data.cuenta.rol, 'admin');
  const otra = await cliente('2.2.2.2').post('configurar', { secreto: 'secreto-de-prueba', nombre: 'Y', email: 'y@y.cl', clave: '12345678' });
  assert.equal(otra.status, 409);
});

test('la cookie de sesión es HttpOnly, Secure y SameSite=Strict, y dura 30 días', async () => {
  const c = cliente();
  const r = await c.post('configurar', { secreto: 'secreto-de-prueba', nombre: 'Diego', email: 'd@n.cl', clave: 'claveDiego123' });
  assert.match(r.setCookie, /HttpOnly/);
  assert.match(r.setCookie, /Secure/);
  assert.match(r.setCookie, /SameSite=Strict/);
  assert.match(r.setCookie, /Max-Age=2592000/);
});

test('nunca se guarda ni se devuelve la clave en texto plano', async () => {
  await configurar();
  const fila = await env.DB.prepare('SELECT * FROM cuentas').first();
  assert.notEqual(fila.hash, 'claveDiego123');
  assert.equal(fila.hash.length, 64);
  assert.equal(fila.sal.length, 32);
  const est = await cliente().post('entrar', { email: 'diego@naama.cl', clave: 'claveDiego123' });
  assert.equal(est.data.cuenta.hash, undefined);
  assert.equal(est.data.cuenta.sal, undefined);
});

test('escrituras sin el encabezado x-naama o desde otro sitio se rechazan', async () => {
  const c = cliente();
  const sinHeader = await c.post('configurar', { secreto: 'secreto-de-prueba', nombre: 'D', email: 'd@n.cl', clave: '12345678' }, { headers: { 'x-naama': '0' } });
  assert.equal(sinHeader.status, 403);
  const otroSitio = await c.post('configurar', { secreto: 'secreto-de-prueba', nombre: 'D', email: 'd@n.cl', clave: '12345678' }, { headers: { Origin: 'https://malo.com' } });
  assert.equal(otroSitio.status, 403);
});

test('entrar: clave mala da 401 y tras 5 intentos bloquea ese correo', async () => {
  await configurar();
  const c = cliente('9.9.9.9');
  for (let i = 0; i < 5; i++) assert.equal((await c.post('entrar', { email: 'diego@naama.cl', clave: 'mala' })).status, 401);
  assert.equal((await c.post('entrar', { email: 'diego@naama.cl', clave: 'claveDiego123' })).status, 429);
  // El correo inexistente responde igual que una clave mala
  assert.equal((await cliente('8.8.8.8').post('entrar', { email: 'nadie@naama.cl', clave: 'x' })).status, 401);
});

test('Administración crea cuentas con clave temporal y la persona debe crear la suya', async () => {
  const admin = await configurar();
  const r = await admin.post('cuentas', { nombre: 'Gaby', email: 'gaby@naama.cl', rol: 'socia', extras: [] });
  assert.equal(r.status, 201);
  assert.match(r.data.claveTemporal, /^[a-z2-9]{5}-[a-z2-9]{5}$/);
  assert.equal(r.data.cuenta.debeCambiar, true);

  const gaby = cliente('3.3.3.3');
  const e = await gaby.post('entrar', { email: 'gaby@naama.cl', clave: r.data.claveTemporal });
  assert.equal(e.status, 200);
  assert.equal(e.data.cuenta.debeCambiar, true);
  // Mientras no cambie la clave, no puede usar nada más
  assert.equal((await gaby.post('clave', { actual: 'otra', nueva: 'nuevaClave1' })).status, 401);
  assert.equal((await gaby.post('clave', { actual: r.data.claveTemporal, nueva: 'corta' })).status, 400);
  assert.equal((await gaby.post('clave', { actual: r.data.claveTemporal, nueva: 'nuevaClave1' })).status, 200);
  const est = await gaby.pedir('estado');
  assert.equal(est.data.cuenta.debeCambiar, false);
});

test('Gaby (socia) no ve plata ni caja ni cuentas; Vivy (dueña) ve todo menos cuentas', async () => {
  const admin = await configurar();
  const g = await admin.post('cuentas', { nombre: 'Gaby', email: 'gaby@naama.cl', rol: 'socia', extras: [] });
  const v = await admin.post('cuentas', { nombre: 'Vivy', email: 'vivy@naama.cl', rol: 'duena', extras: [] });
  assert.deepEqual(g.data.cuenta.permisos, []);
  assert.ok(v.data.cuenta.permisos.includes('finanzas'));
  assert.ok(v.data.cuenta.permisos.includes('caja'));
  assert.ok(!v.data.cuenta.permisos.includes('cuentas'));

  const gaby = cliente('4.4.4.4');
  await gaby.post('entrar', { email: 'gaby@naama.cl', clave: g.data.claveTemporal });
  await gaby.post('clave', { actual: g.data.claveTemporal, nueva: 'gabyClave1' });
  assert.equal((await gaby.pedir('cuentas')).status, 403);
  assert.equal((await gaby.post('cuentas', { nombre: 'X', email: 'x@x.cl', rol: 'admin' })).status, 403);
});

test('permisos extra por persona y validación de roles', async () => {
  const admin = await configurar();
  const val = await admin.post('cuentas', { nombre: 'Valeria', email: 'vale@naama.cl', rol: 'equipo', extras: ['insumos'] });
  assert.deepEqual(val.data.cuenta.permisos, ['insumos']);
  assert.equal((await admin.post('cuentas', { nombre: 'X', email: 'x@naama.cl', rol: 'jefa' })).status, 400);
  assert.equal((await admin.post('cuentas', { nombre: 'X', email: 'x@naama.cl', rol: 'equipo', extras: ['todo'] })).status, 400);
  assert.equal((await admin.post('cuentas', { nombre: 'Vale 2', email: 'VALE@naama.cl', rol: 'equipo' })).status, 409);
});

test('desactivar cierra la sesión; restablecer clave invalida la anterior', async () => {
  const admin = await configurar();
  const k = await admin.post('cuentas', { nombre: 'Kata', email: 'kata@naama.cl', rol: 'equipo' });
  const id = k.data.cuenta.id;
  const kata = cliente('5.5.5.5');
  await kata.post('entrar', { email: 'kata@naama.cl', clave: k.data.claveTemporal });
  assert.ok((await kata.pedir('estado')).data.cuenta);

  const rest = await admin.post(`cuentas/${id}/restablecer`, {});
  assert.equal(rest.status, 200);
  assert.equal((await kata.pedir('estado')).data.cuenta, null, 'la sesión vieja se cierra');
  assert.equal((await cliente('6.6.6.6').post('entrar', { email: 'kata@naama.cl', clave: k.data.claveTemporal })).status, 401);
  await kata.post('entrar', { email: 'kata@naama.cl', clave: rest.data.claveTemporal });
  assert.ok((await kata.pedir('estado')).data.cuenta);

  await admin.post(`cuentas/${id}`, { activa: false });
  assert.equal((await kata.pedir('estado')).data.cuenta, null);
  assert.equal((await cliente('7.7.7.7').post('entrar', { email: 'kata@naama.cl', clave: rest.data.claveTemporal })).status, 401);
});

test('nadie puede quitarse su propio acceso de Administración', async () => {
  const admin = await configurar();
  const yo = (await admin.pedir('estado')).data.cuenta;
  assert.equal((await admin.post(`cuentas/${yo.id}`, { rol: 'equipo' })).status, 400);
  assert.equal((await admin.post(`cuentas/${yo.id}`, { activa: false })).status, 400);
});

test('salir borra la sesión', async () => {
  const admin = await configurar();
  await admin.post('salir', {});
  assert.equal((await admin.pedir('estado')).data.cuenta, null);
  assert.equal((await admin.pedir('cuentas')).status, 401);
});

test('lista de cuentas marca quién entró hoy (hora de Chile)', async () => {
  const admin = await configurar();
  await admin.post('cuentas', { nombre: 'Allison', email: 'allison@naama.cl', rol: 'admin' });
  const r = await admin.pedir('cuentas');
  assert.equal(r.status, 200);
  const diego = r.data.cuentas.find((c) => c.nombre === 'Diego');
  const allison = r.data.cuentas.find((c) => c.nombre === 'Allison');
  assert.equal(diego.entroHoy, true);
  assert.equal(allison.entroHoy, false);
  assert.match(r.data.hoy, /^\d{4}-\d{2}-\d{2}$/);
});
