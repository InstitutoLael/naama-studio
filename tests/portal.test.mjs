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

/* ── Clientas ── */
import { limpiarNombre, normalizarTelefono, leerVcf, mostrarTelefono } from '../src/portal/contactos.js';

test('limpia nombres de contactos guardados como «Clienta …»', () => {
  assert.deepEqual(limpiarNombre('Clienta María uñas 💅'), { nombre: 'María', nota: 'uñas' });
  assert.deepEqual(limpiarNombre('cliente JAVIERA soto (balayage)'), { nombre: 'Javiera Soto', nota: 'balayage' });
  assert.deepEqual(limpiarNombre('Carmen Gloria - Naamá'), { nombre: 'Carmen Gloria', nota: '' });
  assert.equal(limpiarNombre('Clienta 2').nombre, '');
});

test('normaliza teléfonos chilenos', () => {
  assert.equal(normalizarTelefono('9 1234 5678'), '+56912345678');
  assert.equal(normalizarTelefono('+56 9 1234-5678'), '+56912345678');
  assert.equal(normalizarTelefono('56912345678'), '+56912345678');
  assert.equal(normalizarTelefono('(09) 1234 5678'), '+56912345678');
  assert.equal(normalizarTelefono('12345678'), '+56912345678');
  assert.equal(normalizarTelefono('123'), null);
  assert.equal(mostrarTelefono('+56912345678'), '+56 9 1234 5678');
});

test('lee un archivo .vcf del iPhone', () => {
  const vcf = 'BEGIN:VCARD\r\nVERSION:3.0\r\nN:Clienta;Ana;;;\r\nFN:Ana Clienta Uñas\r\nTEL;type=CELL;type=VOICE;type=pref:+56 9 8765 4321\r\nEND:VCARD\r\nBEGIN:VCARD\r\nVERSION:3.0\r\nFN:Sin Fono\r\nEND:VCARD\r\n';
  assert.deepEqual(leerVcf(vcf), [{ original: 'Ana Clienta Uñas', telefono: '+56 9 8765 4321' }]);
});

const crearEquipo = async () => {
  const admin = await configurar();
  const g = await admin.post('cuentas', { nombre: 'Gaby', email: 'gaby@naama.cl', rol: 'socia' });
  const gaby = cliente('4.4.4.4');
  await gaby.post('entrar', { email: 'gaby@naama.cl', clave: g.data.claveTemporal });
  await gaby.post('clave', { actual: g.data.claveTemporal, nueva: 'gabyClave1' });
  return { admin, gaby };
};

test('Gaby sube una clienta pero no ve números; Administración sí', async () => {
  const { admin, gaby } = await crearEquipo();
  const r = await gaby.post('clientas', { contactos: [{ nombre: 'Clienta Fernanda uñas', telefono: '9 1111 2222' }], origen: 'contacto' });
  assert.equal(r.status, 201);
  assert.equal(r.data.creadas, 1);
  const vistaGaby = await gaby.pedir('clientas');
  assert.equal(vistaGaby.data.verNumeros, false);
  assert.equal(vistaGaby.data.clientas[0].nombre, 'Fernanda');
  assert.equal(vistaGaby.data.clientas[0].telefono, undefined);
  const vistaAdmin = await admin.pedir('clientas');
  assert.equal(vistaAdmin.data.clientas[0].telefono, '+56911112222');
  assert.equal(vistaAdmin.data.clientas[0].nota, 'uñas');
  // Gaby no puede importar listas ni editar
  assert.equal((await gaby.post('clientas', { contactos: [{ nombre: 'A', telefono: '911112223' }, { nombre: 'B', telefono: '911112224' }] })).status, 403);
  assert.equal((await gaby.post(`clientas/${vistaAdmin.data.clientas[0].id}`, { nombre: 'X' })).status, 403);
});

test('importar lista: salta repetidas e inválidas', async () => {
  const { admin } = await crearEquipo();
  await admin.post('clientas', { contactos: [{ nombre: 'Ana', telefono: '+56 9 3333 4444' }] });
  const r = await admin.post('clientas', {
    origen: 'archivo',
    contactos: [
      { nombre: 'Clienta Ana', telefono: '933334444' },
      { nombre: 'Bea cejas', telefono: '955556666' },
      { nombre: 'Bea otra vez', telefono: '+56955556666' },
      { nombre: 'Sin número', telefono: '12' },
      ...Array.from({ length: 120 }, (_, i) => ({ nombre: `Clienta ${String.fromCharCode(65 + (i % 26))}ita`, telefono: `97${String(i).padStart(7, '0')}` })),
    ],
  });
  assert.equal(r.status, 201);
  assert.equal(r.data.creadas, 121);
  assert.equal(r.data.repetidas, 2);
  assert.equal(r.data.invalidas, 1);
  const lista = await admin.pedir('clientas');
  assert.equal(lista.data.clientas.length, 122);
});

test('«Vino hoy» anota una visita por día y calcula hace cuánto no viene', async () => {
  const { admin, gaby } = await crearEquipo();
  await gaby.post('clientas', { contactos: [{ nombre: 'Rosa', telefono: '922223333' }] });
  const id = (await gaby.pedir('clientas')).data.clientas[0].id;
  const a = await gaby.post(`clientas/${id}/visita`, { fecha: '2026-09-01' });
  assert.equal(a.data.clienta.visitas, 1);
  assert.ok(a.data.clienta.diasSinVenir > 30);
  const b = await gaby.post(`clientas/${id}/visita`, {});
  assert.equal(b.data.clienta.diasSinVenir, 0);
  assert.equal(b.data.clienta.visitas, 2);
  const c = await admin.post(`clientas/${id}/visita`, {});
  assert.equal(c.data.yaEstaba, true);
  assert.equal(c.data.clienta.visitas, 2);
  assert.equal((await gaby.post(`clientas/${id}/visita`, { fecha: '2999-01-01' })).status, 400);
  const v = await admin.pedir(`clientas/${id}/visitas`);
  assert.equal(v.data.visitas.length, 2);
  assert.equal(v.data.visitas[0].anotadaPor, 'Gaby');
});

/* ── Insumos y compras ── */
const FOTO = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';

test('insumos: crear con foto, anotar uso con la pesa y descontar stock', async () => {
  const { admin, gaby } = await crearEquipo();
  const r = await gaby.post('insumos', { nombre: 'Decolorante', marca: 'Wella', categoria: 'Color', unidad: 'g', tamano: 500, envases: 2, minimo: 1, costo: 20000, foto: FOTO });
  assert.equal(r.status, 201);
  assert.equal(r.data.producto.stock, 1000);
  assert.equal(r.data.producto.costo, undefined, 'Gaby no ve costos');
  const id = r.data.producto.id;
  const foto = await manejar(new Request(`${BASE}insumos/foto/${r.data.producto.fotoId}`, { headers: { Cookie: gaby.cookie } }), env);
  assert.equal(foto.headers.get('Content-Type'), 'image/webp');
  // Gaby no puede poner precios: lo hace Administración.
  assert.equal((await admin.post(`insumos/${id}`, { costo: 20000 })).status, 200);

  assert.equal((await gaby.post('insumos/uso', { servicio: 'Balayage', items: [{ productoId: id, cantidad: 60 }] })).status, 200);
  await gaby.post('insumos/uso', { servicio: 'Balayage', items: [{ productoId: id, cantidad: '40' }] });
  const lista = await admin.pedir('insumos');
  const p = lista.data.productos[0];
  assert.equal(p.stock, 900);
  assert.equal(p.envases, 1.8);
  assert.equal(p.consumo30, 100);
  assert.equal(p.costo, 20000, 'Administración sí ve costos');

  const datos = await admin.pedir('insumos-datos');
  assert.equal(datos.data.porServicio[0].servicio, 'Balayage');
  assert.equal(datos.data.porServicio[0].veces, 2);
  assert.equal(datos.data.porServicio[0].productos[0].promedio, 50);
  assert.equal(datos.data.porServicio[0].costoPromedio, 2000); // 50 g × $40/g
  assert.equal((await gaby.pedir('insumos-datos')).status, 403);

  assert.equal((await gaby.post('insumos/uso', { servicio: 'X', items: [{ productoId: id, cantidad: 0 }] })).status, 400);
  assert.equal((await gaby.post(`insumos/${id}/ajuste`, { envases: 3 })).status, 403);
  assert.equal((await admin.post(`insumos/${id}/ajuste`, { envases: 3 })).status, 200);
  assert.equal((await admin.pedir('insumos')).data.productos[0].stock, 1500);
});

test('compras: Gaby pide, Administración marca comprado y suma stock', async () => {
  const { admin, gaby } = await crearEquipo();
  const p = (await admin.post('insumos', { nombre: 'Cera', unidad: 'g', tamano: 800, envases: 0, minimo: 1 })).data.producto;
  assert.equal(p.bajo, true);
  assert.equal((await gaby.post('compras', { productoId: p.id, urgente: true })).status, 201);
  assert.equal((await gaby.post('compras', { productoId: p.id })).data.yaEstaba, true);
  await gaby.post('compras', { texto: 'Algodón', cantidad: '2 bolsas' });
  const lista = await gaby.pedir('compras');
  assert.equal(lista.data.pedidos.length, 2);
  assert.equal(lista.data.puedeResolver, false);
  const pedido = lista.data.pedidos.find((x) => x.productoId === p.id);
  assert.equal(pedido.urgente, true);
  assert.equal((await gaby.post(`compras/${pedido.id}`, { estado: 'comprado' })).status, 403);
  assert.equal((await admin.post(`compras/${pedido.id}`, { estado: 'comprado', monto: 29100, envases: 2 })).status, 200);
  const prod = (await admin.pedir('insumos')).data.productos.find((x) => x.id === p.id);
  assert.equal(prod.stock, 1600);
  const vista = await gaby.pedir('compras');
  assert.equal(vista.data.pedidos.find((x) => x.id === pedido.id).monto, undefined, 'Gaby no ve el monto');
});

test('tonos y ventas: variantes del mismo tinte y «Vendí uno»', async () => {
  const { admin, gaby } = await crearEquipo();
  const a = (await admin.post('insumos', { nombre: 'Tinte Igora', marca: 'Schwarzkopf', categoria: 'Color', unidad: 'g', tamano: 60, envases: 3, variante: '7.1 Rubio ceniza' })).data.producto;
  const b = (await admin.post('insumos', { nombre: 'Tinte Igora', marca: 'Schwarzkopf', categoria: 'Color', unidad: 'g', tamano: 60, envases: 2, variante: '9.0' })).data.producto;
  assert.equal(a.variante, '7.1 Rubio ceniza');
  await gaby.post('insumos/uso', { servicio: 'Tintura', items: [{ productoId: a.id, cantidad: 30 }, { productoId: b.id, cantidad: 15 }] });
  const ps = (await admin.pedir('insumos')).data.productos;
  assert.equal(ps.find((x) => x.id === a.id).stock, 150);
  assert.equal(ps.find((x) => x.id === b.id).stock, 105);
  const s = (await admin.post('insumos', { nombre: 'Protector térmico', unidad: 'u', tamano: 1, envases: 10, uso: 'venta', precioVenta: 17999 })).data.producto;
  assert.equal(s.precioVenta, 17999, 'el precio de venta lo ven todas');
  assert.equal((await gaby.post(`insumos/${a.id}/venta`, { unidades: 1 })).status, 400, 'un producto de trabajo no se vende');
  assert.equal((await gaby.post(`insumos/${s.id}/venta`, { unidades: 2 })).status, 200);
  assert.equal((await admin.pedir('insumos')).data.productos.find((x) => x.id === s.id).stock, 8);
  const d = await admin.pedir('insumos-datos');
  assert.equal(d.data.ventas[0].total, 35998);
  const c = await gaby.post('compras', { productoId: a.id });
  assert.equal(c.status, 201);
  assert.match((await gaby.pedir('compras')).data.pedidos[0].texto, /7\.1/);
});
